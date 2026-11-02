"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FamilyActionState = {
  error: string | null;
};

export async function createFamilyAction(
  _prev: FamilyActionState,
  formData: FormData
): Promise<FamilyActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name) {
    return { error: "Family name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to create a family." };
  }

  // Free plan: at most one owned family (enforced here until RPC entitlements land).
  const { count: ownedCount, error: countError } = await supabase
    .from("family_memberships")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active");

  if (countError) {
    return { error: countError.message };
  }
  if ((ownedCount ?? 0) >= 1) {
    return {
      error:
        "Free plan allows one owned family. Upgrade later or open an existing family from the app."
    };
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      name,
      description: description || null,
      location: location || null,
      created_by: user.id
    })
    .select("id")
    .single();

  if (familyError || !family) {
    return { error: familyError?.message ?? "Could not create family." };
  }

  const { error: membershipError } = await supabase.from("family_memberships").insert({
    family_id: family.id,
    user_id: user.id,
    role: "owner",
    status: "active"
  });

  if (membershipError) {
    return { error: membershipError.message };
  }

  // No mandatory "create myself" tree member — workspace opens empty-ready.
  redirect(`/app/families/${family.id}`);
}
