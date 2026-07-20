/**
 * =============================================================================
 * FILE: src/layout/computeFamilyTreeLayout.ts
 * ROLE: Pure layout math for the genealogy canvas (no React / no UI)
 * =============================================================================
 * Input:  members[] + unions[]
 * Output: { [nodeId]: { x, y } } for every member card and marriage node
 *
 * Rules this algorithm enforces:
 *   1. One horizontal row per generation
 *   2. Spouses sit side-by-side on the same row
 *   3. Children are centered under the couple midpoint
 *   4. Child unions are NEVER re-added as separate roots
 *      (that bug caused the "kids shifted to the right" look)
 *
 * NOTE: App.tsx currently also contains an inline computeDynamicLayout().
 * Prefer consolidating on this module when cleaning up — same algorithm.
 * =============================================================================
 */

import type { FamilyMember, MarriageUnion } from '../types';

export interface LayoutCoords {
  [id: string]: { x: number; y: number };
}

type LayoutEntity = {
  id: string;
  type: 'single' | 'union';
  memberId?: string;
  spouse1Id?: string;
  spouse2Id?: string;
  children: LayoutEntity[];
  width: number;
  generation: number;
};

/**
 * Genealogy layout:
 * - one horizontal row per generation
 * - spouses side-by-side
 * - children centered under the couple midpoint
 * - never re-root child unions (that caused the "shifted right" look)
 */
export function computeFamilyTreeLayout(
  members: FamilyMember[],
  unions: MarriageUnion[]
): LayoutCoords {
  const coords: LayoutCoords = {};

  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 100;
  const SIBLING_GAP = 72;
  const VERTICAL_GAP = 170;
  const SPOUSE_GAP = 100;
  const MARRIAGE_WIDTH = 24;
  const MARRIAGE_HEIGHT = 24;
  const COUPLE_WIDTH = CARD_WIDTH * 2 + SPOUSE_GAP;
  const SINGLE_WIDTH = CARD_WIDTH;

  const unionById = new Map(unions.map((union) => [union.id, union]));
  const unionByMemberId = new Map<string, MarriageUnion>();
  const childToParentUnionId = new Map<string, string>();

  unions.forEach((union) => {
    unionByMemberId.set(union.spouse1Id, union);
    unionByMemberId.set(union.spouse2Id, union);
    union.childrenIds.forEach((childId) => {
      if (!childToParentUnionId.has(childId)) {
        childToParentUnionId.set(childId, union.id);
      }
    });
  });

  const isRootUnion = (union: MarriageUnion) =>
    !childToParentUnionId.has(union.spouse1Id) && !childToParentUnionId.has(union.spouse2Id);

  const isRootSingle = (memberId: string) =>
    !unionByMemberId.has(memberId) && !childToParentUnionId.has(memberId);

  const placedMembers = new Set<string>();
  const placedUnions = new Set<string>();
  const buildingUnions = new Set<string>();

  const uniqueChildren = (entities: LayoutEntity[]): LayoutEntity[] => {
    const seen = new Set<string>();
    const result: LayoutEntity[] = [];
    entities.forEach((entity) => {
      if (seen.has(entity.id)) return;
      seen.add(entity.id);
      result.push(entity);
    });
    return result;
  };

  const buildMemberEntity = (memberId: string, generation: number): LayoutEntity => {
    const ownUnion = unionByMemberId.get(memberId);
    if (ownUnion) {
      return buildUnionEntity(ownUnion.id, generation);
    }

    return {
      id: `single_${memberId}`,
      type: 'single',
      memberId,
      children: [],
      width: SINGLE_WIDTH,
      generation
    };
  };

  const buildUnionEntity = (unionId: string, generation: number): LayoutEntity => {
    const union = unionById.get(unionId);
    if (!union) {
      return {
        id: `missing_${unionId}`,
        type: 'single',
        children: [],
        width: SINGLE_WIDTH,
        generation
      };
    }

    if (buildingUnions.has(unionId)) {
      return {
        id: unionId,
        type: 'union',
        spouse1Id: union.spouse1Id,
        spouse2Id: union.spouse2Id,
        children: [],
        width: COUPLE_WIDTH,
        generation
      };
    }

    buildingUnions.add(unionId);

    const childEntities = uniqueChildren(
      union.childrenIds.map((childId) => buildMemberEntity(childId, generation + 1))
    );

    buildingUnions.delete(unionId);

    const childrenWidth =
      childEntities.length === 0
        ? 0
        : childEntities.reduce((sum, child) => sum + child.width, 0) +
          Math.max(0, childEntities.length - 1) * SIBLING_GAP;

    return {
      id: union.id,
      type: 'union',
      spouse1Id: union.spouse1Id,
      spouse2Id: union.spouse2Id,
      children: childEntities,
      width: Math.max(COUPLE_WIDTH, childrenWidth),
      generation
    };
  };

  const rootEntities: LayoutEntity[] = [];

  unions.forEach((union) => {
    if (!isRootUnion(union)) return;
    rootEntities.push(buildUnionEntity(union.id, 0));
  });

  members.forEach((member) => {
    if (!isRootSingle(member.id)) return;
    rootEntities.push(buildMemberEntity(member.id, 0));
  });

  const markPlaced = (entity: LayoutEntity) => {
    if (entity.type === 'union') {
      placedUnions.add(entity.id);
      if (entity.spouse1Id) placedMembers.add(entity.spouse1Id);
      if (entity.spouse2Id) placedMembers.add(entity.spouse2Id);
    } else if (entity.memberId) {
      placedMembers.add(entity.memberId);
    }
    entity.children.forEach(markPlaced);
  };
  rootEntities.forEach(markPlaced);

  // Only true orphans — never re-root children already inside a family subtree.
  unions.forEach((union) => {
    if (placedUnions.has(union.id)) return;
    if (placedMembers.has(union.spouse1Id) || placedMembers.has(union.spouse2Id)) return;
    const orphan = buildUnionEntity(union.id, 0);
    rootEntities.push(orphan);
    markPlaced(orphan);
  });

  members.forEach((member) => {
    if (placedMembers.has(member.id)) return;
    const orphan = buildMemberEntity(member.id, 0);
    rootEntities.push(orphan);
    markPlaced(orphan);
  });

  const positionEntity = (entity: LayoutEntity, leftX: number) => {
    const centerX = leftX + entity.width / 2;
    const y = entity.generation * (CARD_HEIGHT + VERTICAL_GAP) + 80;

    if (entity.type === 'single') {
      if (!entity.memberId) return;
      coords[entity.memberId] = {
        x: centerX - CARD_WIDTH / 2,
        y
      };
      return;
    }

    const s1Id = entity.spouse1Id!;
    const s2Id = entity.spouse2Id!;

    coords[s1Id] = {
      x: centerX - CARD_WIDTH - SPOUSE_GAP / 2,
      y
    };
    coords[s2Id] = {
      x: centerX + SPOUSE_GAP / 2,
      y
    };
    coords[`m_${s1Id}_${s2Id}`] = {
      x: centerX - MARRIAGE_WIDTH / 2,
      y: y + CARD_HEIGHT / 2 - MARRIAGE_HEIGHT / 2
    };

    if (entity.children.length === 0) return;

    const childrenSpan =
      entity.children.reduce((sum, child) => sum + child.width, 0) +
      Math.max(0, entity.children.length - 1) * SIBLING_GAP;

    let childLeftX = centerX - childrenSpan / 2;
    entity.children.forEach((child) => {
      positionEntity(child, childLeftX);
      childLeftX += child.width + SIBLING_GAP;
    });
  };

  let currentX = 120;
  rootEntities.forEach((entity) => {
    positionEntity(entity, currentX);
    currentX += entity.width + SIBLING_GAP * 2;
  });

  return coords;
}
