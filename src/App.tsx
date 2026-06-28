import { useState, useEffect } from 'react';
import { useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

import { familyMembers, marriageUnions, familyMilestones, layoutCoordinates } from './mockData';
import type { FamilyMember } from './types';

// Import Custom components
import { SearchHeader } from './components/SearchHeader';
import { FilterSidebar } from './components/FilterSidebar';
import { FamilyTreeCanvas } from './components/FamilyTreeCanvas';
import { ProfileModal } from './components/ProfileModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { TimelinePanel } from './components/TimelinePanel';

import '@xyflow/react/dist/style.css';

// Helper: Determine generation level of a member
const getGenOfMember = (id: string): number => {
  if (['ramesh', 'savita'].includes(id)) return 1;
  if (['suresh', 'rajesh', 'kavita'].includes(id)) return 2;
  if (['amit', 'pooja', 'rahul'].includes(id)) return 3;
  return 4; // aarav, ananya
};

// Helper: Recursively get all descendant nodes to collapse
const getHiddenEntities = (collapsedIds: string[]) => {
  const hiddenNodeIds = new Set<string>();

  const recurseCollapse = (unionId: string) => {
    const union = marriageUnions.find((u) => u.id === unionId);
    if (!union) return;

    union.childrenIds.forEach((childId) => {
      hiddenNodeIds.add(childId);

      // If child has a marriage union, hide their marriage node, spouse, and descendants
      const childUnions = marriageUnions.filter(
        (u) => u.spouse1Id === childId || u.spouse2Id === childId
      );
      
      childUnions.forEach((childUnion) => {
        // Node ID for marriage node matches mapping `m_spouse1_spouse2`
        const mNodeId = `m_${childUnion.spouse1Id}_${childUnion.spouse2Id}`;
        hiddenNodeIds.add(mNodeId);

        // Hide spouse
        const spouseId = childUnion.spouse1Id === childId ? childUnion.spouse2Id : childUnion.spouse1Id;
        hiddenNodeIds.add(spouseId);

        // Recurse children
        recurseCollapse(childUnion.id);
      });
    });
  };

  collapsedIds.forEach((unionId) => {
    recurseCollapse(unionId);
  });

  return hiddenNodeIds;
};

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Visibility states
  const [collapsedUnions, setCollapsedUnions] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Panels and Modals
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Focus and Highlight relative triggers
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);

  // Toggle child expansion of a spouse union
  const toggleUnion = (unionId: string) => {
    setCollapsedUnions((prev) =>
      prev.includes(unionId) ? prev.filter((id) => id !== unionId) : [...prev, unionId]
    );
  };

  // Recalculate nodes and edges when states mutate
  useEffect(() => {
    const hiddenNodeIds = getHiddenEntities(collapsedUnions);
    const activeNodes: any[] = [];
    const activeEdges: any[] = [];

    // 1. Populate Family Member Cards
    familyMembers.forEach((m) => {
      if (hiddenNodeIds.has(m.id)) return;

      const matchesGen = selectedGenerations.length === 0 || selectedGenerations.includes(getGenOfMember(m.id));
      const matchesLoc = selectedLocations.length === 0 || selectedLocations.includes(m.location);
      const isMatched = matchesGen && matchesLoc;

      const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;
      const isDimmed = hasActiveFilters && !isMatched;

      activeNodes.push({
        id: m.id,
        type: 'memberCard',
        position: layoutCoordinates[m.id],
        draggable: false,
        data: {
          member: m,
          onSelect: (member: FamilyMember) => {
            setSelectedMember(member);
          },
          isDimmed,
          isHighlighted: highlightedMemberId === m.id
        }
      });
    });

    // 2. Populate Marriage Junction Nodes
    marriageUnions.forEach((u) => {
      const marriageNodeId = `m_${u.spouse1Id}_${u.spouse2Id}`;
      if (hiddenNodeIds.has(marriageNodeId)) return;

      const spouse1 = familyMembers.find((m) => m.id === u.spouse1Id);
      const spouse2 = familyMembers.find((m) => m.id === u.spouse2Id);

      const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;
      let isDimmed = false;

      if (hasActiveFilters && spouse1 && spouse2) {
        const matchesGen1 = selectedGenerations.length === 0 || selectedGenerations.includes(getGenOfMember(spouse1.id));
        const matchesLoc1 = selectedLocations.length === 0 || selectedLocations.includes(spouse1.location);
        const isMatched1 = matchesGen1 && matchesLoc1;

        const matchesGen2 = selectedGenerations.length === 0 || selectedGenerations.includes(getGenOfMember(spouse2.id));
        const matchesLoc2 = selectedLocations.length === 0 || selectedLocations.includes(spouse2.location);
        const isMatched2 = matchesGen2 && matchesLoc2;

        isDimmed = !isMatched1 && !isMatched2;
      }

      activeNodes.push({
        id: marriageNodeId,
        type: 'marriageNode',
        position: layoutCoordinates[marriageNodeId],
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
    marriageUnions.forEach((u) => {
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
  }, [collapsedUnions, selectedGenerations, selectedLocations, highlightedMemberId]);

  // Center view on search match and flash target node
  const handleSearchMatch = (memberId: string) => {
    // 1. Locate node
    setFocusedNodeId(memberId);
    setHighlightedMemberId(memberId);

    // 2. Spritz green confetti for target found feedback
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#8b5cf6']
    });

    // 3. Keep highlighted for 3 seconds
    setTimeout(() => {
      setHighlightedMemberId((current) => (current === memberId ? null : current));
    }, 3000);
  };

  const handleResetFilters = () => {
    setSelectedGenerations([]);
    setSelectedLocations([]);
  };

  // High-Resolution PNG Canvas Export
  const handleExportPNG = () => {
    const wrapper = document.getElementById('family-tree-canvas-wrapper');
    const flowElement = wrapper?.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    // Temporarily hide panel overlays for a clean export
    const overlays = document.querySelectorAll('.react-flow__panel, header, .fixed');
    overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'hidden'));

    toPng(flowElement, {
      backgroundColor: '#030712',
      quality: 0.98,
      pixelRatio: 2 // 2x density export
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mehta-family-tree.png';
        link.href = dataUrl;
        link.click();
        
        // Restore overlays
        overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'visible'));
      })
      .catch((error) => {
        console.error('Export failed:', error);
        overlays.forEach((el) => ((el as HTMLElement).style.visibility = 'visible'));
      });
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative select-none">
      {/* Autocomplete Search Header */}
      <SearchHeader
        members={familyMembers}
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
      />

      {/* Main interactive tree workspace */}
      <main className="flex-1 w-full h-full pt-20 relative">
        <FamilyTreeCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          focusedNodeId={focusedNodeId}
          onClearFocus={() => setFocusedNodeId(null)}
        />
      </main>

      {/* Filters Overlay on Left */}
      <FilterSidebar
        selectedGenerations={selectedGenerations}
        onChangeGenerations={setSelectedGenerations}
        selectedLocations={selectedLocations}
        onChangeLocations={setSelectedLocations}
        onResetFilters={handleResetFilters}
      />

      {/* Floating Detailed Profile Modal */}
      <ProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      {/* Slider Analytics Sidebar Panel */}
      <AnalyticsPanel
        members={familyMembers}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Slider Milestone Timeline Panel */}
      <TimelinePanel
        milestones={familyMilestones}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onSelectMember={(id) => {
          setIsTimelineOpen(false); // Close drawer to make space
          handleSearchMatch(id);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
