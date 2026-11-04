import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

/** Service-role client for trusted server actions only. Returns null if secret is missing. */
export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
