/**
 * Live smoke check against .env.local (service role).
 * Verifies project reachability + expected tables from migrations.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anon || !service) {
  console.error("FAIL: missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const tables = [
  "profiles",
  "families",
  "family_memberships",
  "subscription_plans",
  "members",
  "relationships",
  "family_invitations",
  "access_tokens",
  "family_events",
  "memories",
  "family_subscriptions"
];

let failed = 0;

console.log(`Smoke: ${url}`);

for (const table of tables) {
  const { error, count } = await admin.from(table).select("*", { count: "exact", head: true });
  if (error) {
    failed += 1;
    console.error(`  FAIL ${table}: ${error.message} (${error.code ?? "?"})`);
  } else {
    console.log(`  OK   ${table} (count=${count ?? 0})`);
  }
}

const { data: plans, error: plansErr } = await admin
  .from("subscription_plans")
  .select("code,name,is_active")
  .eq("is_active", true)
  .order("sort_order");

if (plansErr) {
  failed += 1;
  console.error(`  FAIL seed plans: ${plansErr.message}`);
} else {
  console.log(`  OK   active plans: ${(plans ?? []).map((p) => p.code).join(", ") || "(none)"}`);
  if (!plans?.length) {
    failed += 1;
    console.error("  FAIL expected seeded subscription_plans rows");
  }
}

// Auth API reachable with anon key
const pub = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const { error: authErr } = await pub.auth.getSession();
if (authErr) {
  failed += 1;
  console.error(`  FAIL auth getSession: ${authErr.message}`);
} else {
  console.log("  OK   auth API reachable (anon)");
}

if (failed) {
  console.error(`\nSmoke FAILED (${failed} issue(s)). Apply SQL migrations in Supabase if tables are missing.`);
  process.exit(1);
}

console.log("\nSmoke PASSED");
