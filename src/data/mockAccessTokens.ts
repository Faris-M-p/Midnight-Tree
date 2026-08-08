export type TokenPermission = "view" | "edit";
export type TokenScope = "entire-family" | "selected-member" | "member-descendants";
export type TokenStatus = "active" | "inactive" | "revoked" | "expired";

export interface MockTokenActivity {
  id: string;
  date: string;
  label: string;
}

export interface MockAccessToken {
  id: string;
  name: string;
  status: TokenStatus;
  permission: TokenPermission;
  scope: TokenScope;
  memberId?: string;
  memberName?: string;
  createdOn: string;
  expiresOn: string;
  lastUsed: string;
  activeSessions: number;
  usageCount: number;
  tokenPreview: string;
  activity: MockTokenActivity[];
}

export const mockAccessTokens: MockAccessToken[] = [
  {
    id: "tok-1",
    name: "Aunt Meera — View Tree",
    status: "active",
    permission: "view",
    scope: "entire-family",
    createdOn: "2026-06-01",
    expiresOn: "2026-12-01",
    lastUsed: "2026-08-08",
    activeSessions: 1,
    usageCount: 42,
    tokenPreview: "mct_7f3a…c91e",
    activity: [
      { id: "a1", date: "08 Aug", label: "Token login" },
      { id: "a2", date: "08 Aug", label: "Viewed Members" },
      { id: "a3", date: "08 Aug", label: "Viewed Family Tree" },
      { id: "a4", date: "07 Aug", label: "Viewed Member #25" }
    ]
  },
  {
    id: "tok-2",
    name: "Cousin Editor — Bengaluru branch",
    status: "active",
    permission: "edit",
    scope: "member-descendants",
    memberId: "amit",
    memberName: "Amit Mehta",
    createdOn: "2026-05-12",
    expiresOn: "2026-11-12",
    lastUsed: "2026-08-02",
    activeSessions: 0,
    usageCount: 18,
    tokenPreview: "mct_12ab…44d0",
    activity: [
      { id: "b1", date: "02 Aug", label: "Token login" },
      { id: "b2", date: "02 Aug", label: "Edited story draft" }
    ]
  },
  {
    id: "tok-3",
    name: "Historian — Ramesh line",
    status: "inactive",
    permission: "view",
    scope: "selected-member",
    memberId: "ramesh",
    memberName: "Ramesh Mehta",
    createdOn: "2026-01-20",
    expiresOn: "2026-07-20",
    lastUsed: "2026-06-11",
    activeSessions: 0,
    usageCount: 9,
    tokenPreview: "mct_90cd…e218",
    activity: [{ id: "c1", date: "11 Jun", label: "Viewed Member Details" }]
  },
  {
    id: "tok-4",
    name: "Expired guest pass",
    status: "expired",
    permission: "view",
    scope: "entire-family",
    createdOn: "2025-08-01",
    expiresOn: "2026-02-01",
    lastUsed: "2026-01-28",
    activeSessions: 0,
    usageCount: 5,
    tokenPreview: "mct_exp0…0001",
    activity: []
  }
];

/** Dummy family tokens accepted by the Family Token login UI (not a real API). */
export const mockLoginTokens = [
  {
    value: "FAM-MEHTA-VIEW-2026",
    permission: "view" as const,
    scope: "entire-family" as const,
    expiresOn: "2026-12-31",
    name: "Family view pass"
  },
  {
    value: "FAM-MEHTA-EDIT-2026",
    permission: "edit" as const,
    scope: "entire-family" as const,
    expiresOn: "2026-12-31",
    name: "Family editor pass"
  }
];
