import { NextRequest, NextResponse } from "next/server";
import { resolveUprn, lookupPostcode } from "@/lib/planning-data/os-places";


export const runtime = 'edge';
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const uprn = searchParams.get("uprn");
  const postcode = searchParams.get("postcode");

  if (uprn) {
    const result = await resolveUprn(uprn);
    if (!result) {
      return NextResponse.json({ error: "UPRN not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  if (postcode) {
    const result = await lookupPostcode(postcode);
    if (!result) {
      return NextResponse.json({ error: "Postcode not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "uprn or postcode param required" },
    { status: 400 }
  );
}
