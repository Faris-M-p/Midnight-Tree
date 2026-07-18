import { apiRequest } from "./apiClient";
import type { MemberProfile, MemberSavePayload, PagedMembersResponse } from "../types/member";

const MEMBERS_BASE = "/api/members";

export interface MemberListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  gender?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

function buildQuery(query: MemberListQuery): string {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.gender?.trim()) {
    params.set("gender", query.gender.trim());
  }
  if (query.sortBy?.trim()) {
    params.set("sortBy", query.sortBy.trim());
  }
  if (typeof query.sortDesc === "boolean") {
    params.set("sortDesc", String(query.sortDesc));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getMembers(query: MemberListQuery = {}): Promise<PagedMembersResponse> {
  return apiRequest<PagedMembersResponse>(`${MEMBERS_BASE}${buildQuery(query)}`);
}

export function getMemberDetails(memberId: number): Promise<MemberProfile> {
  return apiRequest<MemberProfile>(`${MEMBERS_BASE}/${memberId}`);
}

export function createMember(payload: MemberSavePayload): Promise<MemberProfile> {
  return apiRequest<MemberProfile, MemberSavePayload>(MEMBERS_BASE, {
    method: "POST",
    body: payload
  });
}

export function updateMember(memberId: number, payload: MemberSavePayload): Promise<MemberProfile> {
  return apiRequest<MemberProfile, MemberSavePayload>(`${MEMBERS_BASE}/${memberId}`, {
    method: "PUT",
    body: payload
  });
}

export function deleteMember(memberId: number): Promise<unknown> {
  return apiRequest<unknown>(`${MEMBERS_BASE}/${memberId}`, {
    method: "DELETE"
  });
}
