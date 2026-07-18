import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactNode } from "react";
import { loginAccount } from "../services/authService";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthSession,
  getAuthSession,
  isSessionValid,
  parseJwtPayload,
  saveAuthSession
} from "../services/authSessionService";
import type { AuthSession, AuthUser, LoginRequest } from "../types/auth";

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStringClaim(payload: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function readNumberClaim(payload: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = payload[key];
    const parsed = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function deriveUserFromSession(session: AuthSession): AuthUser | null {
  if (session.user) {
    return session.user;
  }

  const payload = parseJwtPayload(session.accessToken);
  if (!payload) {
    return null;
  }

  return {
    id: readNumberClaim(payload, ["account_id", "id", "sub", "nameid"]),
    familyId: readNumberClaim(payload, ["family_id"]),
    username: readStringClaim(payload, [
      "name",
      "unique_name",
      "username",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ]),
    role: readStringClaim(payload, [
      "role",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ])
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
    setCurrentUser(null);
  }, []);

  const bootstrapSession = useCallback(() => {
    const stored = getAuthSession();
    if (!isSessionValid(stored)) {
      clearAuthSession();
      setSession(null);
      setCurrentUser(null);
      return;
    }

    setSession(stored);
    setCurrentUser(deriveUserFromSession(stored));
  }, []);

  useEffect(() => {
    bootstrapSession();
    setIsLoading(false);
  }, [bootstrapSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized as EventListener);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized as EventListener);
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginAccount(payload);

    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
      tokenType: response.tokenType,
      refreshToken: response.refreshToken ?? null,
      user: response.user ?? null
    };

    saveAuthSession(nextSession);
    setSession(nextSession);
    setCurrentUser(deriveUserFromSession(nextSession));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    isAuthenticated: Boolean(session?.accessToken),
    isLoading,
    login,
    logout
  }), [currentUser, isLoading, login, logout, session?.accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return ctx;
}
