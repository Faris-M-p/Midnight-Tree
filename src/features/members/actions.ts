"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MemberType } from "@/types/database";

export type MemberActionState = { error: string | null; ok?: boolean };

async function requireEditor(familyId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured.", supabase: null as never, userId: "" };
  }
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required.", supabase, userId: "" };

  const { data: membership } = await supabase
    .from("family_memberships")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
    return { error: "You do not have permission to edit this family.", supabase, userId: user.id };
  }
  return { error: null, supabase, userId: user.id };
}

export async function createMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const familyId = String(formData.get("familyId") ?? "");
  const gate = await requireEditor(familyId);
  if (gate.error) return { error: gate.error };

  const { count } = await gate.supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", familyId);

  if ((count ?? 0) >= 150) {
    return { error: "Member limit reached for the Free plan (150)." };
  }

  const { data: codeRow } = await gate.supabase.rpc("next_member_code", {
    p_family_id: familyId
  });

  const memberType = (String(formData.get("memberType") ?? "real") as MemberType) || "real";
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const gender = String(formData.get("gender") ?? "") || null;

  if (memberType === "real" && !firstName) {
    return { error: "First name is required for a real member." };
  }

  const { data: member, error } = await gate.supabase
    .from("members")
    .insert({
      family_id: familyId,
      member_code: (codeRow as string) || `MEM-${Date.now()}`,
      member_type: memberType,
      first_name: firstName || (memberType === "placeholder" ? "Unknown" : ""),
      last_name: lastName || null,
      gender: gender === "male" || gender === "female" || gender === "other" ? gender : "unknown",
      date_of_birth: String(formData.get("dateOfBirth") ?? "") || null,
      is_deceased: formData.get("isDeceased") === "on",
      created_by: gate.userId
    })
    .select("id")
    .single();

  if (error || !member) return { error: error?.message ?? "Could not create member." };

  const relateTo = String(formData.get("relateToMemberId") ?? "");
  const relation = String(formData.get("relation") ?? "");
  if (relateTo && relation) {
    if (relation === "child") {
      await gate.supabase.from("relationships").insert({
        family_id: familyId,
        source_member_id: relateTo,
        target_member_id: member.id,
        relationship_type: "parent",
        created_by: gate.userId
      });
    } else if (relation === "parent") {
      await gate.supabase.from("relationships").insert({
        family_id: familyId,
        source_member_id: member.id,
        target_member_id: relateTo,
        relationship_type: "parent",
        created_by: gate.userId
      });
    } else if (relation === "partner") {
      await gate.supabase.from("relationships").insert({
        family_id: familyId,
        source_member_id: relateTo,
        target_member_id: member.id,
        relationship_type: "partner",
        created_by: gate.userId
      });
    }
  }

  revalidatePath(`/app/families/${familyId}`);
  revalidatePath(`/app/families/${familyId}/tree`);
  return { error: null, ok: true };
}

export async function connectExistingPartnerAction(
  familyId: string,
  memberA: string,
  memberB: string
): Promise<MemberActionState> {
  const gate = await requireEditor(familyId);
  if (gate.error) return { error: gate.error };
  if (!memberA || !memberB || memberA === memberB) {
    return { error: "Select two different members." };
  }

  const { error } = await gate.supabase.from("relationships").insert({
    family_id: familyId,
    source_member_id: memberA,
    target_member_id: memberB,
    relationship_type: "partner",
    created_by: gate.userId
  });

  if (error) return { error: error.message };
  revalidatePath(`/app/families/${familyId}/tree`);
  return { error: null, ok: true };
}

export async function deleteMemberAction(familyId: string, memberId: string): Promise<MemberActionState> {
  const gate = await requireEditor(familyId);
  if (gate.error) return { error: gate.error };

  const { data: membership } = await gate.supabase
    .from("family_memberships")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", gate.userId)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Only Owner or Admin can delete members." };
  }

  const { error } = await gate.supabase.from("members").delete().eq("id", memberId).eq("family_id", familyId);
  if (error) return { error: error.message };
  revalidatePath(`/app/families/${familyId}/tree`);
  return { error: null, ok: true };
}
