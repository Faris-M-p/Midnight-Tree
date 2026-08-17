/**
 * Forgot password — verify OTP, then continue to reset password.
 */

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { ApiClientError } from "../services/apiClient";
import { requestForgotPassword, verifyForgotPasswordOtp } from "../services/authService";
import {
  getPendingForgotEmail,
  maskEmail,
  setPendingForgotPassword
} from "../auth/pendingAuth";
import { notify } from "../utils/notify";

interface ForgotPasswordVerifyPageProps {
  onNavigate: (path: string) => void;
}

const OTP_LENGTH = 6;

export function ForgotPasswordVerifyPage({ onNavigate }: ForgotPasswordVerifyPageProps) {
  const [email] = useState(() => getPendingForgotEmail() ?? "");
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email.trim()) {
      onNavigate("/forgot-password");
    }
  }, [email, onNavigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const otpValue = useMemo(() => digits.join(""), [digits]);
  const masked = email ? maskEmail(email) : "";

  const updateDigit = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setError("");
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (otpValue.length !== OTP_LENGTH) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const result = await verifyForgotPasswordOtp({ email: email.trim(), otp: otpValue });
      setPendingForgotPassword(result.email || email, result.resetToken);
      notify.success("Verification successful. Create your new password.");
      onNavigate("/forgot-password/reset");
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Unable to verify this code. Please try again.";
      setError(message);
      notify.fromApiError(err instanceof ApiClientError ? err : { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await requestForgotPassword({ email: email.trim() });
      setCooldown(30);
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      notify.success("If an account exists for this email, a verification code has been sent.");
      inputsRef.current[0]?.focus();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Unable to send verification email. Please try again.";
      setError(message);
      notify.fromApiError(err instanceof ApiClientError ? err : { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/forgot-password/verify" />
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Midnight Chronicle</p>
            <h1 className="text-3xl font-semibold text-slate-100">Enter verification code</h1>
            <p className="text-sm text-slate-400">
              We sent a code to <span className="font-medium text-slate-200">{masked}</span>
            </p>
          </div>

          <form onSubmit={(e) => void handleVerify(e)} className="space-y-5">
            <div className="flex justify-center gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={isSubmitting}
                  onChange={(e) => updateDigit(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-10 rounded-xl border border-slate-700 bg-slate-950 text-center text-lg font-semibold text-slate-100 outline-none focus:border-emerald-500 sm:h-14 sm:w-11"
                />
              ))}
            </div>

            {error ? <p className="text-center text-sm text-rose-400">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify code"}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm text-slate-400">
            <button
              type="button"
              disabled={cooldown > 0 || isSubmitting}
              onClick={() => void handleResend()}
              className="font-medium text-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
            <p>
              <button type="button" onClick={() => onNavigate("/forgot-password")} className="hover:text-slate-200">
                Change email
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
