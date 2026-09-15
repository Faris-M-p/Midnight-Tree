/**
 * Family profile now reads/writes Firestore only.
 */

import { DEFAULT_FAMILY_COVER } from "../data/mockFamily";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import {
  getFamily as getFirebaseFamily,
  updateFamily as updateFirebaseFamily
} from "../firebase/firestore/familyService";
import { uploadFamilyImage } from "../firebase/storage/uploadImage";

export interface FamilyProfile {
  id: number;
  familyCode: string;
  familyName: string;
  description?: string | null;
  photoUrl?: string | null;
  coverUrl?: string | null;
}

function toProfile(
  familyId: string,
  family: {
    name?: string;
    description?: string;
    photoUrl?: string | null;
    coverUrl?: string | null;
  } | null
): FamilyProfile {
  return {
    id: 0,
    familyCode: familyId,
    familyName: family?.name || "Your Family",
    description: family?.description ?? "",
    photoUrl: family?.photoUrl ?? null,
    coverUrl: family?.coverUrl || DEFAULT_FAMILY_COVER
  };
}

export async function getFamily(): Promise<FamilyProfile> {
  const familyId = await ensureCurrentFamilyId();
  const family = await getFirebaseFamily(familyId);
  return toProfile(familyId, family);
}

export async function updateFamily(
  payload: { familyName: string; description?: string; photoUrl?: string | null },
  photo?: File | null
): Promise<FamilyProfile> {
  const familyId = await ensureCurrentFamilyId();
  let photoUrl = payload.photoUrl;
  if (photo) {
    photoUrl = await uploadFamilyImage({
      familyId,
      path: "logo",
      file: photo
    });
  }
  await updateFirebaseFamily(familyId, {
    name: payload.familyName,
    description: payload.description,
    photoUrl
  });
  return getFamily();
}

export async function updateFamilyCover(cover: File): Promise<FamilyProfile> {
  const familyId = await ensureCurrentFamilyId();
  const coverUrl = await uploadFamilyImage({
    familyId,
    path: "cover",
    file: cover
  });
  await updateFirebaseFamily(familyId, { coverUrl });
  return getFamily();
}
