/**
 * =============================================================================
 * FILE: src/App.tsx
 * ROLE: App router + Family Tree screen (main orchestrator)
 * =============================================================================
 * This is the largest frontend file. It has two jobs:
 *
 * 1) ROUTING (export default function App)
 *    Reads the browser URL and shows:
 *      /          → LandingPage
 *      /login     → LoginPage
 *      /register  → RegisterPage
 *      /tree      → Family Tree (AppContent + ReactFlowProvider)
 *
 * 2) FAMILY TREE (function AppContent)
 *    - Loads members/unions from treeService
 *    - Runs layout (computeDynamicLayout) to get X/Y positions
 *    - Builds React Flow nodes + edges
 *    - Opens modals (Add Member, Profile, Analytics, Timeline)
 *
 * Architecture reminder:
 *   services/   → API
 *   layout/     → position math
 *   components/ → visual pieces only
 *
 * See also: ARCHITECTURE.md in the project root of "Midnight Tree".
 * =============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

import {
  familyMilestones
} from './mockData';
import type { FamilyMember, MarriageUnion } from './types';

// Import Custom components
import { SearchHeader } from './components/SearchHeader';
import { FilterSidebar } from './components/FilterSidebar';
import { FamilyTreeCanvas } from './components/FamilyTreeCanvas';
import { ProfileModal } from './components/ProfileModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { CreateMemberModal } from './components/CreateMemberModal';
import type { CreateMemberSubmitInput, CreateMemberSubmitResult } from './components/CreateMemberModal';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ApiClientError } from './services/apiClient';
import { createMember, getMemberDetails } from './services/memberService';
import { getFamilyTreeData } from './services/treeService';
import type { MemberProfile } from './types/member';

import '@xyflow/react/dist/style.css';

// =============================================================================
// LAYOUT ALGORITHM (positions only — does not draw anything)
// Converts members + unions into { id → { x, y } } for React Flow nodes.
// =============================================================================
interface LayoutCoords {
  [id: string]: { x: number; y: number };
}

/**
 * Builds a hierarchical family layout.
 * Important: only true roots become top-level trees; children stay nested
 * so they render under their parents (not beside them).
 */
function computeDynamicLayout(
  members: FamilyMember[],
  unions: MarriageUnion[]
): LayoutCoords {
  type LayoutEntity = {
    id: string;
    type: 'single' | 'union';
    memberId?: string;
    spouse1Id?: string;
    spouse2Id?: string;
    children: LayoutEntity[];
    width?: number;
  };

  const coords: LayoutCoords = {};

  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 100;
  const HORIZONTAL_GAP = 80;
  const VERTICAL_GAP = 120;
  const SPOUSE_GAP = 120;
  const MARRIAGE_WIDTH = 24;
  const MARRIAGE_HEIGHT = 24;

  const unionByMemberId = new Map<string, MarriageUnion>();
  const childToParentUnionId = new Map<string, string>();
  const memberIdsInUnion = new Set<string>();

  unions.forEach((union) => {
    unionByMemberId.set(union.spouse1Id, union);
    unionByMemberId.set(union.spouse2Id, union);
    memberIdsInUnion.add(union.spouse1Id);
    memberIdsInUnion.add(union.spouse2Id);

    union.childrenIds.forEach((childId) => {
      if (!childToParentUnionId.has(childId)) {
        childToParentUnionId.set(childId, union.id);
      }
    });
  });

  const unionById = new Map(unions.map((union) => [union.id, union]));
  const builtEntityByUnion = new Map<string, LayoutEntity>();
  const builtEntityByMember = new Map<string, LayoutEntity>();
  const pathGuard = new Set<string>();

  const buildEntityForMember = (memberId: string): LayoutEntity => {
    if (builtEntityByMember.has(memberId)) {
      return builtEntityByMember.get(memberId)!;
    }

    const union = unionByMemberId.get(memberId);
    if (!union) {
      const single: LayoutEntity = {
        id: `single_${memberId}`,
        type: 'single',
        memberId,
        children: []
      };
      builtEntityByMember.set(memberId, single);
      return single;
    }

    const unionEntity = buildEntityForUnion(union.id);
    builtEntityByMember.set(memberId, unionEntity);
    return unionEntity;
  };

  const buildEntityForUnion = (unionId: string): LayoutEntity => {
    if (builtEntityByUnion.has(unionId)) {
      return builtEntityByUnion.get(unionId)!;
    }

    const union = unionById.get(unionId);
    if (!union) {
      return { id: `missing_${unionId}`, type: 'single', children: [] };
    }

    if (pathGuard.has(unionId)) {
      return {
        id: unionId,
        type: 'union',
        spouse1Id: union.spouse1Id,
        spouse2Id: union.spouse2Id,
        children: []
      };
    }

    pathGuard.add(unionId);
    const children = union.childrenIds.map((childId) => buildEntityForMember(childId));
    pathGuard.delete(unionId);

    const entity: LayoutEntity = {
      id: union.id,
      type: 'union',
      spouse1Id: union.spouse1Id,
      spouse2Id: union.spouse2Id,
      children
    };
    builtEntityByUnion.set(unionId, entity);
    return entity;
  };

  const rootEntities: LayoutEntity[] = [];
  const pushedRootKeys = new Set<string>();
  const pushedEntityIds = new Set<string>();

  const pushRoot = (entity: LayoutEntity, key: string) => {
    if (pushedRootKeys.has(key)) return;
    if (pushedEntityIds.has(entity.id)) return;
    pushedRootKeys.add(key);
    pushedEntityIds.add(entity.id);
    rootEntities.push(entity);
  };

  // Primary roots: unions where neither spouse is listed as another union's child
  unions.forEach((union) => {
    const spouse1IsChild = childToParentUnionId.has(union.spouse1Id);
    const spouse2IsChild = childToParentUnionId.has(union.spouse2Id);
    if (!spouse1IsChild && !spouse2IsChild) {
      pushRoot(buildEntityForUnion(union.id), `union_${union.id}`);
    }
  });

  // Single roots: members not married and not child of any union
  members.forEach((member) => {
    const isInCouple = memberIdsInUnion.has(member.id);
    const isChild = childToParentUnionId.has(member.id);
    if (!isInCouple && !isChild) {
      pushRoot(buildEntityForMember(member.id), `single_${member.id}`);
    }
  });

  // Only true orphans — never re-root children already placed inside a family subtree.
  // (Re-rooting caused couples to jump to the right of their parents.)
  const placedMembers = new Set<string>();
  const placedUnions = new Set<string>();

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

  unions.forEach((union) => {
    if (placedUnions.has(union.id)) return;
    if (placedMembers.has(union.spouse1Id) || placedMembers.has(union.spouse2Id)) return;
    pushRoot(buildEntityForUnion(union.id), `orphan_union_${union.id}`);
    markPlaced(rootEntities[rootEntities.length - 1]);
  });
  members.forEach((member) => {
    if (placedMembers.has(member.id)) return;
    pushRoot(buildEntityForMember(member.id), `orphan_member_${member.id}`);
    markPlaced(rootEntities[rootEntities.length - 1]);
  });

  const SIBLING_GAP = 72;
  const ROW_GAP = 170;

  const assignGeneration = (entity: LayoutEntity, generation: number) => {
    (entity as LayoutEntity & { generation?: number }).generation = generation;
    entity.children.forEach((child) => assignGeneration(child, generation + 1));
  };
  rootEntities.forEach((entity) => assignGeneration(entity, 0));

  const computeWidth = (entity: LayoutEntity): number => {
    if (entity.type === 'single') {
      entity.width = CARD_WIDTH;
      return entity.width;
    }

    const childrenWidth =
      entity.children.length === 0
        ? 0
        : entity.children.reduce((sum, child) => sum + computeWidth(child), 0) +
          Math.max(0, entity.children.length - 1) * SIBLING_GAP;
    const coupleWidth = CARD_WIDTH * 2 + SPOUSE_GAP;
    entity.width = Math.max(coupleWidth, childrenWidth);
    return entity.width;
  };

  rootEntities.forEach((entity) => computeWidth(entity));

  // Deduplicate sibling entities that resolve to the same couple block
  const dedupeChildren = (entity: LayoutEntity) => {
    const seen = new Set<string>();
    entity.children = entity.children.filter((child) => {
      if (seen.has(child.id)) return false;
      seen.add(child.id);
      return true;
    });
    entity.children.forEach(dedupeChildren);
  };
  rootEntities.forEach(dedupeChildren);
  rootEntities.forEach((entity) => computeWidth(entity));

  const positionEntity = (entity: LayoutEntity, leftX: number) => {
    const blockWidth = entity.width || CARD_WIDTH;
    const centerX = leftX + blockWidth / 2;
    const generation = (entity as LayoutEntity & { generation?: number }).generation ?? 0;
    const y = generation * (CARD_HEIGHT + ROW_GAP) + 80;

    if (entity.type === 'single') {
      const memberId = entity.memberId;
      if (!memberId) return;
      coords[memberId] = {
        x: centerX - CARD_WIDTH / 2,
        y
      };
      return;
    }

    const s1Id = entity.spouse1Id!;
    const s2Id = entity.spouse2Id!;

    // Couple centered inside the family block (parents sit above children midpoint)
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
      entity.children.reduce((sum, child) => sum + (child.width || 0), 0) +
      Math.max(0, entity.children.length - 1) * SIBLING_GAP;
    let childLeftX = centerX - childrenSpan / 2;
    entity.children.forEach((child) => {
      positionEntity(child, childLeftX);
      childLeftX += (child.width || 0) + SIBLING_GAP;
    });
  };

  let currentX = 120;
  rootEntities.forEach((entity) => {
    positionEntity(entity, currentX);
    currentX += (entity.width || 0) + SIBLING_GAP * 2;
  });

  return coords;
}

/**
 * Family Tree screen (protected visually by going through /tree after login).
 * Holds React state for members, unions, filters, modals, and canvas nodes.
 */
function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Lifiting family tree states
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [unions, setUnions] = useState<MarriageUnion[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState('');
  const [treeSuccessMessage, setTreeSuccessMessage] = useState('');

  // Visibility states
  const [collapsedUnions, setCollapsedUnions] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Panels and Modals
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Focus and Highlight triggers
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);

  const mapGender = (value?: string | null): 'male' | 'female' | 'other' => {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'male') return 'male';
    if (normalized === 'female') return 'female';
    return 'other';
  };

  const defaultAvatar = (gender: 'male' | 'female' | 'other'): string => {
    if (gender === 'male') return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80';
    if (gender === 'female') return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80';
    return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80';
  };

  const mapProfileToMember = (profile: MemberProfile, fallback?: FamilyMember): FamilyMember => {
    const gender = mapGender(profile.gender);
    const photos = (profile.images ?? []).map((x) => x.imageUrl);
    const avatar = profile.images?.find((x) => x.isPrimary)?.imageUrl || photos[0] || fallback?.avatar || defaultAvatar(gender);
    const findSocial = (needle: string) => profile.socialLinks?.find((x) => x.platform.toLowerCase().includes(needle))?.url;

    return {
      id: String(profile.id),
      name: profile.fullName,
      relation: fallback?.relation || (profile.isRoot ? (gender === 'male' ? 'Grandfather' : 'Grandmother') : 'Member'),
      gender,
      dob: profile.dateOfBirth || fallback?.dob || '',
      location: fallback?.location || 'Unknown',
      profession: profile.profession || fallback?.profession || 'Not specified',
      avatar,
      bio: profile.biography || fallback?.bio || 'No biography available.',
      education: fallback?.education || 'Not Specified',
      career: fallback?.career || profile.profession || 'Not Specified',
      photos,
      isDeceased: Boolean(profile.dateOfDeath),
      isRoot: profile.isRoot,
      socials: {
        instagram: findSocial('instagram'),
        facebook: findSocial('facebook'),
        whatsapp: findSocial('whatsapp'),
        gmail: findSocial('gmail')
      }
    };
  };

  const loadTreeData = async () => {
    setIsTreeLoading(true);
    setTreeError('');
    try {
      const data = await getFamilyTreeData();
      setMembers(data.members);
      setUnions(data.unions);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setTreeError(error.statusCode >= 500 ? 'Unable to load family tree right now. Please try again.' : error.message);
      } else {
        setTreeError('Unable to load family tree right now. Please try again.');
      }
      setMembers([]);
      setUnions([]);
    } finally {
      setIsTreeLoading(false);
    }
  };

  useEffect(() => {
    void loadTreeData();
  }, []);

  // Dynamic generation leveling helper
  const getGenOfMember = (id: string): number => {
    const parentUnion = unions.find((u) => u.childrenIds.includes(id));
    if (!parentUnion) {
      // Check if married to someone who has parents
      const spouseUnion = unions.find((u) => u.spouse1Id === id || u.spouse2Id === id);
      if (spouseUnion) {
        const otherSpouseId = spouseUnion.spouse1Id === id ? spouseUnion.spouse2Id : spouseUnion.spouse1Id;
        const otherParentUnion = unions.find((u) => u.childrenIds.includes(otherSpouseId));
        if (otherParentUnion) {
          return getGenOfMember(otherSpouseId);
        }
      }
      return 1;
    }
    return getGenOfMember(parentUnion.spouse1Id) + 1;
  };

  // Helper: Recursively get all descendant nodes to collapse
  const getHiddenEntities = (collapsedIds: string[]) => {
    const hiddenNodeIds = new Set<string>();

    const recurseCollapse = (unionId: string) => {
      const union = unions.find((u) => u.id === unionId);
      if (!union) return;

      union.childrenIds.forEach((childId) => {
        hiddenNodeIds.add(childId);

        const childUnions = unions.filter(
          (u) => u.spouse1Id === childId || u.spouse2Id === childId
        );

        childUnions.forEach((childUnion) => {
          const mNodeId = `m_${childUnion.spouse1Id}_${childUnion.spouse2Id}`;
          hiddenNodeIds.add(mNodeId);

          const spouseId = childUnion.spouse1Id === childId ? childUnion.spouse2Id : childUnion.spouse1Id;
          hiddenNodeIds.add(spouseId);

          recurseCollapse(childUnion.id);
        });
      });
    };

    collapsedIds.forEach((unionId) => {
      recurseCollapse(unionId);
    });

    return hiddenNodeIds;
  };

  // Toggle child expansion of a spouse union
  const toggleUnion = (unionId: string) => {
    setCollapsedUnions((prev) =>
      prev.includes(unionId) ? prev.filter((id) => id !== unionId) : [...prev, unionId]
    );
  };

  // Dynamic CRUD Operators
  const handleAddMemberSave = async ({ memberData, placement }: CreateMemberSubmitInput): Promise<CreateMemberSubmitResult> => {
    const tokens = memberData.name.trim().split(/\s+/).filter(Boolean);
    const firstName = tokens.shift() || memberData.name.trim();
    const lastName = tokens.join(' ') || firstName;

    let parentId: number | undefined;
    let spouseId: number | undefined;
    let isRoot = placement.type === 'root';

    if (placement.type === 'child') {
      const union = unions.find((x) => x.id === placement.targetId);
      if (!union) {
        return { success: false, message: 'Please select a valid couple for child placement.' };
      }
      parentId = Number(union.spouse1Id);
      isRoot = false;
    }

    if (placement.type === 'spouse') {
      if (!placement.targetId) {
        return { success: false, message: 'Please select a member to attach spouse.' };
      }
      spouseId = Number(placement.targetId);
      isRoot = false;
    }

    try {
      const created = await createMember({
        firstName,
        lastName,
        gender: memberData.gender === 'other' ? 'Other' : memberData.gender === 'male' ? 'Male' : 'Female',
        dateOfBirth: memberData.dob || undefined,
        dateOfDeath: memberData.isDeceased ? new Date().toISOString().slice(0, 10) : undefined,
        profession: memberData.profession || undefined,
        biography: memberData.bio || undefined,
        isRoot,
        parentId,
        spouseId
      });

      await loadTreeData();
      setTreeSuccessMessage('Member created successfully.');
      const createdId = String(created.id);
      setFocusedNodeId(createdId);
      setHighlightedMemberId(createdId);
      setTimeout(() => setHighlightedMemberId((current) => (current === createdId ? null : current)), 3000);
      setTimeout(() => setTreeSuccessMessage(''), 2500);
      return { success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          success: false,
          message: error.statusCode >= 500 ? 'Unable to save member right now. Please try again.' : error.message,
          fieldErrors: error.fieldErrors
        };
      }
      return { success: false, message: 'Unable to save member right now. Please try again.' };
    }
  };

  const handleUpdateMember = (id: string, updatedData: Partial<FamilyMember>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, ...updatedData };
        }
        return m;
      })
    );

    // Sync currently selected card if open
    setSelectedMember((current) => {
      if (current && current.id === id) {
        return { ...current, ...updatedData };
      }
      return current;
    });
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMember(null);

    // Cleanup unions
    setUnions((prev) => {
      // 1. Remove unions where deleted member was a spouse
      const filteredUnions = prev.filter((u) => u.spouse1Id !== id && u.spouse2Id !== id);
      // 2. Remove deleted member from children lists
      return filteredUnions.map((u) => {
        if (u.childrenIds.includes(id)) {
          return {
            ...u,
            childrenIds: u.childrenIds.filter((cid) => cid !== id)
          };
        }
        return u;
      });
    });
  };

  // Compute sequential member rank (BFS from roots, stable order)
  const memberRanks = useMemo<{ [id: string]: number }>(() => {
    const ranks: { [id: string]: number } = {};
    let counter = 1;
    // Find root members (no union has them as a child)
    const allChildIds = new Set(unions.flatMap(u => u.childrenIds));
    const roots = members.filter(m => !allChildIds.has(m.id));
    const queue = [...roots.map(m => m.id)];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      ranks[id] = counter++;
      // Enqueue spouses then children
      const memberUnions = unions.filter(u => u.spouse1Id === id || u.spouse2Id === id);
      for (const u of memberUnions) {
        const spouseId = u.spouse1Id === id ? u.spouse2Id : u.spouse1Id;
        if (!visited.has(spouseId)) queue.push(spouseId);
        for (const cid of u.childrenIds) {
          if (!visited.has(cid)) queue.push(cid);
        }
      }
    }
    // Assign any remaining (disconnected) members
    for (const m of members) {
      if (!ranks[m.id]) ranks[m.id] = counter++;
    }
    return ranks;
  }, [members, unions]);

  // Recalculate nodes and edges when states mutate
  useEffect(() => {
    const hiddenNodeIds = getHiddenEntities(collapsedUnions);
    const activeNodes: any[] = [];
    const activeEdges: any[] = [];

    // Dynamically calculate grid coordinate offsets
    const layoutCoords = computeDynamicLayout(members, unions);

    // 1. Populate Family Member Cards
    members.forEach((m) => {
      if (hiddenNodeIds.has(m.id)) return;

      const matchesGen =
        selectedGenerations.length === 0 ||
        selectedGenerations.includes(getGenOfMember(m.id));
      const matchesLoc =
        selectedLocations.length === 0 || selectedLocations.includes(m.location);
      const isMatched = matchesGen && matchesLoc;

      const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;
      const isDimmed = hasActiveFilters && !isMatched;

      const pos = layoutCoords[m.id];
      if (!pos) return;

      activeNodes.push({
        id: m.id,
        type: 'memberCard',
        position: pos,
        draggable: false,
        data: {
          member: m,
          onSelect: (member: FamilyMember) => void handleMemberSelect(member),
          isDimmed,
          isHighlighted: highlightedMemberId === m.id,
          displayId: `#${memberRanks[m.id] ?? '?'}`
        }
      });
    });

    // 2. Populate Marriage Junction Nodes
    unions.forEach((u) => {
      const marriageNodeId = `m_${u.spouse1Id}_${u.spouse2Id}`;
      if (hiddenNodeIds.has(marriageNodeId)) return;

      const spouse1 = members.find((m) => m.id === u.spouse1Id);
      const spouse2 = members.find((m) => m.id === u.spouse2Id);

      const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;
      let isDimmed = false;

      if (hasActiveFilters && spouse1 && spouse2) {
        const matchesGen1 =
          selectedGenerations.length === 0 ||
          selectedGenerations.includes(getGenOfMember(spouse1.id));
        const matchesLoc1 =
          selectedLocations.length === 0 || selectedLocations.includes(spouse1.location);
        const isMatched1 = matchesGen1 && matchesLoc1;

        const matchesGen2 =
          selectedGenerations.length === 0 ||
          selectedGenerations.includes(getGenOfMember(spouse2.id));
        const matchesLoc2 =
          selectedLocations.length === 0 || selectedLocations.includes(spouse2.location);
        const isMatched2 = matchesGen2 && matchesLoc2;

        isDimmed = !isMatched1 && !isMatched2;
      }

      const pos = layoutCoords[marriageNodeId];
      if (!pos) return;

      activeNodes.push({
        id: marriageNodeId,
        type: 'marriageNode',
        position: pos,
        draggable: false,
        data: {
          collapsed: collapsedUnions.includes(u.id),
          onToggle: () => toggleUnion(u.id),
          hasChildren: u.childrenIds.length > 0,
          isDimmed
        }
      });
    });

    // 3. Populate Connections (Edges)
    unions.forEach((u) => {
      const marriageNodeId = `m_${u.spouse1Id}_${u.spouse2Id}`;
      if (hiddenNodeIds.has(marriageNodeId)) return;

      const s1Visible = activeNodes.some((n) => n.id === u.spouse1Id);
      const s2Visible = activeNodes.some((n) => n.id === u.spouse2Id);

      // Horizontal spouse connectors
      if (s1Visible) {
        activeEdges.push({
          id: `e_${u.spouse1Id}_to_${marriageNodeId}`,
          source: u.spouse1Id,
          target: marriageNodeId,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'straight',
          style: { stroke: '#10b981', strokeDasharray: '5,5', strokeWidth: 2 },
          animated: true
        });
      }

      if (s2Visible) {
        activeEdges.push({
          id: `e_${marriageNodeId}_to_${u.spouse2Id}`,
          source: marriageNodeId,
          target: u.spouse2Id,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'straight',
          style: { stroke: '#10b981', strokeDasharray: '5,5', strokeWidth: 2 },
          animated: true
        });
      }

      // Vertical descendants connectors (shared genealogy rail under the couple)
      const isCollapsed = collapsedUnions.includes(u.id);
      if (!isCollapsed) {
        const linkedTargets: string[] = [];
        u.childrenIds.forEach((childId) => {
          // Prefer connecting to the child's marriage junction when married,
          // so lines drop to the couple center (genealogy style).
          const childUnion = unions.find(
            (cu) => cu.spouse1Id === childId || cu.spouse2Id === childId
          );
          const targetId = childUnion
            ? `m_${childUnion.spouse1Id}_${childUnion.spouse2Id}`
            : childId;

          if (linkedTargets.includes(targetId)) return;
          if (!activeNodes.some((n) => n.id === targetId)) return;
          linkedTargets.push(targetId);
        });

        if (linkedTargets.length > 0) {
          const parentPos = layoutCoords[marriageNodeId];
          const parentBottom = parentPos ? parentPos.y + 24 : 0;
          const childTops = linkedTargets
            .map((targetId) => layoutCoords[targetId]?.y)
            .filter((y): y is number => typeof y === 'number');
          const nearestChildTop = childTops.length > 0 ? Math.min(...childTops) : parentBottom + 80;
          // Shared horizontal rail between parent couple and next generation
          const railY = parentBottom + Math.max(40, (nearestChildTop - parentBottom) * 0.42);

          linkedTargets.forEach((targetId) => {
            activeEdges.push({
              id: `e_child_${marriageNodeId}_to_${targetId}`,
              source: marriageNodeId,
              target: targetId,
              sourceHandle: 'bottom',
              targetHandle: 'top',
              type: 'genealogy',
              data: { railY },
              style: { stroke: '#10b981', strokeWidth: 2.5 }
            });
          });
        }
      }
    });

    setNodes(activeNodes);
    setEdges(activeEdges);
  }, [collapsedUnions, selectedGenerations, selectedLocations, highlightedMemberId, members, unions]);

  // Center view on search match and flash target node
  const handleSearchMatch = (memberId: string) => {
    setFocusedNodeId(memberId);
    setHighlightedMemberId(memberId);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#8b5cf6']
    });

    setTimeout(() => {
      setHighlightedMemberId((current) => (current === memberId ? null : current));
    }, 3000);
  };

  const handleResetFilters = () => {
    setSelectedGenerations([]);
    setSelectedLocations([]);
  };

  const handleExportPNG = () => {
    const wrapper = document.getElementById('family-tree-canvas-wrapper');
    const flowElement = wrapper?.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const overlays = document.querySelectorAll('.react-flow__panel, header, .fixed');
    overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'hidden'));

    toPng(flowElement, {
      backgroundColor: '#030712',
      quality: 0.98,
      pixelRatio: 2
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mehta-family-tree.png';
        link.href = dataUrl;
        link.click();
        overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'visible'));
      })
      .catch((error) => {
        console.error('Export failed:', error);
        overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'visible'));
      });
  };

  const handleOpenFilters = () => {
    window.dispatchEvent(new Event('open-filter-sidebar'));
  };

  const handleMemberSelect = async (member: FamilyMember) => {
    setSelectedMember(member);
    try {
      const profile = await getMemberDetails(Number(member.id));
      setSelectedMember(mapProfileToMember(profile, member));
    } catch {
      // keep fallback selected member details if API detail request fails
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative select-none">
      <SearchHeader
        members={members}
        onSearchMatch={handleSearchMatch}
        onOpenAnalytics={() => {
          setIsAnalyticsOpen(true);
          setIsTimelineOpen(false);
        }}
        onOpenTimeline={() => {
          setIsTimelineOpen(true);
          setIsAnalyticsOpen(false);
        }}
        onExportPNG={handleExportPNG}
        onAddMember={() => setIsCreateOpen(true)}
        onOpenFilters={handleOpenFilters}
        hasActiveFilters={selectedGenerations.length > 0 || selectedLocations.length > 0}
      />

      <main className="flex-1 w-full h-full pt-20 relative">
        {treeSuccessMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-300">
            {treeSuccessMessage}
          </div>
        )}

        {isTreeLoading ? (
          <div className="h-full w-full flex items-center justify-center px-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 text-sm text-slate-300 inline-flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              Loading family tree...
            </div>
          </div>
        ) : null}

        {!isTreeLoading && treeError ? (
          <div className="h-full w-full flex items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-center">
              <p className="text-sm text-rose-300">{treeError}</p>
              <button
                type="button"
                onClick={() => void loadTreeData()}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {!isTreeLoading && !treeError && members.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-center">
              <h3 className="text-lg font-semibold text-slate-100">No family members found.</h3>
              <p className="mt-2 text-sm text-slate-400">Start by adding the first member to build your family tree.</p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Add First Member
              </button>
            </div>
          </div>
        ) : null}

        {!isTreeLoading && !treeError && members.length > 0 ? (
          <FamilyTreeCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            focusedNodeId={focusedNodeId}
            onClearFocus={() => setFocusedNodeId(null)}
          />
        ) : null}
      </main>

      <FilterSidebar
        selectedGenerations={selectedGenerations}
        onChangeGenerations={setSelectedGenerations}
        selectedLocations={selectedLocations}
        onChangeLocations={setSelectedLocations}
        onResetFilters={handleResetFilters}
      />

      <ProfileModal
        member={selectedMember}
        displayId={selectedMember ? `#${memberRanks[selectedMember.id] ?? '?'}` : undefined}
        onClose={() => setSelectedMember(null)}
        onUpdate={handleUpdateMember}
        onDelete={handleDeleteMember}
      />

      <AnalyticsPanel
        members={members}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <TimelinePanel
        milestones={familyMilestones}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onSelectMember={(id) => {
          setIsTimelineOpen(false);
          handleSearchMatch(id);
        }}
      />

      <CreateMemberModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleAddMemberSave}
        members={members}
        unions={unions}
        memberRanks={memberRanks}
      />
    </div>
  );
}

/**
 * Tiny client-side router.
 * Uses the browser History API (pushState / popstate) so Back/Forward work.
 */
export default function App() {
  const [routePath, setRoutePath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: '/' | '/register' | '/login' | '/tree') => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setRoutePath(path);
    }
  };

  if (routePath === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (routePath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  if (routePath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (routePath === '/tree') {
    return (
      <ReactFlowProvider>
        <AppContent />
      </ReactFlowProvider>
    );
  }

  return <LandingPage onNavigate={navigate} />;
}
