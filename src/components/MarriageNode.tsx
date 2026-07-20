/**
 * =============================================================================
 * FILE: src/components/MarriageNode.tsx
 * ROLE: Small circle between two spouses on the tree
 * =============================================================================
 * Acts as the "junction" for:
 *   - dashed horizontal spouse connectors
 *   - solid vertical child connectors (from bottom handle)
 *   - expand / collapse children (+ / −)
 * =============================================================================
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface MarriageNodeProps {
  data: {
    collapsed: boolean;
    onToggle: () => void;
    hasChildren: boolean;
    isDimmed?: boolean;
  };
}

export const MarriageNode: React.FC<MarriageNodeProps> = ({ data }) => {
  const { collapsed, onToggle, hasChildren, isDimmed } = data;

  return (
    <div
      className={`
        w-6 h-6 rounded-full flex items-center justify-center select-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] border transition-all duration-300
        ${isDimmed ? 'opacity-30 filter grayscale duration-500' : 'opacity-100'}
        ${
          hasChildren
            ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 cursor-pointer text-slate-950 hover:scale-110 active:scale-95'
            : 'bg-slate-800 border-slate-700 text-slate-400 cursor-default'
        }
      `}
      onClick={(e) => {
        // Prevent event propagation so clicking the marriage node doesn't trigger canvas click events
        e.stopPropagation();
        if (hasChildren) {
          onToggle();
        }
      }}
    >
      {/* Invisible routing handles for connection lines */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!opacity-0 !w-0 !h-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!opacity-0 !w-0 !h-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!opacity-0 !w-0 !h-0"
      />
      
      {/* Bottom handle to connect to children's top handle */}
      {hasChildren && !collapsed && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-emerald-500 !border-slate-900 !w-2.5 !h-2.5"
        />
      )}

      {/* Expansion Indicator Text (+ or −) */}
      {hasChildren ? (
        <span className="text-[14px] font-bold leading-none select-none">
          {collapsed ? '+' : '−'}
        </span>
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
      )}
    </div>
  );
};
