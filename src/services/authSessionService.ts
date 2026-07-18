import type { AuthSession } from "../types/auth";

const AUTH_STORAGE_KEY = "midnight.auth.session";
export const AUTH_UNAUTHORIZED_EVENT = "midnight:auth:unauthorized";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveAuthSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

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

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const authPrefixes = ["midnight.auth", "midnight.user", "midnight.session"];

  const localKeysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) {
      continue;
    }

    if (key === AUTH_STORAGE_KEY || authPrefixes.some((prefix) => key.startsWith(prefix))) {
      localKeysToRemove.push(key);
    }
  }
  localKeysToRemove.forEach((key) => window.localStorage.removeItem(key));

  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key) {
      continue;
    }

    if (authPrefixes.some((prefix) => key.startsWith(prefix))) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const tokenPayload = token.split(".")[1];
    if (!tokenPayload) {
      return null;
    }

    const normalized = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = window.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isSessionValid(session: AuthSession | null): boolean {
  if (!session?.accessToken || !session.expiresAtUtc) {
    return false;
  }

  const payload = parseJwtPayload(session.accessToken);
  if (!payload) {
    return false;
  }

  const exp = payload.exp;
  const tokenExpiryMs = typeof exp === "number" ? exp * 1000 : Number.NaN;
  if (!Number.isFinite(tokenExpiryMs) || tokenExpiryMs <= Date.now()) {
    return false;
  }

  const explicitExpiryMs = Date.parse(session.expiresAtUtc);
  if (!Number.isFinite(explicitExpiryMs) || explicitExpiryMs <= Date.now()) {
    return false;
  }

  return true;
}
