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

export function isFirebaseAuthSession(session = getAuthSession()): boolean {
  return session?.authProvider === "firebase";
}

export function hasAuthSession(): boolean {
  return Boolean(getAuthSession()?.accessToken?.trim());
}

/** MidnightApi Bearer token only. Firebase ID tokens must not be sent to the .NET API. */
export function getAccessToken(): string | null {
  const session = getAuthSession();
  const token = session?.accessToken?.trim();
  if (!token || isFirebaseAuthSession(session)) {
    return null;
  }
  return token;
}

/** Remove session on logout */
export function clearAuthSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
