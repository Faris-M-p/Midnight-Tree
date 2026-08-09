/**
 * =============================================================================
 * FILE: src/services/memberService.ts
 * ROLE: Member CRUD + tree API calls
 * =============================================================================
 * Talks to MidnightApi MemberController:
 *   GET    /api/members
 *   GET    /api/members/{id}
 *   GET    /api/members/tree
 *   POST   /api/members
 *   PUT    /api/members/{id}
 *   DELETE /api/members/{id}
 *
 * No UI logic here — only network + typing.
 * Used by: treeService, App (Add / Edit / Delete Member), ProfileModal flows.
 * =============================================================================
 */

import { apiFormRequest, apiRequest } from "./apiClient";
import type {
  ApiFamilyTreeResponse,
  CreateMemberPayload,
  MemberProfile,
  PagedMembersResponse,
  UpdateMemberPayload
} from "../types/member";

interface WriteEnvelope {
  responseCode?: number;
  status?: boolean;
  responseMessage?: string;
  data?: { id?: number };
}

function isMemberProfile(value: unknown): value is MemberProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as MemberProfile;
  return typeof candidate.id === "number" && typeof candidate.firstName === "string";
}

function extractWriteId(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const envelope = value as WriteEnvelope & { id?: number };
  if (typeof envelope.id === "number" && envelope.id > 0) return envelope.id;
  if (typeof envelope.data?.id === "number" && envelope.data.id > 0) return envelope.data.id;
  if (typeof envelope.responseCode === "number" && envelope.responseCode > 0) return envelope.responseCode;
  return null;
}

async function resolveMemberProfile(result: unknown): Promise<MemberProfile> {
  if (isMemberProfile(result)) {
    return result;
  }

  const id = extractWriteId(result);
  if (!id) {
    throw new Error("Member was saved, but the profile could not be loaded.");
  }

  return getMemberDetails(id);
}

const MEMBERS_BASE = "/api/members";

export interface MembersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

/** Build ?page=1&pageSize=20 style query string */
function buildQuery(query: MembersQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sortBy?.trim()) params.set("sortBy", query.sortBy.trim());
  if (typeof query.sortDesc === "boolean") params.set("sortDesc", String(query.sortDesc));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Paged list of members for the logged-in family */
export function getMembers(query: MembersQuery = {}): Promise<PagedMembersResponse> {
  return apiRequest<PagedMembersResponse>(`${MEMBERS_BASE}${buildQuery(query)}`);
}

/** Full profile (parent, spouse, children, images, socials) */
export function getMemberDetails(memberId: number): Promise<MemberProfile> {
  return apiRequest<MemberProfile>(`${MEMBERS_BASE}/${memberId}`);
}

/** Nested genealogy tree rooted at IsRoot member */
export function getFamilyTree(): Promise<ApiFamilyTreeResponse> {
  return apiRequest<ApiFamilyTreeResponse>(`${MEMBERS_BASE}/tree`);
}

function appendIfValue(form: FormData, key: string, value?: string | number | boolean | null) {
  if (value === undefined || value === null || value === "") return;
  form.append(key, String(value));
}

function appendMemberForm(form: FormData, payload: CreateMemberPayload, photo?: File | null) {
  form.append("firstName", payload.firstName);
  form.append("lastName", payload.lastName);
  form.append("isRoot", payload.isRoot ? "true" : "false");
  appendIfValue(form, "nickname", payload.nickname);
  appendIfValue(form, "gender", payload.gender);
  appendIfValue(form, "dateOfBirth", payload.dateOfBirth);
  appendIfValue(form, "dateOfDeath", payload.dateOfDeath);
  appendIfValue(form, "profession", payload.profession);
  appendIfValue(form, "biography", payload.biography);
  appendIfValue(form, "email", payload.email);
  appendIfValue(form, "phone", payload.phone);
  appendIfValue(form, "parentId", payload.parentId);
  appendIfValue(form, "spouseId", payload.spouseId);

  payload.images?.forEach((image, index) => {
    if (image.id) form.append(`Images[${index}].Id`, String(image.id));
    form.append(`Images[${index}].ImageUrl`, image.imageUrl);
    appendIfValue(form, `Images[${index}].Caption`, image.caption);
    form.append(`Images[${index}].IsPrimary`, image.isPrimary ? "true" : "false");
    if (typeof image.sortOrder === "number") form.append(`Images[${index}].SortOrder`, String(image.sortOrder));
  });

  payload.socialLinks?.forEach((link, index) => {
    if (link.id) form.append(`SocialLinks[${index}].Id`, String(link.id));
    form.append(`SocialLinks[${index}].Platform`, link.platform);
    form.append(`SocialLinks[${index}].Url`, link.url);
    if (link.username) form.append(`SocialLinks[${index}].Username`, link.username);
  });

  if (photo) {
    form.append("profileImage", photo);
  }
}

/** Create root / child / spouse member (multipart so profile image can go in the same request) */
export async function createMember(payload: CreateMemberPayload, photo?: File | null): Promise<MemberProfile> {
  const form = new FormData();
  appendMemberForm(form, payload, photo);
  const result = await apiFormRequest<MemberProfile | WriteEnvelope>(MEMBERS_BASE, form);
  return resolveMemberProfile(result);
}

/** Update an existing member profile (multipart so profile image can go in the same request) */
export async function updateMember(
  memberId: number,
  payload: UpdateMemberPayload,
  photo?: File | null
): Promise<MemberProfile> {
  const form = new FormData();
  appendMemberForm(form, payload, photo);
  const result = await apiFormRequest<MemberProfile | WriteEnvelope>(`${MEMBERS_BASE}/${memberId}`, form, "PUT");
  return resolveMemberProfile(result);
}

/** Soft-delete a member (API may reject if they still have children) */
export function deleteMember(memberId: number): Promise<void> {
  return apiRequest<void>(`${MEMBERS_BASE}/${memberId}`, {
    method: "DELETE"
  });
}
