"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ChevronLeft, Plus, AlertTriangle, CheckCircle, Search, ChevronRight } from "lucide-react";
import type { SavedProject } from "@/lib/project-store";
import { createClient } from "@/lib/supabase/client";

function HeroBg() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "inherit", overflow: "hidden" }}>
      <svg preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="pjSky2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e1e30" />
            <stop offset="40%"  stopColor="#1a3448" />
            <stop offset="70%"  stopColor="#2a5850" />
            <stop offset="100%" stopColor="#3a6040" />
          </linearGradient>
          <radialGradient id="pjSun2" cx="75%" cy="25%" r="35%">
            <stop offset="0%"  stopColor="#d4922a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d4922a" stopOpacity="0"   />
          </radialGradient>
        </defs>
        <rect fill="url(#pjSky2)" width="100%" height="100%" />
        <rect fill="url(#pjSun2)" width="100%" height="100%" />
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

type AuthState = "loading" | "signed_in" | "signed_out";

export default function ProjectsPage() {
  const [projects,   setProjects]   = useState<SavedProject[]>([]);
  const [search,     setSearch]     = useState("");
  const [authState,  setAuthState]  = useState<AuthState>("loading");
  const [userEmail,  setUserEmail]  = useState("");
  // Sign-in form state
  const [signInEmail, setSignInEmail]   = useState("");
  const [signInState, setSignInState]   = useState<"idle" | "sending" | "sent">("idle");
  const [signInError, setSignInError]   = useState("");

  const { isMobile, isTablet } = useBreakpoint();
  const hPad = isMobile ? "16px" : isTablet ? "32px" : "64px";

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setAuthState("signed_out");
        return;
      }

      setUserEmail(session.user.email);

      // Fetch all projects for this user (RLS filters by email automatically)
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_data, assessment_data, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data.map((row) => ({
          id:         row.id,
          createdAt:  row.created_at,
          project:    row.project_data  as SavedProject["project"],
          assessment: row.assessment_data as SavedProject["assessment"],
        })));
      }

      setAuthState("signed_in");
    }
    init();
  }, []);

  async function handleSendMagicLink() {
    setSignInError("");
    const trimmed = signInEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSignInError("Please enter a valid email address.");
      return;
    }
    setSignInState("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSignInState("sent");
    } catch {
      setSignInError("Couldn't send the link. Please try again.");
      setSignInState("idle");
    }
  }

  const filtered = projects.filter((p) =>
    p.project.address.toLowerCase().includes(search.toLowerCase()) ||
    p.project.council.toLowerCase().includes(search.toLowerCase()) ||
    p.project.projectTypeLabel.toLowerCase().includes(search.toLowerCase())
  );

  const needsAttention = projects.filter((p) => p.assessment.score < 45).length;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (authState === "loading") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "rgb(248,250,250)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(55,176,170,0.2)", borderTopColor: "rgb(55,176,170)", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14, color: "rgb(130,150,160)", margin: 0 }}>Loading your projects…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Sign-in gate ────────────────────────────────────────────────────────────
  if (authState === "signed_out") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "rgb(248,250,250)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "rgb(11,29,40)", borderRadius: 24, padding: "40px 32px", textAlign: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#D4922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36, margin: "0 auto 20px", display: "block", filter: "drop-shadow(0 0 10px rgba(212,146,42,0.4))" }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.4, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 0 8px" }}>
            Sign in to view your reports
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px", lineHeight: 1.6 }}>
            Enter the email you used when you ran your check. We&apos;ll send you a one-click sign-in link.
          </p>

          {signInState === "sent" ? (
            <div style={{ background: "rgba(55,176,170,0.12)", border: "1px solid rgba(55,176,170,0.3)", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(55,176,170)", margin: "0 0 4px" }}>Check your email</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                We&apos;ve sent a sign-in link to <strong style={{ color: "white" }}>{signInEmail}</strong>. Click it to access your projects.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => { setSignInEmail(e.target.value); setSignInError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMagicLink(); }}
                  placeholder="your@email.com"
                  disabled={signInState === "sending"}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.08)",
                    border: signInError ? "1.5px solid rgba(220,60,60,0.6)" : "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 14,
                    color: "white",
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  onClick={handleSendMagicLink}
                  disabled={signInState === "sending"}
                  style={{
                    background: "#D4922A",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: signInState === "sending" ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    opacity: signInState === "sending" ? 0.6 : 1,
                  }}
                >
                  {signInState === "sending" ? "Sending…" : "Send link"}
                </button>
              </div>
              {signInError && <p style={{ fontSize: 12, color: "rgba(220,80,80,0.9)", margin: "0 0 8px", textAlign: "left" }}>{signInError}</p>}
            </>
          )}

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: "20px 0 0" }}>
            Don&apos;t have an account?{" "}
            <Link href="/dashboard/projects/new" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>
              Run a new check
            </Link>
          </p>
        </div>
        <style>{`input::placeholder { color: rgba(255,255,255,0.25); } input:focus { border-color: rgba(55,176,170,0.5) !important; }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "rgb(248,250,250)", minHeight: "100vh" }}>

      <main>
        {/* ══ PAGE WRAPPER (hero + content share same gutter) ════════════ */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "12px 16px 40px" : "24px 48px 48px" }}>

          {/* HERO CARD */}
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", padding: isMobile ? "32px 24px 40px" : "48px 52px 52px", marginBottom: isMobile ? 12 : 16 }}>
            <HeroBg />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
                <ChevronLeft size={14} strokeWidth={2} /> Dashboard
              </Link>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? 30 : 42, fontWeight: 800, color: "white", letterSpacing: -0.5, margin: "0 0 8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your projects</h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                    {userEmail && <span>{userEmail} &nbsp;·&nbsp;</span>}
                    {projects.length} {projects.length === 1 ? "property" : "properties"} checked
                    {needsAttention > 0 && <> &nbsp;·&nbsp; <span style={{ color: "rgb(212,150,42)" }}>{needsAttention} need{needsAttention === 1 ? "s" : ""} attention</span></>}
                  </p>
                </div>
                <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 100, padding: "13px 24px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif", boxShadow: "0 0 24px rgba(212,146,42,0.35)", flexShrink: 0 }}>
                  <Plus size={16} strokeWidth={2.5} /> New check
                </Link>
              </div>
            </div>
          </div>

          {/* ══ CONTENT ═════════════════════════════════════════════════════ */}
          <div>

            {/* Search */}
            <section style={{ padding: isMobile ? "20px 0 12px" : "32px 0 16px" }}>
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
                      <p style={{ fontSize: 15, color: "rgb(130,150,160)", margin: "0 0 24px 0" }}>Run your first planning check to get a real approval score.</p>
                      <Link href="/dashboard/projects/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                        <Plus size={16} strokeWidth={2.5} /> Check a property
                      </Link>
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
                          <div style={{ background: "white", borderRadius: 24, padding: isMobile ? "16px 18px" : "22px 28px", boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px 0px, rgba(152,203,205,0.64) 0px 4px 8px 0px", display: "flex", alignItems: "center", gap: isMobile ? 14 : 22 }}>
                          <ScoreRing score={score} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                              <p style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "rgb(11,29,40)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? "calc(100vw - 180px)" : 400 }}>{p.project.address}</p>
                              {!isMobile && <p style={{ fontSize: 14, color: "rgb(100,120,130)", margin: 0, whiteSpace: "nowrap" }}>{p.project.council}</p>}
                            </div>
                            <p style={{ fontSize: 13, color: "rgb(100,120,130)", margin: "0 0 8px 0" }}>{isMobile ? `${p.project.council} · ` : ""}{p.project.projectTypeLabel}</p>
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
                          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            {!isMobile && <span style={{ fontSize: 13, color: "rgb(160,180,185)" }}>{timeAgo(p.createdAt)}</span>}
                            {needsAttn
                              ? isMobile
                                ? <AlertTriangle size={18} color="rgb(212,150,42)" strokeWidth={2} />
                                : <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(212,150,42)", background: "rgba(212,150,42,0.10)", borderRadius: 8, padding: "4px 12px" }}>Review needed</span>
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

        </div>{/* end page wrapper */}
      </main>
    </div>
  );
}
