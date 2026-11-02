"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type TokenState = { error: string | null; rawToken?: string };

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function preview(raw: string) {
  const body = raw.replace(/^mct_/, "");
  if (body.length < 8) return "••••";
  return `${body.slice(0, 4)}••••${body.slice(-4)}`;
}

/** Account Owner only — creates a shared access token for explicit families. */
export async function createAccessTokenAction(
  _prev: TokenState,
  formData: FormData
): Promise<TokenState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };

  const name = String(formData.get("name") ?? "").trim();
  const familyId = String(formData.get("familyId") ?? "");
  const permission = String(formData.get("permission") ?? "view");

  if (!name || !familyId) return { error: "Name and family are required." };
  if (!["view", "edit"].includes(permission)) return { error: "Invalid permission." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };

  // Must own the family (Account Owner creating token for a family they own).
  const { data: ownership } = await supabase
    .from("family_memberships")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();

  if (!ownership) {
    return { error: "Only the Account Owner (family owner) can create access tokens." };
  }

  const raw = `mct_${randomBytes(24).toString("base64url")}`;
  const token_hash = hashToken(raw);
  const expiresDays = Number(formData.get("expiresDays") ?? 90);

  const { data: token, error } = await supabase
    .from("access_tokens")
    .insert({
      account_owner_id: user.id,
      name,
      description: String(formData.get("description") ?? "") || null,
      token_hash,
      token_preview: preview(raw),
      permission,
      status: "active",
      expires_at: new Date(Date.now() + expiresDays * 86400000).toISOString()
    })
    .select("id")
    .single();

  if (error || !token) return { error: error?.message ?? "Could not create token." };

  const { error: linkError } = await supabase.from("access_token_families").insert({
    access_token_id: token.id,
    family_id: familyId,
    permission
  });

  if (linkError) return { error: linkError.message };

  revalidatePath("/app/account/tokens");
  return { error: null, rawToken: raw };
}
