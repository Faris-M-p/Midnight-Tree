/**
 * =============================================================================
 * FILE: src/pages/LoginPage.tsx
 * ROLE: Sign-in screen
 * =============================================================================
 * Validates username/password, calls authService.loginAndPersistSession(),
 * then navigates to /tree on success.
 * =============================================================================
 */

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, GitBranch } from "lucide-react";
import { ApiClientError } from "../services/apiClient";
import { loginAndPersistSession } from "../services/authService";
import { notify } from "../utils/notify";

type LoginField = "username" | "password";
type LoginFormValues = Record<LoginField, string>;
type LoginErrors = Partial<Record<LoginField, string>>;

interface LoginPageProps {
  onNavigate: (path: "/" | "/register" | "/login" | "/tree") => void;
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
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
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

      notify.success("You have signed in successfully.");
      onNavigate("/tree");
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
    <div className="flex h-full w-full overflow-y-auto bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="inline-flex items-center gap-2 text-emerald-300 transition hover:text-emerald-200"
          >
            <GitBranch className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Midnight</span>
          </button>
        </div>

        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
          <h1 className="text-3xl font-semibold text-slate-100">Sign in</h1>
          <p className="text-sm text-slate-400">Use your admin account to open your family dashboard.</p>
        </div>

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

          <p className="text-center text-sm text-slate-400">
            Need an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("/register")}
              className="font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Create one
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
