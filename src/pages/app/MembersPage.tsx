import { useMemo, useState } from "react";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useFamilyData } from "../../context/FamilyDataContext";
import { navigateTo } from "../../routing/navigate";
import { AddMember } from "../../components/members/AddMember";
import { EditMember } from "../../components/members/EditMember";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/PageStates";
import { canCreateMember, canDeleteMember, canEditMember } from "../../auth/permissions";
import { deleteMember } from "../../services/memberService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { useActionLock } from "../../hooks/useActionLock";
import { matchesMemberRank, memberDisplayId } from "../../utils/memberRanks";

const PAGE_SIZE = 12;

export function MembersPage() {
  const { members, unions, memberRanks, isLoading, error, refresh } = useFamilyData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "alive" | "deceased">("all");
  const [sort, setSort] = useState<"number" | "name" | "dob" | "location">("number");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { isBusy, run } = useActionLock();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = members.filter((m) => {
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.nickname || "").toLowerCase().includes(q) ||
        m.relation.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        matchesMemberRank(memberRanks, m.id, q);
      const matchesStatus =
        status === "all" || (status === "deceased" ? Boolean(m.isDeceased) : !m.isDeceased);
      return matchesQuery && matchesStatus;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "number") return (memberRanks[a.id] ?? 9999) - (memberRanks[b.id] ?? 9999);
      if (sort === "dob") return (a.dob || "").localeCompare(b.dob || "");
      if (sort === "location") return a.location.localeCompare(b.location);
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [members, memberRanks, query, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    await run(async () => {
      try {
        await deleteMember(Number(id));
        notify.success("Member deleted successfully.");
        await refresh();
      } catch (err) {
        if (err instanceof ApiClientError) notify.fromApiError(err);
        else notify.error("Unable to delete member right now.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">{filtered.length} members</p>
        </div>
        {canCreateMember() && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <UserPlus size={16} /> Add member
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 md:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search #number, name, nickname..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="all">All statuses</option>
          <option value="alive">Alive</option>
          <option value="deceased">Deceased</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="number">Sort by number</option>
          <option value="name">Sort by name</option>
          <option value="dob">Sort by date of birth</option>
          <option value="location">Sort by location</option>
        </select>
      </div>

      {isLoading ? <LoadingState label="Loading members..." /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!isLoading && !error && filtered.length === 0 ? (
        <EmptyState title="No members found" message="Try a different search or add the first family member." />
      ) : null}

      {!isLoading && !error && pageRows.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Nickname</th>
                  <th className="px-4 py-3 font-medium">Relationship</th>
                  <th className="px-4 py-3 font-medium">Date of birth</th>
                  <th className="px-4 py-3 font-medium">Life status</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((member) => (
                  <tr key={member.id} className="border-t border-slate-800/80 hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => navigateTo(`/members/${member.id}`)} className="flex items-center gap-3 text-left">
                        <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <span className="flex min-w-0 items-baseline gap-1.5">
                          <span className="shrink-0 text-xs font-bold text-emerald-400">{memberDisplayId(memberRanks, member.id)}</span>
                          <span className="truncate font-medium text-slate-100">{member.name}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{member.nickname || "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{member.relation}</td>
                    <td className="px-4 py-3 text-slate-300">{member.dob || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          member.isDeceased ? "bg-slate-800 text-slate-400" : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {member.isDeceased ? "Deceased" : "Alive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{member.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => navigateTo(`/members/${member.id}`)}
                          className="rounded-lg px-2 py-1 text-xs text-emerald-300 hover:bg-slate-800"
                        >
                          View
                        </button>
                        {canEditMember(member.id, unions) && (
                          <button
                            type="button"
                            onClick={() => setEditId(Number(member.id))}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDeleteMember(member.id, unions) && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(member.id, member.name)}
                            disabled={isBusy}
                            className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-950/40 disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageRows.map((member) => (
              <article key={member.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <button type="button" onClick={() => navigateTo(`/members/${member.id}`)} className="flex w-full items-center gap-3 text-left">
                  <img src={member.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="flex items-baseline gap-1.5 font-medium text-slate-100">
                      <span className="text-xs font-bold text-emerald-400">{memberDisplayId(memberRanks, member.id)}</span>
                      <span>{member.name}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {member.nickname || member.relation} · {member.location}
                    </p>
                  </div>
                </button>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>{member.dob || "DOB unknown"}</span>
                  <span>{member.isDeceased ? "Deceased" : "Alive"}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => navigateTo(`/members/${member.id}`)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs">
                    View
                  </button>
                  {canEditMember(member.id, unions) && (
                    <button type="button" onClick={() => setEditId(Number(member.id))} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs">
                      Edit
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      <AddMember
        open={addOpen}
        onClose={() => setAddOpen(false)}
        members={members}
        unions={unions}
        memberRanks={memberRanks}
        onCreated={refresh}
      />
      <EditMember
        open={editId != null}
        memberId={editId}
        fallback={members.find((m) => Number(m.id) === editId)}
        onClose={() => setEditId(null)}
        onSaved={refresh}
      />
    </div>
  );
}
