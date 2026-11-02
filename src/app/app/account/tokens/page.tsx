import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CreateTokenForm } from "@/features/access-tokens/CreateTokenForm";

export const instant = false;

export default async function AccountTokensPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: owned } = await supabase
    .from("family_memberships")
    .select("family_id, families(id, name)")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active");

  const families =
    (owned ?? [])
      .map((row) => {
        const f = Array.isArray(row.families) ? row.families[0] : row.families;
        return f ? { id: f.id as string, name: f.name as string } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];

  const { data: tokens } = await supabase
    .from("access_tokens")
    .select("id, name, token_preview, permission, status, expires_at")
    .eq("account_owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <Link href="/app" className="text-sm underline">
        Back to app
      </Link>
      <h1 className="text-2xl font-semibold">Access tokens</h1>
      <p className="text-sm text-neutral-500">
        Account Owner only. Collaborators cannot manage these.
      </p>

      {families.length === 0 ? (
        <p className="text-sm">Create a family first to attach a token.</p>
      ) : (
        <CreateTokenForm families={families} />
      )}

      <section>
        <h2 className="font-medium">Existing</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {(tokens ?? []).map((t) => (
            <li key={t.id} className="rounded border border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <div className="font-medium">{t.name}</div>
              <div className="text-neutral-500">
                {t.token_preview} · {t.permission} · {t.status}
                {t.expires_at ? ` · exp ${t.expires_at.slice(0, 10)}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
