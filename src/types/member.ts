export interface PagedMembersResponse {
  items: MemberListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MemberListItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  isRoot: boolean;
  profession?: string | null;
  photoUrl?: string | null;
}

export interface MemberRelationSummary {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
}

export interface MemberAddressItem {
  id: number;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  isPrimary: boolean;
}

export interface MemberImageItem {
  id: number;
  imageUrl: string;
  caption?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MemberEventItem {
  id: number;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate: string;
}

export interface MemberNoteItem {
  id: number;
  title: string;
  content: string;
}

export interface MemberSocialLinkItem {
  id: number;
  platform: string;
  url: string;
  username?: string | null;
}

export interface MemberProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  isRoot: boolean;
  biography?: string | null;
  profession?: string | null;
  parent?: MemberRelationSummary | null;
  spouse?: MemberRelationSummary | null;
  children: MemberRelationSummary[];
  addresses: MemberAddressItem[];
  images: MemberImageItem[];
  events: MemberEventItem[];
  notes: MemberNoteItem[];
  socialLinks: MemberSocialLinkItem[];
}

export interface MemberSavePayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other" | "";
  dateOfBirth?: string;
  dateOfDeath?: string;
  isRoot: boolean;
  biography?: string;
  profession?: string;
  parentId?: number;
  spouseId?: number;
}
