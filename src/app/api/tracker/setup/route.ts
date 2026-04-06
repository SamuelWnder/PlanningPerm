import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchApplicationStatus } from "@/lib/tracker/planning-portal";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { project_id, reference, lpa_code } = await request.json();

  if (!project_id || !reference || !lpa_code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", project_id)
    .eq("user_id", userId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch current status from Planning Portal
  const status = await fetchApplicationStatus(reference, lpa_code);

  // Create or update tracker
  const trackerData = {
    project_id,
    reference,
    lpa_code,
    status: status?.status || "Submitted",
    officer_assigned: status?.officer_assigned || null,
    consultation_end_date: status?.consultation_end_date || null,
    decision_due_date: status?.decision_due_date || null,
    objections_count: status?.objections_count || 0,
    last_checked: new Date().toISOString(),
    last_event: status?.last_event || null,
  };

  const { data: tracker, error } = await supabase
    .from("application_trackers")
    .upsert(trackerData, { onConflict: "project_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create tracker" }, { status: 500 });
  }

  // Update project status to submitted
  await supabase
    .from("projects")
    .update({
      status: "submitted",
      application_reference: reference,
    })
    .eq("id", project_id);

  return NextResponse.json({ tracker });
}
