import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { StoredProject, AssessmentResult } from "@/lib/project-store";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const body = await req.json() as {
      email: string;
      project: StoredProject;
      assessment: AssessmentResult;
    };

    const { email, project, assessment } = body;
    if (!email || !project || !assessment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Save project to Supabase (service role bypasses RLS)
    const { data: savedProject, error: dbError } = await supabase
      .from("projects")
      .insert({
        user_email:      email.toLowerCase().trim(),
        project_data:    project,
        assessment_data: assessment,
      })
      .select("id")
      .single();

    if (dbError || !savedProject) {
      console.error("[save-project] DB error:", dbError);
      return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
    }

    const projectId = savedProject.id as string;

    // Generate magic link — clicking it establishes a session for the projects list
    const redirectTo = `${BASE_URL}/auth/callback?projectId=${projectId}`;
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase().trim(),
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[save-project] Magic link error:", linkError);
      // Project is saved — still return the ID even if email fails
      return NextResponse.json({ projectId, emailSent: false });
    }

    // Send email via Resend
    const emailSent = await sendReportEmail({
      email:     email.toLowerCase().trim(),
      magicLink: linkData.properties.action_link,
      address:   project.address,
      projectId,
      baseUrl:   BASE_URL,
    });

    return NextResponse.json({ projectId, emailSent });
  } catch (err) {
    console.error("[save-project]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendReportEmail({
  email, magicLink, address, projectId, baseUrl,
}: {
  email: string;
  magicLink: string;
  address: string;
  projectId: string;
  baseUrl: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[save-project] Magic link for ${email}:\n${magicLink}`);
    return false;
  }

  const reportUrl = `${baseUrl}/dashboard/projects/${projectId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
    <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f8fafa">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafa;padding:40px 0">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

            <!-- Header -->
            <tr><td style="background:#0b1d28;padding:28px 36px">
              <table><tr>
                <td>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4922A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </td>
                <td style="padding-left:10px;font-size:16px;font-weight:700;color:white;font-family:'Helvetica Neue',sans-serif;letter-spacing:-0.3px">PlanningPerm</td>
              </tr></table>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:36px">
              <p style="font-size:12px;font-weight:600;color:#D4922A;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Your report is ready</p>
              <h1 style="font-size:24px;font-weight:700;color:#0b1d28;margin:0 0 10px;letter-spacing:-0.4px;line-height:1.25">
                Your planning assessment<br/>is saved
              </h1>
              <p style="font-size:15px;color:#6b7280;margin:0 0 24px;line-height:1.7">
                Your full planning assessment for <strong style="color:#0b1d28">${address}</strong> is saved to your account.
                Use the button below to access it from any device.
              </p>

              <!-- Primary CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 16px">
                <tr><td style="background:#0b1d28;border-radius:100px">
                  <a href="${reportUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:white;text-decoration:none">
                    Open my report →
                  </a>
                </td></tr>
              </table>

              <!-- Magic link access -->
              <p style="font-size:13px;color:#9ca3af;margin:0 0 8px">
                To access your full project history and sign in to your account:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                <tr><td style="background:#f3f4f6;border-radius:100px">
                  <a href="${magicLink}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#0b1d28;text-decoration:none">
                    Sign in to my account
                  </a>
                </td></tr>
              </table>

              <p style="font-size:12px;color:#d1d5db;margin:0;line-height:1.6">
                The sign-in link expires in 24 hours and can only be used once.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td></tr>

            <!-- Footer -->
            <tr><td style="background:#f8fafa;padding:18px 36px;border-top:1px solid #f1f5f5">
              <p style="font-size:12px;color:#9ca3af;margin:0">PlanningPerm · AI-powered UK planning assessments</p>
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
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "PlanningPerm <hello@planningperm.com>",
      to:      email,
      subject: `Your planning report for ${address}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[save-project] Resend error:", await res.text());
    return false;
  }
  return true;
}
