import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Search, X } from "lucide-react";
import type { FamilyMember, MarriageUnion } from "../../types";
import { mapSpouse } from "../../services/memberService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { useActionLock } from "../../hooks/useActionLock";
import { formatMemberLabel, matchesMemberRank, type MemberRanks } from "../../utils/memberRanks";

interface MapSpouseModalProps {
  open: boolean;
  onClose: () => void;
  members: FamilyMember[];
  unions: MarriageUnion[];
  memberRanks: MemberRanks;
  onMapped: () => Promise<void> | void;
}

function MemberSearchSelect({
  label,
  members,
  ranks,
  value,
  excludeId,
  disabled,
  onChange
}: {
  label: string;
  members: FamilyMember[];
  ranks: MemberRanks;
  value: string;
  excludeId?: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = members.find((m) => m.id === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (excludeId && m.id === excludeId) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.nickname || "").toLowerCase().includes(q) ||
        matchesMemberRank(ranks, m.id, q)
      );
    });
  }, [members, ranks, query, excludeId]);

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  return (
    <label className="block text-sm text-slate-300">
      {label}
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={selected && !open ? formatMemberLabel(ranks, selected.id, selected.name) : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange("");
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="Search by name or #"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-60"
        />
        {open && !disabled ? (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
            {matches.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-500">No unmatched members found.</p>
            ) : (
              matches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <img src={m.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="truncate">{formatMemberLabel(ranks, m.id, m.name)}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export function MapSpouseModal({ open, onClose, members, unions, memberRanks, onMapped }: MapSpouseModalProps) {
  const [memberAId, setMemberAId] = useState("");
  const [memberBId, setMemberBId] = useState("");
  const { isBusy, run } = useActionLock();

  const unmatched = useMemo(
    () =>
      members.filter((m) => !unions.some((u) => u.spouse1Id === m.id || u.spouse2Id === m.id)),
    [members, unions]
  );

  useEffect(() => {
    if (!open) return;
    setMemberAId("");
    setMemberBId("");
  }, [open]);

  if (!open) return null;

  const samePerson = Boolean(memberAId && memberBId && memberAId === memberBId);
  const canSubmit = Boolean(memberAId && memberBId) && !samePerson && !isBusy;

  const handleSubmit = () => {
    if (!canSubmit) return;
    void run(async () => {
      try {
        await mapSpouse(Number(memberAId), Number(memberBId));
        notify.success("Spouse relationship mapped successfully.");
        await onMapped();
        onClose();
      } catch (error) {
        if (error instanceof ApiClientError) notify.fromApiError(error);
        else notify.error("Unable to map spouses right now.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={isBusy ? undefined : onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Map Existing Members as Spouses</h2>
            <p className="mt-1 text-xs text-slate-500">Both members must already exist. This does not create a new member.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isBusy} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <MemberSearchSelect
            label="Member A"
            members={unmatched}
            ranks={memberRanks}
            value={memberAId}
            excludeId={memberBId}
            disabled={isBusy}
            onChange={setMemberAId}
          />
          <div className="hidden h-10 items-center justify-center text-emerald-400 sm:flex">
            <ArrowLeftRight size={18} />
          </div>
          <MemberSearchSelect
            label="Member B"
            members={unmatched}
            ranks={memberRanks}
            value={memberBId}
            excludeId={memberAId}
            disabled={isBusy}
            onChange={setMemberBId}
          />
        </div>

        {samePerson ? (
          <p className="mt-3 text-xs text-rose-400">A member cannot be mapped as their own spouse.</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Map Spouse
          </button>
        </div>
      </div>
    </div>
  );
}
