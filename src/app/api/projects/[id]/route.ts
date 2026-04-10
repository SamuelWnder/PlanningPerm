import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("projects")
      .select("id, user_email, project_data, assessment_data, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      id:          data.id,
      createdAt:   data.created_at,
      project:     data.project_data,
      assessment:  data.assessment_data,
    });
  } catch (err) {
    console.error("[api/projects/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
