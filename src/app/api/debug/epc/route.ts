import { NextRequest, NextResponse } from "next/server";
import { getEpcData } from "@/lib/planning-data/epc";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") ?? "";
  if (!address) {
    return NextResponse.json({ error: "Pass ?address=..." });
  }

  const epc = await getEpcData(address);
  return NextResponse.json({ address, epc });
}
