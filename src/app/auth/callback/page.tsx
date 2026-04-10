"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase  = createClient();
    const projectId = searchParams.get("projectId");

    async function handleCallback() {
      const { error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError("Could not sign you in. The link may have expired — please try again.");
        return;
      }

      const destination = projectId
        ? `/dashboard/projects/${projectId}`
        : "/dashboard/projects";

      router.replace(destination);
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(248,250,250)", gap: 16, padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <AlertTriangle size={36} color="rgb(200,60,60)" />
        <p style={{ fontSize: 16, color: "rgb(60,80,90)", textAlign: "center", maxWidth: 380 }}>{error}</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start a new check
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(11,29,40)", gap: 20, padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#D4922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36, filter: "drop-shadow(0 0 10px rgba(212,146,42,0.5))" }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: -0.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>PlanningPerm</span>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid rgba(55,176,170,0.2)", borderTopColor: "rgb(55,176,170)", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: 0 }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
