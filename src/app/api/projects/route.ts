import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runFeasibilityEngine } from "@/lib/feasibility/engine";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    address,
    uprn,
    lpa_code,
    lpa_name,
    project_type,
    property_type,
    is_listed,
    is_conservation_area,
    description,
  } = body;

  if (!address || !project_type || !property_type || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      address,
      uprn: uprn || null,
      lpa_code: lpa_code || null,
      lpa_name: lpa_name || null,
      project_type,
      property_type,
      is_listed: is_listed || false,
      is_conservation_area: is_conservation_area || false,
      description,
      status: "draft",
    })
    .select()
    .single();

  if (projectError || !project) {
    console.error("Project creation error:", projectError);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  // Run feasibility assessment asynchronously if LPA is known
  if (lpa_code && lpa_name) {
    runFeasibilityEngine({
      address,
      lpa_code,
      lpa_name,
      description,
      project_type,
      property_type,
      is_listed: is_listed || false,
      is_conservation_area: is_conservation_area || false,
    })
      .then(async (report) => {
        await supabase
          .from("projects")
          .update({
          feasibility_score: report.score,
          feasibility_report: JSON.parse(JSON.stringify(report)),
            status: "feasibility_complete",
          })
          .eq("id", project.id);
      })
      .catch((err) => {
        console.error("Feasibility engine error:", err);
      });
  }

  return NextResponse.json({ id: project.id });
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return NextResponse.json(projects || []);
}
