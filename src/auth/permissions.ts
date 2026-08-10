/**
 * Access-control helpers derived from the JWT auth session.
 * UI checks are for visibility only — write APIs enforce authorization on the server.
 */

import { getAuthSession } from "../services/authSessionService";
import type { MarriageUnion } from "../types";
import type { AccessAuthType, AccessPermission, AccessScope } from "../types/auth";

export type PermissionLevel = "view" | "edit" | "admin";
export type TokenScope = "entire-family" | "selected-member" | "member-descendants";

export interface AccessContext {
  authType: AccessAuthType;
  isAdmin: boolean;
  permission: AccessPermission;
  scope: AccessScope;
  scopeMemberId: number | null;
  tokenName?: string | null;
  familyId?: number | null;
  tokenId?: number | null;
  displayName: string;
}

const adminContext = (): AccessContext => ({
  authType: "admin",
  isAdmin: true,
  permission: "ADMIN_FULL",
  scope: "EntireFamily",
  scopeMemberId: null,
  displayName: "Family Admin"
});

export function getAccessContext(): AccessContext {
  const session = getAuthSession();
  if (!session?.accessToken) {
    return {
      authType: "access_token",
      isAdmin: false,
      permission: "View",
      scope: "EntireFamily",
      scopeMemberId: null,
      displayName: "Guest"
    };
  }

  // Legacy password sessions (before authType was stored) behave as admin.
  if (!session.authType || session.authType === "admin" || session.isAdmin) {
    return {
      ...adminContext(),
      displayName: session.user?.username || session.tokenName || "Family Admin",
      familyId: session.familyId ?? null
    };
  }

  return {
    authType: "access_token",
    isAdmin: false,
    permission: session.permission === "Edit" ? "Edit" : "View",
    scope: session.scope ?? "EntireFamily",
    scopeMemberId: session.scopeMemberId ?? null,
    tokenName: session.tokenName,
    familyId: session.familyId ?? null,
    tokenId: session.tokenId ?? null,
    displayName: session.tokenName || session.user?.username || "Token user"
  };
}

/** @deprecated Prefer getAccessContext(); kept for older call sites. */
export function getMockUser() {
  const ctx = getAccessContext();
  return {
    username: ctx.displayName,
    displayName: ctx.displayName,
    isAdmin: ctx.isAdmin,
    permission: (ctx.isAdmin ? "admin" : ctx.permission === "Edit" ? "edit" : "view") as PermissionLevel,
    tokenScope: (ctx.scope === "SelectedMember"
      ? "selected-member"
      : ctx.scope === "MemberDescendants"
        ? "member-descendants"
        : "entire-family") as TokenScope
  };
}

export function setMockUser(_user: Partial<ReturnType<typeof getMockUser>>) {
  // No-op: permissions now come from the JWT auth session.
  return getMockUser();
}

export const canView = () => Boolean(getAuthSession()?.accessToken);

export const canEdit = () => {
  const ctx = getAccessContext();
  return ctx.isAdmin || ctx.permission === "Edit";
};

export const canEditFamily = () => getAccessContext().isAdmin;

export const canCreateMember = () => {
  const ctx = getAccessContext();
  if (ctx.isAdmin) return true;
  if (ctx.permission !== "Edit") return false;
  if (ctx.scope === "EntireFamily") return true;
  if (ctx.scope === "MemberDescendants") return true;
  return false;
};

export const isAdmin = () => getAccessContext().isAdmin;

function collectDescendantIds(rootId: string, unions: MarriageUnion[]): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const union of unions) {
    for (const parentId of [union.spouse1Id, union.spouse2Id]) {
      if (!parentId) continue;
      const list = childrenByParent.get(parentId) ?? [];
      list.push(...union.childrenIds.map(String));
      childrenByParent.set(String(parentId), list);
    }
  }

  const result = new Set<string>();
  const stack = [String(rootId)];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      if (result.has(childId)) continue;
      result.add(childId);
      stack.push(childId);
    }
  }
  return result;
}

/** Scope applies to EDIT only. Pass unions for Member & Descendants checks. */
export function canEditMember(memberId: number | string, unions: MarriageUnion[] = []): boolean {
  const ctx = getAccessContext();
  if (ctx.isAdmin) return true;
  if (ctx.permission !== "Edit") return false;
  if (ctx.scope === "EntireFamily") return true;

  const id = String(memberId);
  const scopeId = ctx.scopeMemberId != null ? String(ctx.scopeMemberId) : null;
  if (!scopeId) return false;

  if (ctx.scope === "SelectedMember") {
    return id === scopeId;
  }

  if (ctx.scope === "MemberDescendants") {
    if (id === scopeId) return true;
    return collectDescendantIds(scopeId, unions).has(id);
  }

  return false;
}

export function canDeleteMember(memberId: number | string, unions: MarriageUnion[] = []): boolean {
  return canEditMember(memberId, unions);
}

/** @deprecated Use canDeleteMember(memberId, unions) for scoped deletes. */
export const canDelete = () => isAdmin();
