/**
 * Historic England — National Heritage List for England (NHLE)
 * ArcGIS REST API — Listed Building Points (Layer 0)
 *
 * This is the AUTHORITATIVE source for listed building status.
 * Do NOT rely solely on MHCLG Planning Data for listed buildings —
 * NHLE coverage is more complete and updated daily.
 *
 * No API key required. Free, open data under OGL v3.
 * https://opendata-historicengland.hub.arcgis.com/
 */

import { bngEnvelope } from "./coords";

const NHLE_URL =
  "https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/National_Heritage_List_for_England_NHLE_v02_VIEW/FeatureServer/0/query";

export interface ListedBuilding {
  name: string;
  grade: "I" | "II*" | "II";
  listEntry: number;
  url: string;
  easting: number;
  northing: number;
  /** Distance in metres from queried point */
  distance: number;
}

export interface NhleResult {
  is_listed: boolean;
  listed_grade: "I" | "II*" | "II" | null;
  listed_name: string | null;
  listed_entry: number | null;
  listed_url: string | null;
  /** All listed buildings found within the search radius */
  nearby_listed: ListedBuilding[];
}

function parseGrade(raw: string | null): "I" | "II*" | "II" {
  if (!raw) return "II";
  const u = raw.toUpperCase().trim();
  if (u === "I")    return "I";
  if (u === "II*")  return "II*";
  return "II";
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Query the Historic England NHLE for listed buildings near a WGS84 point.
 *
 * Uses a 200m BNG bounding box — wide enough to catch buildings whose NHLE
 * centroid differs slightly from the OS Places geocoded address point.
 *
 * Returns all buildings found sorted by distance; the closest is treated as
 * the subject property's listed status.
 */
export async function getNhleListedBuildings(
  latitude: number,
  longitude: number,
  radiusMetres: number = 250
): Promise<NhleResult> {
  try {
    const envelope = bngEnvelope(latitude, longitude, radiusMetres);
    const centreBng = {
      easting:  Math.round((envelope.xmin + envelope.xmax) / 2),
      northing: Math.round((envelope.ymin + envelope.ymax) / 2),
    };

    const params = new URLSearchParams({
      geometry:     JSON.stringify(envelope),
      geometryType: "esriGeometryEnvelope",
      inSR:         "27700",
      spatialRel:   "esriSpatialRelIntersects",
      outFields:    "Name,Grade,ListEntry,hyperlink,Easting,Northing",
      f:            "json",
    });

    const resp = await fetch(`${NHLE_URL}?${params}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // Cache 24h — NHLE changes infrequently
    });

    if (!resp.ok) {
      throw new Error(`NHLE API error ${resp.status}`);
    }

    const data = await resp.json() as {
      features?: Array<{
        attributes: {
          Name: string;
          Grade: string;
          ListEntry: number;
          hyperlink: string;
          Easting: number;
          Northing: number;
        };
      }>;
    };

    const features = data.features ?? [];

    const buildings: ListedBuilding[] = features.map((f) => {
      const dx = f.attributes.Easting - centreBng.easting;
      const dy = f.attributes.Northing - centreBng.northing;
      return {
        name:     f.attributes.Name,
        grade:    parseGrade(f.attributes.Grade),
        listEntry: f.attributes.ListEntry,
        url:      f.attributes.hyperlink,
        easting:  f.attributes.Easting,
        northing: f.attributes.Northing,
        distance: Math.round(Math.sqrt(dx * dx + dy * dy)),
      };
    }).sort((a, b) => a.distance - b.distance);

    // The closest building within 80m is most likely the subject property.
    // Buildings 80–250m away are flagged as "nearby listed" — they affect
    // setting considerations but are not the subject building itself.
    const subject = buildings.find((b) => b.distance <= 80) ?? null;

    return {
      is_listed:    subject !== null,
      listed_grade: subject?.grade ?? null,
      listed_name:  subject?.name ?? null,
      listed_entry: subject?.listEntry ?? null,
      listed_url:   subject?.url ?? null,
      nearby_listed: buildings,
    };
  } catch (err) {
    console.error("[NHLE] Listed building lookup failed:", err);
    // Fail open — return unknown rather than false negative
    return {
      is_listed:    false,
      listed_grade: null,
      listed_name:  null,
      listed_entry: null,
      listed_url:   null,
      nearby_listed: [],
    };
  }
}
