import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import type { FeasibilityReport } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!project) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const report = project.feasibility_report as FeasibilityReport | null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/dashboard/projects/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Planning documents</h1>
        <p className="text-[#6B7280] mt-1 text-sm">
          AI-drafted documents for {project.address}. Edit them to match your
          specific circumstances before submitting.
        </p>
      </div>

      <DocumentsPanel
        projectId={id}
        project={project}
        report={report}
        existingDocuments={documents || []}
      />
    </div>
  );
}
