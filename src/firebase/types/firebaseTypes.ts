/**
 * =============================================================================
 * FILE: src/firebase/types/firebaseTypes.ts
 * ROLE: Firestore / Firebase Auth models (not MidnightApi models)
 * =============================================================================
 * Keep these separate from src/types/* API contracts.
 * Firestore document IDs are strings. Existing API IDs stay numeric.
 * =============================================================================
 */

export type FirebaseRecordStatus = "active" | "inactive";
export type FirebaseFamilyRole = "owner" | "editor" | "viewer";
export type FirebaseRelationshipType = "parent" | "child" | "spouse";
export type FirebasePlanDuration = "yearly";
export type FirebaseSubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export const FIRESTORE_COLLECTIONS = {
  users: "users",
  families: "families",
  members: "members",
  relationships: "relationships",
  familyMembers: "familyMembers",
  plans: "plans",
  subscriptions: "subscriptions",
  albums: "albums",
  albumPhotos: "albumPhotos",
  stories: "stories",
  memories: "memories",
  memoryPhotos: "memoryPhotos",
  events: "events",
  accessTokens: "accessTokens",
  devTest: "_dev_firebase_test"
} as const;

export interface FirebaseUserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  familyId?: string | null;
  phone?: string;
  profileImage?: string;
  status: FirebaseRecordStatus;
  createdAt: unknown;
}

export interface FirebaseFamily {
  id?: string;
  name: string;
  ownerId: string;
  memberCount?: number;
  description?: string;
  photoUrl?: string | null;
  coverUrl?: string | null;
  status: FirebaseRecordStatus;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseFamilyMember {
  id?: string;
  familyId: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  photoUrl?: string | null;
  profession?: string;
  biography?: string;
  email?: string;
  phone?: string;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  isRoot?: boolean;
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseRelationship {
  id?: string;
  familyId: string;
  member1Id: string;
  member2Id: string;
  relationshipType: FirebaseRelationshipType;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseFamilyMemberAccess {
  id?: string;
  familyId: string;
  userId: string;
  role: FirebaseFamilyRole;
  status: FirebaseRecordStatus;
  joinedAt: unknown;
}

export interface FirebasePlan {
  id?: string;
  name: string;
  price: number;
  duration: FirebasePlanDuration;
  maxMembers: number;
  status: FirebaseRecordStatus;
}

export interface FirebaseSubscription {
  id?: string;
  userId: string;
  familyId: string;
  planId: string;
  startDate: unknown;
  expiryDate: unknown;
  status: FirebaseSubscriptionStatus;
  paymentId?: string;
  createdAt: unknown;
}

export interface FirebaseAlbum {
  id?: string;
  familyId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseAlbumPhoto {
  id?: string;
  familyId: string;
  albumId: string;
  uploadedBy: string;
  fileUrl: string;
  caption?: string;
  createdAt: unknown;
}

export interface FirebaseStory {
  id?: string;
  familyId: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseMemory {
  id?: string;
  familyId: string;
  title: string;
  description: string;
  memoryDate: string;
  location?: string;
  coverUrl?: string | null;
  coverPhotoId?: string | null;
  imageCount: number;
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseMemoryPhoto {
  id?: string;
  familyId: string;
  memoryId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  sortOrder: number;
  isCover: boolean;
  createdAt: unknown;
}

export interface FirebaseEvent {
  id?: string;
  familyId: string;
  title: string;
  eventType: string;
  eventDateTime: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  coverImageUrl?: string | null;
  memberIds: string[];
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseAccessToken {
  id?: string;
  familyId: string;
  tokenName: string;
  permission: "View" | "Edit";
  scope: "EntireFamily" | "SelectedMember" | "MemberDescendants";
  memberId?: string | null;
  tokenPreview: string;
  authEmail?: string | null;
  status: "Active" | "Inactive";
  expiresOn: string;
  lastUsedOn?: string | null;
  usageCount: number;
  createdBy: string;
  createdAt: unknown;
  updatedAt?: unknown;
}

export interface FirebaseDevTestDocument {
  id?: string;
  message: string;
  createdAt: unknown;
}

/** Document id used by security rules: familyMembers/{familyId}_{userId} */
export function familyMemberAccessId(familyId: string, userId: string): string {
  return `${familyId}_${userId}`;
}
