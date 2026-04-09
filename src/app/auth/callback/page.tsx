"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase  = createClient();
    const projectId = searchParams.get("projectId");

    async function handleCallback() {
      // Supabase puts the auth code in the URL hash (implicit flow) or as a ?code= param (PKCE)
      // @supabase/ssr handles both automatically when we call getSession
      const { error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError("Could not sign you in. The link may have expired — please contact support.");
        return;
      }

      // Redirect to the project if we have an ID, else the dashboard
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(234,245,245)", gap: 16, padding: 24, fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif' }}>
        <AlertTriangle size={36} color="rgb(200,60,60)" />
        <p style={{ fontSize: 16, color: "rgb(60,80,90)", textAlign: "center", maxWidth: 380 }}>{error}</p>
        <Link href="/dashboard/projects/new" style={{ padding: "12px 24px", borderRadius: 12, background: "rgb(11,29,40)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
          Start a new check
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(11,29,40)", gap: 20, padding: 24, fontFamily: '"Rethink Sans","Helvetica Neue",Arial,sans-serif' }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: "#D4922A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>PP</span>
      </div>
      <Loader2 size={28} color="rgb(55,176,170)" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: 0 }}>Opening your report…</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
