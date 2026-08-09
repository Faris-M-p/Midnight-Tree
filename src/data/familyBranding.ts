import { mockFamily } from "./mockFamily";

const listeners = new Set<() => void>();

export function getFamilyBranding() {
  return {
    name: mockFamily.name,
    logo: mockFamily.logo,
    code: mockFamily.code
  };
}

export function setFamilyBranding(patch: Partial<{ name: string; logo: string; code: string }>) {
  if (patch.name) mockFamily.name = patch.name;
  if (patch.logo) mockFamily.logo = patch.logo;
  if (patch.code) mockFamily.code = patch.code;
  listeners.forEach((listener) => listener());
}

export function subscribeFamilyBranding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
