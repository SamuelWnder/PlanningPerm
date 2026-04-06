"use client";

import { useState } from "react";
import { Clock, Bell, User, Calendar, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { AlertType } from "@/types/database";

interface Tracker {
  id: string;
  reference: string;
  lpa_code: string;
  status: string;
  officer_assigned: string | null;
  consultation_end_date: string | null;
  decision_due_date: string | null;
  objections_count: number;
  last_checked: string;
  last_event: string | null;
}

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface Props {
  projectId: string;
  project: {
    address: string;
    lpa_code: string | null;
  };
  tracker: Tracker | null;
  alerts: Alert[];
}

const TRACKER_STEPS = [
  { key: "submitted", label: "Application submitted" },
  { key: "validated", label: "Application validated" },
  { key: "consultation", label: "Consultation period" },
  { key: "assessment", label: "Officer assessment" },
  { key: "decided", label: "Decision made" },
];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const statusLower = currentStatus.toLowerCase();
  const currentIndex = TRACKER_STEPS.findIndex((s) =>
    statusLower.includes(s.key)
  );
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#E5E0D8]" />
      <div className="space-y-4">
        {TRACKER_STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-4 relative">
            <div
              className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                i < activeIndex
                  ? "border-[#1A3A2A] bg-[#1A3A2A]"
                  : i === activeIndex
                  ? "border-[#C8A96E] bg-[#C8A96E]"
                  : "border-[#E5E0D8] bg-white"
              }`}
            >
              {i < activeIndex ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              ) : i === activeIndex ? (
                <Clock className="h-3.5 w-3.5 text-white" />
              ) : null}
            </div>
            <span
              className={`text-sm ${
                i <= activeIndex ? "font-medium text-[#1A1F2E]" : "text-[#9CA3AF]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ALERT_TYPE_ICONS: Record<AlertType, React.ElementType> = {
  status_change: Clock,
  objection_received: MessageSquare,
  officer_assigned: User,
  decision_due: Calendar,
  decision_made: CheckCircle2,
  condition_attached: Bell,
};

export function TrackerPanel({ projectId, project, tracker: initialTracker, alerts: initialAlerts }: Props) {
  const [tracker, setTracker] = useState<Tracker | null>(initialTracker);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [reference, setReference] = useState(initialTracker?.reference || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupTracker = async () => {
    if (!reference.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch(`/api/tracker/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          reference: reference.trim(),
          lpa_code: project.lpa_code,
        }),
      });
      if (!resp.ok) throw new Error("Failed to set up tracker");
      const data = await resp.json();
      setTracker(data.tracker);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const markAlertRead = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}/read`, { method: "POST" });
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  if (!tracker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            Once you&apos;ve submitted your application, enter the reference number
            from your acknowledgement letter. We&apos;ll monitor the Planning Portal
            and alert you at every stage.
          </p>

          <div className="space-y-2">
            <Label htmlFor="reference">Application reference number</Label>
            <div className="flex gap-2">
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 2024/1234/P or PP-123456"
                className="flex-1"
              />
              <Button onClick={setupTracker} disabled={submitting || !reference.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start tracking"}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="rounded-lg bg-[#F0EDE6] p-4 text-sm text-[#6B7280]">
            <p className="font-medium text-[#1A1F2E] mb-1">What we&apos;ll track:</p>
            <ul className="space-y-1">
              <li>• Application validation and registration</li>
              <li>• Neighbour consultation period and objections</li>
              <li>• Planning officer assignment</li>
              <li>• Decision date and outcome</li>
              <li>• Any conditions attached to an approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold text-[#9CA3AF] mb-1">STATUS</p>
            <p className="font-semibold text-[#1A1F2E]">{tracker.status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold text-[#9CA3AF] mb-1">REFERENCE</p>
            <p className="font-semibold text-[#1A1F2E] font-mono text-sm">
              {tracker.reference}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold text-[#9CA3AF] mb-1">OBJECTIONS</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#1A1F2E]">{tracker.objections_count}</p>
              {tracker.objections_count > 0 && (
                <Badge variant="warning">{tracker.objections_count} received</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Application progress</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={tracker.status} />

            {(tracker.officer_assigned || tracker.decision_due_date) && (
              <>
                <Separator className="my-5" />
                <div className="space-y-3">
                  {tracker.officer_assigned && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-[#6B7280]">Officer:</span>
                      <span className="font-medium">{tracker.officer_assigned}</span>
                    </div>
                  )}
                  {tracker.decision_due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-[#6B7280]">Decision due:</span>
                      <span className="font-medium">{formatDate(tracker.decision_due_date)}</span>
                    </div>
                  )}
                  {tracker.consultation_end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-[#6B7280]">Consultation ends:</span>
                      <span className="font-medium">{formatDate(tracker.consultation_end_date)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <p className="text-xs text-[#9CA3AF] mt-4">
              Last checked: {formatDate(tracker.last_checked)}
            </p>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Alerts</span>
              {alerts.filter((a) => !a.read).length > 0 && (
                <Badge variant="destructive">
                  {alerts.filter((a) => !a.read).length} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-[#9CA3AF]">
                <Bell className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm">No alerts yet. We&apos;ll notify you when anything changes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = ALERT_TYPE_ICONS[alert.type] || Bell;
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-lg p-3 cursor-pointer transition-colors ${
                        alert.read ? "bg-[#F9F8F6]" : "bg-[#F0EDE6] border border-[#C8A96E]/30"
                      }`}
                      onClick={() => !alert.read && markAlertRead(alert.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 text-[#1A3A2A] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
                            {alert.body}
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {formatDate(alert.created_at)}
                          </p>
                        </div>
                        {!alert.read && (
                          <div className="h-2 w-2 rounded-full bg-[#C8A96E] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
