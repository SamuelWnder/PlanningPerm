/**
 * MHCLG Planning Data API client
 * https://www.planning.data.gov.uk/docs
 *
 * Free, no API key required. Covers all of England.
 * Returns planning constraints, designations, and applications.
 */

const BASE_URL = "https://www.planning.data.gov.uk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanningConstraints {
  is_listed_building: boolean;
  listed_building_grade: "I" | "II*" | "II" | null;
  is_conservation_area: boolean;
  conservation_area_name: string | null;
  is_flood_risk: boolean;
  flood_risk_zone: "1" | "2" | "3a" | "3b" | null;
  is_green_belt: boolean;
  is_article_4: boolean;
  article_4_direction: string | null;
  is_tree_preservation: boolean;
  is_aonb: boolean;
  is_ancient_woodland: boolean;
  is_scheduled_monument: boolean;
  // Extended designations
  is_sssi: boolean;
  sssi_name: string | null;
  is_national_park: boolean;
  national_park_name: string | null;
  is_sac: boolean;
  sac_name: string | null;
  is_spa: boolean;
  spa_name: string | null;
  is_ramsar: boolean;
  ramsar_name: string | null;
  is_historic_park: boolean;
  historic_park_name: string | null;
  is_world_heritage_site: boolean;
  world_heritage_site_name: string | null;
  is_world_heritage_buffer: boolean;
  is_heritage_at_risk: boolean;
  is_archaeological_priority: boolean;
  is_locally_listed: boolean;
  is_local_nature_reserve: boolean;
  raw: MhclgEntity[];
}

export interface ComparableApplication {
  reference: string;
  description: string;
  decision: string | null;
  decision_date: string | null;
  address: string | null;
  application_type: string | null;
  lpa_name: string | null;
  url: string | null;
}

export interface MhclgEntity {
  entity: number;
  name: string;
  dataset: string;
  reference: string;
  start_date: string | null;
  end_date: string | null;
  point: string | null;
  geometry: string | null;
  [key: string]: unknown;
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function mhclgFetch(
  path: string,
  params: Record<string, string | string[] | number | undefined>
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 }, // Cache 1h — short enough to pick up query changes
  });

  if (!resp.ok) {
    throw new Error(`MHCLG API error ${resp.status} for ${url.toString()}`);
  }

  return resp.json();
}

// ─── Constraints lookup ───────────────────────────────────────────────────────

/**
 * Fetch all planning constraints for a lat/lng point.
 * Returns structured constraints object.
 */
export async function getConstraintsAtPoint(
  latitude: number,
  longitude: number
): Promise<PlanningConstraints> {
  const CONSTRAINT_DATASETS = [
    "listed-building",
    "conservation-area",
    "flood-risk-zone",
    "green-belt",
    "article-4-direction-area",
    "tree-preservation-zone",
    "area-of-outstanding-natural-beauty",
    "ancient-woodland",
    "scheduled-monument",
    // Extended designations
    "site-of-special-scientific-interest",
    "national-park",
    "special-area-of-conservation",
    "special-protection-area",
    "ramsar",
    "park-and-garden",
    "world-heritage-site",
    "world-heritage-site-buffer-zone",
    "heritage-at-risk",
    "archaeological-priority-area",
    "locally-listed-building",
    "local-nature-reserve",
  ];

  // Query 5 points in parallel: the address centroid plus four cardinal offsets at ~100m.
  // OS Places geocoded centroids can sit just outside designation polygon boundaries
  // (e.g. a property on the edge of a conservation area, or a Georgian square where the
  // UPRN centroid falls in the road). Querying surrounding points catches these cases
  // while still using the proven latitude/longitude point-in-polygon API.
  const dLat = 0.0009; // ~100m north/south
  const dLng = 0.0013; // ~100m east/west at UK latitudes
  const queryPoints = [
    { latitude,          longitude          }, // centre
    { latitude: latitude + dLat, longitude          }, // north
    { latitude: latitude - dLat, longitude          }, // south
    { latitude,          longitude: longitude + dLng }, // east
    { latitude,          longitude: longitude - dLng }, // west
  ];

  const responses = await Promise.all(
    queryPoints.map((p) =>
      mhclgFetch("/entity.json", {
        latitude:  p.latitude,
        longitude: p.longitude,
        dataset:   CONSTRAINT_DATASETS,
        limit:     100,
      }).catch(() => ({ entities: [] as MhclgEntity[] }))
    )
  ) as { entities: MhclgEntity[] }[];

  // Deduplicate by entity ID — keep the first occurrence from each parallel response
  const seen = new Set<number>();
  const entities: MhclgEntity[] = [];
  for (const res of responses) {
    for (const e of (res.entities ?? [])) {
      if (!seen.has(e.entity)) {
        seen.add(e.entity);
        entities.push(e);
      }
    }
  }

  const byDataset = (name: string) =>
    entities.filter((e) => e.dataset === name);

  const listed = byDataset("listed-building");
  const conservation = byDataset("conservation-area");
  const flood = byDataset("flood-risk-zone");

  // Parse listed building grade from entity fields
  const listedGrade = listed[0]
    ? parseListedGrade(listed[0]["listed-building-grade"] as string)
    : null;

  // Parse flood zone — zone field varies by LPA
  const floodZone = flood[0]
    ? parseFloodZone(
        (flood[0]["flood-zone"] as string) ||
        (flood[0]["name"] as string) ||
        ""
      )
    : null;

  const article4   = byDataset("article-4-direction-area");
  const sssi       = byDataset("site-of-special-scientific-interest");
  const natPark    = byDataset("national-park");
  const sac        = byDataset("special-area-of-conservation");
  const spa        = byDataset("special-protection-area");
  const ramsar     = byDataset("ramsar");
  const histPark   = byDataset("park-and-garden");
  const whs        = byDataset("world-heritage-site");
  const whsBuf     = byDataset("world-heritage-site-buffer-zone");
  const harisk     = byDataset("heritage-at-risk");
  const archPrio   = byDataset("archaeological-priority-area");
  const localList  = byDataset("locally-listed-building");

  return {
    is_listed_building: listed.length > 0,
    listed_building_grade: listedGrade,
    is_conservation_area: conservation.length > 0,
    conservation_area_name: conservation[0]?.name || null,
    is_flood_risk: flood.length > 0,
    flood_risk_zone: floodZone,
    is_green_belt: byDataset("green-belt").length > 0,
    is_article_4: article4.length > 0,
    article_4_direction: article4[0]?.name || null,
    is_tree_preservation: byDataset("tree-preservation-zone").length > 0,
    is_aonb: byDataset("area-of-outstanding-natural-beauty").length > 0,
    is_ancient_woodland: byDataset("ancient-woodland").length > 0,
    is_scheduled_monument: byDataset("scheduled-monument").length > 0,
    is_sssi: sssi.length > 0,
    sssi_name: sssi[0]?.name || null,
    is_national_park: natPark.length > 0,
    national_park_name: natPark[0]?.name || null,
    is_sac: sac.length > 0,
    sac_name: sac[0]?.name || null,
    is_spa: spa.length > 0,
    spa_name: spa[0]?.name || null,
    is_ramsar: ramsar.length > 0,
    ramsar_name: ramsar[0]?.name || null,
    is_historic_park: histPark.length > 0,
    historic_park_name: histPark[0]?.name || null,
    is_world_heritage_site: whs.length > 0,
    world_heritage_site_name: whs[0]?.name || null,
    is_world_heritage_buffer: whsBuf.length > 0,
    is_heritage_at_risk: harisk.length > 0,
    is_archaeological_priority: archPrio.length > 0,
    is_locally_listed: localList.length > 0,
    is_local_nature_reserve: byDataset("local-nature-reserve").length > 0,
    raw: entities,
  };
}

// ─── Comparable applications ──────────────────────────────────────────────────

/**
 * Fetch recent planning applications in an LPA area.
 * Uses the LPA entity ID from the planning.data.gov.uk dataset.
 */
export async function getComparableApplications(
  latitude: number,
  longitude: number,
  limitResults: number = 50
): Promise<ComparableApplication[]> {
  // Search within ~1km radius using a bounding box approximation
  // MHCLG supports geometry intersection, so we query by point + radius via geometry
  const delta = 0.01; // ~1km in degrees
  const bbox = `POLYGON((${longitude - delta} ${latitude - delta},${longitude + delta} ${latitude - delta},${longitude + delta} ${latitude + delta},${longitude - delta} ${latitude + delta},${longitude - delta} ${latitude - delta}))`;

  try {
    const data = await mhclgFetch("/entity.json", {
      dataset: "planning-application",
      geometry: bbox,
      geometry_relation: "intersects",
      "start_date_year": new Date().getFullYear() - 5, // Last 5 years
      start_date_match: "since",
      limit: limitResults,
      field: [
        "reference",
        "name",
        "description",
        "decision",
        "decision-date",
        "address",
        "application-type",
        "organisation-entity",
      ],
    }) as { entities: MhclgEntity[] };

    return (data.entities || []).map(parseApplication);
  } catch {
    // Planning application data is still in beta — fall back gracefully
    return [];
  }
}

/**
 * Get comparable applications by LPA entity ID (more reliable than geometry).
 */
export async function getApplicationsByLpa(
  lpaEntityId: number,
  limitResults: number = 100
): Promise<ComparableApplication[]> {
  try {
    const currentYear = new Date().getFullYear();
    const data = await mhclgFetch("/entity.json", {
      dataset: "planning-application",
      geometry_entity: lpaEntityId,
      geometry_relation: "within",
      start_date_year: currentYear - 5,
      start_date_match: "since",
      limit: limitResults,
    }) as { entities: MhclgEntity[] };

    return (data.entities || []).map(parseApplication);
  } catch {
    return [];
  }
}

/**
 * Look up the MHCLG entity ID for an LPA by its GSS code (e.g. E09000033).
 */
export async function getLpaEntityId(gssCode: string): Promise<number | null> {
  try {
    const data = await mhclgFetch("/entity.json", {
      dataset: "local-planning-authority",
      reference: gssCode,
      limit: 1,
      field: ["entity", "name", "reference"],
    }) as { entities: MhclgEntity[] };

    return data.entities?.[0]?.entity ?? null;
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseApplication(e: MhclgEntity): ComparableApplication {
  return {
    reference: e.reference || String(e.entity),
    description: (e.description as string) || (e.name as string) || "",
    decision: (e.decision as string) || null,
    decision_date: (e["decision-date"] as string) || null,
    address: (e.address as string) || null,
    application_type: (e["application-type"] as string) || null,
    lpa_name: null,
    url: `https://www.planning.data.gov.uk/entity/${e.entity}`,
  };
}

function parseListedGrade(raw: string | undefined): "I" | "II*" | "II" | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper.includes("I*") || upper.includes("II*")) return "II*";
  if (upper === "I" || upper.includes("GRADE I")) return "I";
  if (upper.includes("II")) return "II";
  return null;
}

function parseFloodZone(raw: string): "1" | "2" | "3a" | "3b" | null {
  if (raw.includes("3b") || raw.includes("3B")) return "3b";
  if (raw.includes("3a") || raw.includes("3A") || raw.includes("3")) return "3a";
  if (raw.includes("2")) return "2";
  if (raw.includes("1")) return "1";
  return null;
}

// ─── Constraint summary for Claude prompt ────────────────────────────────────

export function formatConstraintsForPrompt(c: PlanningConstraints): string {
  const flags: string[] = [];

  if (c.is_listed_building) {
    flags.push(
      `Listed building (Grade ${c.listed_building_grade || "unknown"}) — Listed Building Consent required for any works affecting character`
    );
  }
  if (c.is_conservation_area) {
    flags.push(
      `Conservation Area${c.conservation_area_name ? ` (${c.conservation_area_name})` : ""} — permitted development rights are restricted; design and materials will be scrutinised`
    );
  }
  if (c.is_flood_risk) {
    flags.push(
      `Flood Risk Zone ${c.flood_risk_zone || "unknown"} — Sequential and Exception Tests may apply; drainage strategy likely required`
    );
  }
  if (c.is_green_belt) {
    flags.push(
      `Green Belt — very special circumstances required for most development; strong presumption against inappropriate development`
    );
  }
  if (c.is_article_4) {
    flags.push(
      `Article 4 Direction${c.article_4_direction ? ` (${c.article_4_direction})` : ""} — permitted development rights removed; full application required`
    );
  }
  if (c.is_aonb) {
    flags.push(
      `Area of Outstanding Natural Beauty — high bar for development; landscape impact will be assessed`
    );
  }
  if (c.is_ancient_woodland) {
    flags.push(`Ancient Woodland nearby — buffer zone policy applies`);
  }
  if (c.is_scheduled_monument) {
    flags.push(`Scheduled Monument — Scheduled Monument Consent required`);
  }
  if (c.is_tree_preservation) {
    flags.push(`Tree Preservation Order — TPO consent required for works to affected trees`);
  }
  if (c.is_sssi) {
    flags.push(`Site of Special Scientific Interest${c.sssi_name ? ` (${c.sssi_name})` : ""} — Natural England must be consulted; significant development near SSSI may be refused`);
  }
  if (c.is_national_park) {
    flags.push(`National Park${c.national_park_name ? ` (${c.national_park_name})` : ""} — equivalent protection to AONB; national park authority is the LPA`);
  }
  if (c.is_sac) {
    flags.push(`Special Area of Conservation${c.sac_name ? ` (${c.sac_name})` : ""} — Habitats Regulations Assessment may be required`);
  }
  if (c.is_spa) {
    flags.push(`Special Protection Area${c.spa_name ? ` (${c.spa_name})` : ""} — bird protection designation; Habitats Regulations Assessment likely required`);
  }
  if (c.is_ramsar) {
    flags.push(`Ramsar Site${c.ramsar_name ? ` (${c.ramsar_name})` : ""} — internationally designated wetland; treated as SPA for planning purposes`);
  }
  if (c.is_historic_park) {
    flags.push(`Registered Historic Park and Garden${c.historic_park_name ? ` (${c.historic_park_name})` : ""} — Historic England designation; works affecting setting or character will be scrutinised`);
  }
  if (c.is_world_heritage_site) {
    flags.push(`UNESCO World Heritage Site${c.world_heritage_site_name ? ` (${c.world_heritage_site_name})` : ""} — highest level of heritage protection; Outstanding Universal Value must be preserved`);
  }
  if (c.is_world_heritage_buffer) {
    flags.push(`UNESCO World Heritage Site Buffer Zone — development must preserve the setting and views of the WHS`);
  }
  if (c.is_heritage_at_risk) {
    flags.push(`Heritage at Risk — Historic England's at-risk register; any works must demonstrate they improve the asset's condition`);
  }
  if (c.is_archaeological_priority) {
    flags.push(`Archaeological Priority Area — pre-application archaeological assessment likely required by LPA`);
  }
  if (c.is_locally_listed) {
    flags.push(`Locally Listed Building — not statutory listed but council will apply heritage policies; unsympathetic alterations may be refused`);
  }
  if (c.is_local_nature_reserve) {
    flags.push(`Local Nature Reserve — council designation; works affecting the reserve or its setting may require ecological assessment`);
  }

  if (flags.length === 0) return "No statutory designations detected at this location.";
  return flags.join("\n");
}
