import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


export const runtime = 'edge';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2025-03-31.basil" });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    return NextResponse.json({ paid: true, address: session.metadata?.address ?? "" });
  } catch (err) {
    console.error("[stripe/verify]", err);
    return NextResponse.json({ error: "Could not verify payment" }, { status: 500 });
  }
}
