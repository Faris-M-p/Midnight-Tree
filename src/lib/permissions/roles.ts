import type { FamilyRole } from "@/types/database";

export function canManageFamilySettings(role: FamilyRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canEditFamilyTree(role: FamilyRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canInviteCollaborators(role: FamilyRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function isFamilyOwner(role: FamilyRole | null | undefined): boolean {
  return role === "owner";
}
