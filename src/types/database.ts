/**
 * Hand-written types aligned with supabase/migrations.
 */

export type FamilyRole = "owner" | "admin" | "editor" | "viewer";
export type MembershipStatus = "active" | "inactive";
export type MemberType = "real" | "placeholder";
export type RelationshipType = "parent" | "partner";
export type RelationshipStatus = "active" | "ended" | "unknown";
export type TokenPermission = "view" | "edit";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMembership {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  status: MembershipStatus;
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  yearly_price_inr: number;
  max_owned_families: number;
  max_members: number;
  total_image_limit_bytes: number;
  max_single_image_bytes: number;
  features: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  family_id: string;
  member_code: string;
  member_type: MemberType;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  display_name: string | null;
  gender: "male" | "female" | "other" | "unknown" | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  is_deceased: boolean;
  email: string | null;
  phone: string | null;
  location: string | null;
  biography: string | null;
  occupation: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  family_id: string;
  source_member_id: string;
  target_member_id: string;
  relationship_type: RelationshipType;
  relationship_status: RelationshipStatus;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  family_id: string;
  email: string;
  role: Exclude<FamilyRole, "owner">;
  token_hash: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  invited_by: string;
  accepted_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessToken {
  id: string;
  account_owner_id: string;
  name: string;
  description: string | null;
  token_hash: string;
  token_preview: string;
  permission: TokenPermission;
  status: "active" | "inactive" | "revoked";
  starts_at: string | null;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyEvent {
  id: string;
  family_id: string;
  title: string;
  event_type: string;
  event_date: string | null;
  description: string | null;
  member_ids: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  memory_date: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function memberLabel(m: Pick<Member, "display_name" | "first_name" | "last_name" | "member_type">): string {
  if (m.display_name?.trim()) return m.display_name.trim();
  const name = `${m.first_name} ${m.last_name ?? ""}`.replace(/\s+/g, " ").trim();
  if (name) return name;
  return m.member_type === "placeholder" ? "Unknown" : "Unnamed";
}
