"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  MapPin, ChevronLeft,
  CheckCircle, AlertTriangle, XCircle, Building2, Zap, ShieldCheck,
  Trees, Landmark, FileSignature, TrendingUp, ArrowRight,
} from "lucide-react";
import type { StoredProject, AssessmentResult } from "@/lib/project-store";

type PreviewData = { project: StoredProject; assessment: AssessmentResult };

// ── Score arc ────────────────────────────────────────────────────────────────
function ScoreArc({ score, sizePx = 220 }: { score: number; sizePx?: number }) {
  const size = sizePx; const r = Math.round(size * 0.4);
  const circ = 2 * Math.PI * r;
  const arc = 0.75;
  const filled = (score / 100) * arc * circ;
  const track  = arc * circ;
  const gap    = circ - track;
  const color  = score >= 70 ? "rgb(55,176,170)" : score >= 45 ? "#D4922A" : "#e05252";
  const label  = score >= 70 ? "Likely Approved" : score >= 45 ? "Borderline" : "High Risk";

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(135deg)", pointerEvents: "none" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={11} strokeDasharray={`${track} ${gap}`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dasharray 0.9s ease" }} />
      </svg>
      <p style={{ fontSize: Math.round(size * 0.068), fontWeight: 600, color: "rgba(255,255,255,0.55)", margin: `0 0 ${Math.round(size * 0.02)}px 0`, letterSpacing: "0.08em", textTransform: "uppercase" }}>Score</p>
      <p style={{ fontSize: Math.round(size * 0.27), fontWeight: 800, color: "white", letterSpacing: -0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {score}<span style={{ fontSize: Math.round(size * 0.11), fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>%</span>
      </p>
      <p style={{ fontSize: Math.round(size * 0.068), color: "rgba(255,255,255,0.4)", margin: `${Math.round(size * 0.03)}px 0 0 0` }}>out of 100</p>
      <p style={{ fontSize: Math.round(size * 0.075), fontWeight: 700, color, margin: `${Math.round(size * 0.05)}px 0 0 0` }}>{label}</p>
    </div>
  );
}

// ── Constraint icon map ───────────────────────────────────────────────────────
function constraintIcon(label: string) {
  const map: Record<string, React.ReactNode> = {
    "Conservation area":         <Landmark   size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Listed building":           <ShieldCheck size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Green belt":                <Trees       size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Flood zone":                <Zap         size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "Article 4 direction":       <AlertTriangle size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
    "AONB / National Landscape": <MapPin      size={17} color="rgb(130,150,160)" strokeWidth={1.8} />,
  };
  return map[label] ?? <MapPin size={17} color="rgb(130,150,160)" strokeWidth={1.8} />;
}

function buildConstraints(c: StoredProject["constraints"]) {
  if (!c) return [
    { label: "Conservation area",         status: "warn" as const, note: "Unable to verify — check with your council" },
    { label: "Listed building",           status: "warn" as const, note: "Unable to verify — check with your council" },
    { label: "Green belt",                status: "warn" as const, note: "Unable to verify — check with your council" },
    { label: "Flood zone",                status: "warn" as const, note: "Unable to verify — check with your council" },
    { label: "Article 4 direction",       status: "warn" as const, note: "Unable to verify — check with your council" },
    { label: "AONB / National Landscape", status: "warn" as const, note: "Unable to verify — check with your council" },
  ];
  return [
    { label: "Conservation area",         status: c.is_conservation ? "warn" as const : "pass" as const, note: c.is_conservation ? `Within ${c.conservation_name ?? "a conservation area"}` : "Not within a conservation area" },
    { label: "Listed building",           status: c.is_listed ? "fail" as const : "pass" as const,       note: c.is_listed ? `Grade ${c.listed_grade ?? "II"} listed building` : "Property is not listed" },
    { label: "Green belt",                status: c.is_green_belt ? "fail" as const : "pass" as const,   note: c.is_green_belt ? "Within green belt land" : "Outside green belt land" },
    { label: "Flood zone",                status: c.is_flood_risk ? "warn" as const : "pass" as const,   note: c.is_flood_risk ? `${c.flood_zone ?? "Flood zone"} — drainage plan required` : "Low flood risk" },
    { label: "Article 4 direction",       status: c.is_article_4 ? "warn" as const : "pass" as const,   note: c.is_article_4 ? "Article 4 applies — permitted development rights restricted" : "No Article 4 restrictions apply" },
    { label: "AONB / National Landscape", status: c.is_aonb ? "warn" as const : "pass" as const,       note: c.is_aonb ? "Within Area of Outstanding Natural Beauty" : "Outside any designated landscape" },
  ];
}

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle size={17} color="rgb(55,176,170)" strokeWidth={2} />;
  if (status === "fail") return <XCircle size={17} color="rgb(200,60,60)" strokeWidth={2} />;
  return <AlertTriangle size={17} color="rgb(212,150,42)" strokeWidth={2} />;
}

// ── Hero background ───────────────────────────────────────────────────────────
function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", height: "100%", pointerEvents: "none" }}>
        <defs>
          <linearGradient id="prev-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgb(11,29,40)" />
            <stop offset="100%" stopColor="rgb(22,58,80)" />
          </linearGradient>
          <radialGradient id="prev-g2" cx="75%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(55,176,170,0.28)" />
            <stop offset="100%" stopColor="rgba(55,176,170,0)"    />
          </radialGradient>
          <radialGradient id="prev-g3" cx="15%" cy="70%" r="45%">
            <stop offset="0%"   stopColor="rgba(212,150,42,0.18)" />
            <stop offset="100%" stopColor="rgba(212,150,42,0)"    />
          </radialGradient>
        </defs>
        <rect fill="url(#prev-g1)" width="100%" height="100%" />
        <rect fill="url(#prev-g2)" width="100%" height="100%" />
        <rect fill="url(#prev-g3)" width="100%" height="100%" />
      </svg>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const [data, setData]         = useState<PreviewData | null>(null);
  const [noData, setNoData]     = useState(false);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const { isMobile, isTablet }  = useBreakpoint();
  const hPad = isMobile ? "16px" : isTablet ? "32px" : "64px";

  useEffect(() => {
    const raw = sessionStorage.getItem("pp_preview_data");
    if (!raw) { setNoData(true); return; }
    try { setData(JSON.parse(raw)); } catch { setNoData(true); }
  }, []);

  const handleEmailCapture = () => {
    if (!email.trim() || !email.includes("@")) return;
    const lead = { name: name.trim(), email: email.trim(), address: data?.project.address ?? "", ts: new Date().toISOString() };
    sessionStorage.setItem("pp_lead_email", email.trim());
    if (name.trim()) sessionStorage.setItem("pp_lead_name", name.trim());
    try {
      const existing = JSON.parse(localStorage.getItem("pp_leads") ?? "[]");
      existing.unshift(lead);
      localStorage.setItem("pp_leads", JSON.stringify(existing));
    } catch { /* ignore */ }
    setEmailSaved(true);
  };


  if (noData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(248,250,250)", gap: 16, fontFamily: ''Inter', sans-serif' }}>
        <AlertTriangle size={36} color="rgb(180,180,180)" />
        <p style={{ fontSize: 16, color: "rgb(60,80,90)" }}>No preview data found. Please start a new check.</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start a new check
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { project, assessment } = data;
  const constraints = buildConstraints(project.constraints);
  const hasConstraints = project.constraints && (
    project.constraints.is_conservation || project.constraints.is_listed ||
    project.constraints.is_green_belt   || project.constraints.is_flood_risk ||
    project.constraints.is_article_4    || project.constraints.is_aonb
  );

  const highRisks   = assessment.risks?.filter((r) => r.severity === "high")   ?? [];
  const medRisks    = assessment.risks?.filter((r) => r.severity === "medium")  ?? [];
  const lowRisks    = assessment.risks?.filter((r) => r.severity === "low")     ?? [];
  const riskBadgeColor = highRisks.length > 0 ? "rgb(200,60,60)" : medRisks.length > 0 ? "rgb(212,150,42)" : "rgb(55,176,170)";
  const riskBadgeBg    = highRisks.length > 0 ? "rgba(200,60,60,0.10)" : medRisks.length > 0 ? "rgba(212,150,42,0.10)" : "rgba(55,176,170,0.10)";
  const riskBadgeText  = highRisks.length > 0
    ? `${highRisks.length} high risk${highRisks.length > 1 ? "s" : ""}`
    : medRisks.length > 0
      ? `${medRisks.length} medium risk${medRisks.length > 1 ? "s" : ""}`
      : `${lowRisks.length} flag${lowRisks.length !== 1 ? "s" : ""} identified`;

  const CARD = { background: "white", borderRadius: 24, padding: "28px 32px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" };

  return (
    <div style={{ fontFamily: ''Inter', sans-serif', background: "rgb(248,250,250)", minHeight: "100vh" }}>

      <main>
        {/* ── Hero ── */}
        <section style={{ position: "relative", overflow: "hidden", paddingTop: 68, minHeight: 340 }}>
          <HeroBg />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? "24px" : "36px"} ${hPad} ${isMobile ? "56px" : "72px"}` }}>
            <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
              <ChevronLeft size={16} strokeWidth={2} /> Start over
            </Link>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 24 : 40, textAlign: isMobile ? "center" : "left" }}>
              <ScoreArc score={assessment.score} sizePx={isMobile ? 210 : 220} />
              <div style={{ flex: 1 }}>
                {/* Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, justifyContent: isMobile ? "center" : "flex-start" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(55,176,170,0.15)", border: "1px solid rgba(55,176,170,0.35)", borderRadius: 20, padding: "5px 14px" }}>
                    <CheckCircle size={12} color="rgb(55,176,170)" strokeWidth={2.5} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(55,176,170)" }}>Full report — free during beta</span>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.10)", borderRadius: 20, padding: "5px 14px" }}>
                    <MapPin size={13} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{project.council || "Local Planning Authority"}</span>
                  </div>
                </div>

                <h1 style={{ fontSize: isMobile ? 22 : 42, fontWeight: 800, color: "white", letterSpacing: -0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project.address}
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: "0 0 20px 0", lineHeight: 1.6 }}>
                  {project.projectTypeLabel}
                </p>

                {/* Verdict pill */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 18px" }}>
                  <Building2 size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>Verdict:</span>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}>
                    {assessment.score >= 70 ? "Likely Approved" : assessment.score >= 45 ? "Borderline" : "High Risk"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wave */}
          <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2, lineHeight: 0, pointerEvents: "none" }}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
              <path d="M0,0 Q360,80 720,40 Q1080,0 1440,60 L1440,80 L0,80 Z" fill="rgb(248,250,250)" />
            </svg>
          </div>
        </section>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${hPad} 80px` }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 400px", gap: 24, marginTop: 32 }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Constraints */}
              <div style={CARD}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgb(11,29,40)", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Site constraints</h2>
                  {hasConstraints ? (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(140,90,10)", background: "rgba(212,150,42,0.10)", border: "1px solid rgba(212,150,42,0.25)", borderRadius: 8, padding: "3px 10px" }}>Constraints detected</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(30,110,105)", background: "rgba(55,176,170,0.10)", border: "1px solid rgba(55,176,170,0.25)", borderRadius: 8, padding: "3px 10px" }}>No major constraints</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {constraints.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < constraints.length - 1 ? "1px solid rgb(240,246,246)" : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgb(248,250,250)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {constraintIcon(c.label)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "rgb(11,29,40)", margin: 0 }}>{c.label}</p>
                        <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: "2px 0 0 0" }}>{c.note}</p>
                      </div>
                      <StatusIcon status={c.status} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "rgb(160,180,185)", margin: "16px 0 0 0", lineHeight: 1.5 }}>
                  Data from MHCLG Planning Data API and OS Places. Verified against your exact address coordinates.
                </p>
              </div>

              {/* Risk factors — unlocked */}
              <div style={CARD}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgb(11,29,40)", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Risk factors</h2>
                  <span style={{ fontSize: 13, fontWeight: 600, color: riskBadgeColor, background: riskBadgeBg, border: `1px solid ${riskBadgeColor}44`, borderRadius: 8, padding: "3px 10px" }}>
                    {riskBadgeText}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[...highRisks, ...medRisks, ...lowRisks].map((r, i, arr) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid rgb(240,246,246)" : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: r.severity === "high" ? "rgba(200,60,60,0.08)" : r.severity === "medium" ? "rgba(212,150,42,0.08)" : "rgba(55,176,170,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {r.severity === "high"
                          ? <AlertTriangle size={17} color="rgb(200,60,60)"    strokeWidth={1.8} />
                          : r.severity === "medium"
                            ? <AlertTriangle size={17} color="rgb(212,150,42)" strokeWidth={1.8} />
                            : <CheckCircle   size={17} color="rgb(55,176,170)" strokeWidth={1.8} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "rgb(11,29,40)", margin: "0 0 3px 0" }}>{r.title}</p>
                        <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: 0, lineHeight: 1.5 }}>{r.detail}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.severity === "high" ? "rgb(200,60,60)" : r.severity === "medium" ? "rgb(212,150,42)" : "rgb(55,176,170)", background: r.severity === "high" ? "rgba(200,60,60,0.08)" : r.severity === "medium" ? "rgba(212,150,42,0.08)" : "rgba(55,176,170,0.08)", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {r.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Paywall CTA (sticky) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ position: "sticky", top: 96 }}>

                {/* Beta access card */}
                <div style={{ background: "rgb(11,29,40)", borderRadius: 24, padding: "32px 28px", boxShadow: "rgba(0,0,0,0.2) 0px 8px 32px", marginBottom: 16 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(55,176,170,0.15)", border: "1px solid rgba(55,176,170,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 14 }}>
                    <CheckCircle size={12} color="rgb(55,176,170)" strokeWidth={2.5} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(55,176,170)" }}>Beta — full access free</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Your complete planning assessment
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 20px 0", lineHeight: 1.6 }}>
                    We&apos;re in early access — full reports are free while we refine the product. Paid plans launch soon.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: <AlertTriangle size={14} color="rgb(55,176,170)" strokeWidth={2} />, text: "Full risk factor breakdown — included" },
                      { icon: <FileSignature size={14} color="rgb(55,176,170)" strokeWidth={2} />, text: "Planning documents — coming soon" },
                      { icon: <Building2    size={14} color="rgb(55,176,170)" strokeWidth={2} />, text: "Cost estimate — coming soon" },
                      { icon: <ArrowRight   size={14} color="rgb(55,176,170)" strokeWidth={2} />, text: "Architect referrals — coming soon" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(55,176,170,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval rate teaser */}
                {assessment.area_approval_rate !== null && (
                  <div style={{ background: "white", borderRadius: 20, padding: "20px 24px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgb(100,120,130)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Area approval rate</p>
                    <p style={{ fontSize: 32, fontWeight: 400, color: "rgb(11,29,40)", margin: "0 0 4px 0", letterSpacing: -1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {assessment.area_approval_rate}%
                      <span style={{ fontSize: 15, fontWeight: 400, color: "rgb(100,120,130)", marginLeft: 6 }}>householder</span>
                    </p>
                    <p style={{ fontSize: 12, color: "rgb(160,180,185)", margin: 0, lineHeight: 1.5 }}>{project.council} · MHCLG PS2 data</p>
                  </div>
                )}

                {/* Email capture — save report link */}
                {!emailSaved ? (
                  <div style={{ background: "white", borderRadius: 20, padding: "20px 24px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(11,29,40)", margin: "0 0 4px 0" }}>Not ready to unlock?</p>
                    <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: "0 0 12px 0", lineHeight: 1.5 }}>Leave your details and we&apos;ll save this report so you can come back. Your name will also appear on your planning documents.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        style={{ border: "1.5px solid rgb(226,240,240)", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "rgb(11,29,40)", background: "rgb(249,252,252)" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleEmailCapture(); }}
                          placeholder="your@email.com"
                          style={{ flex: 1, border: "1.5px solid rgb(226,240,240)", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "rgb(11,29,40)", background: "rgb(249,252,252)" }}
                        />
                        <button
                          onClick={handleEmailCapture}
                          style={{ background: "rgb(11,29,40)", color: "white", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "rgba(55,176,170,0.08)", border: "1.5px solid rgba(55,176,170,0.3)", borderRadius: 20, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={18} color="rgb(55,176,170)" strokeWidth={2} />
                    <p style={{ fontSize: 14, color: "rgb(30,100,95)", margin: 0, fontWeight: 500 }}>Got it — we&apos;ll hold your report at this link.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom info banner */}
          <div style={{ marginTop: 32, background: "white", borderRadius: 20, padding: isMobile ? "20px" : "24px 32px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 4px 0" }}>planningperm is in early access</p>
              <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: 0 }}>Full reports are free during beta. Paid plans with additional features — documents, comparables, and architect referrals — launch soon.</p>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(55,176,170,0.08)", border: "1.5px solid rgba(55,176,170,0.25)", borderRadius: 12, padding: "10px 18px", flexShrink: 0, whiteSpace: "nowrap" }}>
              <CheckCircle size={15} color="rgb(55,176,170)" strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgb(30,100,95)" }}>Free during beta</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
