import { NextRequest, NextResponse } from "next/server";
import { pollAllTrackers } from "@/lib/tracker/tracker-service";

// Called by Python cron service weekly
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.PYTHON_SERVICE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pollAllTrackers();
  return NextResponse.json(result);
}
