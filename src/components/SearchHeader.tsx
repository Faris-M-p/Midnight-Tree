/**
 * =============================================================================
 * FILE: src/components/SearchHeader.tsx
 * ROLE: Top toolbar on the Family Tree screen
 * =============================================================================
 * Search relatives, open analytics / timeline, add member, export PNG.
 * =============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, BarChart3, Clock, Download, X, UserPlus, HeartHandshake } from 'lucide-react';
import type { FamilyMember } from '../types';
import { canCreateMember, canEdit } from '../auth/permissions';

interface SearchHeaderProps {
  members: FamilyMember[];
  onSearchMatch: (memberId: string) => void;
  onOpenAnalytics: () => void;
  onOpenTimeline: () => void;
  onExportPNG: () => void;
  onAddMember: () => void;
  onMapSpouse?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  members,
  onSearchMatch,
  onOpenAnalytics,
  onOpenTimeline,
  onExportPNG,
  onAddMember,
  onMapSpouse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FamilyMember[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const showAddMember = canCreateMember();
  const showMapSpouse = Boolean(onMapSpouse) && canEdit();

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.nickname || '').toLowerCase().includes(query) ||
        m.relation.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.profession.toLowerCase().includes(query)
    );
    setSuggestions(filtered);
  }, [searchQuery, members]);

  // Click outside listener to close search autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (memberId: string) => {
    onSearchMatch(memberId);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-header/80 backdrop-blur-md border-b border-edge px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Title / Identity */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="font-serif font-bold text-slate-950 text-xl">M</span>
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-100 m-0 leading-none">
            Mehta Lineage
          </h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase mt-1 leading-none">
            Family Chronicle
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="relative" ref={containerRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search relative, role, or location..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestion Dropdown Panel */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {suggestions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className="px-4 py-3 hover:bg-slate-800/60 border-b border-slate-900/50 last:border-b-0 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-200 truncate">{m.name}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-slate-400 font-medium">
                        {m.relation}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {m.profession} &bull; {m.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOpen && searchQuery.trim() && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-center text-slate-500 text-sm">
              No relatives match your search.
            </div>
          )}
        </div>
      </div>

      {/* Right Controls (Add Member, Dashboard, Timeline, PDF export) */}
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
        {showAddMember ? (
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
            title="Add Family Member"
          >
            <UserPlus size={14} className="text-emerald-500" />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        ) : null}

        {showMapSpouse ? (
          <button
            onClick={onMapSpouse}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
            title="Map Existing Members as Spouses"
          >
            <HeartHandshake size={14} className="text-emerald-500" />
            <span className="hidden sm:inline">Map Spouse</span>
          </button>
        ) : null}

        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
          title="Family Analytics"
        >
          <BarChart3 size={14} className="text-emerald-500" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        <button
          onClick={onOpenTimeline}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-slate-100 text-xs font-medium transition-all cursor-pointer"
          title="Historical Timeline"
        >
          <Clock size={14} className="text-emerald-500" />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        <button
          onClick={onExportPNG}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          title="Download Canvas"
        >
          <Download size={14} />
          <span>Export Tree</span>
        </button>
      </div>
    </header>
  );
};
