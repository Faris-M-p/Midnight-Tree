import { describe, expect, it } from "vitest";
import {
  canEditFamilyTree,
  canInviteCollaborators,
  canManageFamilySettings,
  isFamilyOwner
} from "./roles";

describe("family role permissions", () => {
  it("owner can manage, edit, invite", () => {
    expect(isFamilyOwner("owner")).toBe(true);
    expect(canManageFamilySettings("owner")).toBe(true);
    expect(canEditFamilyTree("owner")).toBe(true);
    expect(canInviteCollaborators("owner")).toBe(true);
  });

  it("admin can manage and invite but is not owner", () => {
    expect(isFamilyOwner("admin")).toBe(false);
    expect(canManageFamilySettings("admin")).toBe(true);
    expect(canInviteCollaborators("admin")).toBe(true);
    expect(canEditFamilyTree("admin")).toBe(true);
  });

  it("editor can edit tree only", () => {
    expect(canEditFamilyTree("editor")).toBe(true);
    expect(canManageFamilySettings("editor")).toBe(false);
    expect(canInviteCollaborators("editor")).toBe(false);
    expect(isFamilyOwner("editor")).toBe(false);
  });

  it("viewer and null are denied", () => {
    expect(canEditFamilyTree("viewer")).toBe(false);
    expect(canManageFamilySettings(null)).toBe(false);
    expect(canInviteCollaborators(undefined)).toBe(false);
    expect(isFamilyOwner(null)).toBe(false);
  });
});
