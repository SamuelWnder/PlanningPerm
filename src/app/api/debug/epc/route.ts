import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") ?? "";
  const email   = process.env.EPC_API_EMAIL ?? null;
  const apiKey  = process.env.EPC_API_KEY   ?? null;

  // 1. Check env vars
  if (!email || !apiKey) {
    return NextResponse.json({ error: "EPC_API_EMAIL or EPC_API_KEY not set", email: !!email, apiKey: !!apiKey });
  }

  // 2. Extract postcode
  const m = address.match(/\b([A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2})\b/i);
  const postcode = m ? m[1].toUpperCase().replace(/\s+/, " ") : null;
  const params = postcode
    ? new URLSearchParams({ postcode, size: "3" })
    : new URLSearchParams({ address: address.split(",")[0].trim(), size: "3" });
  const url = `https://epc.opendatacommunities.org/api/v1/domestic/search?${params}`;

  // 3. Make the request
  let status = 0;
  let body = "";
  try {
    const token = btoa(`${email}:${apiKey}`);
    const resp = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Basic ${token}` },
    });
    status = resp.status;
    body = await resp.text();
  } catch (err) {
    return NextResponse.json({ error: String(err), url, postcode });
  }

  // 4. Parse
  let rows = 0;
  try { rows = (JSON.parse(body) as { rows?: unknown[] }).rows?.length ?? 0; } catch { /* ignore */ }

  return NextResponse.json({
    url,
    postcode,
    status,
    bodyLength: body.length,
    rows,
    preview: body.slice(0, 300),
  });
}
