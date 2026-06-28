import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, RefreshCw, Layers, MapPin, X } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Dropdown states
  const [genOpen, setGenOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  const genRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);

  // Handle window resizing to detect mobile viewports
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsDesktopExpanded(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genRef.current && !genRef.current.contains(event.target as Node)) {
        setGenOpen(false);
      }
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setLocOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getGenLabel = () => {
    if (selectedGenerations.length === 0) return 'All Generations';
    if (selectedGenerations.length === 1) {
      const match = generations.find((g) => g.val === selectedGenerations[0]);
      return match ? match.label : '1 Selected';
    }
    return `Generations (${selectedGenerations.length})`;
  };

  const getLocLabel = () => {
    if (selectedLocations.length === 0) return 'All Locations';
    if (selectedLocations.length === 1) return selectedLocations[0];
    return `Locations (${selectedLocations.length})`;
  };

  const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;

  // Render Mobile Bottom Sheet view
  if (isMobile) {
    return (
      <>
        {/* Floating Pills Filter FAB trigger */}
        <div className="fixed top-[180px] left-4 z-30">
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition-all text-xs font-semibold cursor-pointer ${
              hasActiveFilters
                ? 'bg-emerald-600 border-emerald-500 text-slate-950'
                : 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-300'
            }`}
          >
            <Filter size={13} className={hasActiveFilters ? 'fill-slate-950' : ''} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Bottom Sheet Modal backdrop overlay */}
        {isBottomSheetOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setIsBottomSheetOpen(false)}
          />
        )}

        {/* Slide-up Bottom Sheet Panel container */}
        <div
          className={`fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl z-55 px-5 pt-3 pb-8 space-y-5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 transform ${
            isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag Handle indicator */}
          <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-2"></div>

          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-slate-100">Filters</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setIsBottomSheetOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-wider font-semibold cursor-pointer"
              >
                <RefreshCw size={11} />
                Clear
              </button>
            )}
          </div>

          {/* Stacking Dropdowns inside Bottom Sheet */}
          <div className="space-y-4">
            
            {/* Gen Select */}
            <div className="space-y-1.5" ref={genRef}>
              <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <Layers size={11} className="text-emerald-500/80" />
                Generation
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGenOpen(!genOpen);
                    setLocOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-left"
                >
                  <span className="truncate">{getGenLabel()}</span>
                  <ChevronDown size={12} className={`text-slate-500 transition-transform ${genOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {genOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-55 p-1.5 space-y-0.5 max-h-40 overflow-y-auto">
                    {generations.map((g) => {
                      const isActive = selectedGenerations.includes(g.val);
                      return (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => toggleGen(g.val)}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          <span>{g.label}</span>
                          <input type="checkbox" checked={isActive} readOnly className="accent-emerald-500 pointer-events-none w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Location Select */}
            <div className="space-y-1.5" ref={locRef}>
              <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-500/80" />
                Geographical Focus
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLocOpen(!locOpen);
                    setGenOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl bg-slate-955 border border-slate-850 text-slate-300 text-left"
                >
                  <span className="truncate">{getLocLabel()}</span>
                  <ChevronDown size={12} className={`text-slate-500 transition-transform ${locOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {locOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-55 p-1.5 space-y-0.5">
                    {locations.map((loc) => {
                      const isActive = selectedLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleLocation(loc)}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          <span>{loc}</span>
                          <input type="checkbox" checked={isActive} readOnly className="accent-emerald-500 pointer-events-none w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Primary Call to Action Button */}
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(false)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md cursor-pointer text-center"
          >
            Apply Filters
          </button>
        </div>
      </>
    );
  }

  // Render Desktop panel view
  return (
    <div className="fixed top-24 left-4 z-30 flex items-start gap-2">
      {isDesktopExpanded ? (
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-xl shadow-2xl w-56 p-3.5 space-y-4 animate-in fade-in slide-in-from-left duration-200">
          
          {/* Header row with Title and Close Trigger */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-emerald-500" />
              <h3 className="font-semibold text-xs text-slate-200">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-[9px] text-slate-500 hover:text-emerald-400 font-bold uppercase transition-colors cursor-pointer"
                  title="Clear all active filters"
                >
                  <RefreshCw size={9} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsDesktopExpanded(false);
                  setGenOpen(false);
                  setLocOpen(false);
                }}
                className="p-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="Collapse sidebar panel"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          {/* Stacking Dropdowns */}
          <div className="space-y-3">
            
            {/* Gen select dropdown */}
            <div className="space-y-1" ref={genRef}>
              <h4 className="text-[9px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Layers size={10} className="text-emerald-500/70" />
                Generation
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGenOpen(!genOpen);
                    setLocOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border text-slate-350 hover:text-slate-200 transition-all text-left cursor-pointer ${
                    genOpen || selectedGenerations.length > 0 ? 'border-emerald-500/35 ring-1 ring-emerald-500/10' : 'border-slate-800'
                  }`}
                >
                  <span className="truncate">{getGenLabel()}</span>
                  <ChevronDown size={11} className={`text-slate-500 transition-transform ${genOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {genOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-850 rounded-lg shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    {generations.map((g) => {
                      const isActive = selectedGenerations.includes(g.val);
                      return (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => toggleGen(g.val)}
                          className={`w-full text-left text-[11px] px-2 py-1 rounded flex items-center justify-between cursor-pointer ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-250'
                          }`}
                        >
                          <span>{g.label}</span>
                          <input type="checkbox" checked={isActive} readOnly className="w-3 h-3 rounded accent-emerald-500 pointer-events-none" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Location select dropdown */}
            <div className="space-y-1" ref={locRef}>
              <h4 className="text-[9px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <MapPin size={10} className="text-emerald-500/70" />
                Location
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLocOpen(!locOpen);
                    setGenOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border text-slate-350 hover:text-slate-200 transition-all text-left cursor-pointer ${
                    locOpen || selectedLocations.length > 0 ? 'border-emerald-500/35 ring-1 ring-emerald-500/10' : 'border-slate-800'
                  }`}
                >
                  <span className="truncate">{getLocLabel()}</span>
                  <ChevronDown size={11} className={`text-slate-500 transition-transform ${locOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {locOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-850 rounded-lg shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    {locations.map((loc) => {
                      const isActive = selectedLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleLocation(loc)}
                          className={`w-full text-left text-[11px] px-2 py-1 rounded flex items-center justify-between cursor-pointer ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-250'
                          }`}
                        >
                          <span>{loc}</span>
                          <input type="checkbox" checked={isActive} readOnly className="w-3 h-3 rounded accent-emerald-500 pointer-events-none" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Slim floating Filters toggle tab */
        <button
          type="button"
          onClick={() => setIsDesktopExpanded(true)}
          className={`flex items-center gap-2 px-3 py-2 bg-slate-950 border rounded-xl text-xs transition-all shadow-xl cursor-pointer ${
            hasActiveFilters
              ? 'bg-emerald-600 border-emerald-500 text-slate-950 font-bold'
              : 'border-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-800'
          }`}
          title="Expand filters panel"
        >
          <Filter size={13} className={hasActiveFilters ? 'fill-slate-950' : ''} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
          )}
        </button>
      )}
    </div>
  );
};
