import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Plus, Search } from "lucide-react";
import { EmptyState, ErrorState } from "../ui/PageStates";
import { canEditFamily } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { ApiClientError } from "../../services/apiClient";
import { formatMemoryDate, listMemories, truncateText } from "../../services/memoryService";
import type { MemoryListItem, MemorySortBy, PagedMemories } from "../../types/memory";
import { memoryInputClass } from "../../utils/memoryImages";

function MemoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="aspect-[16/10] animate-pulse bg-slate-800/80" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  );
}

function MemoryCard({ memory }: { memory: MemoryListItem }) {
  const meta = [formatMemoryDate(memory.memoryDate), memory.location?.trim()].filter(Boolean).join(" • ");
  const photoLabel = memory.imageCount === 1 ? "1 photo" : `${memory.imageCount} photos`;

  return (
    <button
      type="button"
      onClick={() => navigateTo(`/memories/${memory.id}`)}
      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 text-left transition hover:border-emerald-500/40 hover:bg-slate-900/70"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-950">
        {memory.coverUrl ? (
          <img
            src={memory.coverUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <ImagePlus size={28} />
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-100">{memory.title}</h3>
        {meta && <p className="text-xs text-slate-400">{meta}</p>}
        {memory.description?.trim() && (
          <p className="line-clamp-2 text-sm text-slate-300">{truncateText(memory.description, 140)}</p>
        )}
        <p className="text-xs font-medium text-emerald-400/90">{photoLabel}</p>
      </div>
    </button>
  );
}

export function MemoriesListView() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<MemorySortBy>("recent");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PagedMemories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMemories({
        search,
        sortBy,
        page,
        pageSize: 12
      });
      setData(result);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Unable to load memories right now.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      setSearch(query.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [query]);

  const canWrite = canEditFamily();
  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages || 1);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Memories</h1>
          <p className="mt-1 text-sm text-slate-400">Preserve your family&apos;s special moments.</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => navigateTo("/memories/create")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <Plus size={16} /> Create Memory
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-[1fr_auto]">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories..."
            className={`${memoryInputClass} pl-9`}
          />
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as MemorySortBy);
            setPage(1);
          }}
          className={`${memoryInputClass} sm:w-44`}
        >
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title</option>
        </select>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MemoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="No memories yet"
          message="Preserve your family's special moments by creating your first memory."
          action={
            canWrite ? (
              <button
                type="button"
                onClick={() => navigateTo("/memories/create")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                <Plus size={16} /> Create Memory
              </button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">
                Page {data?.page ?? page} of {totalPages} · {data?.totalCount ?? 0} memories
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
