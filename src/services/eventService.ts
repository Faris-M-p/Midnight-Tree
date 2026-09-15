import { FirebaseClientError } from "../firebase/errors/firebaseErrorHandler";
import { getCurrentFirebaseUser } from "../firebase/auth/firebaseAuth";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import {
  createEvent as createFirebaseEvent,
  deleteEvent as deleteFirebaseEvent,
  getEvent as getFirebaseEvent,
  getEventsByFamily,
  updateEvent as updateFirebaseEvent
} from "../firebase/firestore/eventService";
import { getMembersByFamily } from "../firebase/firestore/memberService";
import type { FirebaseEvent, FirebaseFamilyMember } from "../firebase/types/firebaseTypes";
import { fileToCompressedDataUrl, isLikelyImageFile } from "../utils/imageFile";
import { EVENT_MAX_IMAGE_BYTES } from "../utils/eventImages";
import { formatEventDateTime } from "../utils/eventDateTime";
import type {
  EventDetail,
  EventListItem,
  EventListQuery,
  EventMemberItem,
  EventUpsertInput,
  PagedEvents
} from "../types/event";

function asId(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
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

function fullName(member: Pick<FirebaseFamilyMember, "firstName" | "lastName">): string {
  return `${member.firstName} ${member.lastName ?? ""}`.replace(/\s+/g, " ").trim();
}

function toMemberItem(member: FirebaseFamilyMember): EventMemberItem {
  return {
    id: member.id ?? "",
    firstName: member.firstName,
    lastName: member.lastName ?? "",
    fullName: fullName(member),
    photoUrl: member.photoUrl ?? null
  };
}

async function compressCover(file: File): Promise<string> {
  if (!isLikelyImageFile(file)) {
    throw new FirebaseClientError("Please choose a JPG, JPEG, PNG, or WEBP image.", "invalid-argument");
  }
  if (file.size > EVENT_MAX_IMAGE_BYTES) {
    throw new FirebaseClientError("Image must be 10 MB or smaller.", "invalid-argument");
  }
  try {
    return await fileToCompressedDataUrl(file, 1000, 0.78);
  } catch {
    throw new FirebaseClientError("Could not read this image. Try a JPG or PNG.", "invalid-argument");
  }
}

function toListItem(event: FirebaseEvent, membersById: Map<string, FirebaseFamilyMember>): EventListItem {
  const memberIds = (event.memberIds ?? []).map(asId).filter(Boolean);
  const named = memberIds
    .map((id) => membersById.get(id))
    .filter((member): member is FirebaseFamilyMember => Boolean(member))
    .map((member) => fullName(member));
  return {
    id: event.id ?? "",
    title: event.title,
    eventType: event.eventType,
    eventDateTime: event.eventDateTime,
    locationName: event.locationName ?? null,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    description: event.description ?? null,
    coverImageUrl: event.coverImageUrl ?? null,
    memberCount: memberIds.length,
    memberNames: named.length ? named.join(", ") : null,
    createdOn: timestampToIso(event.createdAt)
  };
}

function toDetail(event: FirebaseEvent, membersById: Map<string, FirebaseFamilyMember>): EventDetail {
  const members = (event.memberIds ?? [])
    .map((id) => membersById.get(asId(id)))
    .filter((member): member is FirebaseFamilyMember => Boolean(member))
    .map(toMemberItem);
  return {
    id: event.id ?? "",
    title: event.title,
    eventType: event.eventType,
    eventDateTime: event.eventDateTime,
    locationName: event.locationName ?? null,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
    description: event.description ?? null,
    coverImageUrl: event.coverImageUrl ?? null,
    members,
    createdOn: timestampToIso(event.createdAt),
    updatedOn: timestampToIso(event.updatedAt) ?? null
  };
}

async function membersMap(familyId: string): Promise<Map<string, FirebaseFamilyMember>> {
  const members = await getMembersByFamily(familyId);
  return new Map(members.filter((member) => member.id).map((member) => [member.id as string, member]));
}

async function coverUrlFromInput(
  input: EventUpsertInput,
  existingCover?: string | null
): Promise<string | null> {
  if (input.removeCover) return null;
  if (input.coverImage) return compressCover(input.coverImage);
  return existingCover ?? null;
}

export async function listEvents(query: EventListQuery = {}): Promise<PagedEvents> {
  const familyId = await ensureCurrentFamilyId();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 100);
  const search = (query.search ?? "").trim().toLowerCase();
  const byId = await membersMap(familyId);

  let rows = await getEventsByFamily(familyId);
  if (search) {
    rows = rows.filter((event) => {
      const haystack = `${event.title} ${event.description ?? ""} ${event.locationName ?? ""} ${event.eventType}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  rows.sort((left, right) => {
    if (query.sortBy === "title") return left.title.localeCompare(right.title);
    if (query.sortBy === "recent") {
      return (timestampToIso(right.createdAt) ?? "").localeCompare(timestampToIso(left.createdAt) ?? "");
    }
    return (left.eventDateTime || "").localeCompare(right.eventDateTime || "");
  });

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize).map((event) => toListItem(event, byId)),
    page,
    pageSize,
    totalCount,
    totalPages
  };
}

export async function getEvent(id: string | number): Promise<EventDetail> {
  const eventId = asId(id);
  const event = await getFirebaseEvent(eventId);
  if (!event?.id) {
    throw new FirebaseClientError("Event not found.", "not-found");
  }
  const byId = await membersMap(event.familyId);
  return toDetail(event, byId);
}

export async function createEvent(input: EventUpsertInput): Promise<EventDetail> {
  const familyId = await ensureCurrentFamilyId();
  const user = getCurrentFirebaseUser();
  const coverImageUrl = await coverUrlFromInput(input, null);
  const created = await createFirebaseEvent({
    familyId,
    title: input.title,
    eventType: input.eventType,
    eventDateTime: input.eventDateTime,
    locationName: input.locationName ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    description: input.description ?? null,
    coverImageUrl,
    memberIds: input.memberIds.map(asId).filter(Boolean),
    createdBy: user?.uid ?? "unknown"
  });
  if (!created.id) {
    throw new FirebaseClientError("Event could not be created.", "failed-precondition");
  }
  const byId = await membersMap(familyId);
  return toDetail(created, byId);
}

export async function updateEvent(id: string | number, input: EventUpsertInput): Promise<EventDetail> {
  const eventId = asId(id);
  const existing = await getFirebaseEvent(eventId);
  if (!existing?.id) {
    throw new FirebaseClientError("Event not found.", "not-found");
  }
  const coverImageUrl = await coverUrlFromInput(input, existing.coverImageUrl);
  await updateFirebaseEvent(eventId, {
    title: input.title,
    eventType: input.eventType,
    eventDateTime: input.eventDateTime,
    locationName: input.locationName ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    description: input.description ?? null,
    coverImageUrl,
    memberIds: input.memberIds.map(asId).filter(Boolean)
  });
  return getEvent(eventId);
}

export async function deleteEvent(id: string | number): Promise<void> {
  await deleteFirebaseEvent(asId(id));
}

export function formatEventTypeLabel(type?: string | null): string {
  const value = (type ?? "").trim();
  if (!value) return "Event";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export { formatEventDateTime };
