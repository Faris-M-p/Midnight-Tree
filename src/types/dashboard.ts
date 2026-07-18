export interface FamilySummary {
  id_Families: number;
  familyCode: string;
  familyName: string;
  description?: string | null;
}

export interface DashboardMemberItem {
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

export interface DashboardUpcomingBirthday {
  memberId: number;
  fullName: string;
  dateOfBirth: string;
  turningAge: number;
  daysUntil: number;
}

export interface DashboardStats {
  maleCount: number;
  femaleCount: number;
  otherGenderCount: number;
  livingCount: number;
  deceasedCount: number;
}

export interface DashboardResponse {
  family: FamilySummary;
  totalMembers: number;
  totalGenerations: number;
  recentMembers: DashboardMemberItem[];
  upcomingBirthdays: DashboardUpcomingBirthday[];
  stats: DashboardStats;
}
