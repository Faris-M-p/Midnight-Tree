/**
 * Convert Firestore members + relationships into the Family Tree UI model.
 * Does not call MidnightApi.
 */

import { logUnexpected } from "../utils/logFailure";
import { resolveAvatarUrl } from "../utils/defaultAvatar";
import type { FamilyMember, MarriageUnion } from "../types";
import type { TreeDataResponse } from "../types/member";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import { waitForCurrentFirebaseUser } from "../firebase/auth/firebaseAuth";
import { getMembersByFamily } from "../firebase/firestore/memberService";
import { getRelationshipsByFamily } from "../firebase/firestore/relationshipService";
import type { FirebaseFamilyMember, FirebaseRelationship } from "../firebase/types/firebaseTypes";

function mapGender(value?: string | null): "male" | "female" | "other" {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "male") return "male";
  if (normalized === "female") return "female";
  return "other";
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

function toFamilyMember(member: FirebaseFamilyMember): FamilyMember {
  const id = member.id ?? "";
  const gender = mapGender(member.gender);
  return {
    id,
    name: `${member.firstName} ${member.lastName ?? ""}`.replace(/\s+/g, " ").trim(),
    nickname: member.nickname,
    relation: member.isRoot ? "Root" : member.nickname || "",
    gender,
    dob: member.dateOfBirth ?? "",
    dateOfDeath: member.dateOfDeath ?? undefined,
    location: member.locationName || "Unknown",
    profession: member.profession || "",
    avatar: resolveAvatarUrl(member.photoUrl, gender),
    bio: member.biography || "",
    education: "",
    career: member.profession || "",
    photos: member.photoUrl ? [member.photoUrl] : [],
    isDeceased: Boolean(member.dateOfDeath),
    isRoot: Boolean(member.isRoot),
    createdAt: timestampToIso(member.createdAt)
  };
}

function buildUnions(members: FirebaseFamilyMember[], rels: FirebaseRelationship[]): MarriageUnion[] {
  const unions = new Map<string, MarriageUnion>();

  for (const rel of rels) {
    if (rel.relationshipType !== "spouse") continue;
    const left = rel.member1Id;
    const right = rel.member2Id;
    if (!left || !right) continue;
    const key = [left, right].sort().join("|");
    if (!unions.has(key)) {
      unions.set(key, {
        id: rel.id || `union-${key}`,
        spouse1Id: left,
        spouse2Id: right,
        childrenIds: []
      });
    }
  }

  for (const rel of rels) {
    if (rel.relationshipType !== "parent") continue;
    const parentId = rel.member1Id;
    const childId = rel.member2Id;
    let parentUnion = [...unions.values()].find(
      (union) => union.spouse1Id === parentId || union.spouse2Id === parentId
    );
    if (!parentUnion) {
      const key = `${parentId}|solo`;
      parentUnion = {
        id: `union-${key}`,
        spouse1Id: parentId,
        spouse2Id: parentId,
        childrenIds: []
      };
      unions.set(key, parentUnion);
    }
    if (!parentUnion.childrenIds.includes(childId)) {
      parentUnion.childrenIds.push(childId);
    }
  }

  void members;
  return [...unions.values()];
}

export async function getFamilyTreeData(): Promise<TreeDataResponse> {
  try {
    const user = await waitForCurrentFirebaseUser();
    if (!user) {
      return { members: [], unions: [] };
    }
    const familyId = await ensureCurrentFamilyId();
    const [members, relationships] = await Promise.all([
      getMembersByFamily(familyId),
      getRelationshipsByFamily(familyId)
    ]);
    return {
      members: members.map(toFamilyMember),
      unions: buildUnions(members, relationships)
    };
  } catch (error) {
    logUnexpected("FamilyTree", error);
    return { members: [], unions: [] };
  }
}
