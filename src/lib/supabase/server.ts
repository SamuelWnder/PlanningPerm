import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side admin client — uses the service role key.
 * Only import this in API routes / server components, never in client components.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
