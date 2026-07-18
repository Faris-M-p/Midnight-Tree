import { useState, useEffect, useMemo } from 'react';
import { useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import type { FamilyMember, MarriageUnion, Milestone } from './types';

// Import Custom components
import { SearchHeader } from './components/SearchHeader';
import { FilterSidebar } from './components/FilterSidebar';
import { FamilyTreeCanvas } from './components/FamilyTreeCanvas';
import { ProfileModal } from './components/ProfileModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { CreateMemberModal } from './components/CreateMemberModal';
import type { MemberPlacement } from './components/CreateMemberModal';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ProtectedShellPage } from './pages/ProtectedShellPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { FamilyPage } from './pages/FamilyPage';
import { MembersPage } from './pages/MembersPage';
import { ApiClientError } from './services/apiClient';
import { getFamilyTreeData } from './services/treeService';

import '@xyflow/react/dist/style.css';

// ─────────────────────────────────────────────────────────────────
// DYNAMIC LAYOUT ALGORITHM
// ─────────────────────────────────────────────────────────────────
interface LayoutCoords {
  [id: string]: { x: number; y: number };
}

interface LayoutBlock {
  id: string;
  type: 'single' | 'union';
  memberId?: string;
  spouse1Id?: string;
  spouse2Id?: string;
  children: LayoutBlock[];
  width?: number;
}

function computeDynamicLayout(
  members: FamilyMember[],
  unions: MarriageUnion[]
): LayoutCoords {
  const coords: LayoutCoords = {};

  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 100;
  const HORIZONTAL_GAP = 80;
  const VERTICAL_GAP = 120;
  const SPOUSE_GAP = 120;
  const MARRIAGE_WIDTH = 24;
  const MARRIAGE_HEIGHT = 24;

  // Track parents
  const childToParentUnion = new Map<string, string>();
  unions.forEach((u) => {
    u.childrenIds.forEach((childId) => {
      childToParentUnion.set(childId, u.id);
    });
  });

  const processedMembers = new Set<string>();
  const processedUnions = new Set<string>();

  // Recursive block builder
  const buildBlockTree = (memberId: string): LayoutBlock => {
    if (processedMembers.has(memberId)) {
      return { id: memberId, type: 'single', memberId, children: [] };
    }
    processedMembers.add(memberId);

    const mainUnion = unions.find((u) => u.spouse1Id === memberId || u.spouse2Id === memberId);
    if (mainUnion) {
      processedUnions.add(mainUnion.id);
      processedMembers.add(mainUnion.spouse1Id);
      processedMembers.add(mainUnion.spouse2Id);

      const children = mainUnion.childrenIds
        .filter((childId) => !processedMembers.has(childId))
        .map((childId) => buildBlockTree(childId));

      return {
        id: mainUnion.id,
        type: 'union',
        spouse1Id: mainUnion.spouse1Id,
        spouse2Id: mainUnion.spouse2Id,
        children
      };
    } else {
      return {
        id: memberId,
        type: 'single',
        memberId,
        children: []
      };
    }
  };

  // Find all roots
  const rootMembers = members.filter((m) => !childToParentUnion.has(m.id));
  const rootBlocks: LayoutBlock[] = [];

  // 1. Build trees starting from roots
  rootMembers.forEach((m) => {
    if (processedMembers.has(m.id)) return;
    rootBlocks.push(buildBlockTree(m.id));
  });

  // 2. Safe fallback: Process remaining disconnected members
  members.forEach((m) => {
    if (processedMembers.has(m.id)) return;
    rootBlocks.push(buildBlockTree(m.id));
  });

  // Calculate block widths
  const computeWidth = (block: LayoutBlock): number => {
    if (block.type === 'single') {
      block.width = CARD_WIDTH + HORIZONTAL_GAP;
    } else {
      const childrenWidth = block.children.reduce((sum, child) => sum + computeWidth(child), 0);
      const selfWidth = CARD_WIDTH * 2 + SPOUSE_GAP + HORIZONTAL_GAP;
      block.width = Math.max(selfWidth, childrenWidth);
    }
    return block.width;
  };

  rootBlocks.forEach((b) => computeWidth(b));

  // Position blocks recursively
  const positionBlock = (block: LayoutBlock, leftX: number, level: number) => {
    const blockWidth = block.width || CARD_WIDTH + HORIZONTAL_GAP;
    const centerX = leftX + blockWidth / 2;
    const y = level * (CARD_HEIGHT + VERTICAL_GAP) + 60;

    if (block.type === 'single') {
      const memberId = block.memberId!;
      coords[memberId] = {
        x: centerX - CARD_WIDTH / 2,
        y
      };
    } else {
      const s1Id = block.spouse1Id!;
      const s2Id = block.spouse2Id!;

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

      if (block.children.length > 0) {
        const totalChildrenWidth = block.children.reduce((sum, child) => sum + (child.width || 0), 0);
        let childLeftX = centerX - totalChildrenWidth / 2;
        block.children.forEach((child) => {
          positionBlock(child, childLeftX, level + 1);
          childLeftX += child.width || 0;
        });
      }
    }
  };

  let currentX = 50;
  rootBlocks.forEach((block) => {
    positionBlock(block, currentX, 0);
    currentX += (block.width || 0) + HORIZONTAL_GAP;
  });

  return coords;
}

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Lifiting family tree states
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [unions, setUnions] = useState<MarriageUnion[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState('');

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

  const loadTreeData = async () => {
    setIsTreeLoading(true);
    setTreeError('');

    try {
      const data = await getFamilyTreeData();
      setMembers(data.members);
      setUnions(data.unions);
      setMilestones(data.milestones);
    } catch (error) {
      setMembers([]);
      setUnions([]);
      setMilestones([]);
      if (error instanceof ApiClientError) {
        setTreeError(
          error.statusCode >= 500
            ? 'Unable to load family tree right now. Please try again.'
            : error.message
        );
      } else {
        setTreeError('Unable to load family tree right now. Please try again.');
      }
    } finally {
      setIsTreeLoading(false);
    }
  };

  useEffect(() => {
    void loadTreeData();
  }, []);

  // Dynamic CRUD Operators
  const handleAddMemberSave = (
    memberData: Omit<FamilyMember, 'id'>,
    placement: MemberPlacement
  ) => {
    const newId = `member_${Date.now()}`;
    const newMember: FamilyMember = {
      ...memberData,
      id: newId
    };

    setMembers((prev) => [...prev, newMember]);

    if (placement.type === 'child') {
      setUnions((prev) =>
        prev.map((u) => {
          if (u.id === placement.targetId) {
            return {
              ...u,
              childrenIds: [...u.childrenIds, newId]
            };
          }
          return u;
        })
      );
    } else if (placement.type === 'spouse') {
      const newUnion: MarriageUnion = {
        id: `union_${placement.targetId}_${newId}`,
        spouse1Id: placement.targetId,
        spouse2Id: newId,
        childrenIds: []
      };
      setUnions((prev) => [...prev, newUnion]);
    }

    // Centering the new node
    setTimeout(() => {
      setFocusedNodeId(newId);
    }, 100);
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
          onSelect: (member: FamilyMember) => {
            setSelectedMember(member);
          },
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

      // Vertical descendants connectors
      const isCollapsed = collapsedUnions.includes(u.id);
      if (!isCollapsed) {
        u.childrenIds.forEach((childId) => {
          const childVisible = activeNodes.some((n) => n.id === childId);
          if (childVisible) {
            activeEdges.push({
              id: `e_child_${marriageNodeId}_to_${childId}`,
              source: marriageNodeId,
              target: childId,
              sourceHandle: 'bottom',
              targetHandle: 'top',
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 2.5 }
            });
          }
        });
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
              <p className="mt-2 text-sm text-slate-400">
                Start by adding the first member to build your family tree.
              </p>
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
        milestones={milestones}
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

type AppRoute =
  | '/'
  | '/register'
  | '/login'
  | '/dashboard'
  | '/family'
  | '/members'
  | '/timeline'
  | '/gallery'
  | '/analytics'
  | '/tree';

const protectedRoutes = new Set<AppRoute>([
  '/dashboard',
  '/family',
  '/members',
  '/timeline',
  '/gallery',
  '/analytics',
  '/tree'
]);

function AppRouter() {
  const { isAuthenticated, isLoading, currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [routePath, setRoutePath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: AppRoute) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setRoutePath(path);
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentPath = routePath as AppRoute;
    const isProtectedPath = protectedRoutes.has(currentPath);

    if (!isAuthenticated && isProtectedPath) {
      window.history.replaceState({}, '', '/login');
      setRoutePath('/login');
    }
  }, [isAuthenticated, isLoading, routePath]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && (routePath === '/login' || routePath === '/register')) {
      window.history.replaceState({}, '', '/dashboard');
      setRoutePath('/dashboard');
    }
  }, [isAuthenticated, isLoading, routePath]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    window.history.replaceState({}, '', '/login');
    setRoutePath('/login');
    setIsLoggingOut(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        <div className="inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <span className="text-sm">Restoring session...</span>
        </div>
      </div>
    );
  }

  if (routePath === '/') {
    return (
      <LandingPage
        onNavigate={navigate}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  if (routePath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (routePath === '/dashboard') {
    return (
      <DashboardPage
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/family') {
    return (
      <FamilyPage
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/members') {
    return (
      <MembersPage
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/timeline') {
    return (
      <ProtectedShellPage
        title="Timeline"
        description="Timeline module is protected and ready for your authenticated data."
        currentPath="/timeline"
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/gallery') {
    return (
      <ProtectedShellPage
        title="Gallery"
        description="Gallery module is protected and ready for implementation."
        currentPath="/gallery"
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/analytics') {
    return (
      <ProtectedShellPage
        title="Analytics"
        description="Analytics module is protected and prepared for upcoming integrations."
        currentPath="/analytics"
        onNavigate={navigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  if (routePath === '/tree') {
    return (
      <ReactFlowProvider>
        <AppContent />
      </ReactFlowProvider>
    );
  }

  return (
    <LandingPage
      onNavigate={navigate}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
