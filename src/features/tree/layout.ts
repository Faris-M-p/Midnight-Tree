import type { Member, Relationship } from "@/types/database";

export type TreeCoords = Record<string, { x: number; y: number }>;

const CARD_W = 200;
const CARD_H = 88;
const SPOUSE_GAP = 48;
const SIBLING_GAP = 56;
const VERTICAL = 140;

/**
 * Simple generation layout: partners side-by-side, children centered under midpoints.
 * Good enough for Lineage-style readability; refine as trees grow.
 */
export function layoutFamilyTree(members: Member[], relationships: Relationship[]): TreeCoords {
  const coords: TreeCoords = {};
  const byId = new Map(members.map((m) => [m.id, m]));
  const partners = new Map<string, string>();
  const childrenOf = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const rel of relationships) {
    if (rel.relationship_status === "ended") continue;
    if (rel.relationship_type === "partner") {
      partners.set(rel.source_member_id, rel.target_member_id);
      partners.set(rel.target_member_id, rel.source_member_id);
    }
    if (rel.relationship_type === "parent") {
      const list = childrenOf.get(rel.source_member_id) ?? [];
      if (!list.includes(rel.target_member_id)) list.push(rel.target_member_id);
      childrenOf.set(rel.source_member_id, list);
      hasParent.add(rel.target_member_id);
    }
  }

  const roots = members.filter((m) => !hasParent.has(m.id));
  const placed = new Set<string>();

  function placePerson(id: string, x: number, y: number) {
    if (!byId.has(id) || placed.has(id)) return;
    coords[id] = { x, y };
    placed.add(id);
  }

  function subtreeWidth(id: string, visiting = new Set<string>()): number {
    if (visiting.has(id)) return CARD_W;
    visiting.add(id);
    const partnerId = partners.get(id);
    const kids = [
      ...(childrenOf.get(id) ?? []),
      ...(partnerId ? childrenOf.get(partnerId) ?? [] : [])
    ].filter((k, i, a) => a.indexOf(k) === i);
    const couple = partnerId ? CARD_W * 2 + SPOUSE_GAP : CARD_W;
    if (kids.length === 0) return couple;
    const kidsW =
      kids.reduce((sum, kid) => sum + subtreeWidth(kid, visiting), 0) +
      Math.max(0, kids.length - 1) * SIBLING_GAP;
    return Math.max(couple, kidsW);
  }

  function placeSubtree(id: string, left: number, generation: number, visiting = new Set<string>()) {
    if (visiting.has(id) || placed.has(id)) return;
    visiting.add(id);
    const y = 40 + generation * (CARD_H + VERTICAL);
    const partnerId = partners.get(id);
    const width = subtreeWidth(id);
    const center = left + width / 2;

    if (partnerId && byId.has(partnerId)) {
      const leftPerson = id < partnerId ? id : partnerId;
      const rightPerson = id < partnerId ? partnerId : id;
      placePerson(leftPerson, center - CARD_W - SPOUSE_GAP / 2, y);
      placePerson(rightPerson, center + SPOUSE_GAP / 2, y);
    } else {
      placePerson(id, center - CARD_W / 2, y);
    }

    const kids = [
      ...(childrenOf.get(id) ?? []),
      ...(partnerId ? childrenOf.get(partnerId) ?? [] : [])
    ].filter((k, i, a) => a.indexOf(k) === i);

    if (kids.length === 0) return;
    const kidsSpan =
      kids.reduce((sum, kid) => sum + subtreeWidth(kid), 0) + Math.max(0, kids.length - 1) * SIBLING_GAP;
    let cursor = center - kidsSpan / 2;
    for (const kid of kids) {
      const w = subtreeWidth(kid);
      placeSubtree(kid, cursor, generation + 1, visiting);
      cursor += w + SIBLING_GAP;
    }
  }

  let x = 40;
  const orderedRoots = roots.length > 0 ? roots : members;
  for (const root of orderedRoots) {
    if (placed.has(root.id)) continue;
    const partner = partners.get(root.id);
    if (partner && placed.has(partner)) continue;
    const w = subtreeWidth(root.id);
    placeSubtree(root.id, x, 0);
    x += w + SIBLING_GAP * 2;
  }

  for (const m of members) {
    if (!placed.has(m.id)) {
      coords[m.id] = { x, y: 40 };
      x += CARD_W + SIBLING_GAP;
    }
  }

  return coords;
}
