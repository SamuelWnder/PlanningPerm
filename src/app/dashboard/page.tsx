"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ChevronLeft, ChevronRight, CheckCircle, Plus, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SavedProject } from "@/lib/project-store";

function ScoreArc({ score, size = 200 }: { score?: number; empty?: boolean; size?: number }) {
  const r    = size * 0.38;
  const circ = 2 * Math.PI * r;
  const arc  = 0.72;
  const track  = arc * circ;
  const gap    = circ - track;
  const filled = score != null ? (score / 100) * arc * circ : 0;
  const color  = score == null ? "rgba(255,255,255,0.15)"
    : score >= 70 ? "rgb(55,176,170)"
    : score >= 45 ? "#D4922A"
    : "#e05252";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0, transform: "rotate(126deg)", pointerEvents: "none" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.10)" strokeWidth={size * 0.04}
          strokeDasharray={`${track} ${gap}`} />
        {score != null && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={size * 0.04} strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.9s ease" }} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        {score != null ? (
          <>
            <span style={{ fontSize: size * 0.22, fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: -2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score}</span>
            <span style={{ fontSize: size * 0.065, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>out of 100</span>
            <span style={{ fontSize: size * 0.07, fontWeight: 700, color, marginTop: 4, background: `${color}22`, borderRadius: 100, padding: `${size*0.02}px ${size*0.06}px` }}>
              {score >= 70 ? "Likely Approved" : score >= 45 ? "Borderline" : "High Risk"}
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: size * 0.22, fontWeight: 800, color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>—</span>
            <span style={{ fontSize: size * 0.065, color: "rgba(255,255,255,0.3)", fontWeight: 500, textAlign: "center", maxWidth: size * 0.6 }}>Run your first check</span>
          </>
        )}
      </div>
    </div>
  );
}

function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit", overflow: "hidden" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="dhSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="40%"  stopColor="#1a3448" />
            <stop offset="70%"  stopColor="#2a5850" />
            <stop offset="100%" stopColor="#3a6040" />
          </linearGradient>
          <radialGradient id="dhSun" cx="75%" cy="25%" r="35%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
        </defs>
        <rect fill="url(#dhSky)" width="100%" height="100%" />
        <rect fill="url(#dhSun)" width="100%" height="100%" />
      </svg>
    </div>
  );
}

export default function DashboardHome() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [dot, setDot]           = useState(0);
  const [loading, setLoading]   = useState(true);
  const { isMobile }            = useBreakpoint();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data } = await supabase
          .from("projects")
          .select("id, project_data, assessment_data, created_at")
          .order("created_at", { ascending: false });
        if (data) {
          setProjects(data.map((r) => ({
            id: r.id, createdAt: r.created_at,
            project: r.project_data as SavedProject["project"],
            assessment: r.assessment_data as SavedProject["assessment"],
          })));
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const safeDot       = Math.min(dot, Math.max(0, projects.length - 1));
  const cur           = projects[safeDot] ?? null;
  const needsAttention = projects.filter((p) => p.assessment.score < 45).length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "rgb(248,250,250)", minHeight: "100vh" }}>
      <main>

        {/* ── PAGE WRAPPER (hero + cards share same gutter) ─────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "12px 16px 40px" : "24px 48px 48px" }}>

          {/* HERO CARD */}
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", padding: isMobile ? "32px 24px 40px" : "48px 52px 52px", marginBottom: isMobile ? 12 : 16 }}>
            <HeroBg />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? 32 : 40 }}>

              {/* Left */}
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>Dashboard</p>
                <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, color: "white", letterSpacing: -0.5, margin: "0 0 6px", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1 }}>
                  {loading ? "Loading…" : projects.length > 0 ? "Your projects" : "Welcome"}
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
                  {projects.length > 0
                    ? <>{projects.length} {projects.length === 1 ? "property" : "properties"} checked{needsAttention > 0 && <> · <span style={{ color: "#D4922A" }}>{needsAttention} need{needsAttention === 1 ? "s" : ""} attention</span></>}</>
                    : "Run your first planning check to get a real approval score."
                  }
                </p>
                <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 100, padding: "13px 24px", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 24px rgba(212,146,42,0.35)", fontFamily: "'Inter', sans-serif" }}>
                  <Plus width={16} height={16} strokeWidth={2.5} />
                  {projects.length > 0 ? "Check a new property" : "Check your first property"}
                </Link>
              </div>

              {/* Right — score gauge */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                {cur && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 2px", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.project.address}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <MapPin width={12} height={12} strokeWidth={1.8} />{cur.project.council}
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {projects.length > 1 && (
                    <button onClick={() => setDot((d) => (d - 1 + projects.length) % projects.length)}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                      <ChevronLeft width={16} height={16} strokeWidth={2} />
                    </button>
                  )}
                  <ScoreArc score={cur?.assessment.score} size={isMobile ? 180 : 220} />
                  {projects.length > 1 && (
                    <button onClick={() => setDot((d) => (d + 1) % projects.length)}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                      <ChevronRight width={16} height={16} strokeWidth={2} />
                    </button>
                  )}
                </div>
                {projects.length > 1 && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {projects.map((_, i) => (
                      <button key={i} onClick={() => setDot(i)} style={{ width: i === safeDot ? 16 : 8, height: 8, borderRadius: 100, background: i === safeDot ? "white" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── CARDS BELOW ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Projects card */}
          <Link href="/dashboard/projects" style={{ textDecoration: "none" }}>
            <div style={{ background: "#0b1d28", borderRadius: 20, padding: isMobile ? "24px 20px" : "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>Your reports</p>
                <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "white", margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {projects.length > 0 ? "View all projects" : "No projects yet"}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>Track approval scores and site constraints for every property</p>
              </div>
              <ChevronRight width={22} height={22} color="rgba(255,255,255,0.3)" strokeWidth={2} style={{ flexShrink: 0 }} />
            </div>
          </Link>

          {/* Documents card */}
          <Link href="/dashboard/documents" style={{ textDecoration: "none" }}>
            <div style={{ background: "white", borderRadius: 20, padding: isMobile ? "24px 20px" : "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(55,176,170,0.1)", borderRadius: 100, padding: "4px 10px", marginBottom: 8 }}>
                  <CheckCircle width={11} height={11} color="rgb(55,176,170)" strokeWidth={2.5} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgb(55,176,170)", fontFamily: "'Inter', sans-serif" }}>{projects.length > 0 ? "Ready to use" : "Run a check first"}</span>
                </div>
                <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0b1d28", margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>We write your planning documents</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.55 }}>
                  {projects.length > 0
                    ? isMobile ? "Design & Access Statement, Planning Statement and more" : "Your Design & Access Statement and Planning Statement are drafted automatically"
                    : "Run a check and we'll draft your planning documents automatically"}
                </p>
              </div>
              <ChevronRight width={22} height={22} color="rgba(11,29,40,0.2)" strokeWidth={2} style={{ flexShrink: 0 }} />
            </div>
          </Link>

          {/* Area data card */}
          {cur?.assessment.area_approval_rate != null && (
            <Link href={`/dashboard/projects/${cur.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0b1d28", borderRadius: 20, padding: isMobile ? "24px 20px" : "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>Area intelligence</p>
                  <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "white", margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {cur.project.council} approves {cur.assessment.area_approval_rate}%
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>of householder applications · MHCLG PS2 data</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: "rgb(55,176,170)", margin: 0, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cur.assessment.area_approval_rate}%</p>
                </div>
              </div>
            </Link>
          )}

          </div>

        </div>{/* end page wrapper */}
      </main>
    </div>
  );
}
