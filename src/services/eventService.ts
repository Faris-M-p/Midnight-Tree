import { apiFormRequest, apiRequest } from "./apiClient";
import type {
  EventDetail,
  EventListItem,
  EventListQuery,
  EventMemberItem,
  EventUpsertInput,
  PagedEvents
} from "../types/event";
import { EVENT_TYPES } from "../types/event";
import { formatEventDateTime } from "../utils/eventDateTime";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function pick<T>(obj: AnyRecord, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key] as T;
    }
  }
  return undefined;
}

function normalizeEventType(value?: string | null): string {
  const raw = (value ?? "").trim().toLowerCase();
  return (EVENT_TYPES as string[]).includes(raw) ? raw : raw || "custom";
}

function mapMember(raw: unknown): EventMemberItem {
  const item = asRecord(raw);
  const firstName = String(pick<string>(item, "firstName", "FirstName") ?? "");
  const lastName = String(pick<string>(item, "lastName", "LastName") ?? "");
  const fullName =
    String(pick<string>(item, "fullName", "FullName") ?? "").trim() ||
    `${firstName} ${lastName}`.trim();
  return {
    id: Number(pick<number>(item, "id", "Id") ?? 0),
    firstName,
    lastName,
    fullName,
    photoUrl: pick<string | null>(item, "photoUrl", "PhotoUrl") ?? null
  };
}

function mapListItem(raw: unknown): EventListItem {
  const item = asRecord(raw);
  return {
    id: Number(pick<number>(item, "id", "Id") ?? 0),
    title: String(pick<string>(item, "title", "Title") ?? ""),
    eventType: normalizeEventType(pick<string>(item, "eventType", "EventType")),
    eventDateTime: String(pick<string>(item, "eventDateTime", "EventDateTime") ?? ""),
    locationName: pick<string | null>(item, "locationName", "LocationName", "location", "Location") ?? null,
    latitude: pick<number | null>(item, "latitude", "Latitude") ?? null,
    longitude: pick<number | null>(item, "longitude", "Longitude") ?? null,
    description: pick<string | null>(item, "description", "Description") ?? null,
    coverImageUrl: pick<string | null>(item, "coverImageUrl", "CoverImageUrl") ?? null,
    memberCount: Number(pick<number>(item, "memberCount", "MemberCount") ?? 0),
    memberNames: pick<string | null>(item, "memberNames", "MemberNames") ?? null,
    createdOn: pick<string>(item, "createdOn", "CreatedOn")
  };
}

function mapDetail(raw: unknown): EventDetail {
  const data = asRecord(raw);
  const membersRaw = pick<unknown[]>(data, "members", "Members") ?? [];
  return {
    id: Number(pick<number>(data, "id", "Id") ?? 0),
    title: String(pick<string>(data, "title", "Title") ?? ""),
    eventType: normalizeEventType(pick<string>(data, "eventType", "EventType")),
    eventDateTime: String(pick<string>(data, "eventDateTime", "EventDateTime") ?? ""),
    locationName: pick<string | null>(data, "locationName", "LocationName", "location", "Location") ?? null,
    latitude: pick<number | null>(data, "latitude", "Latitude") ?? null,
    longitude: pick<number | null>(data, "longitude", "Longitude") ?? null,
    description: pick<string | null>(data, "description", "Description") ?? null,
    coverImageUrl: pick<string | null>(data, "coverImageUrl", "CoverImageUrl") ?? null,
    members: Array.isArray(membersRaw) ? membersRaw.map(mapMember).filter((m) => m.id > 0) : [],
    createdOn: pick<string>(data, "createdOn", "CreatedOn"),
    updatedOn: pick<string | null>(data, "updatedOn", "UpdatedOn") ?? null
  };
}

function buildListQuery(query: EventListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function buildFormData(input: EventUpsertInput): FormData {
  const form = new FormData();
  form.append("Title", input.title.trim());
  form.append("EventType", normalizeEventType(input.eventType));
  form.append("EventDateTime", input.eventDateTime);
  if (input.locationName?.trim()) form.append("LocationName", input.locationName.trim());
  if (input.latitude != null) form.append("Latitude", String(input.latitude));
  if (input.longitude != null) form.append("Longitude", String(input.longitude));
  if (input.description?.trim()) form.append("Description", input.description.trim());
  for (const id of input.memberIds.filter((value) => Number.isFinite(value) && value > 0)) {
    form.append("MemberIds", String(id));
  }
  if (input.coverImage) form.append("CoverImage", input.coverImage);
  if (input.removeCover) form.append("RemoveCover", "true");
  return form;
}

export async function listEvents(query: EventListQuery = {}): Promise<PagedEvents> {
  const data = asRecord(await apiRequest<unknown>(`/api/events${buildListQuery(query)}`));
  const itemsRaw = pick<unknown[]>(data, "items", "Items") ?? [];
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(mapListItem) : [],
    page: Number(pick<number>(data, "page", "Page") ?? 1),
    pageSize: Number(pick<number>(data, "pageSize", "PageSize") ?? 100),
    totalCount: Number(pick<number>(data, "totalCount", "TotalCount") ?? 0),
    totalPages: Number(pick<number>(data, "totalPages", "TotalPages") ?? 0)
  };
}

export async function getEvent(id: number): Promise<EventDetail> {
  return mapDetail(await apiRequest<unknown>(`/api/events/${id}`));
}

export async function createEvent(input: EventUpsertInput): Promise<EventDetail> {
  return mapDetail(await apiFormRequest<unknown>("/api/events", buildFormData(input), "POST"));
}

export async function updateEvent(id: number, input: EventUpsertInput): Promise<EventDetail> {
  return mapDetail(await apiFormRequest<unknown>(`/api/events/${id}`, buildFormData(input), "PUT"));
}

export async function deleteEvent(id: number): Promise<void> {
  await apiRequest(`/api/events/${id}`, { method: "DELETE" });
}

export function formatEventTypeLabel(type?: string | null): string {
  const value = (type ?? "").trim();
  if (!value) return "Event";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export { formatEventDateTime };
