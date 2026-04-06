import { NextRequest, NextResponse } from "next/server";
import { resolveUprn } from "@/lib/planning-data/os-places";

export async function GET(request: NextRequest) {
  const uprn = request.nextUrl.searchParams.get("uprn");
  if (!uprn) {
    return NextResponse.json({ error: "UPRN required" }, { status: 400 });
  }

  const result = await resolveUprn(uprn);
  if (!result) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
