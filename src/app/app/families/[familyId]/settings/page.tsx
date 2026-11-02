import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { canInviteCollaborators } from "@/lib/permissions/roles";
import type { FamilyRole } from "@/types/database";
import { InviteForm } from "@/features/invitations/InviteForm";

export const instant = false;

type PageProps = { params: Promise<{ familyId: string }> };

export default async function FamilySettingsPage({ params }: PageProps) {
  const { familyId } = await params;
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_memberships")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) notFound();
  const role = membership.role as FamilyRole;

  const { data: family } = await supabase.from("families").select("*").eq("id", familyId).single();
  const { data: members } = await supabase
    .from("family_memberships")
    .select("role, status, user_id, profiles(full_name, email)")
    .eq("family_id", familyId);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <Link href={`/app/families/${familyId}`} className="text-sm underline">
        Back
      </Link>
      <h1 className="text-2xl font-semibold">{family?.name} · Settings</h1>
      <p className="text-sm text-neutral-500">Your role: {role}</p>

      <section>
        <h2 className="font-medium">Collaborators</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(members ?? []).map((m) => {
            const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
            return (
              <li key={m.user_id} className="flex justify-between border-b border-neutral-100 py-2 dark:border-neutral-900">
                <span>{profile?.email ?? m.user_id}</span>
                <span className="capitalize text-neutral-500">{m.role}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {canInviteCollaborators(role) ? <InviteForm familyId={familyId} /> : null}
    </main>
  );
}
