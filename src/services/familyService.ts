import { apiRequest } from "./apiClient";
import type { DashboardResponse } from "../types/dashboard";
import type { FamilyDetails, FamilyTimelineItem, UpdateFamilyPayload } from "../types/family";

const FAMILY_BASE = "/api/family";

export function getFamilyDashboard(): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(`${FAMILY_BASE}/dashboard`);
}

export function getFamilyDetails(): Promise<FamilyDetails> {
  return apiRequest<FamilyDetails>(FAMILY_BASE);
}

export function updateFamilyDetails(payload: UpdateFamilyPayload): Promise<FamilyDetails> {
  return apiRequest<FamilyDetails, UpdateFamilyPayload>(FAMILY_BASE, {
    method: "PUT",
    body: payload
  });
}

export function getFamilyTimeline(): Promise<FamilyTimelineItem[]> {
  return apiRequest<FamilyTimelineItem[]>(`${FAMILY_BASE}/timeline`);
}
