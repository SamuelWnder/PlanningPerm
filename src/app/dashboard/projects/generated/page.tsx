"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, AlertTriangle, Mail, ArrowRight } from "lucide-react";
import type { StoredProject } from "@/lib/project-store";

const STEPS = [
  { label: "Resolving address & coordinates",  duration: 900  },
  { label: "Checking 20 site constraints",      duration: 1800 },
  { label: "Analysing planning policy",         duration: 2700 },
  { label: "Calculating approval probability",  duration: 3600 },
  { label: "Generating your full assessment",   duration: 4500 },
];

const FACTS = [
  "Over 500,000 planning applications are submitted in England every year.",
  "Rear extensions under 4m for detached houses usually don't need planning permission.",
  "Conservation areas cover around 5% of the land area in England.",
  "Around 88% of planning applications in England are approved.",
  "Article 4 directions can remove permitted development rights in specific areas.",
  "Listed buildings in England & Wales are graded I, II*, or II — Grade I is the most protected.",
  "Properties in flood zones may require a Flood Risk Assessment with any application.",
  "Planning decisions must be made within 8 weeks for most applications.",
];

type PageState = "loading" | "needs_email" | "saving" | "error";

export default function GeneratedResultPage() {
  const router = useRouter();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [address,    setAddress]    = useState("Your property");
  const [step,       setStep]       = useState(0);
  const [progress,   setProgress]   = useState(0);
  const [factIdx,    setFactIdx]    = useState(0);
  const [factVisible,setFactVisible]= useState(true);
  const [pageState,  setPageState]  = useState<PageState>("loading");
  const [error,      setError]      = useState<string | null>(null);

  // ── Email form ─────────────────────────────────────────────────────────────
  const [email,       setEmail]      = useState("");
  const [emailError,  setEmailError] = useState("");

  // ── Internal refs (don't trigger re-renders) ──────────────────────────────
  // Holds the finished AI result waiting for email submission
  const pendingResult = useRef<{ project: StoredProject; assessment: unknown } | null>(null);

  // ── Step progression ───────────────────────────────────────────────────────
  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i + 1), s.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Smooth progress bar (0→95% over ~5s, holds until done) ────────────────
  useEffect(() => {
    const start = Date.now();
    const total = 5200;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(95, (elapsed / total) * 95));
    }, 40);
    return () => clearInterval(tick);
  }, []);

  // ── Rotating facts ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIdx((i) => (i + 1) % FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Run AI assessment ──────────────────────────────────────────────────────
  useEffect(() => {
    async function run() {
      try {
        const raw = sessionStorage.getItem("pp_new_project");
        if (!raw) {
          setError("No project data found. Please start a new check.");
          return;
        }
        const proj: StoredProject = JSON.parse(raw);
        setAddress(proj.address);

        const res = await fetch("/api/dashboard/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address:          proj.address,
            council:          proj.council,
            lpa_code:         proj.lpa_code,
            projectType:      proj.projectTypeLabel,
            size:             proj.size,
            roof:             proj.roof,
            material:         proj.material,
            description:      proj.description,
            constraints:      proj.constraints,
            propertyType:     proj.propertyType,
            tenure:           proj.tenure,
            garageAttachment: proj.garageAttachment,
            garageUse:        proj.garageUse,
            treeWorkType:     proj.treeWorkType,
            treeTPO:          proj.treeTPO,
            treeDiameter:     proj.treeDiameter,
            currentUse:       proj.currentUse,
            proposedUse:      proj.proposedUse,
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // AI done — store result and prompt for email
        pendingResult.current = { project: proj, assessment: data };
        setProgress(100);
        setStep(STEPS.length);
        setPageState("needs_email");
      } catch (e) {
        console.error(e);
        setError("Something went wrong generating your assessment. Please try again.");
      }
    }
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save project + redirect ────────────────────────────────────────────────
  async function handleSubmitEmail() {
    setEmailError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!pendingResult.current) {
      setEmailError("Still generating — please wait a moment.");
      return;
    }

    setPageState("saving");

    try {
      const res = await fetch("/api/auth/save-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:      trimmed,
          project:    pendingResult.current.project,
          assessment: pendingResult.current.assessment,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Save failed");

      // Clean up session data
      sessionStorage.removeItem("pp_new_project");

      // Redirect directly to the report — UUID is the access token
      router.replace(`/dashboard/projects/${data.projectId}`);
    } catch (e) {
      console.error(e);
      setError("We couldn't save your report. Please try again.");
    }
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", gap: 16, padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <AlertTriangle size={40} color="rgb(200,60,60)" />
        <p style={{ fontSize: 17, color: "rgb(60,80,90)", textAlign: "center", maxWidth: 400 }}>{error}</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start again
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgb(11,29,40)",
      padding: "32px 20px",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Dot-grid background */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(55,176,170,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>

        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D4922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, filter: "drop-shadow(0 0 10px rgba(212,146,42,0.5))" }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: -0.4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              PlanningPerm
            </span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px 0" }}>
            Feasibility check
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "white", margin: "0 0 4px 0", letterSpacing: -0.3, lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {address}
          </h2>
          {pageState === "loading" && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Usually takes 30–60 seconds
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgb(55,176,170), rgb(212,146,42))",
            borderRadius: 4,
            transition: progress === 100 ? "width 0.6s ease" : "width 0.1s linear",
          }} />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const active  = i === step;
            const pending = i > step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: pending ? 0.28 : 1, transition: "opacity 0.5s" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "rgb(55,176,170)" : active ? "rgba(55,176,170,0.15)" : "rgba(255,255,255,0.06)",
                  border: active ? "1.5px solid rgba(55,176,170,0.5)" : "1.5px solid transparent",
                  transition: "all 0.4s",
                }}>
                  {done   && <Check size={12} color="white" strokeWidth={2.5} />}
                  {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(55,176,170)", animation: "pulse 1.2s ease-in-out infinite" }} />}
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: done ? 400 : active ? 600 : 400,
                  color: done ? "rgba(255,255,255,0.45)" : active ? "white" : "rgba(255,255,255,0.3)",
                  transition: "color 0.4s",
                  textDecorationLine: done ? "line-through" : "none",
                  textDecorationColor: done ? "rgba(255,255,255,0.2)" : "transparent",
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Email gate — shown when AI is done ────────────────────────────── */}
        {(pageState === "needs_email" || pageState === "saving") && (
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 18,
            padding: "24px 22px",
            animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(55,176,170,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={14} color="rgb(55,176,170)" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Your report is ready
              </p>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
              Enter your email to open your report and receive a saved link — so you can come back from any device.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmitEmail(); }}
                placeholder="your@email.com"
                disabled={pageState === "saving"}
                autoFocus
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.08)",
                  border: emailError ? "1.5px solid rgba(220,60,60,0.6)" : "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "white",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                onClick={handleSubmitEmail}
                disabled={pageState === "saving"}
                style={{
                  background: pageState === "saving" ? "rgba(212,146,42,0.5)" : "#D4922A",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "11px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: pageState === "saving" ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "background 0.2s",
                }}
              >
                {pageState === "saving" ? "Saving…" : <>Open report <ArrowRight size={14} /></>}
              </button>
            </div>
            {emailError && (
              <p style={{ fontSize: 12, color: "rgba(220,80,80,0.9)", margin: "8px 0 0", lineHeight: 1.5 }}>
                {emailError}
              </p>
            )}
          </div>
        )}

        {/* Rotating fact — shown only while loading */}
        {pageState === "loading" && (
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "16px 20px",
            opacity: factVisible ? 1 : 0,
            transition: "opacity 0.4s",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(55,176,170,0.8)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px 0" }}>
              Did you know?
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
              {FACTS[factIdx]}
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(55,176,170,0.5) !important; }
      `}</style>
    </div>
  );
}
