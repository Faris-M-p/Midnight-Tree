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

export const FamilyTreeCanvas: React.FC<FamilyTreeCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  focusedNodeId,
  onClearFocus
}) => {
  const { setCenter } = useReactFlow();

  // Handle focus node transitions
  useEffect(() => {
    if (!focusedNodeId) return;

    const node = nodes.find((n) => n.id === focusedNodeId);
    if (!node) return;

    // Node coordinates are based on top-left. Let's center on the card.
    // For MemberCard (width=220, height=100), center is offset by +110, +50
    // For MarriageNode (width=24, height=24), center is offset by +12, +12
    const isMarriage = node.type === 'marriageNode';
    const offsetX = isMarriage ? 12 : 110;
    const offsetY = isMarriage ? 12 : 50;

    setCenter(node.position.x + offsetX, node.position.y + offsetY, {
      zoom: 1.15,
      duration: 800
    });

    // Reset focused node state after panning completes
    const timer = setTimeout(() => {
      onClearFocus();
    }, 1000);

    return () => clearTimeout(timer);
  }, [focusedNodeId, nodes, setCenter, onClearFocus]);

  // Handle initial viewport center for mobile vs desktop
  const handleInit = () => {
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Root marriage node center: x = 455, y = 110 (Ramesh & Savita midpoint)
        setCenter(455, 110, { zoom: 0.9, duration: 0 });
      } else {
        // Center of the entire graph layout
        setCenter(455, 330, { zoom: 1.0, duration: 0 });
      }
    }, 100);
  };

  return (
    <div className="w-full h-full relative" id="family-tree-canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={handleInit}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
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
          color="#10b981"
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
            if (n.type === 'marriageNode') return '#10b981';
            return '#1f2937';
          }}
          maskColor="rgba(3, 7, 18, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
