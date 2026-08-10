/**
 * Authentication request/response TypeScript models.
 * Matches MidnightApi account + access-token login endpoints.
 */

export type AccessAuthType = "admin" | "access_token";
export type AccessPermission = "View" | "Edit" | "ADMIN_FULL";
export type AccessScope = "EntireFamily" | "SelectedMember" | "MemberDescendants";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  familyName: string;
  description?: string;
}

export interface RegisterResponse {
  accountId: number;
  familyId: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  tokenType: string;
  refreshToken?: string;
  user?: AuthUser;
}

export interface AccessTokenLoginRequest {
  accessToken: string;
}

export interface AccessTokenLoginUser {
  authType: AccessAuthType;
  familyId: number;
  tokenId: number;
  tokenName: string;
  permission: AccessPermission;
  scope: AccessScope;
  scopeMemberId?: number | null;
  isAdmin: boolean;
}

export interface AccessTokenLoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  tokenType: string;
  user: AccessTokenLoginUser;
}

export interface AuthUser {
  id?: number;
  username?: string;
  email?: string;
  [key: string]: unknown;
}

/** Persisted login session kept in the browser */
export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  tokenType: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
  authType?: AccessAuthType;
  isAdmin?: boolean;
  familyId?: number | null;
  tokenId?: number | null;
  tokenName?: string | null;
  permission?: AccessPermission;
  scope?: AccessScope;
  scopeMemberId?: number | null;
}
