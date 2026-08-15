/**
 * =============================================================================
 * FILE: src/services/authService.ts
 * ROLE: Account register / login / email verification / password recovery
 * =============================================================================
 */

import { apiRequest } from "./apiClient";
import { saveAuthSession } from "./authSessionService";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  OtpChallengeResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyForgotPasswordOtpRequest,
  VerifyForgotPasswordOtpResponse
} from "../types/auth";

const AUTH_BASE = "/api/accounts";

function persistAdminSession(response: LoginResponse, fallbackUsername?: string) {
  if (!response.accessToken?.trim()) {
    throw new Error("Sign-in did not return an access token.");
  }

  saveAuthSession({
    accessToken: response.accessToken.trim(),
    expiresAtUtc: response.expiresAtUtc ?? new Date().toISOString(),
    tokenType: response.tokenType ?? "Bearer",
    refreshToken: response.refreshToken ?? null,
    user: response.user ?? {
      username: response.username ?? fallbackUsername
    },
    authType: "admin",
    isAdmin: true,
    permission: "ADMIN_FULL",
    scope: "EntireFamily",
    scopeMemberId: null,
    tokenId: null,
    tokenName: null
  });
}

/** Create a new family admin account (unverified until OTP succeeds). */
export function registerAccount(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse, RegisterRequest>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: payload
  });
}

export function verifyEmail(payload: VerifyEmailRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, VerifyEmailRequest>(`${AUTH_BASE}/verify-email`, {
    method: "POST",
    body: payload
  });
}

/** Verify email OTP + persist admin session (auto-login after registration). */
export async function verifyEmailAndPersistSession(payload: VerifyEmailRequest): Promise<LoginResponse> {
  const response = await verifyEmail(payload);
  persistAdminSession(response, response.username ?? payload.email);
  return response;
}

export function resendVerification(payload: ResendVerificationRequest): Promise<OtpChallengeResponse> {
  return apiRequest<OtpChallengeResponse, ResendVerificationRequest>(`${AUTH_BASE}/resend-verification`, {
    method: "POST",
    body: payload
  });
}

/** Authenticate and return tokens (does not store them). May require email verification. */
export function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: payload
  });
}

/** Login + save session only when JWT is returned. */
export async function loginAndPersistSession(payload: LoginRequest): Promise<LoginResponse> {
  const response = await loginAccount(payload);

  if (response.requiresEmailVerification) {
    return response;
  }

  persistAdminSession(response, payload.email);
  return response;
}

export function requestForgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse, ForgotPasswordRequest>(`${AUTH_BASE}/forgot-password`, {
    method: "POST",
    body: payload
  });
}

export function verifyForgotPasswordOtp(
  payload: VerifyForgotPasswordOtpRequest
): Promise<VerifyForgotPasswordOtpResponse> {
  return apiRequest<VerifyForgotPasswordOtpResponse, VerifyForgotPasswordOtpRequest>(
    `${AUTH_BASE}/forgot-password/verify-otp`,
    {
      method: "POST",
      body: payload
    }
  );
}

export function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  return apiRequest<void, ResetPasswordRequest>(`${AUTH_BASE}/forgot-password/reset`, {
    method: "POST",
    body: payload
  });
}
