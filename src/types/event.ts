export type EventType =
  | "birthday"
  | "anniversary"
  | "memorial"
  | "gathering"
  | "achievement"
  | "custom";

export const EVENT_TYPES: EventType[] = [
  "birthday",
  "anniversary",
  "memorial",
  "gathering",
  "achievement",
  "custom"
];

export interface EventMemberItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string | null;
}

export interface EventListItem {
  id: number;
  title: string;
  eventType: EventType | string;
  eventDateTime: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  coverImageUrl?: string | null;
  memberCount: number;
  memberNames?: string | null;
  createdOn?: string;
}

export interface EventDetail {
  id: number;
  title: string;
  eventType: EventType | string;
  eventDateTime: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  coverImageUrl?: string | null;
  members: EventMemberItem[];
  createdOn?: string;
  updatedOn?: string | null;
}

export interface PagedEvents {
  items: EventListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface EventListQuery {
  search?: string;
  sortBy?: "date" | "recent" | "title";
  page?: number;
  pageSize?: number;
}

export interface EventUpsertInput {
  title: string;
  eventType: EventType | string;
  eventDateTime: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  memberIds: number[];
  coverImage?: File | null;
  removeCover?: boolean;
}

export interface EventLocationValue {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
}
