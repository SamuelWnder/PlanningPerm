import { NextRequest, NextResponse } from "next/server";
import { getConstraintsAtPoint } from "@/lib/planning-data/mhclg";
import { getNhleListedBuildings } from "@/lib/planning-data/historic-england";
import { getEaFloodZone } from "@/lib/planning-data/ea-flood";
import { getEpcData } from "@/lib/planning-data/epc";


export const runtime = 'edge';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat     = searchParams.get("lat");
  const lng     = searchParams.get("lng");
  const address = searchParams.get("address") ?? "";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng query params are required" },
      { status: 400 }
    );
  }

  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (
    isNaN(latitude)  || isNaN(longitude)  ||
    latitude  < 49.5 || latitude  > 60.9  || // UK bounding box
    longitude < -8.2 || longitude > 2.0
  ) {
    return NextResponse.json(
      { error: "Coordinates must be within the United Kingdom" },
      { status: 400 }
    );
  }

  // Truncate address to prevent oversized requests
  const safeAddress = address.slice(0, 200);

  try {
    // Run all four sources in parallel
    const [mhclg, nhle, eaFlood, epc] = await Promise.all([
      getConstraintsAtPoint(latitude, longitude),
      getNhleListedBuildings(latitude, longitude),
      getEaFloodZone(latitude, longitude),
      safeAddress ? getEpcData(safeAddress) : Promise.resolve(null),
    ]);

    const merged = {
      ...mhclg,

      // ── Listed building: NHLE is authoritative, overrides MHCLG ──
      is_listed_building:    nhle.is_listed || mhclg.is_listed_building,
      listed_building_grade: nhle.listed_grade ?? mhclg.listed_building_grade,
      nhle_name:             nhle.listed_name,
      nhle_entry:            nhle.listed_entry,
      nhle_url:              nhle.listed_url,
      nhle_nearby_listed:    nhle.nearby_listed,
      nhle_source:           "historic-england",

      // ── Flood zone: EA is authoritative, overrides MHCLG ──
      is_flood_risk:  eaFlood.is_flood_risk,
      flood_risk_zone: eaFlood.flood_zone,
      is_flood_storage_area: eaFlood.is_flood_storage_area,
      flood_source:   "environment-agency",

      // ── EPC property data (enrichment, not a planning constraint) ──
      epc: epc ?? null,
    };

    return NextResponse.json(merged);
  } catch (err) {
    console.error("Constraints lookup error:", err);
    return NextResponse.json(
      { error: "Failed to fetch constraints" },
      { status: 500 }
    );
  }
}
