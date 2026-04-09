"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import type { StoredProject } from "@/lib/project-store";

const LOADING_STEPS = [
  "Resolving address and coordinates",
  "Checking site constraints",
  "Analysing planning policy",
  "Calculating approval score",
  "Generating your assessment",
];

function LoadingScreen({ address }: { address: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 900)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(11,29,40)", gap: 32, padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#D4922A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>PP</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px 0" }}>Feasibility check</p>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", margin: "0 0 8px 0", letterSpacing: -0.5 }}>{address}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        {LOADING_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: i <= step ? 1 : 0.25, transition: "opacity 0.5s" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < step ? "rgb(55,176,170)" : i === step ? "rgba(55,176,170,0.3)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.5s" }}>
              {i < step
                ? <CheckCircle size={14} color="white" strokeWidth={2.5} />
                : i === step
                ? <Loader2 size={13} color="rgb(55,176,170)" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }} />
                : null}
            </div>
            <span style={{ fontSize: 15, color: i <= step ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)", transition: "color 0.5s" }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function GeneratedResultPage() {
  const router = useRouter();
  const [address, setAddress] = useState("Your property");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have a preview result for the SAME project input, skip re-running
    const existingPreview = sessionStorage.getItem("pp_preview_data");
    const currentInput    = sessionStorage.getItem("pp_new_project");
    if (existingPreview && currentInput) {
      try {
        const previewed = JSON.parse(existingPreview) as { project: StoredProject };
        const current   = JSON.parse(currentInput)   as StoredProject;
        // Only reuse if address + project type match
        if (previewed.project.address === current.address && previewed.project.projectTypeId === current.projectTypeId) {
          router.replace("/dashboard/projects/preview");
          return;
        }
      } catch { /* fall through to re-run */ }
    }
    // Clear stale preview data before running a fresh assessment
    sessionStorage.removeItem("pp_preview_data");

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

        // Store the full result as a preview (not yet saved to localStorage)
        sessionStorage.setItem("pp_preview_data", JSON.stringify({ project: proj, assessment: data }));
        sessionStorage.removeItem("pp_latest_project_id");

        // Mark that this browser has used its one free preview
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
