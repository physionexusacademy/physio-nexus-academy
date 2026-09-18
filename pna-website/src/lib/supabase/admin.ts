import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses Row Level Security entirely — never import
 * this into anything that runs in the browser, and never use it to answer a
 * request without first checking permissions yourself (see
 * /api/resources/[id]/download/route.ts for the pattern: verify visibility
 * with the normal RLS-respecting server client, THEN use this one only to
 * generate a short-lived signed URL for that already-approved file).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
