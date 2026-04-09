import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


export const runtime = 'edge';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 2000, // £20.00
            product_data: {
              name: "Full Planning Report",
              description: `Complete feasibility report for ${address ?? "your property"} — risk factors, comparable decisions, cost estimate, and planning documents.`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard/projects/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/dashboard/projects/preview`,
      metadata: { address: address ?? "" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/create-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
