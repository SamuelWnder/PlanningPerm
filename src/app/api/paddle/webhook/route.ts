import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

async function verifySignature(rawBody: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = header.split(";");
    const ts = parts.find((p) => p.startsWith("ts="))?.slice(3);
    const h1 = parts.find((p) => p.startsWith("h1="))?.slice(3);
    if (!ts || !h1) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`${ts}:${rawBody}`));
    const hex = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hex === h1;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET ?? "";
  const header = req.headers.get("paddle-signature") ?? "";
  const rawBody = await req.text();

  if (secret && !(await verifySignature(rawBody, header, secret))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event_type === "transaction.completed") {
    const tx = event.data;
    console.log("[paddle/webhook] transaction.completed", tx.id, tx.custom_data?.address);
    // The client-side payment-success page handles saving via setup-account.
    // The webhook is an additional safety net for server-side confirmation.
  }

  return NextResponse.json({ received: true });
}

interface PaddleEvent {
  event_type: string;
  data: {
    id: string;
    status: string;
    custom_data?: { address?: string; email?: string };
    customer?: { id: string; email?: string };
  };
}
