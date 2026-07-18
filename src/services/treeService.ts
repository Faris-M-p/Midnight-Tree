import { getFamilyTimeline } from "./familyService";
import { getMemberDetails, getMembers } from "./memberService";
import type { FamilyMember, MarriageUnion, Milestone } from "../types";
import type { FamilyTimelineItem } from "../types/family";
import type { MemberProfile } from "../types/member";

interface TreeDataResponse {
  members: FamilyMember[];
  unions: MarriageUnion[];
  milestones: Milestone[];
}

function mapGender(value?: string | null): "male" | "female" | "other" {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "male") {
    return "male";
  }
  if (normalized === "female") {
    return "female";
  }
  return "other";
}

function defaultAvatar(gender: "male" | "female" | "other"): string {
  if (gender === "male") {
    return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80";
  }
  if (gender === "female") {
    return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80";
  }
  return "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80";
}

function mapSocialLinks(profile: MemberProfile): FamilyMember["socials"] {
  const links = profile.socialLinks ?? [];
  const find = (key: string) => links.find((x) => x.platform.toLowerCase().includes(key))?.url;

  return {
    facebook: find("facebook"),
    instagram: find("instagram"),
    whatsapp: find("whatsapp"),
    gmail: find("gmail")
  };
}

function mapMilestoneCategory(value: string): Milestone["category"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("birth")) {
    return "birth";
  }
  if (normalized.includes("marriage")) {
    return "marriage";
  }
  if (normalized.includes("career") || normalized.includes("job")) {
    return "career";
  }
  if (normalized.includes("education") || normalized.includes("school") || normalized.includes("degree")) {
    return "education";
  }
  return "other";
}

function mapTimelineToMilestones(items: FamilyTimelineItem[]): Milestone[] {
  return items.map((item) => ({
    id: `timeline_${item.eventId}`,
    year: new Date(item.eventDate).getFullYear() || new Date().getFullYear(),
    title: item.title,
    description: item.description || `${item.eventType} milestone`,
    memberId: String(item.memberId),
    memberName: item.memberName,
    category: mapMilestoneCategory(item.eventType)
  }));
}

function buildGenerationMap(profiles: MemberProfile[]): Map<number, number> {
  const profileById = new Map<number, MemberProfile>();
  profiles.forEach((profile) => profileById.set(profile.id, profile));

  const generationById = new Map<number, number>();

  const visit = (memberId: number, stack = new Set<number>()): number => {
    const cached = generationById.get(memberId);
    if (cached) {
      return cached;
    }

    if (stack.has(memberId)) {
      generationById.set(memberId, 1);
      return 1;
    }

    const profile = profileById.get(memberId);
    if (!profile?.parent?.id) {
      generationById.set(memberId, 1);
      return 1;
    }

    stack.add(memberId);
    const parentGeneration = visit(profile.parent.id, stack);
    stack.delete(memberId);

    const currentGeneration = parentGeneration + 1;
    generationById.set(memberId, currentGeneration);
    return currentGeneration;
  };

  profiles.forEach((profile) => {
    visit(profile.id);
  });

  return generationById;
}

function deriveRelation(generation: number, gender: "male" | "female" | "other"): string {
  if (generation <= 1) {
    return gender === "male" ? "Grandfather" : gender === "female" ? "Grandmother" : "Ancestor";
  }
  if (generation === 2) {
    return gender === "male" ? "Father" : gender === "female" ? "Mother" : "Parent";
  }
  if (generation === 3) {
    return gender === "male" ? "Brother" : gender === "female" ? "Sister-in-Law" : "Member";
  }
  return gender === "male" ? "Nephew" : gender === "female" ? "Niece" : "Member";
}

function toFamilyMember(profile: MemberProfile, generationMap: Map<number, number>): FamilyMember {
  const gender = mapGender(profile.gender);
  const generation = generationMap.get(profile.id) ?? 1;
  const images = (profile.images ?? []).map((image) => image.imageUrl);
  const avatar = profile.images.find((image) => image.isPrimary)?.imageUrl ?? images[0] ?? defaultAvatar(gender);

  return {
    id: String(profile.id),
    name: profile.fullName,
    relation: deriveRelation(generation, gender),
    gender,
    dob: profile.dateOfBirth ?? "",
    location: "Unknown",
    profession: profile.profession || "Not specified",
    avatar,
    bio: profile.biography || "No biography available.",
    education: "Not Specified",
    career: profile.profession || "Not Specified",
    photos: images,
    isDeceased: Boolean(profile.dateOfDeath),
    socials: mapSocialLinks(profile)
  };
}

function buildUnions(profiles: MemberProfile[]): MarriageUnion[] {
  const profileById = new Map<number, MemberProfile>();
  const memberIds = new Set<string>();

  profiles.forEach((profile) => {
    profileById.set(profile.id, profile);
    memberIds.add(String(profile.id));
  });

  const unionMap = new Map<string, { spouse1Id: string; spouse2Id: string; childrenIds: Set<string> }>();

  const ensureUnion = (idA: string, idB: string) => {
    if (idA === idB || !memberIds.has(idA) || !memberIds.has(idB)) {
      return null;
    }

    const [spouse1Id, spouse2Id] = [idA, idB].sort();
    const key = `${spouse1Id}_${spouse2Id}`;
    if (!unionMap.has(key)) {
      unionMap.set(key, { spouse1Id, spouse2Id, childrenIds: new Set<string>() });
    }
    return unionMap.get(key)!;
  };

  profiles.forEach((profile) => {
    const selfId = String(profile.id);
    const spouseId = profile.spouse?.id ? String(profile.spouse.id) : null;
    if (!spouseId) {
      return;
    }

    const union = ensureUnion(selfId, spouseId);
    if (!union) {
      return;
    }

    for (const child of profile.children ?? []) {
      union.childrenIds.add(String(child.id));
    }
  });

  profiles.forEach((profile) => {
    const parentId = profile.parent?.id;
    if (!parentId) {
      return;
    }

    const parent = profileById.get(parentId);
    const spouseId = parent?.spouse?.id;
    if (!spouseId) {
      return;
    }

    const union = ensureUnion(String(parentId), String(spouseId));
    if (!union) {
      return;
    }

    union.childrenIds.add(String(profile.id));
  });

  return Array.from(unionMap.values()).map((union) => ({
    id: `union_${union.spouse1Id}_${union.spouse2Id}`,
    spouse1Id: union.spouse1Id,
    spouse2Id: union.spouse2Id,
    childrenIds: Array.from(union.childrenIds).filter((childId) => memberIds.has(childId))
  }));
}

async function fetchAllMemberProfiles(): Promise<MemberProfile[]> {
  const firstPage = await getMembers({ page: 1, pageSize: 100, sortBy: "firstName", sortDesc: false });
  const allItems = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await getMembers({ page, pageSize: 100, sortBy: "firstName", sortDesc: false });
    allItems.push(...nextPage.items);
  }

  const detailPromises = allItems.map((item) => getMemberDetails(item.id));
  const settled = await Promise.allSettled(detailPromises);
  const profiles = settled
    .filter((result): result is PromiseFulfilledResult<MemberProfile> => result.status === "fulfilled")
    .map((result) => result.value);

  // If absolutely no profiles can be loaded, treat it as a hard failure.
  if (allItems.length > 0 && profiles.length === 0) {
    throw new Error("Unable to load member profiles for tree rendering.");
  }

  return profiles;
}

export async function getFamilyTreeData(): Promise<TreeDataResponse> {
  const profiles = await fetchAllMemberProfiles();
  const timelineItems = await getFamilyTimeline().catch(() => []);

  const generationMap = buildGenerationMap(profiles);
  const members = profiles.map((profile) => toFamilyMember(profile, generationMap));
  const unions = buildUnions(profiles);
  const milestones = mapTimelineToMilestones(timelineItems);

  return { members, unions, milestones };
}
