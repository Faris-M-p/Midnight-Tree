import type {
  HomeFamilyDate,
  HomeGrowthPoint,
  HomeLocation,
  HomeMemory,
  HomeRecentMember,
  HomeTimelineEvent,
  HomeTreePreviewNode
} from "../data/mockHome";
import type { TimelineCategory } from "../data/mockTimeline";
import type { EventListItem } from "../types/event";
import type { MemoryListItem } from "../types/memory";
import type { FamilyMember, MarriageUnion } from "../types";

export interface HomeGrowthSummary {
  membersAdded: number;
  deceased: number;
  netGrowth: number;
}

export interface FamilyTimelineItem {
  id: string;
  year: number;
  date?: string;
  title: string;
  description: string;
  category: TimelineCategory;
  memberName: string;
  memberId?: string;
  href?: string;
  kind: string;
}

function parseDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value.length <= 10 ? `${value.slice(0, 10)}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function nextMonthDay(from: Date, month: number, day: number): Date {
  const thisYear = new Date(from.getFullYear(), month, day);
  if (thisYear >= from) return thisYear;
  return new Date(from.getFullYear() + 1, month, day);
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function isDeceased(member: FamilyMember): boolean {
  return Boolean(member.isDeceased || member.dateOfDeath);
}

function eventTypeLabel(type: string): HomeFamilyDate["eventType"] {
  const value = type.toLowerCase();
  if (value === "birthday") return "Birthday";
  if (value === "anniversary") return "Anniversary";
  if (value === "memorial" || value === "remembrance") return "Remembrance";
  return "Family event";
}

function eventCategory(type: string): TimelineCategory {
  const value = type.toLowerCase();
  if (value === "birthday") return "birth";
  if (value === "anniversary") return "marriage";
  if (value === "memorial") return "death";
  if (value === "achievement") return "achievement";
  return "family-event";
}

export function countGenerations(members: FamilyMember[], unions: MarriageUnion[]): number {
  if (!members.length) return 0;

  const allChildIds = new Set(unions.flatMap((union) => union.childrenIds));
  const roots = members.filter((member) => member.isRoot || !allChildIds.has(member.id));
  const start = roots.length ? roots : members;
  const depth = new Map<string, number>();
  const queue = start.map((member) => member.id);
  start.forEach((member) => depth.set(member.id, 1));

  let max = 1;
  while (queue.length) {
    const id = queue.shift()!;
    const current = depth.get(id) ?? 1;
    const memberUnions = unions.filter((union) => union.spouse1Id === id || union.spouse2Id === id);
    for (const union of memberUnions) {
      for (const childId of union.childrenIds) {
        if (depth.has(childId)) continue;
        const next = current + 1;
        depth.set(childId, next);
        max = Math.max(max, next);
        queue.push(childId);
      }
    }
  }

  return max;
}

export function buildGenderSlices(members: FamilyMember[]) {
  const counts = { male: 0, female: 0, other: 0 };
  for (const member of members) {
    if (member.gender === "female") counts.female += 1;
    else if (member.gender === "other") counts.other += 1;
    else counts.male += 1;
  }
  return [
    { label: "Male", value: counts.male, color: "#34d399" },
    { label: "Female", value: counts.female, color: "#fb7185" },
    { label: "Other", value: counts.other, color: "#64748b" }
  ];
}

export function buildLocations(members: FamilyMember[]): HomeLocation[] {
  const map = new Map<string, number>();
  for (const member of members) {
    const name = member.location?.trim();
    if (!name || name.toLowerCase() === "unknown") continue;
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, memberCount], index) => ({ id: `loc-${index}`, name, memberCount }))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 6);
}

export function buildRecentMembers(members: FamilyMember[]): HomeRecentMember[] {
  return [...members]
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? "") || right.id.localeCompare(left.id))
    .slice(0, 4)
    .map((member) => ({
      id: member.id,
      name: member.name,
      relation: member.nickname || member.relation || (member.isRoot ? "Root" : "Family member"),
      avatar: member.avatar,
      addedOn: member.createdAt ? member.createdAt.slice(0, 10) : "",
      href: `/members/${member.id}`
    }));
}

export function buildGrowthSeries(members: FamilyMember[]): HomeGrowthPoint[] {
  if (!members.length) return [];
  const nowYear = new Date().getFullYear();
  const birthYears = members
    .map((member) => parseDate(member.dob)?.getFullYear())
    .filter((year): year is number => typeof year === "number");
  const earliest = birthYears.length ? Math.min(...birthYears) : nowYear;
  const startYear = Math.max(earliest, nowYear - 7);

  const points: HomeGrowthPoint[] = [];
  for (let year = startYear; year <= nowYear; year += 1) {
    const count = members.filter((member) => {
      const born = parseDate(member.dob)?.getFullYear();
      if (born == null) return year === nowYear;
      return born <= year;
    }).length;
    points.push({ label: String(year), count });
  }
  return points;
}

export function buildGrowthSummary(members: FamilyMember[]): HomeGrowthSummary {
  const deceased = members.filter(isDeceased).length;
  return {
    membersAdded: members.length,
    deceased,
    netGrowth: members.length - deceased
  };
}

export function buildUpcomingDates(
  members: FamilyMember[],
  events: EventListItem[],
  limit = 6
): HomeFamilyDate[] {
  const today = startOfDay(new Date());
  const horizon = new Date(today);
  horizon.setFullYear(horizon.getFullYear() + 1);
  const dates: HomeFamilyDate[] = [];

  for (const member of members) {
    const birth = parseDate(member.dob);
    if (birth && !isDeceased(member)) {
      const next = nextMonthDay(today, birth.getMonth(), birth.getDate());
      if (next <= horizon) {
        dates.push({
          id: `bday-${member.id}`,
          personName: member.name,
          eventType: "Birthday",
          date: isoDate(next),
          location: member.location && member.location.toLowerCase() !== "unknown" ? member.location : undefined,
          href: `/members/${member.id}`
        });
      }
    }

    const death = parseDate(member.dateOfDeath);
    if (death) {
      const next = nextMonthDay(today, death.getMonth(), death.getDate());
      if (next <= horizon) {
        dates.push({
          id: `remember-${member.id}`,
          personName: member.name,
          eventType: "Remembrance",
          date: isoDate(next),
          location: member.location && member.location.toLowerCase() !== "unknown" ? member.location : undefined,
          href: `/members/${member.id}`
        });
      }
    }
  }

  for (const event of events) {
    const when = parseDate(event.eventDateTime);
    if (!when || when < today || when > horizon) continue;
    dates.push({
      id: `event-${event.id}`,
      personName: event.memberNames?.split(",")[0]?.trim() || event.title,
      eventType: eventTypeLabel(String(event.eventType)),
      date: isoDate(when),
      location: event.locationName ?? undefined,
      href: `/events/${event.id}`
    });
  }

  return dates.sort((left, right) => left.date.localeCompare(right.date)).slice(0, limit);
}

function childIdsFor(memberId: string, unions: MarriageUnion[]): string[] {
  const ids: string[] = [];
  for (const union of unions) {
    if (union.spouse1Id !== memberId && union.spouse2Id !== memberId) continue;
    for (const childId of union.childrenIds) {
      if (!ids.includes(childId)) ids.push(childId);
    }
  }
  return ids;
}

function previewNode(
  member: FamilyMember,
  unions: MarriageUnion[],
  membersById: Map<string, FamilyMember>,
  depth: number
): HomeTreePreviewNode {
  const childMembers = childIdsFor(member.id, unions)
    .map((id) => membersById.get(id))
    .filter((child): child is FamilyMember => Boolean(child))
    .slice(0, depth === 0 ? 4 : 2);

  return {
    id: member.id,
    name: firstName(member.name),
    relation: member.nickname || member.relation || (member.isRoot ? "Root" : depth === 0 ? "Member" : "Child"),
    children:
      depth < 2 && childMembers.length
        ? childMembers.map((child) => previewNode(child, unions, membersById, depth + 1))
        : undefined
  };
}

export function buildTreePreview(members: FamilyMember[], unions: MarriageUnion[]): HomeTreePreviewNode | null {
  if (!members.length) return null;
  const membersById = new Map(members.map((member) => [member.id, member]));
  const root = members.find((member) => member.isRoot) ?? members[0];
  return previewNode(root, unions, membersById, 0);
}

export function buildMemoryCards(memories: MemoryListItem[]): HomeMemory[] {
  return memories
    .filter((memory) => memory.coverUrl || memory.title)
    .slice(0, 6)
    .map((memory) => ({
      id: String(memory.id),
      title: memory.title,
      imageUrl: memory.coverUrl ?? "",
      href: `/memories/${memory.id}`
    }));
}

export function buildFamilyTimeline(
  members: FamilyMember[],
  events: EventListItem[] = [],
  memories: MemoryListItem[] = []
): FamilyTimelineItem[] {
  const items: FamilyTimelineItem[] = [];

  for (const member of members) {
    const birth = parseDate(member.dob);
    if (birth) {
      items.push({
        id: `birth-${member.id}`,
        year: birth.getFullYear(),
        date: isoDate(birth),
        title: `${member.name} was born`,
        description: member.location && member.location.toLowerCase() !== "unknown" ? `Born in ${member.location}.` : "Added to the family chronicle.",
        category: "birth",
        memberName: member.name,
        memberId: member.id,
        href: `/members/${member.id}`,
        kind: "Birth"
      });
    } else {
      const added = parseDate(member.createdAt);
      if (added) {
        items.push({
          id: `added-${member.id}`,
          year: added.getFullYear(),
          date: isoDate(added),
          title: `${member.name} added to the chronicle`,
          description: "A new member joined the family tree.",
          category: "family-event",
          memberName: member.name,
          memberId: member.id,
          href: `/members/${member.id}`,
          kind: "Member added"
        });
      }
    }
    const death = parseDate(member.dateOfDeath);
    if (death) {
      items.push({
        id: `death-${member.id}`,
        year: death.getFullYear(),
        date: isoDate(death),
        title: `In remembrance of ${member.name}`,
        description: member.profession ? `${member.profession}.` : "Remembered in the family chronicle.",
        category: "death",
        memberName: member.name,
        memberId: member.id,
        href: `/members/${member.id}`,
        kind: "Remembrance"
      });
    }
  }

  for (const event of events) {
    const when = parseDate(event.eventDateTime);
    if (!when) continue;
    items.push({
      id: `event-${event.id}`,
      year: when.getFullYear(),
      date: isoDate(when),
      title: event.title,
      description: event.description?.trim() || event.locationName || "Family event",
      category: eventCategory(String(event.eventType)),
      memberName: event.memberNames?.split(",")[0]?.trim() || event.title,
      href: `/events/${event.id}`,
      kind: eventTypeLabel(String(event.eventType))
    });
  }

  for (const memory of memories) {
    const when = parseDate(memory.memoryDate);
    if (!when) continue;
    items.push({
      id: `memory-${memory.id}`,
      year: when.getFullYear(),
      date: isoDate(when),
      title: memory.title,
      description: memory.location?.trim() || memory.description?.trim() || "Family memory",
      category: "family-event",
      memberName: memory.title,
      href: `/memories/${memory.id}`,
      kind: "New photo"
    });
  }

  return items.sort((left, right) => {
    const byYear = right.year - left.year;
    if (byYear) return byYear;
    return (right.date ?? "").localeCompare(left.date ?? "");
  });
}

export function toHomeTimeline(items: FamilyTimelineItem[], limit = 6): HomeTimelineEvent[] {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    dateLabel: item.date
      ? new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "numeric" })
      : String(item.year),
    title: item.title,
    description: item.description,
    kind: item.kind,
    href: item.href
  }));
}
