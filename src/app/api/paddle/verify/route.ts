import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const transactionId = req.nextUrl.searchParams.get("transaction_id");
  if (!transactionId) {
    return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Paddle not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.paddle.com/transactions/${transactionId}?include=customer`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) {
      console.error("[paddle/verify] Paddle API error:", res.status, await res.text());
      return NextResponse.json({ error: "Could not fetch transaction" }, { status: 500 });
    }

    const { data } = await res.json() as { data: PaddleTransaction };

    if (data.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed", status: data.status }, { status: 402 });
    }

    return NextResponse.json({
      paid: true,
      transactionId: data.id,
      address: data.custom_data?.address ?? "",
      email: data.customer?.email ?? data.custom_data?.email ?? "",
    });
  } catch (err) {
    console.error("[paddle/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

interface PaddleTransaction {
  id: string;
  status: string;
  custom_data?: { address?: string; email?: string };
  customer?: { id: string; email?: string };
}
