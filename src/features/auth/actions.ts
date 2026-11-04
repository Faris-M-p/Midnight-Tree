"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthActionState = {
  error: string | null;
  code?: string | null;
};

function requireConfigured(): AuthActionState | null {
  if (!isSupabaseConfigured()) {
    const error =
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
    console.error("[auth] config missing", { error });
    return { error, code: "config_missing" };
  }
  return null;
}

function logAuthError(
  action: "login" | "register" | "logout",
  email: string | null,
  error: { message: string; status?: number; code?: string; name?: string }
) {
  console.error(`[auth:${action}] failed`, {
    email,
    message: error.message,
    status: error.status ?? null,
    code: error.code ?? null,
    name: error.name ?? null,
    at: new Date().toISOString()
  });
}

async function confirmEmailIfNeeded(userId: string | undefined, email: string) {
  if (!userId) return;
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[auth:register] no SUPABASE_SERVICE_ROLE_KEY — cannot auto-confirm email");
    return;
  }

  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true
  });

  if (error) {
    logAuthError("register", email, error);
    console.error("[auth:register] email auto-confirm failed", { userId, message: error.message });
    return;
  }

  console.info("[auth:register] email auto-confirmed", {
    userId,
    email,
    emailConfirmedAt: data.user.email_confirmed_at
  });
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const blocked = requireConfigured();
  if (blocked) return blocked;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  console.info("[auth:register] attempt", { email, fullNameLength: fullName.length });

  if (!fullName || !email || !password) {
    const error = "Name, email, and password are required.";
    console.error("[auth:register] validation", { error, email });
    return { error, code: "validation" };
  }
  if (password.length < 8) {
    const error = "Password must be at least 8 characters.";
    console.error("[auth:register] validation", { error, email });
    return { error, code: "validation" };
  }
  if (password !== confirmPassword) {
    const error = "Passwords do not match.";
    console.error("[auth:register] validation", { error, email });
    return { error, code: "validation" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) {
    logAuthError("register", email, error);
    return { error: error.message, code: error.code ?? "signup_failed" };
  }

  console.info("[auth:register] signup ok", {
    email,
    userId: data.user?.id ?? null,
    hasSession: Boolean(data.session)
  });

  // Supabase projects often require email confirm before password login.
  if (!data.user?.email_confirmed_at) {
    await confirmEmailIfNeeded(data.user?.id, email);
  }

  // Ensure a session exists for first-time UX (confirm may not auto-sign-in).
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      logAuthError("register", email, signInError);
      return {
        error:
          signInError.message === "Email not confirmed"
            ? "Account created, but email is not confirmed yet. Check inbox, or disable “Confirm email” in Supabase Auth settings."
            : signInError.message,
        code: signInError.code ?? "post_signup_signin_failed"
      };
    }
  }

  redirect("/onboarding/family");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const blocked = requireConfigured();
  if (blocked) return blocked;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  console.info("[auth:login] attempt", { email });

  if (!email || !password) {
    const error = "Email and password are required.";
    console.error("[auth:login] validation", { error });
    return { error, code: "validation" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logAuthError("login", email, error);

    // Dev convenience: if unconfirmed and we have service role, confirm then retry once.
    if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
      const admin = createAdminClient();
      if (admin) {
        const { data: listed, error: listError } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200
        });
        if (listError) {
          console.error("[auth:login] listUsers failed", listError);
        } else {
          const user = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (user) {
            console.info("[auth:login] auto-confirming unconfirmed user", { userId: user.id, email });
            const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
              email_confirm: true
            });
            if (confirmError) {
              logAuthError("login", email, confirmError);
            } else {
              const retry = await supabase.auth.signInWithPassword({ email, password });
              if (!retry.error) {
                console.info("[auth:login] ok after auto-confirm", {
                  email,
                  userId: retry.data.user?.id ?? null
                });
                redirect("/app");
              }
              logAuthError("login", email, retry.error);
              return {
                error: retry.error.message,
                code: retry.error.code ?? "login_failed"
              };
            }
          } else {
            console.error("[auth:login] user not found for auto-confirm", { email });
          }
        }
      }

      return {
        error:
          "Email not confirmed. Open the confirmation link from your inbox, or turn off Confirm email in Supabase → Authentication → Providers → Email.",
        code: error.code ?? "email_not_confirmed"
      };
    }

    return { error: error.message, code: error.code ?? "login_failed" };
  }

  console.info("[auth:login] ok", { email, userId: data.user?.id ?? null });
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  console.info("[auth:logout] attempt");
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    logAuthError("logout", null, error);
  } else {
    console.info("[auth:logout] ok");
  }
  redirect("/login");
}
