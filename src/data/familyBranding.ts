import { getFamily } from "../services/familyService";
import { logUnexpected } from "../utils/logFailure";
import { mockFamily } from "./mockFamily";

export interface FamilyBranding {
  name: string;
  logo: string;
  code: string;
  description: string;
}

const listeners = new Set<() => void>();

let snapshot: FamilyBranding = {
  name: mockFamily.name,
  logo: mockFamily.logo,
  code: mockFamily.code,
  description: mockFamily.description
};

export function getFamilyBranding(): FamilyBranding {
  return snapshot;
}

export function setFamilyBranding(patch: Partial<FamilyBranding>) {
  snapshot = {
    name: patch.name ?? snapshot.name,
    logo: patch.logo ?? snapshot.logo,
    code: patch.code ?? snapshot.code,
    description: patch.description ?? snapshot.description
  };
  mockFamily.name = snapshot.name;
  mockFamily.logo = snapshot.logo;
  mockFamily.code = snapshot.code;
  mockFamily.description = snapshot.description;
  listeners.forEach((listener) => listener());
}

export function subscribeFamilyBranding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadFamilyBranding(): Promise<void> {
  try {
    const family = await getFamily();
    setFamilyBranding({
      name: family.familyName?.trim() || snapshot.name,
      logo: family.photoUrl?.trim() || snapshot.logo,
      code: family.familyCode?.trim() || snapshot.code,
      description: family.description?.trim() || snapshot.description
    });
  } catch (error) {
    logUnexpected("FamilyBranding", error);
  }
}
