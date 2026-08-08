/**
 * =============================================================================
 * FILE: src/services/treeService.ts
 * ROLE: Convert API member data into tree canvas data
 * =============================================================================
 * The Family Tree UI needs two arrays:
 *   - members[]  → person cards
 *   - unions[]   → couples + children links
 *
 * Primary path:
 *   GET /api/members/tree  → nested root/spouse/children
 *   mapFromNestedTree()    → members + unions
 *
 * Fallback path (if tree endpoint fails):
 *   GET /api/members + GET /api/members/{id} for each
 *   buildUnions() from parent/spouse/children fields
 *
 * Used by: App.tsx → loadTreeData()
 * =============================================================================
 */

import { getFamilyTree, getMemberDetails, getMembers } from "./memberService";
import type { FamilyMember, MarriageUnion } from "../types";
import type { ApiTreeNode, MemberProfile, TreeDataResponse } from "../types/member";
import { defaultAvatar } from "../utils/defaultAvatar";

function mapGender(value?: string | null): "male" | "female" | "other" {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "male") return "male";
  if (normalized === "female") return "female";
  return "other";
}

function mapSocials(profile: MemberProfile): FamilyMember["socials"] {
  const findBy = (needle: string) =>
    profile.socialLinks?.find((x) => x.platform.toLowerCase().includes(needle))?.url;

  return {
    instagram: findBy("instagram"),
    facebook: findBy("facebook"),
    whatsapp: findBy("whatsapp"),
    gmail: findBy("gmail")
  };
}

function buildGenerationMap(profiles: MemberProfile[]): Map<number, number> {
  const byId = new Map<number, MemberProfile>();
  profiles.forEach((p) => byId.set(p.id, p));

  const gen = new Map<number, number>();

  const visit = (id: number, stack = new Set<number>()): number => {
    const cached = gen.get(id);
    if (cached) return cached;
    if (stack.has(id)) return 1;

    const profile = byId.get(id);
    if (!profile?.parent?.id) {
      gen.set(id, 1);
      return 1;
    }

    stack.add(id);
    const p = visit(profile.parent.id, stack);
    stack.delete(id);
    const current = p + 1;
    gen.set(id, current);
    return current;
  };

  profiles.forEach((p) => visit(p.id));
  return gen;
}

function relationFromGeneration(
  generation: number,
  gender: "male" | "female" | "other",
  isRoot: boolean
): string {
  if (isRoot || generation <= 1) {
    if (gender === "male") return "Grandfather";
    if (gender === "female") return "Grandmother";
    return "Ancestor";
  }
  if (generation === 2) {
    if (gender === "male") return "Father";
    if (gender === "female") return "Mother";
    return "Parent";
  }
  if (generation === 3) {
    if (gender === "male") return "Brother";
    if (gender === "female") return "Sister-in-Law";
    return "Member";
  }
  if (gender === "male") return "Nephew";
  if (gender === "female") return "Niece";
  return "Member";
}

function toFamilyMember(profile: MemberProfile, generationMap: Map<number, number>): FamilyMember {
  const gender = mapGender(profile.gender);
  const generation = generationMap.get(profile.id) ?? 1;
  const photos = (profile.images ?? []).map((x) => x.imageUrl);
  const avatar = profile.images?.find((x) => x.isPrimary)?.imageUrl ?? photos[0] ?? defaultAvatar(gender);

  return {
    id: String(profile.id),
    name: profile.fullName,
    nickname: profile.nickname?.trim() || undefined,
    relation: profile.nickname?.trim() || relationFromGeneration(generation, gender, profile.isRoot),
    gender,
    dob: profile.dateOfBirth ?? "",
    location: "Unknown",
    profession: profile.profession || "Not specified",
    avatar,
    bio: profile.biography || "No biography available.",
    education: "Not Specified",
    career: profile.profession || "Not Specified",
    photos,
    isDeceased: Boolean(profile.dateOfDeath),
    isRoot: profile.isRoot,
    socials: mapSocials(profile)
  };
}

function buildUnions(profiles: MemberProfile[]): MarriageUnion[] {
  const memberIds = new Set(profiles.map((p) => String(p.id)));
  const unions = new Map<string, { spouse1Id: string; spouse2Id: string; childrenIds: Set<string> }>();
  const profileById = new Map<string, MemberProfile>();
  profiles.forEach((p) => profileById.set(String(p.id), p));

  const spouseLookup = new Map<string, string>();

  const stableSortPair = (left: string, right: string): [string, string] => {
    const leftNum = Number(left);
    const rightNum = Number(right);
    const numericComparable = Number.isFinite(leftNum) && Number.isFinite(rightNum);
    if (numericComparable) {
      return leftNum <= rightNum ? [left, right] : [right, left];
    }
    return left.localeCompare(right) <= 0 ? [left, right] : [right, left];
  };

  const ensureUnion = (a: string, b: string) => {
    if (!memberIds.has(a) || !memberIds.has(b) || a === b) return null;
    const [spouse1Id, spouse2Id] = stableSortPair(a, b);
    const key = `${spouse1Id}_${spouse2Id}`;
    if (!unions.has(key)) {
      unions.set(key, { spouse1Id, spouse2Id, childrenIds: new Set<string>() });
    }
    return unions.get(key)!;
  };

  const linkSpouse = (a: string, b: string) => {
    if (!memberIds.has(a) || !memberIds.has(b) || a === b) return;
    if (!spouseLookup.has(a)) spouseLookup.set(a, b);
    if (!spouseLookup.has(b)) spouseLookup.set(b, a);
  };

  profiles.forEach((profile) => {
    if (!profile.spouse?.id) return;
    const currentId = String(profile.id);
    const spouseId = String(profile.spouse.id);
    linkSpouse(currentId, spouseId);
    ensureUnion(currentId, spouseId);
  });

  // reverse spouse discovery for one-sided spouse links in data
  profiles.forEach((profile) => {
    const currentId = String(profile.id);
    if (spouseLookup.has(currentId)) return;
    const reverse = profiles.find((candidate) => String(candidate.spouse?.id ?? "") === currentId);
    if (!reverse) return;
    const reverseId = String(reverse.id);
    linkSpouse(currentId, reverseId);
    ensureUnion(currentId, reverseId);
  });

  // attach children from explicit parent relation (primary source)
  profiles.forEach((profile) => {
    if (!profile.parent?.id) return;
    const childId = String(profile.id);
    const parentId = String(profile.parent.id);
    const spouseId = spouseLookup.get(parentId);
    if (!spouseId) return;
    const union = ensureUnion(parentId, spouseId);
    if (!union) return;
    union.childrenIds.add(childId);
  });

  // fallback: attach children from each profile's children array
  profiles.forEach((profile) => {
    const parentId = String(profile.id);
    const spouseId = spouseLookup.get(parentId);
    if (!spouseId) return;
    const union = ensureUnion(parentId, spouseId);
    if (!union) return;
    profile.children?.forEach((child) => {
      const childId = String(child.id);
      if (memberIds.has(childId)) {
        union.childrenIds.add(childId);
      }
    });
  });

  return Array.from(unions.values()).map((u) => ({
    id: `union_${u.spouse1Id}_${u.spouse2Id}`,
    spouse1Id: u.spouse1Id,
    spouse2Id: u.spouse2Id,
    childrenIds: Array.from(u.childrenIds)
      .filter((id) => memberIds.has(id))
      .sort((left, right) => {
        const leftProfile = profileById.get(left);
        const rightProfile = profileById.get(right);
        const leftDob = leftProfile?.dateOfBirth ? new Date(leftProfile.dateOfBirth).getTime() : Number.POSITIVE_INFINITY;
        const rightDob = rightProfile?.dateOfBirth ? new Date(rightProfile.dateOfBirth).getTime() : Number.POSITIVE_INFINITY;
        if (leftDob !== rightDob) return leftDob - rightDob;
        return (leftProfile?.fullName ?? "").localeCompare(rightProfile?.fullName ?? "");
      })
  }));
}

async function fetchAllProfiles(): Promise<MemberProfile[]> {
  const first = await getMembers({ page: 1, pageSize: 100, sortBy: "firstName", sortDesc: false });
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await getMembers({ page, pageSize: 100, sortBy: "firstName", sortDesc: false });
    items.push(...next.items);
  }

  const settled = await Promise.allSettled(items.map((item) => getMemberDetails(item.id)));
  const profiles = settled
    .filter((r): r is PromiseFulfilledResult<MemberProfile> => r.status === "fulfilled")
    .map((r) => r.value);

  if (items.length > 0 && profiles.length === 0) {
    throw new Error("Unable to load member profiles.");
  }

  return profiles;
}

function toFamilyMemberFromTree(node: ApiTreeNode, generation: number): FamilyMember {
  const gender = mapGender(node.gender);
  const nickname = node.nickname?.trim() || undefined;
  return {
    id: String(node.id),
    name: node.fullName || `${node.firstName} ${node.lastName}`.trim(),
    nickname,
    relation: nickname || relationFromGeneration(generation, gender, node.isRoot),
    gender,
    dob: node.dateOfBirth ?? "",
    location: "Unknown",
    profession: "Not specified",
    avatar: node.photoUrl || defaultAvatar(gender),
    bio: "No biography available.",
    education: "Not Specified",
    career: "Not Specified",
    photos: node.photoUrl ? [node.photoUrl] : [],
    isDeceased: Boolean(node.dateOfDeath),
    isRoot: node.isRoot,
    socials: {}
  };
}

function mapFromNestedTree(root: ApiTreeNode): TreeDataResponse {
  const members = new Map<string, FamilyMember>();
  const unions = new Map<string, MarriageUnion>();
  const traversed = new Set<string>();

  const stablePair = (a: string, b: string): [string, string] => {
    const aNum = Number(a);
    const bNum = Number(b);
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      return aNum <= bNum ? [a, b] : [b, a];
    }
    return a.localeCompare(b) <= 0 ? [a, b] : [b, a];
  };

  const walk = (node: ApiTreeNode, generation: number) => {
    const nodeId = String(node.id);
    if (!members.has(nodeId)) {
      members.set(nodeId, toFamilyMemberFromTree(node, generation));
    }

    let parentUnion: MarriageUnion | null = null;
    if (node.spouse?.id) {
      const spouseId = String(node.spouse.id);
      if (!members.has(spouseId)) {
        members.set(spouseId, toFamilyMemberFromTree(node.spouse, generation));
      }

      const [left, right] = stablePair(nodeId, spouseId);
      const unionId = `union_${left}_${right}`;
      if (!unions.has(unionId)) {
        unions.set(unionId, {
          id: unionId,
          spouse1Id: left,
          spouse2Id: right,
          childrenIds: []
        });
      }
      parentUnion = unions.get(unionId)!;
    }

    const key = `${nodeId}|g${generation}`;
    if (traversed.has(key)) return;
    traversed.add(key);

    node.children?.forEach((child) => {
      const childId = String(child.id);
      walk(child, generation + 1);
      if (parentUnion && !parentUnion.childrenIds.includes(childId)) {
        parentUnion.childrenIds.push(childId);
      }
    });
  };

  walk(root, 1);

  return {
    members: Array.from(members.values()),
    unions: Array.from(unions.values())
  };
}

/**
 * Main entry used by the Tree screen.
 * Prefers nested API tree; falls back to profile stitching.
 */
export async function getFamilyTreeData(): Promise<TreeDataResponse> {
  // Prefer explicit backend tree graph when available.
  const nested = await getFamilyTree().catch(() => null);
  if (nested?.root) {
    return mapFromNestedTree(nested.root);
  }

  // Fallback to profile stitching for backward compatibility.
  const profiles = await fetchAllProfiles();
  const generationMap = buildGenerationMap(profiles);
  const members = profiles.map((p) => toFamilyMember(p, generationMap));
  const unions = buildUnions(profiles);
  return { members, unions };
}
