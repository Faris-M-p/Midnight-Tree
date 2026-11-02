import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("supabase env helpers", () => {
  it("isSupabaseConfigured is false when URL missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "pk");
    const { isSupabaseConfigured } = await import("./env");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("reads public env when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "pk-test");
    const { getSupabasePublicEnv, isSupabaseConfigured } = await import("./env");
    expect(isSupabaseConfigured()).toBe(true);
    expect(getSupabasePublicEnv()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "pk-test"
    });
  });
});
