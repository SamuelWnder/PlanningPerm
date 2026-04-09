import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { StoredProject, AssessmentResult } from "@/lib/project-store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-03-31.basil",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      stripeSessionId: string;
      project: StoredProject;
      assessment: AssessmentResult;
    };

    const { stripeSessionId, project, assessment } = body;
    if (!stripeSessionId || !project || !assessment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify payment via Stripe
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified" }, { status: 402 });
    }

    const customerEmail = session.customer_details?.email ?? session.metadata?.email ?? null;
    if (!customerEmail) {
      return NextResponse.json({ error: "No email on Stripe session" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 2. Save the project to Supabase (upsert by stripe_session_id to be idempotent)
    const { data: savedProject, error: dbError } = await supabase
      .from("projects")
      .upsert(
        {
          user_email:        customerEmail,
          project_data:      project,
          assessment_data:   assessment,
          stripe_session_id: stripeSessionId,
        },
        { onConflict: "stripe_session_id" }
      )
      .select("id")
      .single();

    if (dbError || !savedProject) {
      console.error("[setup-account] DB error:", dbError);
      return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
    }

    const projectId = savedProject.id as string;

    // 3. Generate a magic link via Supabase Auth admin API
    const redirectTo = `${BASE_URL}/auth/callback?projectId=${projectId}`;
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[setup-account] Magic link error:", linkError);
      return NextResponse.json({ error: "Failed to generate magic link" }, { status: 500 });
    }

    const magicLink = linkData.properties.action_link;

    // 4. Send the email via Resend
    await sendMagicLinkEmail({ email: customerEmail, magicLink, address: project.address });

    return NextResponse.json({ success: true, projectId });
  } catch (err) {
    console.error("[setup-account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendMagicLinkEmail({
  email,
  magicLink,
  address,
}: {
  email: string;
  magicLink: string;
  address: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // In dev without Resend, just log the link
    console.log(`[setup-account] Magic link for ${email}:\n${magicLink}`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
    <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f9f9">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f9;padding:40px 0">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

            <!-- Header -->
            <tr><td style="background:#0b1d28;padding:32px 40px">
              <table><tr>
                <td style="width:32px;height:32px;background:#D4922A;border-radius:8px;text-align:center;vertical-align:middle">
                  <span style="font-size:11px;font-weight:700;color:white">PP</span>
                </td>
                <td style="padding-left:10px;font-size:16px;font-weight:600;color:white">PlanningPerm</td>
              </tr></table>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:40px">
              <p style="font-size:13px;font-weight:600;color:#37b0aa;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px">Your full report is ready</p>
              <h1 style="font-size:26px;font-weight:700;color:#0b1d28;margin:0 0 10px;letter-spacing:-0.5px;line-height:1.2">
                Access your planning report
              </h1>
              <p style="font-size:15px;color:#64787a;margin:0 0 28px;line-height:1.7">
                Your full planning assessment for <strong style="color:#0b1d28">${address}</strong> is ready — including risk factors, cost estimate and planning documents.
              </p>
              <p style="font-size:14px;color:#64787a;margin:0 0 16px">
                Click below to open your report. The link works on any device.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                <tr><td style="background:#D4922A;border-radius:12px">
                  <a href="${magicLink}" style="display:inline-block;padding:15px 32px;font-size:16px;font-weight:700;color:white;text-decoration:none">
                    Open my planning report →
                  </a>
                </td></tr>
              </table>

              <p style="font-size:13px;color:#a0b4b5;margin:0;line-height:1.6">
                This link expires in 24 hours and can only be used once.<br/>
                If you didn&apos;t request this, you can safely ignore this email.
              </p>
            </td></tr>

            <!-- Footer -->
            <tr><td style="background:#f4f9f9;padding:20px 40px;border-top:1px solid #e8f2f2">
              <p style="font-size:12px;color:#a0b4b5;margin:0">
                PlanningPerm · One-time fee · No subscription
              </p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "PlanningPerm <onboarding@resend.dev>",
      to:      email,
      subject: `Your planning report for ${address}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[setup-account] Resend error:", err);
  }
}
