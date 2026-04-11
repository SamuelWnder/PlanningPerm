import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://planningperm.com";

  try {
    const { email, projectId } = await req.json() as { email?: string; projectId?: string };

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const redirectTo = projectId
      ? `${BASE_URL}/auth/callback?projectId=${projectId}`
      : `${BASE_URL}/dashboard/projects`;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim().toLowerCase(),
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[resend-magic-link] error:", linkError);
      return NextResponse.json({ error: "Failed to generate magic link" }, { status: 500 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const html = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 0">
          <div style="background:#0b1d28;border-radius:20px;overflow:hidden">
            <div style="padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.08)">
              <span style="font-size:16px;font-weight:700;color:white">PlanningPerm</span>
            </div>
            <div style="padding:36px">
              <p style="font-size:12px;font-weight:600;color:#D4922A;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Sign in link</p>
              <h1 style="font-size:22px;font-weight:700;color:white;margin:0 0 12px;letter-spacing:-0.3px">
                Your new magic link
              </h1>
              <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0 0 28px;line-height:1.7">
                Click below to sign in and access your planning report. This link works on any device.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr><td style="background:#D4922A;border-radius:12px">
                  <a href="${linkData.properties.action_link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:white;text-decoration:none">
                    Open my planning report →
                  </a>
                </td></tr>
              </table>
              <p style="font-size:12px;color:rgba(255,255,255,0.25);margin:24px 0 0;line-height:1.6">
                This link expires in 24 hours and can only be used once.
              </p>
            </div>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "PlanningPerm <hello@planningperm.com>",
          to: email.trim().toLowerCase(),
          subject: "Your new PlanningPerm sign-in link",
          html,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resend-magic-link]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
