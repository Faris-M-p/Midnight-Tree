/**
 * Pending email-verification / password-reset context (session only).
 */

const VERIFY_EMAIL_KEY = "midnight.verify.email";
const FORGOT_EMAIL_KEY = "midnight.forgot.email";
const RESET_TOKEN_KEY = "midnight.forgot.resetToken";

function canUseSession(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setPendingVerificationEmail(email: string) {
  if (!canUseSession()) return;
  window.sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim());
}

export function getPendingVerificationEmail(): string | null {
  if (!canUseSession()) return null;
  return window.sessionStorage.getItem(VERIFY_EMAIL_KEY);
}

export function clearPendingVerificationEmail() {
  if (!canUseSession()) return;
  window.sessionStorage.removeItem(VERIFY_EMAIL_KEY);
}

export function setPendingForgotPassword(email: string, resetToken?: string | null) {
  if (!canUseSession()) return;
  window.sessionStorage.setItem(FORGOT_EMAIL_KEY, email.trim());
  if (resetToken) {
    window.sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
  } else {
    window.sessionStorage.removeItem(RESET_TOKEN_KEY);
  }
}

export function getPendingForgotEmail(): string | null {
  if (!canUseSession()) return null;
  return window.sessionStorage.getItem(FORGOT_EMAIL_KEY);
}

export function getPendingResetToken(): string | null {
  if (!canUseSession()) return null;
  return window.sessionStorage.getItem(RESET_TOKEN_KEY);
}

export function clearPendingForgotPassword() {
  if (!canUseSession()) return;
  window.sessionStorage.removeItem(FORGOT_EMAIL_KEY);
  window.sessionStorage.removeItem(RESET_TOKEN_KEY);
}

export function maskEmail(email: string): string {
  const value = email.trim();
  const at = value.indexOf("@");
  if (at <= 0 || at === value.length - 1) return "***";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const visible = local.length <= 3 ? local.slice(0, 1) : local.slice(0, 3);
  return `${visible}********@${domain}`;
}
