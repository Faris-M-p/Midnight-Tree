import type { FamilyMember, MarriageUnion } from "../types";

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

export interface PagedMembersResponse {
  items: MemberListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
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

export interface MemberImageItem {
  id: number;
  imageUrl: string;
  caption?: string | null;
  isPrimary: boolean;
  sortOrder: number;
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
  images: MemberImageItem[];
  socialLinks: MemberSocialLinkItem[];
}

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isRoot: boolean;
  biography?: string;
  profession?: string;
  parentId?: number;
  spouseId?: number;
}

export interface TreeDataResponse {
  members: FamilyMember[];
  unions: MarriageUnion[];
}

export interface ApiTreeNode {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  isRoot: boolean;
  photoUrl?: string | null;
  spouse?: ApiTreeNode | null;
  children: ApiTreeNode[];
}

export interface ApiFamilyTreeResponse {
  root?: ApiTreeNode | null;
  totalMembers: number;
}
