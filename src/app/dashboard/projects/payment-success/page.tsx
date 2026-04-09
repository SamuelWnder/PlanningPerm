"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { projectStore, type StoredProject, type AssessmentResult } from "@/lib/project-store";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [status, setStatus]    = useState<"verifying" | "saving" | "done" | "error">("verifying");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) { setStatus("error"); setErrorMsg("No session ID found."); return; }

    async function verify() {
      try {
        // 1. Verify payment with Stripe
        const verifyRes = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const verifyData = await verifyRes.json();
        if (!verifyData.paid) throw new Error(verifyData.error ?? "Payment not verified");

        // 2. Read preview data from sessionStorage
        setStatus("saving");
        const raw = sessionStorage.getItem("pp_preview_data");
        if (!raw) throw new Error("Preview data not found in session.");

        const { project, assessment } = JSON.parse(raw) as {
          project: StoredProject;
          assessment: AssessmentResult;
        };

        // 3. Save to localStorage permanently (instant local access)
        const localProjectId = projectStore.save(project, assessment);
        setProjectId(localProjectId);
        sessionStorage.setItem("pp_latest_project_id", localProjectId);

        // 4. Setup account in background: save to Supabase + send magic link email
        //    Fire-and-forget — don't block the redirect on this
        fetch("/api/auth/setup-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stripeSessionId: sessionId, project, assessment }),
        })
          .then((r) => r.json())
          .then((d) => { if (d.success) setEmailSent(true); })
          .catch((e) => console.error("[setup-account]", e));

        // 5. Clean up session data
        sessionStorage.removeItem("pp_preview_data");
        sessionStorage.removeItem("pp_new_project");

        setStatus("done");
      } catch (e) {
        console.error(e);
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
      }
    }
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(11,29,40)", gap: 20, padding: 24, fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif', textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "#D4922A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>PP</span>
      </div>

      {(status === "verifying" || status === "saving") && (
        <>
          <Loader2 size={36} color="rgb(55,176,170)" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: "white", margin: 0 }}>
            {status === "verifying" ? "Verifying your payment…" : "Unlocking your full report…"}
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>This will only take a moment</p>
        </>
      )}

      {status === "done" && projectId && (
        <>
          <CheckCircle size={44} color="rgb(55,176,170)" strokeWidth={1.5} />
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "0 0 8px 0", letterSpacing: -0.5 }}>Payment confirmed</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 380, lineHeight: 1.7 }}>
              Your full planning report is ready.
            </p>
          </div>

          {/* Magic link notice */}
          <div style={{ background: "rgba(55,176,170,0.10)", border: "1.5px solid rgba(55,176,170,0.25)", borderRadius: 16, padding: "18px 24px", maxWidth: 400, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Mail size={18} color="rgb(55,176,170)" strokeWidth={1.8} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "rgb(55,176,170)", margin: 0 }}>
                {emailSent ? "Magic link sent to your email" : "Sending your magic link…"}
              </p>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
              We&apos;ve emailed you a link so you can access this report from any device at any time — no password needed.
            </p>
          </div>

          <Link
            href={`/dashboard/projects/${projectId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4922A", color: "white", borderRadius: 14, padding: "15px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 24px rgba(212,150,42,0.35)" }}
          >
            Open my full report →
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <CheckCircle size={40} color="rgb(200,60,60)" strokeWidth={1.5} />
          <p style={{ fontSize: 18, fontWeight: 600, color: "white", margin: 0 }}>Something went wrong</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 380 }}>{errorMsg}</p>
          <button
            onClick={() => router.push("/dashboard/projects/preview")}
            style={{ marginTop: 8, padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Back to preview
          </button>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
