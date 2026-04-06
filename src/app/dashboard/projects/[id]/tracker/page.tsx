import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { TrackerPanel } from "@/components/tracker/tracker-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackerPage({ params }: PageProps) {
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

  const { data: tracker } = await supabase
    .from("application_trackers")
    .select("*")
    .eq("project_id", id)
    .single();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/dashboard/projects/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Application tracker</h1>
        <p className="text-[#6B7280] mt-1 text-sm">
          Monitor your application at {project.address}
        </p>
      </div>

      <TrackerPanel
        projectId={id}
        project={project}
        tracker={tracker}
        alerts={alerts || []}
      />
    </div>
  );
}
