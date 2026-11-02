/**
 * Public Supabase env. Missing values do not crash the app at import time.
 * Callers should use isSupabaseConfigured() before creating clients that need a live project.
 */

export function getSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    anonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}
