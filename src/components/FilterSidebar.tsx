/**
 * =============================================================================
 * FILE: src/components/FilterSidebar.tsx
 * ROLE: Family Tree generation + location filters
 * =============================================================================
 * Lives inside the Family Tree page (not viewport-fixed over the app sidebar).
 * Desktop: in-flow left column. Mobile: bottom sheet over the tree canvas.
 * =============================================================================
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Filter, Layers, MapPin, RefreshCw, X } from "lucide-react";

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  selectedGenerations: number[];
  onChangeGenerations: (generations: number[]) => void;
  selectedLocations: string[];
  onChangeLocations: (locations: string[]) => void;
  onResetFilters: () => void;
}

const GENERATIONS = [
  { label: "1st Gen (Grandparents)", val: 1 },
  { label: "2nd Gen (Parents / Uncle)", val: 2 },
  { label: "3rd Gen (Children / Me)", val: 3 },
  { label: "4th Gen (Grandchildren)", val: 4 }
];

const LOCATIONS = ["Kerala", "Pune", "Bengaluru"];

export function FilterSidebar({
  open,
  onClose,
  selectedGenerations,
  onChangeGenerations,
  selectedLocations,
  onChangeLocations,
  onResetFilters
}: FilterSidebarProps) {
  const [genOpen, setGenOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const genRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setGenOpen(false);
      setLocOpen(false);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genRef.current && !genRef.current.contains(event.target as Node)) setGenOpen(false);
      if (locRef.current && !locRef.current.contains(event.target as Node)) setLocOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGen = (val: number) => {
    onChangeGenerations(
      selectedGenerations.includes(val)
        ? selectedGenerations.filter((g) => g !== val)
        : [...selectedGenerations, val]
    );
  };

  const toggleLocation = (loc: string) => {
    onChangeLocations(
      selectedLocations.includes(loc) ? selectedLocations.filter((l) => l !== loc) : [...selectedLocations, loc]
    );
  };

  const genLabel =
    selectedGenerations.length === 0
      ? "All Generations"
      : selectedGenerations.length === 1
        ? (GENERATIONS.find((g) => g.val === selectedGenerations[0])?.label ?? "1 Selected")
        : `Generations (${selectedGenerations.length})`;

  const locLabel =
    selectedLocations.length === 0
      ? "All Locations"
      : selectedLocations.length === 1
        ? selectedLocations[0]
        : `Locations (${selectedLocations.length})`;

  const hasActiveFilters = selectedGenerations.length > 0 || selectedLocations.length > 0;

  const fields = (dropdownUp: boolean) => (
    <div className="space-y-3">
      <div className="space-y-1" ref={genRef}>
        <h4 className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Layers size={11} className="text-emerald-500/80" />
          Generation
        </h4>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setGenOpen((v) => !v);
              setLocOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg border bg-slate-900 px-2.5 py-2 text-left text-xs text-slate-300 ${
              genOpen || selectedGenerations.length > 0
                ? "border-emerald-500/35 ring-1 ring-emerald-500/10"
                : "border-slate-800"
            }`}
          >
            <span className="truncate">{genLabel}</span>
            <ChevronDown size={12} className={`text-slate-500 transition-transform ${genOpen ? "rotate-180 text-emerald-400" : ""}`} />
          </button>
          {genOpen ? (
            <div
              className={`absolute left-0 right-0 z-20 space-y-0.5 rounded-lg border border-slate-800 bg-slate-950 p-1 shadow-2xl ${
                dropdownUp ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
              {GENERATIONS.map((g) => {
                const isActive = selectedGenerations.includes(g.val);
                return (
                  <button
                    key={g.val}
                    type="button"
                    onClick={() => toggleGen(g.val)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                      isActive ? "bg-emerald-500/10 font-medium text-emerald-400" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span>{g.label}</span>
                    <input type="checkbox" checked={isActive} readOnly className="pointer-events-none h-3.5 w-3.5 accent-emerald-500" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-1" ref={locRef}>
        <h4 className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <MapPin size={11} className="text-emerald-500/80" />
          Location
        </h4>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setLocOpen((v) => !v);
              setGenOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg border bg-slate-900 px-2.5 py-2 text-left text-xs text-slate-300 ${
              locOpen || selectedLocations.length > 0
                ? "border-emerald-500/35 ring-1 ring-emerald-500/10"
                : "border-slate-800"
            }`}
          >
            <span className="truncate">{locLabel}</span>
            <ChevronDown size={12} className={`text-slate-500 transition-transform ${locOpen ? "rotate-180 text-emerald-400" : ""}`} />
          </button>
          {locOpen ? (
            <div
              className={`absolute left-0 right-0 z-20 space-y-0.5 rounded-lg border border-slate-800 bg-slate-950 p-1 shadow-2xl ${
                dropdownUp ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
              {LOCATIONS.map((loc) => {
                const isActive = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                      isActive ? "bg-emerald-500/10 font-medium text-emerald-400" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span>{loc}</span>
                    <input type="checkbox" checked={isActive} readOnly className="pointer-events-none h-3.5 w-3.5 accent-emerald-500" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
      <div className="flex items-center gap-1.5">
        <Filter size={14} className="text-emerald-500" />
        <h3 className="text-xs font-semibold text-slate-200">Filters</h3>
      </div>
      <div className="flex items-center gap-1">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-900 hover:text-emerald-400"
            title="Clear filters"
          >
            <RefreshCw size={12} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
          aria-label="Close filters"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <>
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950/95 p-3.5 md:flex">
        {header}
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">{fields(false)}</div>
      </aside>

      <div className="absolute inset-0 z-30 md:hidden">
        <button type="button" className="absolute inset-0 bg-slate-950/70" aria-label="Close filters" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 space-y-4 rounded-t-2xl border-t border-slate-800 bg-slate-900 px-5 pb-6 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          <div className="mx-auto mb-1 h-1 w-12 rounded-full bg-slate-700" />
          {header}
          {fields(true)}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
