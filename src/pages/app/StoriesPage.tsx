import { useMemo, useState } from "react";
import { getStory, listStories, removeStory, saveStory } from "../../data/stores";
import type { MockStory } from "../../data/mockStories";
import { matchPath, navigateTo } from "../../routing/navigate";
import { canEdit } from "../../auth/permissions";
import { EmptyState } from "../../components/ui/PageStates";
import { mockMemberName } from "../../data/mockMembers";

interface StoriesPageProps {
  pathname: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

function StoryForm({ initial, onCancel }: { initial?: MockStory; onCancel: () => void }) {
  const [draft, setDraft] = useState<MockStory>(
    initial ?? {
      id: `story-${Date.now()}`,
      title: "",
      description: "",
      content: "",
      coverImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=700&fit=crop",
      images: [],
      relatedMemberIds: [],
      relatedEventIds: [],
      date: new Date().toISOString().slice(0, 10),
      author: "Family member",
      status: "draft"
    }
  );

  return (
    <form
      className="mx-auto max-w-3xl space-y-4 p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        saveStory(draft);
        navigateTo(`/stories/${draft.id}`);
      }}
    >
      <label className="block text-sm">
        Title
        <input className={`${inputClass} mt-1`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
      </label>
      <label className="block text-sm">
        Description
        <textarea className={`${inputClass} mt-1`} rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </label>
      <label className="block text-sm">
        Content
        <textarea className={`${inputClass} mt-1`} rows={8} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
      </label>
      <label className="block text-sm">
        Cover image URL
        <input className={`${inputClass} mt-1`} value={draft.coverImage} onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })} />
      </label>
      <label className="block text-sm">
        Additional images (comma-separated URLs)
        <input
          className={`${inputClass} mt-1`}
          value={draft.images.join(", ")}
          onChange={(e) => setDraft({ ...draft, images: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Date
          <input type="date" className={`${inputClass} mt-1`} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </label>
        <label className="text-sm">
          Status
          <select className={`${inputClass} mt-1`} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as MockStory["status"] })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Save story
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function StoriesPage({ pathname }: StoriesPageProps) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | MockStory["status"]>("all");

  const createMatch = matchPath("/stories/create", pathname);
  const editMatch = matchPath("/stories/:id/edit", pathname);
  const detailMatch = matchPath("/stories/:id", pathname);

  if (createMatch) {
    return <StoryForm onCancel={() => navigateTo("/stories")} />;
  }
  if (editMatch) {
    const story = getStory(editMatch.params.id);
    if (!story) return <EmptyState title="Story not found" message="This story is no longer available." />;
    return <StoryForm initial={story} onCancel={() => navigateTo(`/stories/${story.id}`)} />;
  }
  if (detailMatch && detailMatch.params.id !== "create") {
    const story = getStory(detailMatch.params.id);
    if (!story) return <EmptyState title="Story not found" message="This story is no longer available." />;
    return (
      <article className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <img src={story.coverImage} alt="" className="h-56 w-full rounded-2xl object-cover" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400">{story.status}</p>
            <h2 className="text-2xl font-semibold">{story.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {story.author} · {story.date}
            </p>
          </div>
          {canEdit() && (
            <div className="flex gap-2">
              <button type="button" onClick={() => navigateTo(`/stories/${story.id}/edit`)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  saveStory({ ...story, status: story.status === "published" ? "unpublished" : "published" });
                  refresh();
                }}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm"
              >
                {story.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => {
                  removeStory(story.id);
                  navigateTo("/stories");
                }}
                className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <p className="text-slate-300">{story.description}</p>
        <p className="leading-relaxed text-slate-200">{story.content}</p>
        {story.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {story.images.map((src) => (
              <img key={src} src={src} alt="" className="h-40 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500">
          Related members: {story.relatedMemberIds.map(mockMemberName).join(", ") || "—"}
        </p>
      </article>
    );
  }

  const stories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listStories().filter((story) => {
      const matchesQuery = !q || story.title.toLowerCase().includes(q) || story.description.toLowerCase().includes(q);
      const matchesStatus = status === "all" || story.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, pathname]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories..."
            className={inputClass}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={`${inputClass} max-w-[10rem]`}>
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
        {canEdit() && (
          <button type="button" onClick={() => navigateTo("/stories/create")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Create story
          </button>
        )}
      </div>
      {stories.length === 0 ? (
        <EmptyState title="No stories yet" message="Capture a family memory to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => navigateTo(`/stories/${story.id}`)}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-emerald-500/40"
            >
              <img src={story.coverImage} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400">{story.status}</p>
                <h3 className="mt-1 font-semibold text-slate-100">{story.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{story.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
