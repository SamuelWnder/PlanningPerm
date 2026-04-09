"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, AlertTriangle } from "lucide-react";
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

function LoadingScreen({ address }: { address: string }) {
  const [step, setStep]       = useState(0);
  const [progress, setProgress] = useState(0);
  const [factIdx, setFactIdx]  = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  // Step progression
  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i + 1), s.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Smooth progress bar (0→95% over ~5s, holds until redirect)
  useEffect(() => {
    const start = Date.now();
    const total = 5200;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(95, (elapsed / total) * 95));
    }, 40);
    return () => clearInterval(tick);
  }, []);

  // Rotating facts every 4s
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

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgb(11,29,40)",
      padding: "32px 20px",
      fontFamily: '"Euclid Circular B","Helvetica Neue",Arial,sans-serif',
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Subtle dot-grid background */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Glow blob */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(55,176,170,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>

        {/* Logo + address */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#D4922A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 32px rgba(212,146,42,0.35)" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: -0.5 }}>PP</span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px 0" }}>
            Feasibility check
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "0 0 6px 0", letterSpacing: -0.3, lineHeight: 1.3 }}>
            {address}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Usually takes 30–60 seconds
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgb(55,176,170), rgb(212,146,42))",
            borderRadius: 4,
            transition: "width 0.1s linear",
          }} />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const active  = i === step;
            const pending = i > step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: pending ? 0.28 : 1, transition: "opacity 0.5s" }}>
                {/* Icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "rgb(55,176,170)" : active ? "rgba(55,176,170,0.15)" : "rgba(255,255,255,0.06)",
                  border: active ? "1.5px solid rgba(55,176,170,0.5)" : "1.5px solid transparent",
                  transition: "all 0.4s",
                }}>
                  {done && <Check size={13} color="white" strokeWidth={2.5} />}
                  {active && (
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "rgb(55,176,170)",
                      animation: "pulse 1.2s ease-in-out infinite",
                    }} />
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 14,
                  fontWeight: done ? 500 : active ? 600 : 400,
                  color: done ? "rgba(255,255,255,0.6)" : active ? "white" : "rgba(255,255,255,0.3)",
                  transition: "color 0.4s",
                  textDecoration: done ? "line-through" : "none",
                  textDecorationColor: "rgba(255,255,255,0.2)",
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Rotating fact */}
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

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}

export default function GeneratedResultPage() {
  const router = useRouter();
  const [address, setAddress] = useState("Your property");
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const existingPreview = sessionStorage.getItem("pp_preview_data");
    const currentInput    = sessionStorage.getItem("pp_new_project");
    if (existingPreview && currentInput) {
      try {
        const previewed = JSON.parse(existingPreview) as { project: StoredProject };
        const current   = JSON.parse(currentInput)   as StoredProject;
        if (previewed.project.address === current.address && previewed.project.projectTypeId === current.projectTypeId) {
          router.replace("/dashboard/projects/preview");
          return;
        }
      } catch { /* fall through */ }
    }
    sessionStorage.removeItem("pp_preview_data");

    async function run() {
      try {
        const raw = sessionStorage.getItem("pp_new_project");
        if (!raw) { setError("No project data found. Please start a new check."); return; }
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

        sessionStorage.setItem("pp_preview_data", JSON.stringify({ project: proj, assessment: data }));
        sessionStorage.removeItem("pp_latest_project_id");
        localStorage.setItem("pp_used_free_check", "true");
        router.replace("/dashboard/projects/preview");
      } catch (e) {
        setError("Something went wrong generating your assessment. Please try again.");
        console.error(e);
      }
    }
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(234,245,245)", gap: 16, padding: 24 }}>
        <AlertTriangle size={40} color="rgb(200,60,60)" />
        <p style={{ fontSize: 17, color: "rgb(60,80,90)", textAlign: "center", maxWidth: 400 }}>{error}</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start again
        </Link>
      </div>
    );
  }

  return <LoadingScreen address={address} />;
}
