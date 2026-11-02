"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type InviteState = { error: string | null; inviteUrl?: string };

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createInvitationAction(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };

  const familyId = String(formData.get("familyId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "viewer");

  if (!familyId || !email) return { error: "Family and email are required." };
  if (!["admin", "editor", "viewer"].includes(role)) return { error: "Invalid role." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  const { data: membership } = await supabase
    .from("family_memberships")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Only Owner or Admin can invite." };
  }

  const raw = `inv_${randomBytes(24).toString("base64url")}`;
  const token_hash = hashToken(raw);
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("invitations").insert({
    family_id: familyId,
    email,
    role,
    token_hash,
    status: "pending",
    expires_at,
    invited_by: user.id
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/families/${familyId}/settings`);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return { error: null, inviteUrl: `${base}/invite/${raw}` };
}

export async function acceptInvitationAction(rawToken: string): Promise<InviteState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to accept the invitation." };

  const token_hash = hashToken(rawToken);
  const { data: invite } = await supabase
    .from("invitations")
    .select("*")
    .eq("token_hash", token_hash)
    .maybeSingle();

  if (!invite) return { error: "Invitation not found." };
  if (invite.status !== "pending") return { error: "Invitation is no longer valid." };
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { error: "Invitation has expired." };
  }

  const { error: memError } = await supabase.from("family_memberships").insert({
    family_id: invite.family_id,
    user_id: user.id,
    role: invite.role,
    status: "active",
    invited_by: invite.invited_by
  });

  if (memError && !memError.message.includes("duplicate")) {
    return { error: memError.message };
  }

  await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_by: user.id,
      accepted_at: new Date().toISOString()
    })
    .eq("id", invite.id);

  return { error: null };
}
