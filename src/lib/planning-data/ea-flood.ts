/**
 * Environment Agency — Flood Map for Planning
 * ArcGIS FeatureServer — separate layers for FZ3 and FZ2
 *
 * More reliable and precise than the MHCLG flood-risk-zone dataset,
 * which relies on LPA submissions with inconsistent field names.
 *
 * Layers:
 *   0 — Flood Storage Areas
 *   1 — Flood Zone 3 (≥1% annual probability river / ≥0.5% sea)
 *   2 — Flood Zone 2 (0.1%–1% annual probability river / 0.1%–0.5% sea)
 *
 * Zone 3 is subdivided into 3a (high risk) and 3b (functional floodplain),
 * but this distinction is NOT available in the public EA dataset — it is
 * determined by the LPA using site-specific assessments. We flag all Zone 3
 * as "3" and note this in the UI.
 *
 * No API key required. Free, open data under OGL v3.
 */

import { bngEnvelope } from "./coords";

const EA_FLOOD_BASE =
  "https://environment.data.gov.uk/KB6uNVj5ZcJr7jUP/ArcGIS/rest/services/Flood_Map_for_Planning/FeatureServer";

export type FloodZone = "1" | "2" | "3" | null;

export interface EaFloodResult {
  is_flood_risk: boolean;
  flood_zone: FloodZone;
  /** True if in Flood Storage Area (a sub-type of Zone 3) */
  is_flood_storage_area: boolean;
  source: "ea";
}

async function queryLayer(layerId: number, envelope: ReturnType<typeof bngEnvelope>): Promise<boolean> {
  const params = new URLSearchParams({
    geometry:     JSON.stringify(envelope),
    geometryType: "esriGeometryEnvelope",
    inSR:         "27700",
    spatialRel:   "esriSpatialRelIntersects",
    returnCountOnly: "true",
    f:            "json",
  });

  try {
    const resp = await fetch(`${EA_FLOOD_BASE}/${layerId}/query?${params}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // Cache 1h
    });
    if (!resp.ok) return false;
    const data = await resp.json() as { count?: number };
    return (data.count ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Determine the Environment Agency flood zone for a WGS84 point.
 *
 * Uses a 30m BNG bounding box — tight enough to avoid false positives
 * for properties near zone boundaries while accounting for geocoding jitter.
 */
export async function getEaFloodZone(
  latitude: number,
  longitude: number
): Promise<EaFloodResult> {
  try {
    const envelope = bngEnvelope(latitude, longitude, 30);

    // Query all three layers in parallel
    const [inFSA, inFZ3, inFZ2] = await Promise.all([
      queryLayer(0, envelope),
      queryLayer(1, envelope),
      queryLayer(2, envelope),
    ]);

    if (inFZ3 || inFSA) {
      return {
        is_flood_risk: true,
        flood_zone: "3",
        is_flood_storage_area: inFSA,
        source: "ea",
      };
    }
    if (inFZ2) {
      return {
        is_flood_risk: true,
        flood_zone: "2",
        is_flood_storage_area: false,
        source: "ea",
      };
    }
    return {
      is_flood_risk: false,
      flood_zone: "1",
      is_flood_storage_area: false,
      source: "ea",
    };
  } catch (err) {
    console.error("[EA Flood] Zone lookup failed:", err);
    return {
      is_flood_risk: false,
      flood_zone: null,
      is_flood_storage_area: false,
      source: "ea",
    };
  }
}
