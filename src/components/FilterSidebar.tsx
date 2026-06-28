import React, { useState } from 'react';
import { Filter, ChevronLeft, ChevronRight, MapPin, Layers, RefreshCw } from 'lucide-react';

interface FilterSidebarProps {
  selectedGenerations: number[];
  onChangeGenerations: (generations: number[]) => void;
  selectedLocations: string[];
  onChangeLocations: (locations: string[]) => void;
  onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedGenerations,
  onChangeGenerations,
  selectedLocations,
  onChangeLocations,
  onResetFilters
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const generations = [
    { label: '1st Gen (Grandparents)', val: 1 },
    { label: '2nd Gen (Parents / Uncle)', val: 2 },
    { label: '3rd Gen (Children / Me)', val: 3 },
    { label: '4th Gen (Grandchildren)', val: 4 }
  ];

  const locations = ['Kerala', 'Pune', 'Bengaluru'];

  const toggleGen = (val: number) => {
    if (selectedGenerations.includes(val)) {
      onChangeGenerations(selectedGenerations.filter((g) => g !== val));
    } else {
      onChangeGenerations([...selectedGenerations, val]);
    }
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      onChangeLocations(selectedLocations.filter((l) => l !== loc));
    } else {
      onChangeLocations([...selectedLocations, loc]);
    }
  };

  const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;

  return (
    <div
      className={`fixed top-24 left-4 z-30 transition-all duration-300 flex items-start gap-1`}
    >
      {/* Sidebar Panel */}
      <div
        className={`bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-64 ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-72 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-200">Interactive Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-emerald-400 font-medium tracking-wide uppercase transition-colors"
            >
              <RefreshCw size={10} />
              Reset
            </button>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Generation Filter */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <Layers size={12} className="text-emerald-500/80" />
              Generation
            </h4>
            <div className="space-y-1.5">
              {generations.map((g) => {
                const isActive = selectedGenerations.includes(g.val);
                return (
                  <button
                    key={g.val}
                    onClick={() => toggleGen(g.val)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all border flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{g.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-500/80" />
              Geographical Focus
            </h4>
            <div className="space-y-1.5">
              {locations.map((loc) => {
                const isActive = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    onClick={() => toggleLocation(loc)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all border flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{loc}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Legend */}
        <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-900 text-[10px] text-slate-500">
          <p className="leading-relaxed">
            * Selected filters dim unrelated family nodes. Select multiple to combine.
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-black/30"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
};
