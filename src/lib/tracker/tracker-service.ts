/**
 * Tracker service — checks all active application trackers and
 * creates alerts for any status changes.
 *
 * Called by the Python service cron (weekly) via the /api/tracker/poll endpoint.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { fetchApplicationStatus } from "./planning-portal";
import {
  generateStatusChangeAlert,
  generateObjectionAlert,
  generateOfficerAssignedAlert,
} from "./alert-generator";

interface TrackerWithProject {
  id: string;
  project_id: string;
  reference: string;
  lpa_code: string;
  status: string;
  officer_assigned: string | null;
  consultation_end_date: string | null;
  decision_due_date: string | null;
  objections_count: number;
  last_checked: string;
  last_event: string | null;
  projects: {
    id: string;
    address: string;
    user_id: string;
    lpa_code: string | null;
    lpas?: { portal_url: string } | null;
  } | null;
}

export async function pollAllTrackers() {
  const supabase = await createServiceClient();

  const { data: rawTrackers } = await supabase
    .from("application_trackers")
    .select("*");

  if (!rawTrackers || rawTrackers.length === 0) return { checked: 0, alerts: 0 };

  let alertCount = 0;

  for (const tracker of rawTrackers) {
    try {
      // Fetch the project separately to avoid complex join typing
      const { data: project } = await supabase
        .from("projects")
        .select("id, address, user_id, lpa_code")
        .eq("id", tracker.project_id)
        .single();

      if (!project) continue;

      // Fetch the LPA portal URL
      const { data: lpa } = project.lpa_code
        ? await supabase
            .from("lpas")
            .select("portal_url")
            .eq("code", project.lpa_code)
            .single()
        : { data: null };

      const status = await fetchApplicationStatus(
        tracker.reference,
        tracker.lpa_code,
        lpa?.portal_url
      );

      if (!status) continue;

      const alerts = [];

      if (status.status !== tracker.status) {
        alerts.push(
          generateStatusChangeAlert(tracker.status, status.status, tracker.reference)
        );
      }

      if (status.objections_count > tracker.objections_count) {
        alerts.push(
          generateObjectionAlert(tracker.reference, status.objections_count)
        );
      }

      if (status.officer_assigned && !tracker.officer_assigned) {
        alerts.push(
          generateOfficerAssignedAlert(tracker.reference, status.officer_assigned)
        );
      }

      if (alerts.length > 0) {
        for (const alert of alerts) {
          await supabase.from("alerts").insert({
            project_id: project.id,
            user_id: project.user_id,
            type: alert.type,
            title: alert.title,
            body: alert.body,
            read: false,
            sent_email: false,
          });
        }
        alertCount += alerts.length;
      }

      await supabase
        .from("application_trackers")
        .update({
          status: status.status,
          officer_assigned: status.officer_assigned,
          consultation_end_date: status.consultation_end_date,
          decision_due_date: status.decision_due_date,
          objections_count: status.objections_count,
          last_checked: new Date().toISOString(),
          last_event: status.last_event,
        })
        .eq("id", tracker.id);

    } catch (e) {
      console.error(`Failed to poll tracker ${tracker.id}:`, e);
    }
  }

  return { checked: rawTrackers.length, alerts: alertCount };
}
