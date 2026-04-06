/**
 * Generates plain-English alerts when application status changes.
 * Sends email via Resend.
 */

import { Resend } from "resend";
import type { AlertType } from "@/types/database";

export interface AlertData {
  type: AlertType;
  title: string;
  body: string;
}

export function generateStatusChangeAlert(
  oldStatus: string,
  newStatus: string,
  reference: string
): AlertData {
  const statusMessages: Record<string, { title: string; body: string }> = {
    "Awaiting Decision": {
      title: "Your application is awaiting decision",
      body: `Planning application ${reference} has been validated and is now awaiting a decision. The council has 8 weeks from the validation date to decide.`,
    },
    "Decided": {
      title: "A decision has been made on your application",
      body: `Planning application ${reference} has received a decision. Log in to view the full decision notice.`,
    },
    "Approved": {
      title: "Your planning application has been approved",
      body: `Congratulations! Planning application ${reference} has been approved. Log in to view any conditions attached to the approval.`,
    },
    "Refused": {
      title: "Your planning application has been refused",
      body: `Planning application ${reference} has been refused. Log in to read the officer's report and explore your options, including appeal.`,
    },
  };

  const msg = statusMessages[newStatus] || {
    title: `Application status changed to: ${newStatus}`,
    body: `The status of planning application ${reference} has changed from "${oldStatus}" to "${newStatus}".`,
  };

  return { type: "status_change", ...msg };
}

export function generateObjectionAlert(
  reference: string,
  objectionCount: number
): AlertData {
  return {
    type: "objection_received",
    title: `${objectionCount} objection${objectionCount > 1 ? "s" : ""} received`,
    body: `Planning application ${reference} has received ${objectionCount} objection${objectionCount > 1 ? "s" : ""} from neighbours or third parties. Log in to view the objections and draft a response.`,
  };
}

export function generateOfficerAssignedAlert(
  reference: string,
  officerName: string
): AlertData {
  return {
    type: "officer_assigned",
    title: "Planning officer assigned",
    body: `${officerName} has been assigned as the case officer for planning application ${reference}. They will be your main contact during the assessment process.`,
  };
}

export async function sendAlertEmail(
  userEmail: string,
  alert: AlertData,
  address: string,
  projectId: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "PlanningPerm <alerts@planningperm.co.uk>",
    to: userEmail,
    subject: alert.title,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="margin-bottom: 24px;">
          <div style="background: #1A3A2A; color: #C8A96E; display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 16px;">
            PLANNING PERM
          </div>
          <h1 style="font-size: 22px; color: #1A1F2E; margin: 0 0 8px;">${alert.title}</h1>
          <p style="color: #6B7280; font-size: 14px; margin: 0;">${address}</p>
        </div>
        
        <div style="background: #F9F8F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #374151; margin: 0; line-height: 1.6;">${alert.body}</p>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://planningperm.co.uk"}/dashboard/projects/${projectId}" 
           style="display: inline-block; background: #1A3A2A; color: #F5F0E8; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
          View project
        </a>
        
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
          You're receiving this because you set up tracking for this application on PlanningPerm.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #9CA3AF;">Manage notifications</a>
        </p>
      </div>
    `,
  });
}
