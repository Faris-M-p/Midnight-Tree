/**
 * Mock permission helpers for the new frontend architecture.
 * Password-login users keep their real JWT; this layer only gates UI
 * (Administration / Access Tokens) until the token API is connected.
 */

export type PermissionLevel = "view" | "edit" | "admin";
export type TokenScope = "entire-family" | "selected-member" | "member-descendants";

export interface MockUser {
  username: string;
  displayName: string;
  isAdmin: boolean;
  permission: PermissionLevel;
  tokenScope: TokenScope;
}

const MOCK_USER_KEY = "midnight.mock.user";

export const defaultMockUser: MockUser = {
  username: "admin",
  displayName: "Family Admin",
  isAdmin: true,
  permission: "admin",
  tokenScope: "entire-family"
};

export function getMockUser(): MockUser {
  try {
    const raw = localStorage.getItem(MOCK_USER_KEY);
    if (raw) return { ...defaultMockUser, ...(JSON.parse(raw) as MockUser) };
  } catch {
    /* ignore */
  }
  return defaultMockUser;
}

export function setMockUser(user: Partial<MockUser>) {
  const next = { ...getMockUser(), ...user };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(next));
  return next;
}

export const canView = (user = getMockUser()) =>
  user.permission === "view" || user.permission === "edit" || user.permission === "admin";

export const canEdit = (user = getMockUser()) =>
  user.permission === "edit" || user.permission === "admin";

export const canDelete = (user = getMockUser()) => user.permission === "admin";

export const isAdmin = (user = getMockUser()) => user.isAdmin || user.permission === "admin";
