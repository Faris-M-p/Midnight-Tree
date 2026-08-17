/**
 * Forgot password — request email OTP.
 */

import { useMemo, useState, type FormEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { requestForgotPassword } from "../services/authService";
import { setPendingForgotPassword } from "../auth/pendingAuth";
import { notify } from "../utils/notify";
import { useActionLock } from "../hooks/useActionLock";

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { isBusy, run } = useActionLock();
  const canSubmit = useMemo(() => !isBusy, [isBusy]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    await run(async () => {
      setError("");
      try {
        const result = await requestForgotPassword({ email: value });
        setPendingForgotPassword(value);
        notify.success(result.message || "If an account exists for this email, a verification code has been sent.");
        onNavigate("/forgot-password/verify");
      } catch (err) {
        if (err instanceof ApiClientError) notify.fromApiError(err);
        else notify.error("Unable to send verification email. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/forgot-password" />
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
            <h1 className="text-3xl font-semibold text-slate-100">Forgot password</h1>
            <p className="text-sm text-slate-400">
              Enter your account email and we&apos;ll send a verification code if an account exists.
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                disabled={!canSubmit}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
                placeholder="you@example.com"
              />
              {error ? <p className="text-xs text-rose-400">{error}</p> : null}
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Send verification code
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            <button type="button" onClick={() => onNavigate("/login")} className="text-emerald-400 hover:text-emerald-300">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
