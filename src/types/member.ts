/**
 * =============================================================================
 * FILE: src/types/member.ts
 * ROLE: Member / Family Tree API models (backend contract)
 * =============================================================================
 * These interfaces mirror MidnightApi member endpoints:
 *   GET  /api/members
 *   GET  /api/members/{id}
 *   GET  /api/members/tree
 *   POST /api/members
 *
 * After loading, treeService.ts converts these into UI models
 * (FamilyMember + MarriageUnion) used by the canvas.
 * =============================================================================
 */

import type { FamilyMember, MarriageUnion } from "../types";

/** One row from the paged members list */
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

/** Lightweight relative (parent / spouse / child) on a profile */
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

/** Full member profile returned by GET /api/members/{id} */
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

/** Body for POST /api/members (create) */
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
  email?: string;
  phone?: string;
}

/** Body for PUT /api/members/{id} (update) — same core fields as create */
export interface UpdateMemberPayload extends CreateMemberPayload {
  socialLinks?: Array<{
    id?: number;
    platform: string;
    url: string;
    username?: string;
  }>;
}

/** What the tree screen needs after mapping from API */
export interface TreeDataResponse {
  members: FamilyMember[];
  unions: MarriageUnion[];
}

/** Nested tree node from GET /api/members/tree */
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
