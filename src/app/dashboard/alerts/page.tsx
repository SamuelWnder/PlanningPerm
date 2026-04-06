import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  const { data: alertsRaw } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const alerts = alertsRaw || [];

  const unreadCount = alerts?.filter((a) => !a.read).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-[#6B7280] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
      </div>

      {(!alerts || alerts.length === 0) ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-white p-16 text-center">
          <Bell className="h-10 w-10 text-[#D1CDC6] mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No alerts yet</h3>
          <p className="text-[#6B7280] text-sm">
            Alerts will appear here when your application status changes.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const project = null;
            return (
              <Card
                key={alert.id}
                className={alert.read ? "opacity-70" : "border-[#C8A96E]/30"}
              >
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="flex items-start gap-3">
                    {!alert.read && (
                      <div className="h-2 w-2 rounded-full bg-[#C8A96E] flex-shrink-0 mt-2" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm text-[#6B7280] mt-0.5">{alert.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#9CA3AF]">
                          {formatDate(alert.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/projects/${alert.project_id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
