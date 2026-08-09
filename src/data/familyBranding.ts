import { mockFamily } from "./mockFamily";

export interface FamilyBranding {
  name: string;
  logo: string;
  code: string;
}

const listeners = new Set<() => void>();

let snapshot: FamilyBranding = {
  name: mockFamily.name,
  logo: mockFamily.logo,
  code: mockFamily.code
};

export function getFamilyBranding(): FamilyBranding {
  return snapshot;
}

export function setFamilyBranding(patch: Partial<FamilyBranding>) {
  snapshot = {
    name: patch.name ?? snapshot.name,
    logo: patch.logo ?? snapshot.logo,
    code: patch.code ?? snapshot.code
  };
  mockFamily.name = snapshot.name;
  mockFamily.logo = snapshot.logo;
  mockFamily.code = snapshot.code;
  listeners.forEach((listener) => listener());
}

export function subscribeFamilyBranding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
