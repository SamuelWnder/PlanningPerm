import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowRight, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/utils";
import type { ProjectStatus } from "@/types/database";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" | "default"; icon: React.ElementType }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  feasibility_complete: { label: "Feasibility done", variant: "success", icon: CheckCircle2 },
  documents_ready: { label: "Documents ready", variant: "success", icon: FileText },
  submitted: { label: "Submitted", variant: "warning", icon: Clock },
  under_review: { label: "Under review", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  refused: { label: "Refused", variant: "destructive", icon: XCircle },
  appeal_lodged: { label: "Appeal lodged", variant: "warning", icon: Clock },
  appeal_decided: { label: "Appeal decided", variant: "outline", icon: CheckCircle2 },
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your projects</h1>
          <p className="text-[#6B7280] mt-1">
            {projects?.length === 0
              ? "Start by adding your first project"
              : `${projects?.length} project${projects?.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {(!projects || projects.length === 0) && (
        <div className="rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EDE6]">
            <Plus className="h-7 w-7 text-[#1A3A2A]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-[#6B7280] mb-6 max-w-sm mx-auto">
            Add your first project to get a free feasibility assessment based on
            real planning data for your area.
          </p>
          <Link href="/dashboard/projects/new">
            <Button>
              Start your first assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Project grid */}
      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = STATUS_CONFIG[project.status as ProjectStatus] || STATUS_CONFIG.draft;
            const StatusIcon = config.icon;

            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:border-[#1A3A2A]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug line-clamp-2">
                        {project.address}
                      </CardTitle>
                      <Badge variant={config.variant} className="shrink-0">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">
                      {project.description || "No description yet"}
                    </p>
                    <div className="flex items-center justify-between">
                      {project.feasibility_score !== null ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              project.feasibility_score >= 70
                                ? "bg-green-100 text-green-700"
                                : project.feasibility_score >= 45
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(project.feasibility_score)}%
                          </div>
                          <span className="text-xs text-[#6B7280]">approval odds</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">No assessment yet</span>
                      )}
                      <span className="text-xs text-[#9CA3AF]">
                        {formatDateShort(project.updated_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Add new card */}
          <Link href="/dashboard/projects/new">
            <div className="rounded-xl border-2 border-dashed border-[#E5E0D8] bg-white p-6 hover:border-[#1A3A2A]/30 transition-colors cursor-pointer flex flex-col items-center justify-center text-center min-h-[180px] gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE6]">
                <Plus className="h-5 w-5 text-[#1A3A2A]" />
              </div>
              <p className="text-sm font-medium text-[#6B7280]">Add new project</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
