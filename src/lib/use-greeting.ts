"use client";

import { useEffect, useState } from "react";

/**
 * Returns a greeting string like "Hey sam" if the user has a Supabase session,
 * or "Hey there" as a fallback. Uses only what's already in browser storage —
 * no network request needed.
 */
export function useGreeting(): string {
  const [greeting, setGreeting] = useState("Hey there");

  useEffect(() => {
    async function resolve() {
      try {
        // Check for a cached email from the lead capture form first (fastest)
        const leadEmail = sessionStorage.getItem("pp_lead_email");
        if (leadEmail) {
          setGreeting(`Hey ${leadEmail.split("@")[0]}`);
          return;
        }

        // Fall back to Supabase session
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setGreeting(`Hey ${session.user.email.split("@")[0]}`);
        }
      } catch { /* stay with default */ }
    }
    resolve();
  }, []);

  return greeting;
}
