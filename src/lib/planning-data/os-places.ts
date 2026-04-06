/**
 * OS Places API integration for address geocoding.
 * Resolves a UK address string to UPRN, coordinates, and LPA code.
 *
 * API docs: https://osdatahub.os.uk/docs/places/overview
 * Free tier: 1,000 transactions/day
 */

export interface AddressMatch {
  uprn: string;
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

const OS_PLACES_BASE = "https://api.os.uk/search/places/v1";

async function osRequest(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.OS_PLACES_API_KEY;
  if (!apiKey) throw new Error("OS_PLACES_API_KEY not configured");

  const url = new URL(`${OS_PLACES_BASE}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!resp.ok) {
    throw new Error(`OS Places API error ${resp.status}: ${await resp.text()}`);
  }

  return resp.json();
}

/**
 * Autocomplete address suggestions as the user types.
 */
export async function autocompleteAddress(
  query: string
): Promise<AddressAutocompleteResult[]> {
  if (query.length < 3) return [];

  try {
    const data = await osRequest("find", {
      text: query,
      maxresults: "10",
      dataset: "DPA",
      output_srs: "EPSG:4326",
    });

    return (data.results || []).map((r: OsPlacesResult) => ({
      text: r.DPA?.ADDRESS || "",
      uprn: r.DPA?.UPRN || null,
    }));
  } catch {
    return [];
  }
}

/**
 * Resolve a UPRN to full address details including LPA code.
 */
export async function resolveUprn(uprn: string): Promise<AddressMatch | null> {
  try {
    const data = await osRequest("uprn", {
      uprn,
      dataset: "DPA",
      output_srs: "EPSG:4326",
    });

    const result = data.results?.[0]?.DPA;
    if (!result) return null;

    // LOCAL_CUSTODIAN_CODE maps to LPA code in ONS format
    // We need to map this to our lpa.code
    const lpaCode = mapCustodianToLpaCode(result.LOCAL_CUSTODIAN_CODE);

    return {
      uprn: result.UPRN,
      address: result.ADDRESS,
      postcode: result.POSTCODE,
      lpa_code: lpaCode,
      lpa_name: result.LOCAL_CUSTODIAN_CODE_DESCRIPTION || null,
      latitude: parseFloat(result.LAT),
      longitude: parseFloat(result.LNG),
      easting: parseFloat(result.X_COORDINATE),
      northing: parseFloat(result.Y_COORDINATE),
      local_type: result.LOCAL_TYPE || "",
    };
  } catch {
    return null;
  }
}

/**
 * Full address lookup — takes a free-text address, returns best match.
 */
export async function lookupAddress(address: string): Promise<AddressMatch | null> {
  try {
    const data = await osRequest("find", {
      text: address,
      maxresults: "1",
      dataset: "DPA",
      output_srs: "EPSG:4326",
    });

    const result = data.results?.[0]?.DPA;
    if (!result) return null;

    const lpaCode = mapCustodianToLpaCode(result.LOCAL_CUSTODIAN_CODE);

    return {
      uprn: result.UPRN,
      address: result.ADDRESS,
      postcode: result.POSTCODE,
      lpa_code: lpaCode,
      lpa_name: result.LOCAL_CUSTODIAN_CODE_DESCRIPTION || null,
      latitude: parseFloat(result.LAT),
      longitude: parseFloat(result.LNG),
      easting: parseFloat(result.X_COORDINATE),
      northing: parseFloat(result.Y_COORDINATE),
      local_type: result.LOCAL_TYPE || "",
    };
  } catch {
    return null;
  }
}

/**
 * Map OS LOCAL_CUSTODIAN_CODE (numeric) to ONS GSS E-code used in our LPA table.
 * This mapping covers the top 20 LPAs we scrape.
 * Full mapping should be loaded from a lookup table in production.
 */
function mapCustodianToLpaCode(custodianCode: string | number): string | null {
  const code = String(custodianCode);
  const MAP: Record<string, string> = {
    "5990": "E09000033", // Westminster
    "5100": "E09000012", // Hackney
    "5210": "E09000022", // Lewisham
    "5060": "E09000006", // Bromley
    "5010": "E09000001", // City of London
    "5110": "E09000011", // Greenwich
    "4215": "E08000003", // Manchester
    "4255": "E08000007", // Salford
    "4605": "E08000025", // Birmingham
    "4710": "E08000035", // Leeds
    "4715": "E08000019", // Sheffield
    "4315": "E08000012", // Liverpool
    "2114": "E06000010", // Kingston upon Hull
    "3100": "E07000178", // Oxford
    "1500": "E07000008", // Cambridge
    "0116": "E06000023", // Bristol
    "1585": "E06000037", // Nottingham
    "1110": "E07000086", // Exeter
    "6815": "W06000015", // Cardiff
    "9070": "S12000036", // Edinburgh
  };
  return MAP[code] || null;
}

interface OsPlacesResult {
  DPA?: {
    UPRN: string;
    ADDRESS: string;
    POSTCODE: string;
    LOCAL_CUSTODIAN_CODE: string;
    LOCAL_CUSTODIAN_CODE_DESCRIPTION?: string;
    LAT: string;
    LNG: string;
    X_COORDINATE: string;
    Y_COORDINATE: string;
    LOCAL_TYPE?: string;
  };
}
