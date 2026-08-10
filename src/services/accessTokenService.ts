/**
 * Admin Access Token API service.
 * Talks to MidnightApi AccessTokenController:
 *   POST   /api/access-tokens/login
 *   GET    /api/access-tokens
 *   GET    /api/access-tokens/{id}
 *   POST   /api/access-tokens
 *   PUT    /api/access-tokens/{id}
 *   PUT    /api/access-tokens/{id}/status
 *   DELETE /api/access-tokens/{id}
 */

import { apiRequest } from "./apiClient";
import { applyAccessTokenSession } from "../auth/session";
import type {
  AccessToken,
  CreateAccessTokenPayload,
  CreateAccessTokenResult,
  UpdateAccessTokenPayload
} from "../types/accessToken";
import type { AccessTokenLoginRequest, AccessTokenLoginResponse } from "../types/auth";

const BASE = "/api/access-tokens";

export function loginWithAccessToken(payload: AccessTokenLoginRequest): Promise<AccessTokenLoginResponse> {
  return apiRequest<AccessTokenLoginResponse, AccessTokenLoginRequest>(`${BASE}/login`, {
    method: "POST",
    body: payload
  });
}

export async function loginWithAccessTokenAndPersist(
  payload: AccessTokenLoginRequest
): Promise<AccessTokenLoginResponse> {
  const response = await loginWithAccessToken(payload);
  applyAccessTokenSession({
    accessToken: response.accessToken,
    expiresAtUtc: response.expiresAtUtc,
    tokenType: response.tokenType,
    authType: response.user.authType,
    familyId: response.user.familyId,
    tokenId: response.user.tokenId,
    tokenName: response.user.tokenName,
    permission: response.user.permission,
    scope: response.user.scope,
    scopeMemberId: response.user.scopeMemberId
  });
  return response;
}

export function listAccessTokens(): Promise<AccessToken[]> {
  return apiRequest<AccessToken[]>(BASE);
}

export function getAccessToken(id: number): Promise<AccessToken> {
  return apiRequest<AccessToken>(`${BASE}/${id}`);
}

export function createAccessToken(payload: CreateAccessTokenPayload): Promise<CreateAccessTokenResult> {
  return apiRequest<CreateAccessTokenResult, CreateAccessTokenPayload>(BASE, {
    method: "POST",
    body: payload
  });
}

export function updateAccessToken(id: number, payload: UpdateAccessTokenPayload): Promise<AccessToken> {
  return apiRequest<AccessToken, UpdateAccessTokenPayload>(`${BASE}/${id}`, {
    method: "PUT",
    body: payload
  });
}

export function setAccessTokenStatus(id: number, status: "Active" | "Inactive"): Promise<AccessToken> {
  return apiRequest<AccessToken, { status: string }>(`${BASE}/${id}/status`, {
    method: "PUT",
    body: { status }
  });
}

export function deleteAccessToken(id: number): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}`, {
    method: "DELETE"
  });
}
