/**
 * Access token types for Admin Access Token management.
 * Raw token is only present on create response and never persisted in UI state long-term.
 */

export type AccessTokenPermission = "View" | "Edit";
export type AccessTokenScope = "EntireFamily" | "SelectedMember" | "MemberDescendants";
export type AccessTokenStatus = "Active" | "Inactive" | "Expired";
export type AccessTokenExpiryPreset = "30Days" | "90Days" | "6Months" | "1Year" | "Custom";

export interface AccessToken {
  id: number;
  tokenName: string;
  status: AccessTokenStatus;
  permission: AccessTokenPermission;
  scope: AccessTokenScope;
  memberId?: number | null;
  memberName?: string | null;
  tokenPreview: string;
  createdOn: string;
  expiresOn: string;
  lastUsedOn?: string | null;
  activeSessions: number;
  usageCount: number;
}

export interface CreateAccessTokenPayload {
  tokenName: string;
  permission: AccessTokenPermission;
  scope: AccessTokenScope;
  memberId?: number | null;
  expiryPreset: AccessTokenExpiryPreset;
  customExpiresOn?: string | null;
}

export type UpdateAccessTokenPayload = CreateAccessTokenPayload;

export interface CreateAccessTokenResult {
  id: number;
  rawToken: string;
  token: AccessToken;
}
