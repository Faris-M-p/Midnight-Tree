/**
 * Member CRUD now talks to Firestore only — never MidnightApi.
 */

import { getCurrentFirebaseUser } from "../firebase/auth/firebaseAuth";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import { uploadFamilyImage } from "../firebase/storage/uploadImage";
import {
  createMember as createFirebaseMember,
  deleteMember as deleteFirebaseMember,
  getMember as getFirebaseMember,
  getMembersByFamily,
  updateMember as updateFirebaseMember
} from "../firebase/firestore/memberService";
import {
  createRelationship,
  getRelationshipsByFamily
} from "../firebase/firestore/relationshipService";
import type { FirebaseFamilyMember, FirebaseRelationship } from "../firebase/types/firebaseTypes";
import type {
  CreateMemberPayload,
  MemberProfile,
  MemberRelationSummary,
  PagedMembersResponse,
  UpdateMemberPayload
} from "../types/member";

export interface MembersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

function asId(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

function fullName(member: Pick<FirebaseFamilyMember, "firstName" | "lastName">): string {
  return `${member.firstName} ${member.lastName ?? ""}`.replace(/\s+/g, " ").trim();
}

function toSummary(member: FirebaseFamilyMember | undefined): MemberRelationSummary | null {
  if (!member?.id) return null;
  return {
    id: member.id as unknown as number,
    firstName: member.firstName,
    lastName: member.lastName ?? "",
    fullName: fullName(member),
    gender: member.gender,
    dateOfBirth: member.dateOfBirth,
    photoUrl: member.photoUrl
  };
}

function relatedId(
  rels: FirebaseRelationship[],
  memberId: string,
  type: FirebaseRelationship["relationshipType"],
  asParent: boolean
): string[] {
  return rels
    .filter((rel) => rel.relationshipType === type)
    .filter((rel) => (asParent ? rel.member1Id === memberId : rel.member2Id === memberId))
    .map((rel) => (asParent ? rel.member2Id : rel.member1Id));
}

export async function toMemberProfile(member: FirebaseFamilyMember): Promise<MemberProfile> {
  const familyId = member.familyId || (await ensureCurrentFamilyId());
  const [all, rels] = await Promise.all([
    getMembersByFamily(familyId),
    getRelationshipsByFamily(familyId)
  ]);
  const byId = new Map(all.map((item) => [item.id ?? "", item]));
  const id = member.id ?? "";
  const parentId = relatedId(rels, id, "parent", false)[0];
  const childIds = relatedId(rels, id, "parent", true);
  const spouseRel = rels.find(
    (rel) => rel.relationshipType === "spouse" && (rel.member1Id === id || rel.member2Id === id)
  );
  const spouseId = spouseRel
    ? spouseRel.member1Id === id
      ? spouseRel.member2Id
      : spouseRel.member1Id
    : "";

  return {
    id: id as unknown as number,
    firstName: member.firstName,
    lastName: member.lastName ?? "",
    fullName: fullName(member),
    email: member.email,
    phone: member.phone,
    gender: member.gender,
    dateOfBirth: member.dateOfBirth,
    dateOfDeath: member.dateOfDeath,
    isRoot: Boolean(member.isRoot),
    nickname: member.nickname,
    biography: member.biography,
    profession: member.profession,
    locationName: member.locationName,
    latitude: member.latitude ?? null,
    longitude: member.longitude ?? null,
    parent: toSummary(byId.get(parentId)),
    spouse: toSummary(byId.get(spouseId)),
    children: childIds.map((childId) => toSummary(byId.get(childId))).filter(Boolean) as MemberRelationSummary[],
    images: member.photoUrl
      ? [{ id: 1, imageUrl: member.photoUrl, caption: null, isPrimary: true, sortOrder: 0 }]
      : [],
    socialLinks: []
  };
}

export async function getMembers(query: MembersQuery = {}): Promise<PagedMembersResponse> {
  const familyId = await ensureCurrentFamilyId();
  const members = await getMembersByFamily(familyId);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? (members.length || 1);
  const start = (page - 1) * pageSize;
  const items = members.slice(start, start + pageSize).map((member) => ({
    id: (member.id ?? "") as unknown as number,
    firstName: member.firstName,
    lastName: member.lastName ?? "",
    fullName: fullName(member),
    gender: member.gender,
    dateOfBirth: member.dateOfBirth,
    isRoot: Boolean(member.isRoot),
    profession: member.profession,
    photoUrl: member.photoUrl
  }));
  return {
    items,
    page,
    pageSize,
    totalCount: members.length,
    totalPages: Math.max(1, Math.ceil(members.length / pageSize))
  };
}

export async function getMemberDetails(memberId: string | number): Promise<MemberProfile> {
  const member = await getFirebaseMember(asId(memberId));
  if (!member) {
    throw new Error("Member not found.");
  }
  return toMemberProfile(member);
}

export async function getFamilyTree(): Promise<{ root: null; totalMembers: number }> {
  const familyId = await ensureCurrentFamilyId();
  const members = await getMembersByFamily(familyId);
  return { root: null, totalMembers: members.length };
}

export async function createMember(payload: CreateMemberPayload, photo?: File | null): Promise<MemberProfile> {
  const familyId = await ensureCurrentFamilyId();
  const user = getCurrentFirebaseUser();
  const created = await createFirebaseMember({
    familyId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    nickname: payload.nickname,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth ?? null,
    dateOfDeath: payload.dateOfDeath ?? null,
    photoUrl: payload.images?.find((image) => image.isPrimary)?.imageUrl ?? null,
    profession: payload.profession,
    biography: payload.biography,
    email: payload.email,
    phone: payload.phone,
    locationName: payload.locationName,
    latitude: payload.latitude,
    longitude: payload.longitude,
    isRoot: payload.isRoot,
    createdBy: user?.uid ?? "unknown"
  });

  const memberId = created.id ?? "";
  let photoUrl = created.photoUrl ?? null;
  if (photo && memberId) {
    photoUrl = await uploadFamilyImage({
      familyId,
      path: `members/${memberId}/photo`,
      file: photo
    });
    await updateFirebaseMember(memberId, { photoUrl });
  }

  const parentId = asId(payload.parentId);
  const spouseId = asId(payload.spouseId);
  if (parentId) {
    await createRelationship({
      familyId,
      member1Id: parentId,
      member2Id: memberId,
      relationshipType: "parent"
    });
  }
  if (spouseId) {
    await createRelationship({
      familyId,
      member1Id: memberId,
      member2Id: spouseId,
      relationshipType: "spouse"
    });
  }

  return toMemberProfile({ ...created, id: memberId, photoUrl });
}

export async function updateMember(
  memberId: string | number,
  payload: UpdateMemberPayload,
  photo?: File | null
): Promise<MemberProfile> {
  const id = asId(memberId);
  const familyId = await ensureCurrentFamilyId();
  let photoUrl: string | undefined;
  if (photo) {
    photoUrl = await uploadFamilyImage({
      familyId,
      path: `members/${id}/photo`,
      file: photo
    });
  }
  await updateFirebaseMember(id, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    nickname: payload.nickname,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth ?? null,
    dateOfDeath: payload.dateOfDeath ?? null,
    profession: payload.profession,
    biography: payload.biography,
    email: payload.email,
    phone: payload.phone,
    locationName: payload.locationName,
    latitude: payload.latitude,
    longitude: payload.longitude,
    isRoot: payload.isRoot,
    ...(photoUrl ? { photoUrl } : {})
  });
  const member = await getFirebaseMember(id);
  if (!member) {
    throw new Error("Member not found.");
  }
  return toMemberProfile(member);
}

export async function mapSpouse(memberId: string | number, spouseId: string | number): Promise<void> {
  const familyId = await ensureCurrentFamilyId();
  await createRelationship({
    familyId,
    member1Id: asId(memberId),
    member2Id: asId(spouseId),
    relationshipType: "spouse"
  });
}

export async function deleteMember(memberId: string | number): Promise<void> {
  await deleteFirebaseMember(asId(memberId));
}
