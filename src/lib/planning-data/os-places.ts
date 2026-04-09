/**
 * Address lookup using:
 *   - OS Places API (https://api.os.uk/search/places/v1) — full address autocomplete + UPRN
 *   - Postcodes.io — free LPA/GSS code + lat/lng from postcode
 *
 * OS Places gives us real addresses and UPRNs.
 * Postcodes.io maps the postcode to a GSS council code (our lpa_code).
 */

const OS_BASE = "https://api.os.uk/search/places/v1";

function getOsKey(): string {
  const key = process.env.OS_PLACES_API_KEY;
  if (!key) throw new Error("OS_PLACES_API_KEY is not set");
  return key;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AddressMatch {
  uprn: string | null;
  address: string;
  postcode: string;
  lpa_code: string | null;
  lpa_name: string | null;
  latitude: number;
  longitude: number;
  easting: number;
  northing: number;
  local_type: string;
}

export interface AddressAutocompleteResult {
  text: string;
  uprn: string | null;
}

// ─── Internal OS Places types ──────────────────────────────────────────────────

interface OsDpa {
  UPRN: string;
  ADDRESS: string;
  POSTCODE: string;
  POST_TOWN: string;
  LOCAL_CUSTODIAN_CODE: number;
  LOCAL_CUSTODIAN_CODE_DESCRIPTION: string;
  X_COORDINATE: number;
  Y_COORDINATE: number;
  LNG: number;
  LAT: number;
}

interface OsResult {
  DPA?: OsDpa;
}

interface OsResponse {
  results?: OsResult[];
  header?: { totalresults: number };
}

// ─── OS Places: find (autocomplete) ──────────────────────────────────────────

/**
 * Full address autocomplete — returns real addresses with UPRNs.
 * Called as the user types in the address input.
 */
export async function autocompleteAddress(
  query: string
): Promise<AddressAutocompleteResult[]> {
  if (query.trim().length < 4) return [];

  try {
    const url = new URL(`${OS_BASE}/find`);
    url.searchParams.set("query", query);
    url.searchParams.set("maxresults", "8");
    url.searchParams.set("output_srs", "WGS84");
    url.searchParams.set("key", getOsKey());

    const resp = await fetch(url.toString(), {
      next: { revalidate: 0 }, // Don't cache — real-time search
    });

    if (!resp.ok) return fallbackPostcodeAutocomplete(query);

    const data: OsResponse = await resp.json();
    return (data.results || [])
      .filter((r) => r.DPA)
      .map((r) => ({
        text: r.DPA!.ADDRESS,
        uprn: r.DPA!.UPRN,
      }));
  } catch {
    return fallbackPostcodeAutocomplete(query);
  }
}

// ─── OS Places: UPRN lookup ───────────────────────────────────────────────────

/**
 * Resolve a UPRN to a full AddressMatch with lat/lng and LPA code.
 * Called when a user selects a suggestion that has a UPRN.
 */
export async function resolveUprn(uprn: string): Promise<AddressMatch | null> {
  try {
    const url = new URL(`${OS_BASE}/uprn`);
    url.searchParams.set("uprn", uprn);
    url.searchParams.set("output_srs", "WGS84");
    url.searchParams.set("key", getOsKey());

    const resp = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // UPRNs are stable
    });

    if (!resp.ok) return null;
    const data: OsResponse = await resp.json();
    const dpa = data.results?.[0]?.DPA;
    if (!dpa) return null;

    // Enrich with Postcodes.io for the GSS/LPA code + a coordinate sanity check
    const postcodeData = await lookupPostcode(dpa.POSTCODE);

    // Cross-check UPRN coordinates against the postcode centroid.
    // OS Places occasionally stores incorrect coordinates for a UPRN (wrong lat/lng
    // that can be several km out). If the UPRN point is more than ~500m from the
    // postcode centroid, the postcode centroid is almost certainly more accurate.
    let latitude = dpa.LAT;
    let longitude = dpa.LNG;
    if (postcodeData) {
      const dLat = dpa.LAT - postcodeData.latitude;
      const dLng = dpa.LNG - postcodeData.longitude;
      const distanceDeg = Math.sqrt(dLat * dLat + dLng * dLng);
      if (distanceDeg > 0.006) { // ~500m — clear data error, fall back to postcode centroid
        latitude  = postcodeData.latitude;
        longitude = postcodeData.longitude;
      }
    }

    return {
      uprn: dpa.UPRN,
      address: dpa.ADDRESS,
      postcode: dpa.POSTCODE,
      lpa_code: postcodeData?.lpa_code ?? null,
      lpa_name: postcodeData?.lpa_name ?? dpa.LOCAL_CUSTODIAN_CODE_DESCRIPTION ?? null,
      latitude,
      longitude,
      easting: dpa.X_COORDINATE,
      northing: dpa.Y_COORDINATE,
      local_type: "address",
    };
  } catch {
    return null;
  }
}

// ─── Postcodes.io: postcode lookup ───────────────────────────────────────────

interface PostcodesIoResult {
  postcode: string;
  latitude: number;
  longitude: number;
  eastings: number;
  northings: number;
  admin_district: string;
  codes: {
    admin_district: string;
  };
}

/**
 * Look up a UK postcode via Postcodes.io (free).
 * Returns LPA GSS code + lat/lng. Used as a fallback and for LPA identification.
 */
export async function lookupPostcode(postcode: string): Promise<AddressMatch | null> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 5) return null;

  try {
    const resp = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`,
      { next: { revalidate: 86400 } }
    );

    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.status !== 200 || !data.result) return null;

    const r: PostcodesIoResult = data.result;
    const lpaCode = r.codes?.admin_district || null;

    return {
      uprn: null,
      address: postcode.toUpperCase(),
      postcode: r.postcode,
      lpa_code: lpaCode,
      lpa_name: r.admin_district || null,
      latitude: r.latitude,
      longitude: r.longitude,
      easting: r.eastings,
      northing: r.northings,
      local_type: "postcode",
    };
  } catch {
    return null;
  }
}

// ─── Fallback: Postcodes.io autocomplete ──────────────────────────────────────

export async function autocompletePostcode(query: string): Promise<string[]> {
  const cleaned = query.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 2) return [];

  try {
    const resp = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}/autocomplete`,
      { next: { revalidate: 3600 } }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.result || [];
  } catch {
    return [];
  }
}

async function fallbackPostcodeAutocomplete(
  query: string
): Promise<AddressAutocompleteResult[]> {
  const postcodes = await autocompletePostcode(query);
  return postcodes.map((pc) => ({ text: pc, uprn: null }));
}

/**
 * Convenience: resolve either a UPRN or a postcode string.
 * Tries UPRN first if provided, falls back to postcode extraction.
 */
export async function lookupAddress(address: string): Promise<AddressMatch | null> {
  const postcodeMatch = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
  if (postcodeMatch) return lookupPostcode(postcodeMatch[0]);
  return null;
}

export function isValidPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(cleaned);
}
