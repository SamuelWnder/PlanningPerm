/**
 * LPA (Local Planning Authority) lookup utilities.
 * Fetches LPA metadata from the database.
 */

import { createClient } from "@/lib/supabase/server";
import type { LPA } from "@/types/database";

export async function getLpaByCode(code: string): Promise<LPA | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lpas")
    .select("*")
    .eq("code", code)
    .single();
  return data as LPA | null;
}

export async function searchLpas(query: string): Promise<LPA[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lpas")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(10);
  return (data || []) as LPA[];
}

export async function getAllLpas(): Promise<LPA[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lpas")
    .select("*")
    .order("name");
  return (data || []) as LPA[];
}

/**
 * Get statistics for an LPA to show in the UI:
 * total decisions, approval rate, most common refusal reasons.
 */
export async function getLpaStats(lpaCode: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("planning_decisions")
    .select("decision")
    .eq("lpa_code", lpaCode);

  if (!data || data.length === 0) {
    return { total: 0, approval_rate: null, has_data: false };
  }

  const approved = data.filter((d) => d.decision === "approved").length;
  const total = data.length;

  return {
    total,
    approval_rate: Math.round((approved / total) * 100),
    has_data: true,
  };
}
