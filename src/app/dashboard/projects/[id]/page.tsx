import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { FeasibilityReport } from "@/components/feasibility/feasibility-report";
import { FeasibilityPending } from "@/components/feasibility/feasibility-pending";
import { formatDate } from "@/lib/utils";
import type { FeasibilityReport as FeasibilityReportType } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
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

  const report = project.feasibility_report as FeasibilityReportType | null;

  return (
    <div>
      {/* Back nav */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold">{project.address}</h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            {project.project_type?.replace(/_/g, " ")} •{" "}
            {project.property_type?.replace(/_/g, " ")}
            {project.lpa_name && ` • ${project.lpa_name}`}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Created {formatDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {project.status === "feasibility_complete" && (
            <>
              <Link href={`/dashboard/projects/${id}/documents`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="h-4 w-4" />
                  Generate documents
                </Button>
              </Link>
              <Link href={`/dashboard/projects/${id}/tracker`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Bell className="h-4 w-4" />
                  Track application
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feasibility content */}
      {report ? (
        <FeasibilityReport report={report} project={project} />
      ) : (
        <FeasibilityPending projectId={id} />
      )}
    </div>
  );
}
