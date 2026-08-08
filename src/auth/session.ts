/**
 * Auth gate for the new shell: real JWT session OR dummy family-token session.
 * Password login still uses authSessionService / authService unchanged.
 */

import { clearAuthSession, getAccessToken } from "../services/authSessionService";
import {
  defaultMockUser,
  setMockUser,
  type PermissionLevel,
  type TokenScope
} from "./permissions";

const TOKEN_SESSION_KEY = "midnight.token.session";
const MOCK_USER_KEY = "midnight.mock.user";

export interface TokenSession {
  token: string;
  name: string;
  permission: PermissionLevel;
  scope: TokenScope;
  expiresOn: string;
}

export function saveTokenSession(session: TokenSession) {
  localStorage.setItem(TOKEN_SESSION_KEY, JSON.stringify(session));
  setMockUser({
    username: session.name,
    displayName: session.name,
    isAdmin: false,
    permission: session.permission === "edit" ? "edit" : "view",
    tokenScope: session.scope
  });
}

export function getTokenSession(): TokenSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TokenSession;
  } catch {
    return null;
  }
}

export function clearTokenSession() {
  localStorage.removeItem(TOKEN_SESSION_KEY);
}

export function hasTokenSession() {
  return Boolean(getTokenSession());
}

export function isAuthenticated() {
  return Boolean(getAccessToken()) || hasTokenSession();
}

export function markPasswordLoginAdmin(username: string) {
  setMockUser({
    ...defaultMockUser,
    username,
    displayName: username,
    isAdmin: true,
    permission: "admin",
    tokenScope: "entire-family"
  });
}

export function logout() {
  clearAuthSession();
  clearTokenSession();
  localStorage.removeItem(MOCK_USER_KEY);
}
