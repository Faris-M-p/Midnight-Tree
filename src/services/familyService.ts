import { apiFormRequest, apiRequest } from "./apiClient";

export interface FamilyProfile {
  id: number;
  familyCode: string;
  familyName: string;
  description?: string | null;
  photoUrl?: string | null;
  coverUrl?: string | null;
}

interface ApiFamily {
  id?: number;
  iD_Families?: number;
  id_Families?: number;
  familyCode?: string;
  familyName?: string;
  description?: string | null;
  photoUrl?: string | null;
  coverUrl?: string | null;
}

function mapFamily(data: ApiFamily): FamilyProfile {
  return {
    id: data.id || data.iD_Families || data.id_Families || 0,
    familyCode: data.familyCode || "",
    familyName: data.familyName || "",
    description: data.description,
    photoUrl: data.photoUrl,
    coverUrl: data.coverUrl
  };
}

export async function getFamily(): Promise<FamilyProfile> {
  const data = await apiRequest<ApiFamily>("/api/family");
  return mapFamily(data);
}

export async function updateFamily(
  payload: { familyName: string; description?: string; photoUrl?: string | null },
  photo?: File | null
): Promise<FamilyProfile> {
  const form = new FormData();
  form.append("familyName", payload.familyName);
  if (payload.description) form.append("description", payload.description);
  if (payload.photoUrl) form.append("photoUrl", payload.photoUrl);
  if (photo) form.append("familyPhoto", photo);

  await apiFormRequest("/api/family", form, "PUT");
  return getFamily();
}

export async function updateFamilyCover(cover: File): Promise<FamilyProfile> {
  const form = new FormData();
  form.append("familyCover", cover);
  await apiFormRequest("/api/family/cover", form, "PUT");
  return getFamily();
}
