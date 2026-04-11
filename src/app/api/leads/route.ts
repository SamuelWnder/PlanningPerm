export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, consented, address, projectType, score, userEmail } = body;

  if (!name?.trim() || !consented) {
    return NextResponse.json({ error: "Name and consent are required" }, { status: 400 });
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const resendKey    = process.env.RESEND_API_KEY!;
  const supabase     = createClient(supabaseUrl, serviceKey);

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const { error: dbError } = await supabase.from("leads").insert({
    user_email:   userEmail ?? null,
    name:         name.trim(),
    phone:        phone?.trim() ?? null,
    consented,
    address:      address ?? null,
    project_type: projectType ?? null,
    score:        score ?? null,
  });

  if (dbError) {
    console.error("[leads] Supabase insert error:", dbError);
  }

  // ── Send notification email via Resend ───────────────────────────────────
  if (resendKey) {
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0b1d28;margin:0 0 4px">New consultation request</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>

        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#6b7280;width:120px">Name</td>
            <td style="padding:10px 0;font-weight:600;color:#0b1d28">${name.trim()}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#6b7280">Email</td>
            <td style="padding:10px 0;font-weight:600;color:#0b1d28">${userEmail ?? "—"}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#6b7280">Phone</td>
            <td style="padding:10px 0;font-weight:600;color:#0b1d28">${phone?.trim() || "—"}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#6b7280">Property</td>
            <td style="padding:10px 0;color:#0b1d28">${address ?? "—"}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#6b7280">Project</td>
            <td style="padding:10px 0;color:#0b1d28">${projectType ?? "—"}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280">Score</td>
            <td style="padding:10px 0;font-weight:700;color:#D4922A">${score != null ? `${score}/100` : "—"}</td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:16px;background:#f8fafa;border-radius:12px;font-size:13px;color:#6b7280">
          Consented to contact: ✓
        </div>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "PlanningPerm <hello@planningperm.com>",
        to:      "samuel@wnder.co",
        subject: `New consultation request — ${name.trim()} · ${address ?? "unknown address"}`,
        html,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
