/**
 * Forgot password — set a new password after OTP verification.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { resetPassword } from "../services/authService";
import {
  clearPendingForgotPassword,
  getPendingForgotEmail,
  getPendingResetToken
} from "../auth/pendingAuth";
import { notify } from "../utils/notify";
import { useActionLock } from "../hooks/useActionLock";

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const [email] = useState(() => getPendingForgotEmail() ?? "");
  const [resetToken] = useState(() => getPendingResetToken() ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const { isBusy, run } = useActionLock();
  const canSubmit = useMemo(() => !isBusy, [isBusy]);

  useEffect(() => {
    if (!email.trim() || !resetToken.trim()) {
      onNavigate("/forgot-password");
    }
  }, [email, resetToken, onNavigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!newPassword) {
      nextErrors.newPassword = "Password is required.";
    } else if (!strongPassword.test(newPassword)) {
      nextErrors.newPassword =
        "Password must include upper/lowercase letters, a number, a symbol, and be at least 8 characters.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await run(async () => {
      try {
        await resetPassword({
          email: email.trim(),
          resetToken,
          newPassword,
          confirmPassword
        });
        clearPendingForgotPassword();
        notify.success("Password updated successfully. You can sign in now.");
        onNavigate("/login");
      } catch (err) {
        if (err instanceof ApiClientError) notify.fromApiError(err);
        else notify.error("Unable to reset password right now.");
      }
    });
  };

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/forgot-password/reset" />
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
            <h1 className="text-3xl font-semibold text-slate-100">Create new password</h1>
            <p className="text-sm text-slate-400">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">New password</span>
              <input
                type="password"
                value={newPassword}
                disabled={!canSubmit}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((c) => ({ ...c, newPassword: undefined }));
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
              />
              {errors.newPassword ? <p className="text-xs text-rose-400">{errors.newPassword}</p> : null}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                disabled={!canSubmit}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((c) => ({ ...c, confirmPassword: undefined }));
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
              />
              {errors.confirmPassword ? <p className="text-xs text-rose-400">{errors.confirmPassword}</p> : null}
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
