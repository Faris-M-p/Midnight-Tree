import { apiRequest } from "./apiClient";
import { saveAuthSession } from "./authSessionService";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from "../types/auth";

const AUTH_BASE = "/api/accounts";

export function registerAccount(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse, RegisterRequest>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: payload
  });
}

export function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: payload
  });
}

export async function loginAndPersistSession(payload: LoginRequest): Promise<LoginResponse> {
  const response = await loginAccount(payload);

  saveAuthSession({
    accessToken: response.accessToken,
    expiresAtUtc: response.expiresAtUtc,
    tokenType: response.tokenType,
    refreshToken: response.refreshToken ?? null,
    user: response.user ?? null
  });

  return response;
}
