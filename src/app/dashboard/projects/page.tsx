"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home, FolderOpen, FileText, MapPin, Bell,
  User, ChevronLeft, ChevronRight, Plus,
  AlertTriangle, CheckCircle, Search,
} from "lucide-react";
import { projectStore, type SavedProject } from "@/lib/project-store";

function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", height: "100%", pointerEvents: "none" }}>
        <defs>
          <mask id="pjHeroMask">
            <rect fill="white" width="100%" height="50%" />
            <ellipse cx="50%" cy="0%" rx="150%" ry="100%" fill="white" />
          </mask>
          <linearGradient id="pjSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="30%"  stopColor="#1a3448" />
            <stop offset="60%"  stopColor="#2a5850" />
            <stop offset="85%"  stopColor="#3a6840" />
            <stop offset="100%" stopColor="#4a6038" />
          </linearGradient>
          <radialGradient id="pjSun" cx="68%" cy="32%" r="28%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="pjDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(8,18,32,0.78)" />
            <stop offset="45%"  stopColor="rgba(8,18,32,0.32)" />
            <stop offset="100%" stopColor="rgba(8,18,32,0)"    />
          </linearGradient>
        </defs>
        <rect fill="url(#pjSky)"  width="100%" height="100%" mask="url(#pjHeroMask)" />
        <rect fill="url(#pjSun)"  width="100%" height="100%" mask="url(#pjHeroMask)" />
        <rect fill="url(#pjDark)" width="100%" height="100%" mask="url(#pjHeroMask)" />
      </svg>
    </div>
  );
}

function scoreColor(s: number) {
  if (s >= 70) return "rgb(55,176,170)";
  if (s >= 45) return "rgb(212,150,42)";
  return "rgb(200,60,60)";
}
function scoreBg(s: number) {
  if (s >= 70) return "rgba(55,176,170,0.12)";
  if (s >= 45) return "rgba(212,150,42,0.12)";
  return "rgba(200,60,60,0.10)";
}

function ScoreRing({ score }: { score: number }) {
  const r = 32; const circ = 2 * Math.PI * r; const fill = (score / 100) * circ; const c = scoreColor(score);
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ pointerEvents: "none" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} transform="rotate(-90 38 38)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: c }}>{score}</span>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days} day${days !== 1 ? "s" : ""} ago`;
  const mos = Math.floor(days / 30);
  return `${mos} month${mos !== 1 ? "s" : ""} ago`;
}

export default function ProjectsPage() {
  const [projects, setProjects]         = useState<SavedProject[]>([]);
  const [search, setSearch]             = useState("");
  const [hasUnpaidPreview, setHasUnpaidPreview] = useState(false);

  useEffect(() => {
    setProjects(projectStore.getAll());
    setHasUnpaidPreview(!!sessionStorage.getItem("pp_preview_data"));
  }, []);

  const filtered = projects.filter((p) =>
    p.project.address.toLowerCase().includes(search.toLowerCase()) ||
    p.project.council.toLowerCase().includes(search.toLowerCase()) ||
    p.project.projectTypeLabel.toLowerCase().includes(search.toLowerCase())
  );

  const needsAttention = projects.filter((p) => p.assessment.score < 45).length;

  return (
    <div style={{ fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif', background: "rgb(234,245,245)", minHeight: "100vh" }}>

      <main>
        <div style={{ background: "rgb(234,245,245)", paddingBottom: 40 }}>

          {/* ══ HERO ════════════════════════════════════════════════════════ */}
          <section style={{ position: "relative", overflow: "hidden", paddingTop: 68, minHeight: 340 }}>
            <HeroBg />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "40px 64px 56px" }}>
              <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
                <ChevronLeft size={16} strokeWidth={2} /> Back to dashboard
              </Link>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 44, fontWeight: 700, color: "white", margin: "0 0 10px 0", letterSpacing: -1 }}>Your projects</h1>
                  <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                    {projects.length} {projects.length === 1 ? "property" : "properties"} checked &nbsp;·&nbsp;
                    <span style={{ color: needsAttention > 0 ? "rgb(212,150,42)" : "rgb(55,176,170)" }}>
                      {needsAttention > 0 ? `${needsAttention} need${needsAttention === 1 ? "s" : ""} attention` : "All clear"}
                    </span>
                  </p>
                </div>
                <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(55,176,170)", color: "white", borderRadius: 12, padding: "13px 24px", fontSize: 16, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                  <Plus size={17} strokeWidth={2.5} /> Check new property
                </Link>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, zIndex: 2, lineHeight: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
                <path d="M0,0 Q360,80 720,40 Q1080,0 1440,60 L1440,80 L0,80 Z" fill="rgb(234,245,245)" />
              </svg>
            </div>
          </section>

          {/* ══ CONTENT ═════════════════════════════════════════════════════ */}
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px" }}>

            {/* Search */}
            <section style={{ padding: "32px 0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 14, padding: "0 18px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" }}>
                <Search size={18} color="rgb(130,150,160)" strokeWidth={1.8} />
                <input
                  placeholder="Search by address or project type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "rgb(11,29,40)", background: "transparent", padding: "15px 0", fontFamily: "inherit" }}
                />
              </div>
            </section>

            {/* Attention banner */}
            {needsAttention > 0 && (
              <div style={{ background: "rgba(212,150,42,0.10)", border: "1.5px solid rgba(212,150,42,0.3)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <AlertTriangle size={16} color="rgb(212,150,42)" strokeWidth={2} />
                <p style={{ fontSize: 15, color: "rgb(120,80,10)", margin: 0, fontWeight: 500 }}>
                  {needsAttention} {needsAttention === 1 ? "project needs" : "projects need"} your attention — review the risk flags to keep your applications on track
                </p>
              </div>
            )}

            {/* Project list or empty state */}
            <section style={{ padding: "0 0 40px" }}>
              {filtered.length === 0 ? (
                <div style={{ background: "white", borderRadius: 24, padding: "56px 40px", textAlign: "center", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px" }}>
                  {search ? (
                    <>
                      <p style={{ fontSize: 18, fontWeight: 600, color: "rgb(60,80,90)", margin: "0 0 8px 0" }}>No projects match &ldquo;{search}&rdquo;</p>
                      <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: 0 }}>Try a different address or clear the search.</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 18, fontWeight: 600, color: "rgb(60,80,90)", margin: "0 0 8px 0" }}>No projects yet</p>
                      {hasUnpaidPreview ? (
                        <>
                          <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: "0 0 24px 0" }}>You have an unsaved report — unlock it to save it here.</p>
                          <Link href="/dashboard/projects/preview" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(55,176,170)", color: "white", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 600, textDecoration: "none", marginRight: 10 }}>
                            View your preview
                          </Link>
                          <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(11,29,40)", color: "white", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                            <Plus size={16} strokeWidth={2.5} /> Check a different property
                          </Link>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: "0 0 24px 0" }}>Run your first planning check to get a real approval score.</p>
                          <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(11,29,40)", color: "white", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                            <Plus size={16} strokeWidth={2.5} /> Check a property
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map((p) => {
                    const score = p.assessment.score;
                    const sc = scoreColor(score);
                    const sb = scoreBg(score);
                    const needsAttn = score < 45;
                    return (
                      <Link key={p.id} href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ background: "white", borderRadius: 24, padding: "22px 28px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", display: "flex", alignItems: "center", gap: 22 }}>
                          <ScoreRing score={score} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                              <p style={{ fontSize: 19, fontWeight: 700, color: "rgb(11,29,40)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{p.project.address}</p>
                              <p style={{ fontSize: 15, color: "rgb(100,120,130)", margin: 0, whiteSpace: "nowrap" }}>{p.project.council}</p>
                            </div>
                            <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: "0 0 10px 0" }}>{p.project.projectTypeLabel}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: sc, background: sb, borderRadius: 8, padding: "3px 10px" }}>
                                {score >= 70 ? "Likely Approved" : score >= 45 ? "Borderline" : "High Risk"}
                              </span>
                              {p.project.constraints?.is_conservation && (
                                <>
                                  <span style={{ fontSize: 13, color: "rgb(150,170,175)" }}>·</span>
                                  <span style={{ fontSize: 13, color: "rgb(130,150,160)" }}>Conservation area</span>
                                </>
                              )}
                              {p.project.constraints?.is_article_4 && (
                                <>
                                  <span style={{ fontSize: 13, color: "rgb(150,170,175)" }}>·</span>
                                  <span style={{ fontSize: 13, color: "rgb(130,150,160)" }}>Article 4</span>
                                </>
                              )}
                              {needsAttn && (
                                <>
                                  <span style={{ fontSize: 13, color: "rgb(150,170,175)" }}>·</span>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(160,110,20)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <AlertTriangle size={13} strokeWidth={2} /> Needs attention
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
                            <span style={{ fontSize: 13, color: "rgb(160,180,185)" }}>{timeAgo(p.createdAt)}</span>
                            {needsAttn
                              ? <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(212,150,42)", background: "rgba(212,150,42,0.10)", borderRadius: 8, padding: "4px 12px" }}>Review needed</span>
                              : <CheckCircle size={18} color="rgb(55,176,170)" strokeWidth={2} />
                            }
                          </div>
                          <ChevronRight size={20} color="rgb(180,200,200)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
