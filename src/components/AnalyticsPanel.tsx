/**
 * =============================================================================
 * FILE: src/components/AnalyticsPanel.tsx
 * ROLE: Right-side family statistics panel
 * =============================================================================
 * Currently computes simple counts from the in-memory members array.
 * =============================================================================
 */

import React from 'react';
import { X, Users, Compass, ShieldAlert, Award } from 'lucide-react';
import type { FamilyMember } from '../types';

interface AnalyticsPanelProps {
  members: FamilyMember[];
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ members, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Calculate metrics
  const totalCount = members.length;
  
  const maleCount = members.filter((m) => m.gender === 'male').length;
  const femaleCount = members.filter((m) => m.gender === 'female').length;
  
  const genCounts = members.reduce((acc, m) => {
    let gen = 4;
    if (m.relation.includes('Grandfather') || m.relation.includes('Grandmother')) gen = 1;
    else if (m.relation.includes('Father') || m.relation.includes('Mother') || m.relation.includes('Uncle')) gen = 2;
    else if (m.relation.includes('Me') || m.relation.includes('Brother') || m.relation.includes('Sister')) gen = 3;
    acc[gen] = (acc[gen] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const locations = members.reduce((acc, m) => {
    acc[m.location] = (acc[m.location] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const professions = members.reduce((acc, m) => {
    // Exclude toddler/infants or clean them
    if (m.profession === 'Toddler' || m.profession === 'Infant') return acc;
    acc[m.profession] = (acc[m.profession] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <Users className="text-emerald-500" size={18} />
          <h3 className="font-serif font-bold text-lg text-slate-100">Family Analytics</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-850 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Core Count Metrics Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Total Members</h4>
            <p className="text-4xl font-extrabold text-emerald-400">{totalCount}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Generations</h4>
            <p className="text-4xl font-extrabold text-teal-400">4</p>
          </div>
        </div>

        {/* Gender Distribution Section */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Compass size={14} className="text-emerald-500" />
            Gender Distribution
          </h4>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                Male ({maleCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-pink-500"></span>
                Female ({femaleCount})
              </span>
            </div>
            
            {/* Split Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${(maleCount / totalCount) * 100}%` }}
              />
              <div 
                className="bg-pink-500 h-full transition-all duration-500" 
                style={{ width: `${(femaleCount / totalCount) * 100}%` }}
              />
            </div>
            
            <div className="text-center text-[10px] text-slate-500">
              Split: {Math.round((maleCount / totalCount) * 100)}% Male / {Math.round((femaleCount / totalCount) * 100)}% Female
            </div>
          </div>
        </div>

        {/* Geographical Hubs Section */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Compass size={14} className="text-emerald-500" />
            Geographical Hubs
          </h4>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
            {Object.entries(locations).map(([loc, count]) => {
              const percentage = (count / totalCount) * 100;
              return (
                <div key={loc} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{loc}</span>
                    <span className="text-slate-400">{count} {count === 1 ? 'member' : 'members'} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generational Distribution Section */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-emerald-500" />
            Generational Breakdown
          </h4>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
            {[1, 2, 3, 4].map((gen) => {
              const count = genCounts[gen] || 0;
              const percentage = (count / totalCount) * 100;
              const getGenLabel = (g: number) => {
                if (g === 1) return 'Gen 1: Grandparents';
                if (g === 2) return 'Gen 2: Parents & Uncles';
                if (g === 3) return 'Gen 3: Siblings & Self';
                return 'Gen 4: Grandchildren';
              };
              return (
                <div key={gen} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{getGenLabel(gen)}</span>
                    <span className="text-slate-400">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Fields Section */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Award size={14} className="text-emerald-500" />
            Professional Backgrounds
          </h4>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            {Object.entries(professions).map(([prof, count]) => (
              <div 
                key={prof} 
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900/50 last:border-0"
              >
                <span className="text-slate-300 truncate mr-2">{prof}</span>
                <span className="text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {count} {count === 1 ? 'person' : 'people'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
