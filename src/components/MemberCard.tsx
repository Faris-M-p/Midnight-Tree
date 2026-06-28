import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FamilyMember } from '../types';

interface MemberCardProps {
  data: {
    member: FamilyMember;
    onSelect: (member: FamilyMember) => void;
    isDimmed?: boolean;
    isHighlighted?: boolean;
    displayId?: string;
  };
}

export const MemberCard: React.FC<MemberCardProps> = ({ data }) => {
  const { member, onSelect, isDimmed, isHighlighted, displayId } = data;

  // Set colors based on relationship
  const getBadgeStyles = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'me':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'father':
      case 'mother':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'grandfather':
      case 'grandmother':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'brother':
      case 'sister-in-law':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'uncle':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(member)}
      className={`
        w-[220px] h-[100px] rounded-xl bg-slate-900 border text-left p-3 cursor-pointer select-none transition-all duration-300 flex items-center gap-3
        ${
          isHighlighted
            ? 'border-emerald-400 ring-4 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 bg-slate-800'
            : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-[0_4px_15px_rgba(16,185,129,0.1)] hover:scale-[1.02]'
        }
        ${isDimmed ? 'opacity-30 filter grayscale duration-500' : 'opacity-100'}
      `}
    >
      {/* Node Handles */}
      {/* Top Handle (input connection for children) */}
      {member.relation !== 'Grandfather' && member.relation !== 'Grandmother' && (
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!bg-emerald-500 !border-slate-900 !w-2.5 !h-2.5"
        />
      )}

      {/* Right Handle (for connecting to marriage node on the right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!opacity-0 !w-0 !h-0"
      />

      {/* Left Handle (for connecting from marriage node on the left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!opacity-0 !w-0 !h-0"
      />

      {/* Avatar Container with glowing ring offset */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors duration-300">
          <img
            src={member.avatar}
            alt={member.name}
            className={`w-full h-full object-cover ${member.isDeceased ? 'grayscale' : ''}`}
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-110 pointer-events-none animate-pulse"></div>
      </div>

      {/* Member Metadata Info */}
      <div className="min-w-0 flex flex-col justify-center gap-1">
        <h3 className="font-serif font-semibold text-slate-100 text-sm tracking-wide leading-tight truncate flex items-center gap-1.5">
          {displayId && <span className="text-emerald-400 font-sans text-xs font-bold shrink-0">{displayId}</span>}
          <span className="truncate">{member.name}</span>
          {member.isDeceased && (
            <span 
              className="w-2 h-2 rounded-full bg-red-500 border border-red-400 shrink-0 inline-block animate-pulse" 
              title="Deceased" 
            />
          )}
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${getBadgeStyles(member.relation)}`}>
            {member.relation}
          </span>
        </div>
      </div>
    </div>
  );
};
