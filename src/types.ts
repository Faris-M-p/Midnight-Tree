/**
 * =============================================================================
 * FILE: src/types.ts
 * ROLE: UI / canvas domain models for the Family Tree screen
 * =============================================================================
 * These shapes are used by React Flow UI components (MemberCard, layout, etc.).
 * They are NOT the raw ASP.NET API models — those live in `src/types/member.ts`.
 *
 * Flow:
 *   API (member.ts)  →  treeService maps to  →  FamilyMember / MarriageUnion
 *                                               then App.tsx renders them
 * =============================================================================
 */

/** One person shown as a card on the tree canvas */
export interface FamilyMember {
  id: string;
  name: string;
  /** Optional display nickname shown on the card badge */
  nickname?: string;
  /** Computed / legacy relationship label (fallback when nickname is empty) */
  relation: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  location: string;
  profession: string;
  avatar: string;
  bio: string;
  education: string;
  career: string;
  photos: string[];
  isDeceased?: boolean;
  /** True when this person is the family root ancestor */
  isRoot?: boolean;
  socials?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    gmail?: string;
  };
}

/**
 * A married couple (or partner pair) plus their children.
 * The layout algorithm uses unions to place spouses side-by-side
 * and hang children underneath the couple center.
 */
export interface MarriageUnion {
  id: string;
  spouse1Id: string;
  spouse2Id: string;
  childrenIds: string[];
}

/** Timeline / history event shown in the Timeline panel */
export interface Milestone {
  id: string;
  year: number;
  title: string;
  description: string;
  memberId: string;
  memberName: string;
  category: 'birth' | 'marriage' | 'career' | 'education' | 'other';
}
