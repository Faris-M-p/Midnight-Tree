/**
 * Shares the existing tree/member API data across authenticated pages.
 * Does not change treeService or memberService — only loads them once.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FamilyMember, MarriageUnion } from "../types";
import { ApiClientError } from "../services/apiClient";
import { getFamilyTreeData } from "../services/treeService";

interface FamilyDataContextValue {
  members: FamilyMember[];
  unions: MarriageUnion[];
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const FamilyDataContext = createContext<FamilyDataContextValue | null>(null);

export function FamilyDataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [unions, setUnions] = useState<MarriageUnion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getFamilyTreeData();
      setMembers(data.members);
      setUnions(data.unions);
    } catch (err) {
      setMembers([]);
      setUnions([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load family data right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({ members, unions, isLoading, error, refresh }),
    [members, unions, isLoading, error]
  );

  return <FamilyDataContext.Provider value={value}>{children}</FamilyDataContext.Provider>;
}

export function useFamilyData() {
  const ctx = useContext(FamilyDataContext);
  if (!ctx) {
    throw new Error("useFamilyData must be used inside FamilyDataProvider");
  }
  return ctx;
}
