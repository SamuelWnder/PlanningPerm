import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateDocument, DOCUMENT_TYPE_LABELS } from "@/lib/feasibility/document-generator";
import type { DocumentType, FeasibilityReport } from "@/types/database";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { project_id, document_type, refusal_reason } = await request.json();

  if (!project_id || !document_type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", project_id)
    .eq("user_id", userId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const report = project.feasibility_report as FeasibilityReport | null;

  const content = await generateDocument({
    project: {
      address: project.address,
      lpa_name: project.lpa_name,
      project_type: project.project_type,
      property_type: project.property_type,
      is_listed: project.is_listed,
      is_conservation_area: project.is_conservation_area,
      description: project.description,
    },
    report,
    document_type: document_type as DocumentType,
    refusal_reason,
  });

  // Upsert — replace existing if re-generating
  const { data: existing } = await supabase
    .from("documents")
    .select("id")
    .eq("project_id", project_id)
    .eq("document_type", document_type)
    .single();

  let doc;
  if (existing) {
    const { data } = await supabase
      .from("documents")
      .update({ content, version: 1, is_final: false })
      .eq("id", existing.id)
      .select()
      .single();
    doc = data;
  } else {
    const { data } = await supabase
      .from("documents")
      .insert({
        project_id,
        document_type: document_type as DocumentType,
        title: DOCUMENT_TYPE_LABELS[document_type as DocumentType],
        content,
        version: 1,
        is_final: false,
      })
      .select()
      .single();
    doc = data;
  }

  return NextResponse.json(doc);
}
