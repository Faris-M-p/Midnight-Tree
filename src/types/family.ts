export interface FamilyDetails {
  id_Families: number;
  familyCode: string;
  familyName: string;
  description?: string | null;
}

export interface UpdateFamilyPayload {
  familyName: string;
  description?: string;
}

export interface FamilyTimelineItem {
  eventId: number;
  memberId: number;
  memberName: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate: string;
}
