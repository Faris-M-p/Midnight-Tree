"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FamilyActionState = {
  error: string | null;
  code?: string | null;
};

export async function createFamilyAction(
  _prev: FamilyActionState,
  formData: FormData
): Promise<FamilyActionState> {
  if (!isSupabaseConfigured()) {
    const error =
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
    console.error("[family:create] config missing", { error });
    return { error, code: "config_missing" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  console.info("[family:create] attempt", { name, hasDescription: Boolean(description), hasLocation: Boolean(location) });

  if (!name) {
    const error = "Family name is required.";
    console.error("[family:create] validation", { error });
    return { error, code: "validation" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[family:create] unauthenticated", {
      message: userError?.message ?? "no user"
    });
    return { error: "You must be signed in to create a family.", code: "unauthenticated" };
  }

  // Prefer RPC once migration 20261104100000 is applied (fixes RLS chicken-and-egg).
  const { data: rpcFamily, error: rpcError } = await supabase.rpc("create_family_with_owner", {
    p_name: name,
    p_description: description || null,
    p_location: location || null
  });

  if (!rpcError && rpcFamily) {
    const family = Array.isArray(rpcFamily) ? rpcFamily[0] : rpcFamily;
    if (family?.id) {
      console.info("[family:create] ok via rpc", { familyId: family.id, userId: user.id });
      redirect(`/app/families/${family.id}`);
    }
  }

  if (rpcError && rpcError.code !== "PGRST202" && !/could not find the function/i.test(rpcError.message)) {
    console.error("[family:create] rpc failed", {
      message: rpcError.message,
      code: rpcError.code,
      details: rpcError.details,
      hint: rpcError.hint,
      userId: user.id
    });
    return { error: rpcError.message, code: rpcError.code ?? "rpc_failed" };
  }

  console.warn("[family:create] rpc unavailable — using service-role fallback", {
    rpcMessage: rpcError?.message ?? null
  });

  const admin = createAdminClient();
  if (!admin) {
    const error =
      "Cannot create family: apply migration 20261104100000_fix_families_create_rls.sql or set SUPABASE_SERVICE_ROLE_KEY.";
    console.error("[family:create] no admin client", { error });
    return { error, code: "admin_missing" };
  }

  const { count: ownedCount, error: countError } = await admin
    .from("family_memberships")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active");

  if (countError) {
    console.error("[family:create] count failed", countError);
    return { error: countError.message, code: countError.code ?? "count_failed" };
  }
  if ((ownedCount ?? 0) >= 1) {
    const error = "Free plan allows one owned family. Upgrade later or open an existing family from the app.";
    console.error("[family:create] plan limit", { ownedCount, userId: user.id });
    return { error, code: "plan_limit" };
  }

  const { data: family, error: familyError } = await admin
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
    console.error("[family:create] insert families failed", {
      message: familyError?.message,
      code: familyError?.code,
      details: familyError?.details,
      hint: familyError?.hint,
      userId: user.id
    });
    return {
      error: familyError?.message ?? "Could not create family.",
      code: familyError?.code ?? "insert_failed"
    };
  }

  const { error: membershipError } = await admin.from("family_memberships").insert({
    family_id: family.id,
    user_id: user.id,
    role: "owner",
    status: "active"
  });

  if (membershipError) {
    console.error("[family:create] insert membership failed", {
      message: membershipError.message,
      code: membershipError.code,
      familyId: family.id,
      userId: user.id
    });
    await admin.from("families").delete().eq("id", family.id);
    return { error: membershipError.message, code: membershipError.code ?? "membership_failed" };
  }

  console.info("[family:create] ok via admin fallback", { familyId: family.id, userId: user.id });
  redirect(`/app/families/${family.id}`);
}
