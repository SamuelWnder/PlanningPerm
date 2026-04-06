import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  Shield,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateShort } from "@/lib/utils";
import type { FeasibilityReport as FReport, Risk, ComparableCase } from "@/types/database";

interface Props {
  report: FReport;
  project: {
    address: string;
    lpa_name: string | null;
    project_type: string;
  };
}

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-green-700 border-green-500 bg-green-50"
    : score >= 45 ? "text-amber-700 border-amber-500 bg-amber-50"
    : "text-red-700 border-red-500 bg-red-50";

  const label =
    score >= 70 ? "Likely Approved"
    : score >= 45 ? "Uncertain"
    : "High Risk";

  return (
    <div className="flex items-center gap-5">
      <div
        className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 ${color}`}
      >
        <span className="text-3xl font-bold">{Math.round(score)}%</span>
      </div>
      <div>
        <p className="text-xl font-bold">{label}</p>
        <p className="text-sm text-[#6B7280] mt-1">
          Approval likelihood based on comparable cases
        </p>
        <Badge
          variant={
            score >= 70 ? "success"
            : score >= 45 ? "warning"
            : "destructive"
          }
          className="mt-2"
        >
          {score >= 70 ? "Good prospects" : score >= 45 ? "Proceed with caution" : "Significant risk"}
        </Badge>
      </div>
    </div>
  );
}

function RiskCard({ risk }: { risk: Risk }) {
  const Icon =
    risk.severity === "high" ? XCircle
    : risk.severity === "medium" ? AlertTriangle
    : Info;

  const colors = {
    high: "border-red-200 bg-red-50",
    medium: "border-amber-200 bg-amber-50",
    low: "border-blue-200 bg-blue-50",
  };

  const iconColors = {
    high: "text-red-600",
    medium: "text-amber-600",
    low: "text-blue-600",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[risk.severity]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColors[risk.severity]}`} />
        <div>
          <p className="font-medium text-sm">{risk.factor}</p>
          <p className="text-sm text-[#374151] mt-1">{risk.explanation}</p>
          {risk.mitigation && (
            <p className="text-sm text-[#6B7280] mt-2 italic">
              <strong>Tip:</strong> {risk.mitigation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparableCaseRow({ case: c }: { case: ComparableCase }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#9CA3AF] font-mono">{c.reference}</span>
          <span className="text-sm font-medium truncate">{c.address}</span>
        </div>
        <p className="text-sm text-[#6B7280] mt-0.5 line-clamp-2">{c.description}</p>
        {c.notes && (
          <p className="text-xs text-[#9CA3AF] mt-1 italic">{c.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <Badge
          variant={
            c.decision === "approved" ? "success"
            : c.decision === "refused" ? "destructive"
            : "secondary"
          }
        >
          {c.decision}
        </Badge>
        <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateShort(c.decision_date)}
        </span>
      </div>
    </div>
  );
}

export function FeasibilityReport({ report, project }: Props) {
  return (
    <div className="space-y-6">
      {/* Score + summary */}
      <Card>
        <CardContent className="pt-6">
          <ScoreCircle score={report.score} />
          <Separator className="my-5" />
          <p className="text-[#374151] leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Key risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Key risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.key_risks.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                No significant risks identified
              </div>
            ) : (
              report.key_risks.map((risk, i) => (
                <RiskCard key={i} risk={risk} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Permitted development */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-[#1A3A2A]" />
              Permitted development
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.permitted_development.likely_pd ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Likely permitted development</p>
                    {report.permitted_development.pd_class && (
                      <p className="text-xs text-[#6B7280]">
                        {report.permitted_development.pd_class}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[#6B7280]">
                  This project may not require a full planning application.
                  Consider a Lawful Development Certificate to confirm.
                </p>
                {report.permitted_development.limitations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] mb-2">LIMITATIONS TO CHECK:</p>
                    <ul className="space-y-1">
                      {report.permitted_development.limitations.map((l, i) => (
                        <li key={i} className="text-sm text-[#374151] flex items-start gap-2">
                          <span className="text-[#C8A96E] mt-1">•</span>
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#6B7280]" />
                  <p className="font-medium text-sm">Full planning application required</p>
                </div>
                <p className="text-sm text-[#6B7280]">
                  This project falls outside permitted development rights and will
                  require a full householder planning application.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparable cases */}
      {report.comparable_cases.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-[#1A3A2A]" />
              Comparable decisions in {project.lpa_name || "your area"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[#E5E0D8]">
              {report.comparable_cases.map((c, i) => (
                <ComparableCaseRow key={i} case={c} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy notes */}
      {report.policy_notes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-[#1A3A2A]" />
              Relevant planning policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.policy_notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                  <span className="text-[#C8A96E] font-bold mt-0.5">—</span>
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      <Card className="border-[#1A3A2A]/20 bg-[#1A3A2A]/3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#374151] leading-relaxed">{report.recommendation}</p>
        </CardContent>
      </Card>

      <p className="text-xs text-[#9CA3AF] text-center">
        Assessment generated {formatDateShort(report.generated_at)} based on public
        planning data. This is not professional planning advice.
      </p>
    </div>
  );
}
