"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  Home, FolderOpen, FileText, MapPin, Bell,
  User, ChevronLeft, ChevronRight, Star,
  CheckCircle, Plus,
} from "lucide-react";
import { projectStore, type SavedProject } from "@/lib/project-store";

// ── Hero gradient background ───────────────────────────────────────────────────
function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", height: "100%", pointerEvents: "none" }}>
        <defs>
          <mask id="ppHeroMask">
            <rect fill="white" width="100%" height="50%" />
            <ellipse cx="50%" cy="0%" rx="150%" ry="100%" fill="white" />
          </mask>
          <linearGradient id="ppSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="30%"  stopColor="#1a3448" />
            <stop offset="60%"  stopColor="#2a5850" />
            <stop offset="85%"  stopColor="#3a6840" />
            <stop offset="100%" stopColor="#4a6038" />
          </linearGradient>
          <radialGradient id="ppSun" cx="68%" cy="32%" r="28%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="ppDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(8,18,32,0.78)" />
            <stop offset="45%"  stopColor="rgba(8,18,32,0.32)" />
            <stop offset="100%" stopColor="rgba(8,18,32,0)"    />
          </linearGradient>
        </defs>
        <rect fill="url(#ppSky)"  width="100%" height="100%" mask="url(#ppHeroMask)" />
        <rect fill="url(#ppSun)"  width="100%" height="100%" mask="url(#ppHeroMask)" />
        <rect fill="url(#ppDark)" width="100%" height="100%" mask="url(#ppHeroMask)" />
      </svg>
    </div>
  );
}

// ── Score donut ───────────────────────────────────────────────────────────────
function ScoreDonut({ score, empty, size: sizeProp }: { score?: number; empty?: boolean; size?: number }) {
  const size = sizeProp ?? 300;
  const r    = Math.round(size * 0.427);
  const circ = 2 * Math.PI * r;
  const arc  = 0.75;
  const track  = arc * circ;
  const gap    = circ - track;
  const filled = empty ? 0 : ((score ?? 0) / 100) * arc * circ;

  const color = empty ? "rgba(255,255,255,0.18)" : (score ?? 0) >= 70 ? "rgb(55,176,170)" : (score ?? 0) >= 45 ? "#D4922A" : "#e05252";
  const label = empty ? "No searches yet" : (score ?? 0) >= 70 ? "Likely Approved" : (score ?? 0) >= 45 ? "Could go either way" : "High Risk";
  const badgeBg    = empty ? "rgba(212,146,42,0.15)"  : `${color}22`;
  const badgeBorder = empty ? "rgba(212,146,42,0.35)" : `${color}66`;
  const badgeColor  = empty ? "#D4922A"               : color;
  const badgeLabel  = empty ? "Run your first check →" : label;

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: empty ? "1.5px dashed rgba(255,255,255,0.22)" : "1.5px solid rgba(255,255,255,0.18)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", flexShrink: 0,
      }}
    >
      {/* SVG arc */}
      <svg
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0, transform: "rotate(135deg)", pointerEvents: "none" }}
      >
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={11}
          strokeDasharray={`${track} ${gap}`} />
        {!empty && (
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dasharray 0.9s ease" }} />
        )}
      </svg>

      <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)", margin: "0 0 4px 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Planning Score
      </p>
      {empty ? (
        <p style={{ fontSize: 52, fontWeight: 700, color: "rgba(255,255,255,0.18)", margin: 0, lineHeight: 1, letterSpacing: -2 }}>—</p>
      ) : (
        <p style={{ fontSize: 72, fontWeight: 400, color: "white", margin: 0, lineHeight: 1, letterSpacing: -3, fontFamily: "'Clash Display', sans-serif" }}>
          {score}<span style={{ fontSize: 30, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>%</span>
        </p>
      )}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "6px 0 0 0" }}>
        {empty ? "No searches yet" : "out of 100"}
      </p>

      <div style={{ marginTop: 14, background: badgeBg, borderRadius: 16000, padding: "8px 22px", border: `1px solid ${badgeBorder}` }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: badgeColor, margin: 0 }}>{badgeLabel}</p>
      </div>
    </div>
  );
}

// ── Pill tag ──────────────────────────────────────────────────────────────────
function Pill({ children, bg = "rgb(55,176,170)", color = "white", icon }: {
  children: React.ReactNode; bg?: string; color?: string; icon?: React.ReactNode;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, borderRadius: 12, padding: "3px 10px 3px 6px", fontSize: 12, fontWeight: 500 }}>
      {icon}{children}
    </span>
  );
}

// ── White card ────────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", ...style }}>
      {children}
    </div>
  );
}

// ── Dark card ─────────────────────────────────────────────────────────────────
function DarkCard({ children, href, style = {} }: { children: React.ReactNode; href?: string; style?: React.CSSProperties }) {
  const inner = (
    <div style={{ borderRadius: 24, padding: 24, boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", ...style }}>
      {children}
    </div>
  );
  return href
    ? <Link href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
    : inner;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlanningPermHome() {
  const [dot, setDot]             = useState(0);
  const [projects, setProjects]   = useState<SavedProject[]>([]);
  const { isMobile, isTablet }    = useBreakpoint();
  const hPad = isMobile ? "16px" : isTablet ? "32px" : "64px";

  useEffect(() => {
    const loaded = projectStore.getAll();
    setProjects(loaded);
  }, []);

  const hasProjects    = projects.length > 0;
  const safeDot        = Math.min(dot, Math.max(0, projects.length - 1));
  const currentProject = projects[safeDot] ?? null;
  const needsAttention = projects.filter((p) => p.assessment.score < 45).length;

  return (
    <div style={{ fontFamily: '"Euclid Circular B","Helvetica Neue",Arial,sans-serif', background: "rgb(234,245,245)", minHeight: "100vh" }}>

      <main>
        <div style={{ background: "rgb(234,245,245)", paddingBottom: 40 }}>

          {/* ══ HERO ════════════════════════════════════════════════════════ */}
          <section style={{ minHeight: isMobile ? 420 : 688, paddingTop: 68, position: "relative", overflow: "hidden" }}>

            <HeroBg />

            {/* SVG wave cutout at bottom */}
            <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2, lineHeight: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
                <path d="M0,0 Q360,80 720,40 Q1080,0 1440,60 L1440,80 L0,80 Z" fill="rgb(234,245,245)" />
              </svg>
            </div>

            {/* Content */}
            <div style={{ position: "relative", zIndex: 3, maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? "32px" : "72px"} ${hPad} 0`, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: isMobile ? 32 : 48 }}>

              {/* LEFT — welcome + status */}
              <div style={{ flex: "0 0 auto", maxWidth: isMobile ? "100%" : 460 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.50)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.14em" }}>Welcome back</p>
                <p style={{ fontSize: isMobile ? 48 : 88, fontWeight: 400, color: "white", margin: "0 0 24px 0", lineHeight: 1, letterSpacing: isMobile ? -2 : -4, fontFamily: "'Clash Display', sans-serif" }}>Samuel</p>

                {/* Stats row — only when projects exist */}
                {hasProjects && (
                  <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                    <div>
                      <p style={{ fontSize: isMobile ? 28 : 40, fontWeight: 400, color: "white", margin: 0, lineHeight: 1, fontFamily: "'Clash Display', sans-serif", letterSpacing: -1 }}>{projects.length}</p>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "5px 0 0 0", fontWeight: 500 }}>Active projects</p>
                    </div>
                    <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
                    <div>
                      <p style={{ fontSize: isMobile ? 28 : 40, fontWeight: 400, color: needsAttention > 0 ? "#D4922A" : "rgb(55,176,170)", margin: 0, lineHeight: 1, fontFamily: "'Clash Display', sans-serif", letterSpacing: -1 }}>{needsAttention}</p>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "5px 0 0 0", fontWeight: 500 }}>Need{needsAttention === 1 ? "s" : ""} attention</p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href="/dashboard/projects/new"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#D4922A", color: "white", borderRadius: 16000, padding: "16px 28px", fontSize: 17, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 32px rgba(212,146,42,0.45)" }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  {hasProjects ? "Check a new project" : "Check your first property"}
                </Link>
              </div>

              {/* RIGHT — score carousel / empty state */}
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: isMobile ? 48 : 0 }}>

                {hasProjects && currentProject ? (
                  <>
                    {/* Address */}
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 4px 0", letterSpacing: -0.3, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {currentProject.project.address}
                      </p>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <MapPin size={12} strokeWidth={1.8} />{currentProject.project.council}
                      </p>
                    </div>

                    {/* Arrows + ring row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <button
                        onClick={() => setDot((d) => (d - 1 + projects.length) % projects.length)}
                        style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >
                        <ChevronLeft size={22} strokeWidth={2} />
                      </button>

                      <ScoreDonut score={currentProject.assessment.score} size={isMobile ? 200 : 300} />

                      <button
                        onClick={() => setDot((d) => (d + 1) % projects.length)}
                        style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >
                        <ChevronRight size={22} strokeWidth={2} />
                      </button>
                    </div>

                    {/* Dots */}
                    {projects.length > 1 && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {projects.map((_, i) => (
                            <button key={i} onClick={() => setDot(i)} style={{ width: i === safeDot ? 18 : 10, height: i === safeDot ? 18 : 10, borderRadius: 16000, background: i === safeDot ? "white" : "rgba(255,255,255,0.35)", border: i === safeDot ? "2px solid rgba(255,255,255,0.55)" : "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                          Project {safeDot + 1} of {projects.length} · use arrows to switch
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/dashboard/projects/new" style={{ textDecoration: "none" }}>
                    <ScoreDonut empty size={isMobile ? 200 : 300} />
                  </Link>
                )}
              </div>

            </div>

          </section>

          {/* ══ CONTENT ═════════════════════════════════════════════════════ */}
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${hPad}` }}>

            {/* ── What's new ──────────────────────────────────────────────── */}
            <section style={{ padding: "32px 0 8px" }}>
              <h2 style={{ fontSize: 28, fontWeight: 400, color: "rgb(11,29,40)", margin: "0 0 16px 0", fontFamily: "'Clash Display', sans-serif", letterSpacing: -0.5 }}>What&apos;s new</h2>

              <Card>
                <div style={{ marginBottom: 10 }}>
                  <Pill bg="rgb(55,176,170)" icon={<Star size={11} strokeWidth={2} />}>Welcome</Pill>
                </div>
                <h4 style={{ fontSize: 20, fontWeight: 700, color: "rgb(11,29,40)", margin: "0 0 8px 0" }}>Welcome to PlanningPerm</h4>
                <p style={{ fontSize: 16, color: "rgb(11,29,40)", margin: "0 0 20px 0", lineHeight: 1.55 }}>
                  Get a real planning approval score in under 2 minutes — based on your council&apos;s actual decisions, not a generic formula
                </p>
                <Link
                  href="/dashboard/projects/new"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#D4922A",
                    color: "white",
                    border: "none", borderRadius: 12, padding: "11px 20px",
                    fontSize: 15, fontWeight: 600, cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  Get started
                </Link>
              </Card>

            </section>


            {/* ── Your projects ───────────────────────────────────────────── */}
            <section style={{ padding: "20px 0 8px" }}>
              <h2 style={{ fontSize: 28, fontWeight: 400, color: "rgb(11,29,40)", margin: "0 0 16px 0", fontFamily: "'Clash Display', sans-serif", letterSpacing: -0.5 }}>Your projects</h2>

              {/* Check approval odds */}
              <DarkCard
                href="/dashboard/projects"
                style={{ background: "linear-gradient(145deg,rgb(8,18,32) 0%,rgb(14,32,50) 50%,rgb(10,24,38) 100%)", marginBottom: 16, position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 40px)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ marginBottom: 12 }}>
                    <Pill bg="rgb(216,222,228)" color="rgb(11,29,40)">{projects.length} active</Pill>
                  </div>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 8px 0", maxWidth: 480, lineHeight: 1.35 }}>
                    {projects.length > 0 ? "View all your projects" : "No projects yet"}
                  </h4>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0 }}>
                    Track approval scores, site constraints, and next steps for every property
                  </p>
                </div>
              </DarkCard>

              {/* Documents */}
              <DarkCard
                href={hasProjects ? `/dashboard/projects/${projects[0].id}#documents` : "/dashboard/projects/new"}
                style={{ background: "linear-gradient(145deg,rgb(10,24,16) 0%,rgb(18,44,24) 55%,rgb(24,50,20) 100%)", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg,transparent 0%,rgba(30,80,30,0.6) 100%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", maxWidth: "62%" }}>
                  <div style={{ marginBottom: 12 }}>
                    <Pill bg="rgb(55,176,170)" icon={<CheckCircle size={11} strokeWidth={2} />}>
                      {hasProjects ? "Ready to use" : "Run a check first"}
                    </Pill>
                  </div>
                  <h4 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 8px 0", lineHeight: 1.35 }}>
                    We write your planning documents for you
                  </h4>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.55 }}>
                    {hasProjects
                      ? "Your supporting statements are drafted automatically from your assessment — ready to attach to your application"
                      : "Run a property check and we'll draft your Design & Access Statement and Planning Statement automatically"}
                  </p>
                </div>
              </DarkCard>
            </section>

            {/* ── Area Intelligence ────────────────────────────────────────── */}
            <section style={{ padding: "20px 0 32px" }}>
              <h2 style={{ fontSize: 28, fontWeight: 400, color: "rgb(11,29,40)", margin: "0 0 6px 0", fontFamily: "'Clash Display', sans-serif", letterSpacing: -0.5 }}>Area Intelligence</h2>
              <p style={{ fontSize: 16, color: "rgb(45,56,67)", margin: "0 0 16px 0" }}>See how projects like yours have fared nearby</p>

              {(() => {
                const areaRate   = hasProjects ? (projects[0].assessment.area_approval_rate ?? null) : null;
                const areaCouncil = hasProjects ? projects[0].project.council : null;
                const areaLabel  = hasProjects ? projects[0].assessment.area_approval_rate_label : null;
                const rateVal    = areaRate ?? 0;
                const filled     = (rateVal / 100) * 0.75 * 2 * Math.PI * 58;

                return (
                  <Link href={hasProjects ? `/dashboard/projects/${projects[0].id}` : "/dashboard/projects/new"} style={{ textDecoration: "none" }}>
                    <div style={{ borderRadius: 24, padding: isMobile ? 20 : 28, background: "linear-gradient(145deg,rgb(14,10,40) 0%,rgb(22,15,60) 45%,rgb(18,20,70) 100%)", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", position: "relative", overflow: "hidden", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 20 : 0 }}>
                      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

                      <div style={{ position: "relative", maxWidth: isMobile ? "100%" : "55%" }}>
                        <div style={{ marginBottom: 12 }}>
                          <Pill bg="rgb(55,176,170)" icon={<MapPin size={10} strokeWidth={2.5} />}>AreaScore</Pill>
                        </div>
                        {areaRate !== null ? (
                          <>
                            <h4 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                              {areaCouncil} approves {areaRate}% of householder applications
                            </h4>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                              {areaLabel ?? "Source: MHCLG PS2 planning statistics"}
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                              Check a property to see your area&apos;s approval rate
                            </h4>
                            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0 }}>
                              We&apos;ll pull real decision data from your local planning authority
                            </p>
                          </>
                        )}
                      </div>

                      {/* Gauge */}
                      <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0, marginRight: 8 }}>
                        <svg width="130" height="130" viewBox="0 0 130 130">
                          <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                          {areaRate !== null && (
                            <circle cx="65" cy="65" r="58" fill="none" stroke="rgb(55,176,170)" strokeWidth="6" strokeLinecap="round"
                              strokeDasharray={`${filled} ${2 * Math.PI * 58}`}
                              strokeDashoffset={2 * Math.PI * 58 * 0.125}
                              style={{ filter: "drop-shadow(0 0 6px rgba(55,176,170,0.7))" }}
                              transform="rotate(-225 65 65)" />
                          )}
                          <circle cx="65" cy="65" r="44" fill="rgba(55,176,170,0.07)" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          {areaRate !== null ? (
                            <>
                              <p style={{ fontSize: 28, fontWeight: 700, color: "white", margin: 0, letterSpacing: -1, lineHeight: 1 }}>{areaRate}%</p>
                              <p style={{ fontSize: 9, fontWeight: 600, color: "rgb(55,176,170)", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>APPROVAL RATE</p>
                            </>
                          ) : (
                            <>
                              <p style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.2)", margin: 0, letterSpacing: -1, lineHeight: 1 }}>—</p>
                              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>NO DATA YET</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
