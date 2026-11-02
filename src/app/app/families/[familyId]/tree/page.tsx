import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { canEditFamilyTree } from "@/lib/permissions/roles";
import type { FamilyRole, Member, Relationship } from "@/types/database";
import { FamilyTreeCanvas } from "@/features/tree/FamilyTreeCanvas";
import { AddMemberForm } from "@/features/members/AddMemberForm";
import { ConnectPartnerForm } from "@/features/members/ConnectPartnerForm";
import { ImagePicker } from "@/features/images/ImagePicker";

export const instant = false;

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyTreePage({ params }: PageProps) {
  const { familyId } = await params;

  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

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

  const { data: family } = await supabase.from("families").select("name").eq("id", familyId).maybeSingle();
  if (!family) notFound();

  const [{ data: members }, { data: relationships }] = await Promise.all([
    supabase.from("members").select("*").eq("family_id", familyId).order("created_at"),
    supabase.from("relationships").select("*").eq("family_id", familyId)
  ]);

  const role = membership.role as FamilyRole;
  const canEdit = canEditFamilyTree(role);
  const memberList = (members ?? []) as Member[];
  const relList = (relationships ?? []) as Relationship[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/app/families/${familyId}`} className="text-sm underline">
            Back to family
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {family.name} · Tree
          </h1>
          <p className="text-sm text-neutral-500">
            Zoom, pan, fit controls on the canvas. Separate cards per person.
          </p>
        </div>
        <Link href="/app" className="text-sm text-neutral-600 underline">
          All families
        </Link>
      </div>

      <div className="mt-6">
        <FamilyTreeCanvas members={memberList} relationships={relList} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AddMemberForm familyId={familyId} members={memberList} canEdit={canEdit} />
        <div className="space-y-6">
          <ConnectPartnerForm familyId={familyId} members={memberList} canEdit={canEdit} />
          <ImagePicker />
        </div>
      </div>
    </main>
  );
}
