/**
 * =============================================================================
 * FILE: src/services/authSessionService.ts
 * ROLE: Persist / read / clear JWT session in the browser
 * =============================================================================
 * Uses localStorage key: "midnight.auth.session"
 *
 * Why this exists:
 *   - After refresh, the user stays logged in
 *   - apiClient reads getAccessToken() to attach Authorization headers
 *   - Logout should call clearAuthSession()
 * =============================================================================
 */

import type { AuthSession } from "../types/auth";

const AUTH_STORAGE_KEY = "midnight.auth.session";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Save the full auth session after a successful login */
export function saveAuthSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

/** Read the stored session (or null if missing / invalid JSON) */
export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    return null;
  }
}

/** Convenience helper used by apiClient for the Bearer token */
export function getAccessToken(): string | null {
  const token = getAuthSession()?.accessToken?.trim();
  return token || null;
}

/** Remove session on logout */
export function clearAuthSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
