import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, UserRound, X } from "lucide-react";
import { useFamilyData } from "../../context/FamilyDataContext";
import { formatMemberLabel } from "../../utils/memberRanks";
import { eventInputClass } from "../../utils/eventImages";

interface MemberMultiSelectProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export function MemberMultiSelect({ selectedIds, onChange, disabled }: MemberMultiSelectProps) {
  const { members, memberRanks, isLoading } = useFamilyData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedMembers = useMemo(
    () =>
      selectedIds
        .map((id) => members.find((m) => Number(m.id) === id))
        .filter((m): m is NonNullable<typeof m> => Boolean(m)),
    [members, selectedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [...members]
      .filter((m) => !selectedSet.has(Number(m.id)))
      .sort((a, b) => (memberRanks[a.id] ?? 9999) - (memberRanks[b.id] ?? 9999));
    if (!q) return rows;
    return rows.filter((m) => {
      const label = formatMemberLabel(memberRanks, m.id, m.name).toLowerCase();
      return (
        label.includes(q) ||
        m.name.toLowerCase().includes(q) ||
        (m.nickname || "").toLowerCase().includes(q)
      );
    });
  }, [members, memberRanks, query, selectedSet]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const addMember = (id: number) => {
    if (disabled || selectedSet.has(id)) return;
    onChange([...selectedIds, id]);
    setQuery("");
    setOpen(false);
  };

  const removeMember = (id: number) => {
    if (disabled) return;
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div ref={rootRef} className="space-y-2">
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-0.5 py-0.5 pr-2 text-sm text-slate-200"
            >
              <img
                src={member.avatar}
                alt=""
                className="h-6 w-6 rounded-full object-cover border border-slate-800"
              />
              <span className="max-w-[140px] truncate">
                {formatMemberLabel(memberRanks, member.id, member.name)}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeMember(Number(member.id))}
                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-60"
                aria-label="Remove member"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-60"
        >
          <Plus size={14} />
          Add members
        </button>

        {open && (
          <div className="absolute z-40 mt-2 w-full min-w-[280px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-2">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members..."
                disabled={disabled}
                className={`${eventInputClass} pl-9`}
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60">
              {isLoading ? (
                <p className="px-3 py-4 text-sm text-slate-500">Loading members...</p>
              ) : filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-500">No members found.</p>
              ) : (
                filtered.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => addMember(Number(member.id))}
                    className="flex w-full items-center gap-3 border-b border-slate-900/60 px-3 py-2 text-left last:border-b-0 hover:bg-slate-900/50"
                  >
                    <img
                      src={member.avatar}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover border border-slate-800"
                    />
                    <span className="truncate text-sm text-slate-200">
                      {formatMemberLabel(memberRanks, member.id, member.name)}
                    </span>
                    <UserRound size={14} className="ml-auto text-slate-500" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
