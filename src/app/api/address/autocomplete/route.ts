import { NextRequest, NextResponse } from "next/server";
import { autocompleteAddress } from "@/lib/planning-data/os-places";


export const runtime = 'edge';
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const results = await autocompleteAddress(q);
  return NextResponse.json({ results });
}
