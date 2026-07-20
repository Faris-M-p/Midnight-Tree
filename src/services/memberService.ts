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
 *
 * No UI logic here — only network + typing.
 * Used by: treeService, App (Add Member), ProfileModal flows.
 * =============================================================================
 */

import { apiRequest } from "./apiClient";
import type {
  ApiFamilyTreeResponse,
  CreateMemberPayload,
  MemberProfile,
  PagedMembersResponse
} from "../types/member";

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

/** Create root / child / spouse member */
export function createMember(payload: CreateMemberPayload): Promise<MemberProfile> {
  return apiRequest<MemberProfile, CreateMemberPayload>(MEMBERS_BASE, {
    method: "POST",
    body: payload
  });
}
