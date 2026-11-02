import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { canEditFamilyTree } from "@/lib/permissions/roles";
import type { FamilyRole } from "@/types/database";

export const instant = false;

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyWorkspacePage({ params }: PageProps) {
  const { familyId } = await params;

  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("family_memberships")
    .select("role, status")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: family } = await supabase
    .from("families")
    .select("id, name, description, location")
    .eq("id", familyId)
    .maybeSingle();

  if (!family) {
    notFound();
  }

  const role = membership.role as FamilyRole;
  const canEdit = canEditFamilyTree(role);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/app" className="text-sm text-neutral-600 underline dark:text-neutral-400">
        All families
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{family.name}</h1>
      <p className="mt-1 text-sm capitalize text-neutral-500">Your role: {role}</p>
      {family.description ? (
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">{family.description}</p>
      ) : null}
      {family.location ? (
        <p className="mt-2 text-sm text-neutral-500">Location: {family.location}</p>
      ) : null}

      <section className="mt-10 rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">Family tree</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Lineage-style interactive tree lands next. You can start from any person — no root required.
        </p>
        <p className="mt-4 text-xs text-neutral-500">
          Editing enabled for your role: {canEdit ? "yes" : "view only"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium">
          <Link href={`/app/families/${familyId}/tree`} className="underline">
            Open family tree
          </Link>
          <Link href={`/app/families/${familyId}/settings`} className="underline">
            Settings & invites
          </Link>
          <Link href="/app/account/tokens" className="underline">
            Access tokens
          </Link>
          <Link href="/app/account/plans" className="underline">
            Plans
          </Link>
        </div>
      </section>
    </main>
  );
}
