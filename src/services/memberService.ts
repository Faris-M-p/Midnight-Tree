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

export function getMembers(query: MembersQuery = {}): Promise<PagedMembersResponse> {
  return apiRequest<PagedMembersResponse>(`${MEMBERS_BASE}${buildQuery(query)}`);
}

export function getMemberDetails(memberId: number): Promise<MemberProfile> {
  return apiRequest<MemberProfile>(`${MEMBERS_BASE}/${memberId}`);
}

export function getFamilyTree(): Promise<ApiFamilyTreeResponse> {
  return apiRequest<ApiFamilyTreeResponse>(`${MEMBERS_BASE}/tree`);
}

export function createMember(payload: CreateMemberPayload): Promise<MemberProfile> {
  return apiRequest<MemberProfile, CreateMemberPayload>(MEMBERS_BASE, {
    method: "POST",
    body: payload
  });
}
