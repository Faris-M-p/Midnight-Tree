import { FirebaseClientError } from "../firebase/errors/firebaseErrorHandler";
import {
  accessTokenAuthEmail,
  createAccessTokenAuthUser,
  firebaseLogin,
  getCurrentFirebaseUser
} from "../firebase/auth/firebaseAuth";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import {
  createAccessToken as createFirebaseAccessToken,
  deleteAccessToken as deleteFirebaseAccessToken,
  getAccessToken as getFirebaseAccessToken,
  getAccessTokensByFamily,
  updateAccessToken as updateFirebaseAccessToken
} from "../firebase/firestore/accessTokenService";
import { getMembersByFamily } from "../firebase/firestore/memberService";
import type { FirebaseAccessToken } from "../firebase/types/firebaseTypes";
import { applyAccessTokenSession } from "../auth/session";
import type {
  AccessToken,
  AccessTokenStatus,
  CreateAccessTokenPayload,
  CreateAccessTokenResult,
  UpdateAccessTokenPayload
} from "../types/accessToken";
import type { AccessTokenLoginRequest, AccessTokenLoginResponse } from "../types/auth";

function asId(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const body = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `mct_${body}`;
}

function tokenPreview(rawToken: string): string {
  const value = rawToken.replace(/^mct_/, "");
  if (value.length < 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function expiresOnFromPayload(payload: CreateAccessTokenPayload): string {
  if (payload.expiryPreset === "Custom" && payload.customExpiresOn) {
    return payload.customExpiresOn;
  }
  const days =
    payload.expiryPreset === "30Days"
      ? 30
      : payload.expiryPreset === "6Months"
        ? 182
        : payload.expiryPreset === "1Year"
          ? 365
          : 90;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function liveStatus(stored: "Active" | "Inactive" | undefined, expiresOn: string): AccessTokenStatus {
  if (new Date(expiresOn).getTime() < Date.now()) return "Expired";
  return stored === "Inactive" ? "Inactive" : "Active";
}

function toAccessToken(doc: FirebaseAccessToken, memberName?: string | null): AccessToken {
  const expiresOn = doc.expiresOn;
  return {
    id: doc.id ?? "",
    tokenName: doc.tokenName,
    status: liveStatus(doc.status, expiresOn),
    permission: doc.permission,
    scope: doc.scope,
    memberId: doc.memberId ?? null,
    memberName: memberName ?? null,
    tokenPreview: doc.tokenPreview,
    createdOn: timestampToIso(doc.createdAt) ?? new Date().toISOString(),
    expiresOn,
    lastUsedOn: doc.lastUsedOn ?? null,
    activeSessions: 0,
    usageCount: doc.usageCount ?? 0
  };
}

async function memberNamesById(familyId: string): Promise<Map<string, string>> {
  const members = await getMembersByFamily(familyId);
  return new Map(
    members
      .filter((member) => member.id)
      .map((member) => [
        member.id as string,
        `${member.firstName} ${member.lastName ?? ""}`.replace(/\s+/g, " ").trim()
      ])
  );
}

async function mapToken(doc: FirebaseAccessToken): Promise<AccessToken> {
  const names = doc.memberId ? await memberNamesById(doc.familyId) : new Map<string, string>();
  return toAccessToken(doc, doc.memberId ? names.get(doc.memberId) ?? null : null);
}

export async function listAccessTokens(): Promise<AccessToken[]> {
  const familyId = await ensureCurrentFamilyId();
  const rows = await getAccessTokensByFamily(familyId);
  const names = await memberNamesById(familyId);
  return rows
    .map((row) => toAccessToken(row, row.memberId ? names.get(row.memberId) ?? null : null))
    .sort((left, right) => right.createdOn.localeCompare(left.createdOn));
}

export async function getAccessToken(id: string | number): Promise<AccessToken> {
  const doc = await getFirebaseAccessToken(asId(id));
  if (!doc?.id) {
    throw new FirebaseClientError("Access token not found.", "not-found");
  }
  return mapToken(doc);
}

export async function createAccessToken(payload: CreateAccessTokenPayload): Promise<CreateAccessTokenResult> {
  const familyId = await ensureCurrentFamilyId();
  const user = getCurrentFirebaseUser();
  const rawToken = randomToken();
  const tokenId = await sha256Hex(rawToken);
  const authEmail = accessTokenAuthEmail(tokenId);
  await createAccessTokenAuthUser(authEmail, rawToken);
  const created = await createFirebaseAccessToken(tokenId, {
    familyId,
    tokenName: payload.tokenName,
    permission: payload.permission,
    scope: payload.scope,
    memberId: payload.memberId != null ? asId(payload.memberId) : null,
    tokenPreview: tokenPreview(rawToken),
    authEmail,
    status: "Active",
    expiresOn: expiresOnFromPayload(payload),
    lastUsedOn: null,
    usageCount: 0,
    createdBy: user?.uid ?? "unknown"
  });
  const token = await mapToken(created);
  return { id: token.id, rawToken, token };
}

export async function updateAccessToken(
  id: string | number,
  payload: UpdateAccessTokenPayload
): Promise<AccessToken> {
  const tokenId = asId(id);
  const existing = await getFirebaseAccessToken(tokenId);
  if (!existing?.id) {
    throw new FirebaseClientError("Access token not found.", "not-found");
  }
  await updateFirebaseAccessToken(tokenId, {
    tokenName: payload.tokenName,
    permission: payload.permission,
    scope: payload.scope,
    memberId: payload.memberId != null ? asId(payload.memberId) : null,
    expiresOn: expiresOnFromPayload(payload),
    status: existing.status === "Inactive" ? "Inactive" : "Active"
  });
  return getAccessToken(tokenId);
}

export async function setAccessTokenStatus(
  id: string | number,
  status: "Active" | "Inactive"
): Promise<AccessToken> {
  const tokenId = asId(id);
  const existing = await getFirebaseAccessToken(tokenId);
  if (!existing?.id) {
    throw new FirebaseClientError("Access token not found.", "not-found");
  }
  if (liveStatus(existing.status, existing.expiresOn) === "Expired" && status === "Active") {
    throw new FirebaseClientError("Expired tokens cannot be reactivated. Extend the expiry date first.", "failed-precondition");
  }
  await updateFirebaseAccessToken(tokenId, { status });
  return getAccessToken(tokenId);
}

export async function deleteAccessToken(id: string | number): Promise<void> {
  await deleteFirebaseAccessToken(asId(id));
}

export async function loginWithAccessToken(
  payload: AccessTokenLoginRequest
): Promise<AccessTokenLoginResponse> {
  const raw = payload.accessToken.trim();
  if (!raw) {
    throw new FirebaseClientError("Access token is required.", "invalid-argument");
  }
  const tokenId = await sha256Hex(raw);
  const doc = await getFirebaseAccessToken(tokenId);
  if (!doc?.id) {
    throw new FirebaseClientError("Invalid access token.", "not-found");
  }
  const status = liveStatus(doc.status, doc.expiresOn);
  if (status === "Expired") {
    throw new FirebaseClientError("This access token has expired.", "failed-precondition");
  }
  if (status !== "Active") {
    throw new FirebaseClientError("This access token is inactive.", "failed-precondition");
  }
  if (!doc.authEmail) {
    throw new FirebaseClientError("This token cannot sign in. Generate a new access token.", "failed-precondition");
  }

  await firebaseLogin(doc.authEmail, raw);

  try {
    await updateFirebaseAccessToken(tokenId, {
      lastUsedOn: new Date().toISOString(),
      usageCount: (doc.usageCount ?? 0) + 1
    });
  } catch {
    // Usage tracking is optional.
  }

  return {
    accessToken: raw,
    expiresAtUtc: doc.expiresOn,
    tokenType: "Bearer",
    user: {
      authType: "access_token",
      familyId: 0,
      tokenId: doc.id,
      tokenName: doc.tokenName,
      permission: doc.permission,
      scope: doc.scope,
      scopeMemberId: doc.memberId ?? null,
      isAdmin: false
    }
  };
}

export async function loginWithAccessTokenAndPersist(
  payload: AccessTokenLoginRequest
): Promise<AccessTokenLoginResponse> {
  const tokenId = await sha256Hex(payload.accessToken.trim());
  const doc = await getFirebaseAccessToken(tokenId);
  const result = await loginWithAccessToken(payload);
  if (!doc?.familyId) {
    throw new FirebaseClientError("Invalid access token.", "not-found");
  }

  applyAccessTokenSession({
    accessToken: result.accessToken,
    expiresAtUtc: result.expiresAtUtc,
    tokenType: result.tokenType,
    authType: "access_token",
    familyId: 0,
    tokenId: result.user.tokenId,
    tokenName: result.user.tokenName,
    permission: result.user.permission,
    scope: result.user.scope,
    scopeMemberId: result.user.scopeMemberId ?? null,
    firebaseFamilyId: doc.familyId
  });

  return result;
}
