import { getFamily } from "../services/familyService";
import { getAuthSession } from "../services/authSessionService";
import { logUnexpected } from "../utils/logFailure";
import { DEFAULT_FAMILY_COVER } from "./mockFamily";

export interface FamilyBranding {
  name: string;
  logo: string;
  code: string;
  description: string;
  cover: string;
}

const listeners = new Set<() => void>();

let snapshot: FamilyBranding = {
  name: "Your Family",
  logo: "",
  code: "",
  description: "",
  cover: DEFAULT_FAMILY_COVER
};

export function getFamilyBranding(): FamilyBranding {
  return snapshot;
}

export function setFamilyBranding(patch: Partial<FamilyBranding>) {
  snapshot = {
    name: patch.name ?? snapshot.name,
    logo: patch.logo ?? snapshot.logo,
    code: patch.code ?? snapshot.code,
    description: patch.description ?? snapshot.description,
    cover: patch.cover ?? snapshot.cover
  };
  listeners.forEach((listener) => listener());
}

export function subscribeFamilyBranding(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function sessionFamilyName(): string {
  const session = getAuthSession();
  const name = session?.user?.familyName;
  return typeof name === "string" ? name.trim() : "";
}

export async function loadFamilyBranding(): Promise<void> {
  const storedName = sessionFamilyName();
  try {
    const family = await getFamily();
    setFamilyBranding({
      name: family.familyName?.trim() || storedName || "Your Family",
      logo: family.photoUrl?.trim() || "",
      code: family.familyCode?.trim() || "",
      description: family.description?.trim() || "",
      cover: family.coverUrl?.trim() || DEFAULT_FAMILY_COVER
    });
  } catch (error) {
    logUnexpected("FamilyBranding", error);
    setFamilyBranding({
      name: storedName || "Your Family",
      logo: "",
      description: "",
      cover: DEFAULT_FAMILY_COVER
    });
  }
}
