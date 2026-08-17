/**
 * =============================================================================
 * FILE: src/pages/LoginPage.tsx
 * ROLE: Sign-in screen
 * =============================================================================
 * Email/password → admin JWT session.
 * Access Token only → scoped JWT session (family code is embedded in the token).
 * =============================================================================
 */

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { loginAndPersistSession } from "../services/authService";
import { loginWithAccessTokenAndPersist } from "../services/accessTokenService";
import { notify } from "../utils/notify";
import { logout, markPasswordLoginAdmin } from "../auth/session";
import { setPendingVerificationEmail } from "../auth/pendingAuth";
import { useActionLock } from "../hooks/useActionLock";

type LoginField = "email" | "password";
type LoginFormValues = Record<LoginField, string>;
type LoginErrors = Partial<Record<LoginField, string>>;

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

const initialValues: LoginFormValues = {
  email: "",
  password: ""
};

function validateLogin(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
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
  const [accessToken, setAccessToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const { isBusy, run } = useActionLock();
  const canSubmit = useMemo(() => !isBusy, [isBusy]);

  const handleChange = (field: LoginField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const nextErrors = validateLogin(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await run(async () => {
      try {
        // Auth state must come from this login response only — drop any prior JWT first.
        logout();
        const response = await loginAndPersistSession({
          email: values.email.trim(),
          password: values.password
        });

        if (response.requiresEmailVerification) {
          const email = response.email?.trim() || values.email.trim();
          if (email) setPendingVerificationEmail(email);
          notify.info("We've sent a verification code to your email.");
          onNavigate("/verify-email");
          return;
        }

        markPasswordLoginAdmin(response.username?.trim() || values.email.trim());
        notify.success("You have signed in successfully.");
        onNavigate("/home");
      } catch (error) {
        logout();
        if (error instanceof ApiClientError) {
          notify.fromApiError(error);
        } else {
          notify.error("Unable to sign in. Please try again.");
        }
        setValues((current) => ({ ...current, password: "" }));
      }
    });
  };

  const handleTokenSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const token = accessToken.trim();
    if (!token) {
      setTokenError("Access token is required.");
      return;
    }

    setTokenError("");
    await run(async () => {
      try {
        // Auth state must come from this login response only — drop any prior JWT first.
        logout();
        await loginWithAccessTokenAndPersist({ accessToken: token });
        notify.success("You have signed in successfully.");
        onNavigate("/home");
      } catch (error) {
        logout();
        const message =
          error instanceof ApiClientError
            ? error.message
            : "Unable to sign in with this token.";
        setTokenError(message);
        notify.fromApiError(error instanceof ApiClientError ? error : { message });
        setAccessToken("");
      }
    });
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
              disabled={isBusy}
              onClick={() => setMode("password")}
              className={`rounded-lg px-3 py-2 text-sm disabled:opacity-60 ${mode === "password" ? "bg-emerald-500 text-slate-950" : "text-slate-300"}`}
            >
              Email & Password
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setMode("token")}
              className={`rounded-lg px-3 py-2 text-sm disabled:opacity-60 ${mode === "token" ? "bg-emerald-500 text-slate-950" : "text-slate-300"}`}
            >
              Login with Token
            </button>
          </div>

          {mode === "token" ? (
            <form className="space-y-4" onSubmit={(e) => void handleTokenSubmit(e)}>
              <fieldset disabled={isBusy} className="space-y-4">
                <label className="block text-sm">
                  Access Token
                  <input
                    value={accessToken}
                    onChange={(e) => {
                      setAccessToken(e.target.value);
                      setTokenError("");
                    }}
                    placeholder="Enter your access token"
                    autoComplete="off"
                    className={`mt-1 w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none ${
                      tokenError ? "border-rose-500 bg-rose-950/20" : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                    }`}
                  />
                </label>
              </fieldset>
              <p className={`min-h-[1.25rem] text-xs ${tokenError ? "text-rose-400" : "text-slate-500"}`}>
                {tokenError || "Enter the access token shared with you."}
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login with Token
              </button>
            </form>
          ) : null}

          {mode === "password" ? (
            <form onSubmit={(e) => void handlePasswordSubmit(e)} noValidate className="space-y-4">
              <fieldset disabled={isBusy} className="space-y-4 disabled:opacity-100">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    disabled={isBusy}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                      errors.email
                        ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
                        : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                    } ${isBusy ? "cursor-not-allowed opacity-70" : ""}`}
                  />
                  <p className={`min-h-[1.25rem] text-xs ${errors.email ? "text-rose-400" : "text-transparent"}`}>
                    {errors.email ?? "placeholder"}
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
                    disabled={isBusy}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                      errors.password
                        ? "border-rose-500 bg-rose-950/20 focus:border-rose-400"
                        : "border-slate-700 bg-slate-900/80 focus:border-emerald-500"
                    } ${isBusy ? "cursor-not-allowed opacity-70" : ""}`}
                  />
                  <p className={`min-h-[1.25rem] text-xs ${errors.password ? "text-rose-400" : "text-transparent"}`}>
                    {errors.password ?? "placeholder"}
                  </p>
                </div>
              </fieldset>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate("/forgot-password")}
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  canSubmit
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "cursor-not-allowed bg-emerald-500/60 text-slate-900"
                }`}
              >
                Login
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
