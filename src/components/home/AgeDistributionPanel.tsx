import { useMemo, useState } from "react";
import { homeAgeFallback, type HomeAgeBucket } from "../../data/mockHome";
import type { FamilyMember } from "../../types";
import { AgeBars } from "./HomeCharts";

const AGE_LABELS = ["0–5", "6–10", "11–20", "21–30", "31–40", "41–50", "51–60", "61–70", "71+"] as const;

type AgeScope = "living" | "deceased";

function parseDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value.slice(0, 10));
  return Number.isNaN(date.getTime()) ? null : date;
}

function yearsBetween(from: Date, to: Date): number | null {
  let age = to.getFullYear() - from.getFullYear();
  const monthDiff = to.getMonth() - from.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && to.getDate() < from.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function ageBucketLabel(age: number): (typeof AGE_LABELS)[number] {
  if (age <= 5) return "0–5";
  if (age <= 10) return "6–10";
  if (age <= 20) return "11–20";
  if (age <= 30) return "21–30";
  if (age <= 40) return "31–40";
  if (age <= 50) return "41–50";
  if (age <= 60) return "51–60";
  if (age <= 70) return "61–70";
  return "71+";
}

function emptyBuckets(): HomeAgeBucket[] {
  return AGE_LABELS.map((label) => ({ label, value: 0 }));
}

function buildBuckets(
  members: FamilyMember[],
  scope: AgeScope,
  asOf: Date = new Date()
): { buckets: HomeAgeBucket[]; usedFallback: boolean } {
  const counts = Object.fromEntries(AGE_LABELS.map((label) => [label, 0])) as Record<(typeof AGE_LABELS)[number], number>;
  let found = 0;

  for (const member of members) {
    const deceased = Boolean(member.isDeceased || member.dateOfDeath);
    if (scope === "living" && deceased) continue;
    if (scope === "deceased" && !deceased) continue;

    const birth = parseDate(member.dob);
    if (!birth) continue;

    const end = scope === "deceased" ? parseDate(member.dateOfDeath) : asOf;
    if (!end) continue;

    const age = yearsBetween(birth, end);
    if (age == null) continue;

    counts[ageBucketLabel(age)] += 1;
    found += 1;
  }

  if (scope === "living" && found === 0 && members.length === 0) {
    return { buckets: homeAgeFallback, usedFallback: true };
  }

  return {
    buckets: AGE_LABELS.map((label) => ({ label, value: counts[label] })),
    usedFallback: false
  };
}

function countByLife(members: FamilyMember[]) {
  let living = 0;
  let deceased = 0;
  for (const member of members) {
    if (member.isDeceased || member.dateOfDeath) deceased += 1;
    else living += 1;
  }
  return { living, deceased };
}

export function AgeDistributionPanel({ members }: { members: FamilyMember[] }) {
  const [scope, setScope] = useState<AgeScope>("living");
  const summary = useMemo(() => countByLife(members), [members]);
  const { buckets } = useMemo(() => buildBuckets(members, scope), [members, scope]);

  const title = scope === "living" ? "Current Age Distribution" : "Age at Death Distribution";

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs font-medium text-slate-400">Member Status</p>
        <div
          role="group"
          aria-label="Member Status"
          className="inline-flex w-full rounded-lg border border-slate-700 bg-slate-950/70 p-0.5 sm:w-auto"
        >
          {(
            [
              { id: "living" as const, label: "Living" },
              { id: "deceased" as const, label: "Deceased" }
            ] as const
          ).map((option) => {
            const active = scope === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setScope(option.id)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition sm:flex-none sm:min-w-[5.5rem] ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          Living Members: <span className="font-medium text-slate-300">{summary.living}</span>
        </span>
        <span>
          Deceased Members: <span className="font-medium text-slate-300">{summary.deceased}</span>
        </span>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <AgeBars buckets={buckets.length ? buckets : emptyBuckets()} />
      </div>
    </div>
  );
}
