import { useSyncExternalStore } from "react";
import { getFamilyBranding, subscribeFamilyBranding } from "../data/familyBranding";

export function useFamilyBranding() {
  return useSyncExternalStore(subscribeFamilyBranding, getFamilyBranding);
}
