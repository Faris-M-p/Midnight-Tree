/**
 * =============================================================================
 * FILE: src/components/FamilyTreeCanvas.tsx
 * ROLE: React Flow canvas wrapper for the family tree
 * =============================================================================
 * Receives already-positioned nodes + edges from App.tsx and only renders them.
 * Also handles:
 *   - zoom / pan controls
 *   - minimap
 *   - fitView when the tree changes
 *   - focusing/centering when search selects a member
 *
 * Custom types registered here:
 *   nodeTypes.memberCard / marriageNode
 *   edgeTypes.genealogy
 * =============================================================================
 */

import React, { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { MemberCard } from './MemberCard';
import { MarriageNode } from './MarriageNode';
import { GenealogyEdge } from './GenealogyEdge';
import { useTheme } from '../theme';

import '@xyflow/react/dist/style.css';

interface FamilyTreeCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  focusedNodeId: string | null;
  onClearFocus: () => void;
}

const nodeTypes = {
  memberCard: MemberCard,
  marriageNode: MarriageNode
};

const edgeTypes = {
  genealogy: GenealogyEdge
};

export const FamilyTreeCanvas: React.FC<FamilyTreeCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  focusedNodeId,
  onClearFocus
}) => {
  const { setCenter, fitView } = useReactFlow();
  const { theme } = useTheme();

  // Handle focus node transitions (real member only — never a ghost card)
  useEffect(() => {
    if (!focusedNodeId) return;

    const node = nodes.find((n) => {
      if (n.id !== focusedNodeId) return false;
      const data = n.data as { isGhost?: boolean } | undefined;
      return !data?.isGhost;
    });
    if (!node) return;

    const isMarriage = node.type === 'marriageNode';
    const offsetX = isMarriage ? 12 : 110;
    const offsetY = isMarriage ? 12 : 50;

    const panTimer = window.setTimeout(() => {
      setCenter(node.position.x + offsetX, node.position.y + offsetY, {
        zoom: 1.15,
        duration: 800
      });
    }, 40);

    const clearTimer = window.setTimeout(() => {
      onClearFocus();
    }, 1100);

    return () => {
      window.clearTimeout(panTimer);
      window.clearTimeout(clearTimer);
    };
  }, [focusedNodeId, nodes, setCenter, onClearFocus]);

  // Keep the full hierarchical tree framed whenever nodes change
  useEffect(() => {
    if (nodes.length === 0 || focusedNodeId) return;
    const timer = setTimeout(() => {
      fitView({ padding: 0.22, duration: 350 });
    }, 60);
    return () => clearTimeout(timer);
  }, [nodes, fitView, focusedNodeId]);

  return (
    <div className="w-full h-full relative" id="family-tree-canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.25}
        maxZoom={2.0}
        // Enable drag panning and zoom
        panOnScroll={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        className="w-full h-full"
      >
        {/* Emerald themed dot grid background */}
        <Background
          color={theme.colors.accent}
          gap={18}
          size={1}
          style={{ opacity: 0.15 }}
        />
        
        {/* Overlay Controls */}
        <Controls 
          showInteractive={false}
          position="bottom-left"
          className="!m-4"
        />
        
        {/* MiniMap for large canvas navigation */}
        <MiniMap 
          zoomable 
          pannable 
          position="bottom-right"
          className="!m-4 hidden md:block"
          nodeColor={(n) => {
            if (n.type === 'marriageNode') return theme.colors.accent;
            return theme.colors.surfaceHover;
          }}
          maskColor={theme.colors.overlay}
        />
      </ReactFlow>
    </div>
  );
};
