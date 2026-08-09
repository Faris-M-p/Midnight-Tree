import type { FamilyMember, MarriageUnion } from "../types";

export type MemberRanks = Record<string, number>;

/**
 * Sequential # ranks shown on family-tree cards (BFS from roots, then disconnected).
 * Keep this as the single source of truth so Members and Add Member match the tree.
 */
export function computeMemberRanks(members: FamilyMember[], unions: MarriageUnion[]): MemberRanks {
  const ranks: MemberRanks = {};
  let counter = 1;
  const allChildIds = new Set(unions.flatMap((u) => u.childrenIds));
  const roots = members.filter((m) => !allChildIds.has(m.id));
  const queue = [...roots.map((m) => m.id)];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    ranks[id] = counter++;

    const memberUnions = unions.filter((u) => u.spouse1Id === id || u.spouse2Id === id);
    for (const u of memberUnions) {
      const spouseId = u.spouse1Id === id ? u.spouse2Id : u.spouse1Id;
      if (!visited.has(spouseId)) queue.push(spouseId);
      for (const cid of u.childrenIds) {
        if (!visited.has(cid)) queue.push(cid);
      }
    }
  }

  for (const m of members) {
    if (!ranks[m.id]) ranks[m.id] = counter++;
  }

  return ranks;
}

export function memberDisplayId(ranks: MemberRanks, id: string): string {
  const rank = ranks[id];
  return typeof rank === "number" ? `#${rank}` : "#?";
}

export function formatMemberLabel(ranks: MemberRanks, id: string, name: string): string {
  return `${memberDisplayId(ranks, id)} ${name}`;
}

export function matchesMemberRank(ranks: MemberRanks, id: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const rank = ranks[id];
  if (typeof rank !== "number") return false;
  const label = `#${rank}`;
  return q === label || q === String(rank) || label.startsWith(q);
}
