/**
 * =============================================================================
 * FILE: src/components/TimelinePanel.tsx
 * ROLE: Family history / milestones drawer
 * =============================================================================
 * Shows chronological events; clicking an event can focus that member on the tree.
 * =============================================================================
 */

import React, { useState } from 'react';
import { X, Calendar, GraduationCap, Briefcase, Heart, PlusCircle } from 'lucide-react';
import type { Milestone } from '../types';

interface TimelinePanelProps {
  milestones: Milestone[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  milestones,
  isOpen,
  onClose,
  onSelectMember
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Sort milestones chronologically
  const sortedMilestones = [...milestones].sort((a, b) => a.year - b.year);

  // Filter milestones by category
  const filteredMilestones =
    filterCategory === 'all'
      ? sortedMilestones
      : sortedMilestones.filter((m) => m.category === filterCategory);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'birth':
        return {
          icon: <PlusCircle size={14} className="text-blue-400" />,
          bgColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dotColor: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
        };
      case 'marriage':
        return {
          icon: <Heart size={14} className="text-pink-400" />,
          bgColor: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
          dotColor: 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
        };
      case 'education':
        return {
          icon: <GraduationCap size={14} className="text-purple-400" />,
          bgColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dotColor: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
        };
      case 'career':
        return {
          icon: <Briefcase size={14} className="text-amber-400" />,
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
        };
      default:
        return {
          icon: <Calendar size={14} className="text-slate-400" />,
          bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dotColor: 'bg-slate-500'
        };
    }
  };

  const categories = [
    { label: 'All Events', val: 'all' },
    { label: 'Births', val: 'birth' },
    { label: 'Marriages', val: 'marriage' },
    { label: 'Education', val: 'education' },
    { label: 'Careers', val: 'career' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <Calendar className="text-emerald-500" size={18} />
          <h3 className="font-serif font-bold text-lg text-slate-100">Historical Timeline</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-850 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Category Filter row */}
      <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-900 flex gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.val}
            onClick={() => setFilterCategory(cat.val)}
            className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 transition-colors cursor-pointer ${
              filterCategory === cat.val
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline Scroll Box */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 relative">
        {filteredMilestones.length > 0 ? (
          <div className="relative">
            {/* Center connector line */}
            <div className="absolute left-[11px] top-1 bottom-1 w-0.5 border-l-2 border-slate-800 border-dashed"></div>

            {/* Milestones list */}
            <div className="space-y-8">
              {filteredMilestones.map((m) => {
                const styles = getCategoryStyles(m.category);
                return (
                  <div key={m.id} className="relative flex items-start gap-6 group">
                    {/* Node marker dot */}
                    <div
                      className={`absolute left-[6px] top-1.5 w-3 h-3 rounded-full z-10 transition-transform duration-300 group-hover:scale-125 ${styles.dotColor}`}
                    />

                    {/* Content block */}
                    <div className="pl-6 flex-1 min-w-0">
                      {/* Year and Category Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-emerald-400">
                          {m.year}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider flex items-center gap-1 ${styles.bgColor}`}
                        >
                          {styles.icon}
                          {m.category}
                        </span>
                      </div>

                      {/* Milestone Title */}
                      <h4 className="text-sm font-semibold text-slate-200 mt-1 leading-snug">
                        {m.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-light">
                        {m.description}
                      </p>

                      {/* Associated Relative Anchor */}
                      <button
                        onClick={() => {
                          // Extract member ID (could be a couple split by & but take first, or just memberId)
                          onSelectMember(m.memberId);
                        }}
                        className="text-[10px] text-emerald-500 hover:text-emerald-400 font-medium underline mt-2 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Locate relative: {m.memberName}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <Calendar size={32} className="text-slate-700 mb-2" />
            <p className="text-sm">No milestones match the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
