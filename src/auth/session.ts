/**
 * Auth gate for the app shell. Authentication requires a JWT session
 * (admin password login or access-token login).
 */

import { clearAuthSession, getAuthSession, hasAuthSession, saveAuthSession } from "../services/authSessionService";
import { isFirebaseConfigured } from "../firebase/config/firebase";
import { firebaseLogout } from "../firebase/auth/firebaseAuth";
import type { AccessAuthType, AccessPermission, AccessScope, AuthSession } from "../types/auth";

const LEGACY_TOKEN_SESSION_KEY = "midnight.token.session";
const LEGACY_MOCK_USER_KEY = "midnight.mock.user";

export function isAuthenticated() {
  return hasAuthSession();
}

export function markPasswordLoginAdmin(username: string) {
  const current = getAuthSession();
  if (!current) return;

  const next: AuthSession = {
    ...current,
    authType: "admin",
    isAdmin: true,
    permission: "ADMIN_FULL",
    scope: "EntireFamily",
    scopeMemberId: null,
    tokenName: null,
    tokenId: null,
    user: {
      ...(current.user ?? {}),
      username
    }
  };
  saveAuthSession(next);
}

export function applyAccessTokenSession(input: {
  accessToken: string;
  expiresAtUtc: string;
  tokenType?: string;
  authType: AccessAuthType;
  familyId: number;
  firebaseFamilyId?: string | null;
  tokenId: number | string;
  tokenName: string;
  permission: AccessPermission;
  scope: AccessScope;
  scopeMemberId?: number | string | null;
}) {
  saveAuthSession({
    accessToken: input.accessToken,
    expiresAtUtc: input.expiresAtUtc,
    tokenType: input.tokenType ?? "Bearer",
    refreshToken: null,
    authType: input.authType,
    authProvider: "firebase",
    isAdmin: false,
    familyId: input.familyId,
    firebaseFamilyId: input.firebaseFamilyId ?? null,
    tokenId: input.tokenId,
    tokenName: input.tokenName,
    permission: input.permission,
    scope: input.scope,
    scopeMemberId: input.scopeMemberId ?? null,
    user: {
      username: input.tokenName,
      firebaseFamilyId: input.firebaseFamilyId ?? undefined
    }
  });
  localStorage.removeItem(LEGACY_TOKEN_SESSION_KEY);
  localStorage.removeItem(LEGACY_MOCK_USER_KEY);
}

export async function logout() {
  clearAuthSession();
  localStorage.removeItem(LEGACY_TOKEN_SESSION_KEY);
  localStorage.removeItem(LEGACY_MOCK_USER_KEY);
  if (isFirebaseConfigured()) {
    try {
      await firebaseLogout();
    } catch {
      // already signed out
    }
  }
}

/** @deprecated Token login now stores a JWT via applyAccessTokenSession. */
export function saveTokenSession(_session: unknown) {
  // no-op
}

export function getTokenSession() {
  return null;
}

export function clearTokenSession() {
  localStorage.removeItem(LEGACY_TOKEN_SESSION_KEY);
}

export function hasTokenSession() {
  return getAuthSession()?.authType === "access_token";
}
