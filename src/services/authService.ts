/**
 * =============================================================================
 * FILE: src/services/authService.ts
 * ROLE: Account register / login API calls
 * =============================================================================
 * Thin wrappers around MidnightApi account endpoints.
 * Login also saves the JWT session via authSessionService.
 *
 * Used by: LoginPage, RegisterPage
 * =============================================================================
 */

import { apiRequest } from "./apiClient";
import { saveAuthSession } from "./authSessionService";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from "../types/auth";

const AUTH_BASE = "/api/accounts";

/** Create a new family admin account */
export function registerAccount(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse, RegisterRequest>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: payload
  });
}

/** Authenticate and return tokens (does not store them) */
export function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: payload
  });
}

/** Login + save session to localStorage in one step */
export async function loginAndPersistSession(payload: LoginRequest): Promise<LoginResponse> {
  const response = await loginAccount(payload);
  if (!response.accessToken?.trim()) {
    throw new Error("Sign-in did not return an access token.");
  }

  saveAuthSession({
    accessToken: response.accessToken.trim(),
    expiresAtUtc: response.expiresAtUtc,
    tokenType: response.tokenType,
    refreshToken: response.refreshToken ?? null,
    user: response.user ?? { username: payload.username },
    authType: "admin",
    isAdmin: true,
    permission: "ADMIN_FULL",
    scope: "EntireFamily",
    scopeMemberId: null,
    tokenId: null,
    tokenName: null
  });

  return response;
}
