/**
 * Energy Performance Certificate (EPC) Register
 * API by Open Data Communities / DLUHC
 *
 * Requires a free registered account at epc.opendatacommunities.org
 * Set EPC_API_EMAIL and EPC_API_KEY in .env.local
 *
 * Used here to retrieve:
 *   - Property type (house / flat / bungalow / maisonette)
 *   - Construction date band (pre-1900, 1900–1929, … post-2012)
 *   - Floor area (m²)
 *   - Current EPC rating
 *
 * Construction date is especially valuable:
 *   - Pre-1948 properties have different permitted development rights
 *   - Pre-1919 properties in conservation areas face stricter scrutiny
 *   - Helps pre-populate form fields and improve assessment accuracy
 */

const EPC_BASE = "https://epc.opendatacommunities.org/api/v1/domestic/search";

export interface EpcResult {
  found: boolean;
  property_type: string | null;
  built_form: string | null;       // detached / semi-detached / end-terrace / mid-terrace
  construction_age_band: string | null; // e.g. "England and Wales: 1900-1929"
  construction_year_min: number | null; // parsed lower bound
  total_floor_area: number | null; // m²
  current_energy_rating: string | null; // A–G
  lodgement_date: string | null;  // date of most recent EPC
  address: string | null;
}

function parseYearBand(band: string | null): number | null {
  if (!band) return null;
  const match = band.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

/** Extract a UK postcode from an address string, e.g. "W8 7AX" from "21 Campden Hill Gardens, London, W8 7AX" */
function extractPostcode(address: string): string | null {
  const m = address.match(/\b([A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2})\b/i);
  return m ? m[1].toUpperCase().replace(/\s+/, " ") : null;
}

/**
 * Look up EPC data for a property by address string.
 * Extracts the postcode and searches by that — the full-address ?address= param
 * returns an empty body from the EPC API for comma-separated addresses.
 * Returns null if EPC_API_EMAIL or EPC_API_KEY are not set.
 */
export async function getEpcData(address: string): Promise<EpcResult> {
  const email  = process.env.EPC_API_EMAIL;
  const apiKey = process.env.EPC_API_KEY;

  const empty: EpcResult = {
    found: false,
    property_type: null,
    built_form: null,
    construction_age_band: null,
    construction_year_min: null,
    total_floor_area: null,
    current_energy_rating: null,
    lodgement_date: null,
    address: null,
  };

  if (!email || !apiKey) {
    // Credentials not configured — skip silently
    return empty;
  }

  try {
    const token = btoa(`${email}:${apiKey}`);

    // Prefer postcode search — the ?address= param silently returns no results
    // for full comma-separated address strings from OS Places.
    const postcode = extractPostcode(address);

    const params = postcode
      ? new URLSearchParams({ postcode, size: "10" })
      : new URLSearchParams({
          // Fallback: strip commas, use just street + first part
          address: address.split(",")[0].trim(),
          size: "5",
        });

    const resp = await fetch(`${EPC_BASE}?${params}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${token}`,
      },
      cache: "no-store", // avoid stale cached results during testing
    });

    if (!resp.ok) {
      console.error(`[EPC] API error ${resp.status}`);
      return empty;
    }

    const text = await resp.text();
    if (!text) return empty; // API returns empty body when no results

    const data = JSON.parse(text) as { rows?: Array<Record<string, string>> };
    const rows = data.rows ?? [];
    if (rows.length === 0) return empty;

    // When searching by postcode, try to pick the row whose EPC address best
    // matches the first token of our address (house number or name).
    const firstToken = address.split(/[\s,]/)[0].toLowerCase();
    const bestRow =
      rows.find((r) => (r["address"] ?? "").toLowerCase().startsWith(firstToken)) ??
      rows[0];

    const row = bestRow;

    const ageBand = row["construction-age-band"] ?? null;

    return {
      found: true,
      property_type:         row["property-type"] ?? null,
      built_form:            row["built-form"] ?? null,
      construction_age_band: ageBand,
      construction_year_min: parseYearBand(ageBand),
      total_floor_area:      row["total-floor-area"] ? parseFloat(row["total-floor-area"]) : null,
      current_energy_rating: row["current-energy-rating"] ?? null,
      lodgement_date:        row["lodgement-date"] ?? null,
      address:               row["address"] ?? null,
    };
  } catch (err) {
    console.error("[EPC] Lookup failed:", err);
    return empty;
  }
}

/**
 * Human-readable description of the construction age band for UI display.
 */
export function describeAgeBand(band: string | null): string {
  if (!band) return "Unknown age";
  // Strip the "England and Wales: " prefix if present
  return band.replace(/^(england and wales|scotland|northern ireland):\s*/i, "").trim();
}

/**
 * Returns true if the property is likely pre-1948 based on the EPC age band.
 * Pre-1948 properties have different permitted development rules for some works.
 */
export function isPreWar(yearMin: number | null): boolean {
  return yearMin !== null && yearMin < 1948;
}
