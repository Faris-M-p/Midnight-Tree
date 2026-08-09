/**
 * =============================================================================
 * FILE: src/pages/LoginPage.tsx
 * ROLE: Sign-in screen
 * =============================================================================
 * Validates username/password, calls authService.loginAndPersistSession(),
 * then navigates to /home on success. Family token login is UI-only (mock tokens).
 * =============================================================================
 */

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { loginAndPersistSession } from "../services/authService";
import { notify } from "../utils/notify";
import { mockLoginTokens } from "../data/mockAccessTokens";
import { markPasswordLoginAdmin, saveTokenSession } from "../auth/session";

type LoginField = "username" | "password";
type LoginFormValues = Record<LoginField, string>;
type LoginErrors = Partial<Record<LoginField, string>>;

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

const initialValues: LoginFormValues = {
  username: "",
  password: ""
};

function validateLogin(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [mode, setMode] = useState<"password" | "token">("password");
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [familyToken, setFamilyToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

  const handleChange = (field: LoginField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const nextErrors = validateLogin(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await loginAndPersistSession({
        username: values.username.trim(),
        password: values.password
      });

      markPasswordLoginAdmin(values.username.trim());
      notify.success("You have signed in successfully.");
      onNavigate("/home");
    } catch (error) {
      if (error instanceof ApiClientError) {
        notify.fromApiError(error);
      } else {
        notify.error("Unable to sign in. Please try again.");
      }
      setValues((current) => ({ ...current, password: "" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/login" />
      <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
          <h1 className="text-3xl font-semibold text-slate-100">Sign in</h1>
          <p className="text-sm text-slate-400">Use your family account or a family access token.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "password" ? "bg-emerald-500 text-slate-950" : "text-slate-300"}`}
          >
            Username & Password
          </button>
          <button
            type="button"
            onClick={() => setMode("token")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "token" ? "bg-emerald-500 text-slate-950" : "text-slate-300"}`}
          >
            Login with Token
          </button>
        </div>

        {mode === "token" ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const value = familyToken.trim();
              if (!value) {
                setTokenError("Family token is required.");
                return;
              }
              const found = mockLoginTokens.find((item) => item.value === value);
              if (!found) {
                setTokenError("This token is invalid.");
                return;
              }
              if (found.expiresOn < new Date().toISOString().slice(0, 10)) {
                setTokenError("This token has expired.");
                return;
              }
              saveTokenSession({
                token: found.value,
                name: found.name,
                permission: found.permission,
                scope: found.scope,
                expiresOn: found.expiresOn
              });
              notify.success("Family token accepted.");
              onNavigate("/home");
            }}
          >
            <label className="block text-sm">
              Family token
              <input
                value={familyToken}
                onChange={(e) => {
                  setFamilyToken(e.target.value);
                  setTokenError("");
                }}
                placeholder="FAM-MEHTA-VIEW-2026"
                className={`mt-1 w-full rounded-xl border px-4 py-3 outline-none ${
                  tokenError ? "border-rose-500 bg-rose-950/20" : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                }`}
              />
            </label>
            <p className={`min-h-[1.25rem] text-xs ${tokenError ? "text-rose-400" : "text-slate-500"}`}>
              {tokenError || "Demo tokens: FAM-MEHTA-VIEW-2026 or FAM-MEHTA-EDIT-2026"}
            </p>
            <button type="submit" className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
              Validate token
            </button>
          </form>
        ) : null}

        {mode === "password" ? (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4 disabled:opacity-100">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-200">
                Username
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={values.username}
                onChange={(event) => handleChange("username", event.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                  errors.username
                    ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
                    : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              />
              <p className={`min-h-[1.25rem] text-xs ${errors.username ? "text-rose-400" : "text-transparent"}`}>
                {errors.username ?? "placeholder"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(event) => handleChange("password", event.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                  errors.password
                    ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
                    : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              />
              <p className={`min-h-[1.25rem] text-xs ${errors.password ? "text-rose-400" : "text-transparent"}`}>
                {errors.password ?? "placeholder"}
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              canSubmit
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "cursor-not-allowed bg-emerald-500/60 text-slate-900"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        ) : null}

          <p className="mt-5 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("/register")}
              className="font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Create an account
            </button>
          </p>
      </div>
      </div>
    </div>
  );
}
