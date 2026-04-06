import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, is_final } = await request.json();

  const supabase = await createServiceClient();

  // Verify ownership via project
  const { data: doc } = await supabase
    .from("documents")
    .select("id, project_id")
    .eq("id", id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", doc.project_id)
    .single();

  if (!project || project.user_id !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (content !== undefined) updates.content = content;
  if (is_final !== undefined) updates.is_final = is_final;

  const { data: updated } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json(updated);
}
