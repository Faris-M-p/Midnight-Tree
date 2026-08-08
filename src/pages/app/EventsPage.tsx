import { useMemo, useState } from "react";
import { getEvent, listEvents, removeEvent, saveEvent } from "../../data/stores";
import type { MockEvent, MockEventType } from "../../data/mockEvents";
import { matchPath, navigateTo } from "../../routing/navigate";
import { canEdit } from "../../auth/permissions";
import { EmptyState } from "../../components/ui/PageStates";
import { mockMemberName } from "../../data/mockMembers";

interface EventsPageProps {
  pathname: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const types: MockEventType[] = ["birthday", "anniversary", "memorial", "gathering", "achievement", "custom"];

function EventForm({ initial, onCancel }: { initial?: MockEvent; onCancel: () => void }) {
  const [draft, setDraft] = useState<MockEvent>(
    initial ?? {
      id: `event-${Date.now()}`,
      title: "",
      type: "custom",
      date: new Date().toISOString().slice(0, 10),
      time: "18:00",
      location: "",
      description: "",
      relatedMemberIds: [],
      images: []
    }
  );

  return (
    <form
      className="mx-auto max-w-3xl space-y-4 p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        saveEvent(draft);
        navigateTo(`/events/${draft.id}`);
      }}
    >
      <label className="block text-sm">
        Title
        <input className={`${inputClass} mt-1`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Event type
          <select className={`${inputClass} mt-1`} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as MockEventType })}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Location
          <input className={`${inputClass} mt-1`} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        </label>
        <label className="text-sm">
          Date
          <input type="date" className={`${inputClass} mt-1`} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </label>
        <label className="text-sm">
          Time
          <input type="time" className={`${inputClass} mt-1`} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea className={`${inputClass} mt-1`} rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </label>
      <label className="block text-sm">
        Image URLs (comma-separated)
        <input
          className={`${inputClass} mt-1`}
          value={draft.images.join(", ")}
          onChange={(e) => setDraft({ ...draft, images: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Save event
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function EventsPage({ pathname }: EventsPageProps) {
  const createMatch = matchPath("/events/create", pathname);
  const editMatch = matchPath("/events/:id/edit", pathname);
  const detailMatch = matchPath("/events/:id", pathname);
  const today = new Date().toISOString().slice(0, 10);

  if (createMatch) return <EventForm onCancel={() => navigateTo("/events")} />;
  if (editMatch) {
    const event = getEvent(editMatch.params.id);
    if (!event) return <EmptyState title="Event not found" message="This event is no longer available." />;
    return <EventForm initial={event} onCancel={() => navigateTo(`/events/${event.id}`)} />;
  }
  if (detailMatch && detailMatch.params.id !== "create") {
    const event = getEvent(detailMatch.params.id);
    if (!event) return <EmptyState title="Event not found" message="This event is no longer available." />;
    return (
      <article className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        {event.images[0] && <img src={event.images[0]} alt="" className="h-52 w-full rounded-2xl object-cover" />}
        <p className="text-xs uppercase tracking-wider text-emerald-400">{event.type}</p>
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <p className="text-sm text-slate-400">
          {event.date} · {event.time} · {event.location}
        </p>
        <p className="text-slate-200">{event.description}</p>
        <p className="text-xs text-slate-500">Related: {event.relatedMemberIds.map(mockMemberName).join(", ") || "—"}</p>
        {canEdit() && (
          <div className="flex gap-2">
            <button type="button" onClick={() => navigateTo(`/events/${event.id}/edit`)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm">
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                removeEvent(event.id);
                navigateTo("/events");
              }}
              className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300"
            >
              Delete
            </button>
          </div>
        )}
      </article>
    );
  }

  const events = useMemo(() => listEvents().sort((a, b) => a.date.localeCompare(b.date)), [pathname]);
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today).reverse();

  const List = ({ title, items }: { title: string; items: MockEvent[] }) => (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">None yet.</p>
      ) : (
        items.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => navigateTo(`/events/${event.id}`)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left hover:border-emerald-500/40"
          >
            <p className="text-[10px] uppercase tracking-wider text-emerald-400">{event.type}</p>
            <p className="font-medium text-slate-100">{event.title}</p>
            <p className="text-xs text-slate-400">
              {event.date} · {event.location}
            </p>
          </button>
        ))
      )}
    </section>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex justify-end">
        {canEdit() && (
          <button type="button" onClick={() => navigateTo("/events/create")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Create event
          </button>
        )}
      </div>
      <List title="Upcoming events" items={upcoming} />
      <List title="Past events" items={past} />
    </div>
  );
}
