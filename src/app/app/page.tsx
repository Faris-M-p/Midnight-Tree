import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const instant = false;

export default async function AppHomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">App</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Configure Supabase in `.env.local`, then apply `supabase/migrations/20261102120000_phase2_foundation.sql`.
        </p>
        <Link className="mt-4 inline-block underline" href="/login">
          Sign in
        </Link>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("family_memberships")
    .select("role, status, family_id, families(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active");

  type Row = {
    role: string;
    family_id: string;
    families: { id: string; name: string } | { id: string; name: string }[] | null;
  };

  const rows = (memberships ?? []) as unknown as Row[];

  if (rows.length === 0) {
    redirect("/onboarding/family");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Your families</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Sign out
          </button>
        </form>
      </div>

      <ul className="mt-8 space-y-2">
        {rows.map((row) => {
          const family = Array.isArray(row.families) ? row.families[0] : row.families;
          if (!family) return null;
          return (
            <li key={row.family_id}>
              <Link
                href={`/app/families/${family.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-50">{family.name}</span>
                <span className="text-neutral-500 capitalize">{row.role}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/app/account/tokens" className="underline">
          Access tokens
        </Link>
        <Link href="/app/account/plans" className="underline">
          Plans
        </Link>
      </div>
    </main>
  );
}
