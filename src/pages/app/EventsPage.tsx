import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Search, X } from "lucide-react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { canEditFamily } from "../../auth/permissions";
import { DateTimePicker } from "../../components/DateTimePicker";
import { LocationPicker } from "../../components/members/LocationPicker";
import { MemberMultiSelect } from "../../components/members/MemberMultiSelect";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/PageStates";
import { useActionLock } from "../../hooks/useActionLock";
import { useFamilyData } from "../../context/FamilyDataContext";
import { ApiClientError } from "../../services/apiClient";
import {
  createEvent,
  deleteEvent,
  formatEventDateTime,
  formatEventTypeLabel,
  getEvent,
  listEvents,
  updateEvent
} from "../../services/eventService";
import type { EventDetail, EventListItem, EventLocationValue, EventType, EventUpsertInput } from "../../types/event";
import { EVENT_TYPES } from "../../types/event";
import { isEventUpcoming, truncateEventText } from "../../utils/eventDateTime";
import { eventInputClass, eventLabelClass, validateEventImage } from "../../utils/eventImages";
import { formatMemberLabel } from "../../utils/memberRanks";
import { notify } from "../../utils/notify";

interface EventsPageProps {
  pathname: string;
}

interface EventFormState {
  title: string;
  eventType: EventType;
  eventDateTime: string;
  location: EventLocationValue;
  description: string;
  memberIds: number[];
}

function emptyForm(): EventFormState {
  return {
    title: "",
    eventType: "custom",
    eventDateTime: "",
    location: { locationName: "", latitude: null, longitude: null },
    description: "",
    memberIds: []
  };
}

function formFromDetail(event: EventDetail): EventFormState {
  return {
    title: event.title,
    eventType: (EVENT_TYPES.includes(event.eventType as EventType)
      ? event.eventType
      : "custom") as EventType,
    eventDateTime: event.eventDateTime,
    location: {
      locationName: event.locationName || "",
      latitude: event.latitude ?? null,
      longitude: event.longitude ?? null
    },
    description: event.description || "",
    memberIds: event.members.map((m) => m.id)
  };
}

function EventForm({
  initial,
  eventId,
  existingCoverUrl,
  onCancel
}: {
  initial?: EventFormState;
  eventId?: number;
  existingCoverUrl?: string | null;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<EventFormState>(initial ?? emptyForm());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(existingCoverUrl || "");
  const [removeCover, setRemoveCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { isBusy, run } = useActionLock();
  const isEdit = typeof eventId === "number";

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  if (!canEditFamily()) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-8 text-center text-sm text-slate-400">
          You do not have permission to {isEdit ? "edit" : "create"} events.
        </p>
      </div>
    );
  }

  const validate = (): string | null => {
    if (!draft.title.trim()) return "Event title is required.";
    if (!draft.eventType) return "Event type is required.";
    if (!draft.eventDateTime) return "Event date and time is required.";
    return null;
  };

  const setCover = (file: File) => {
    const error = validateEventImage(file);
    if (error) {
      notify.validation(error);
      return;
    }
    setCoverPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
    setRemoveCover(false);
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    setRemoveCover(true);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      notify.validation(error);
      return;
    }

    const payload: EventUpsertInput = {
      title: draft.title.trim(),
      eventType: draft.eventType,
      eventDateTime: draft.eventDateTime,
      locationName: draft.location.locationName.trim() || null,
      latitude: draft.location.latitude,
      longitude: draft.location.longitude,
      description: draft.description.trim() || null,
      memberIds: draft.memberIds,
      coverImage: coverFile,
      removeCover: isEdit ? removeCover : false
    };

    void run(async () => {
      try {
        const saved = isEdit ? await updateEvent(eventId, payload) : await createEvent(payload);
        notify.success(isEdit ? "Event updated successfully." : "Event created successfully.");
        navigateTo(`/events/${saved.id}`);
      } catch (err) {
        if (err instanceof ApiClientError) notify.fromApiError(err);
        else notify.error(isEdit ? "Unable to update event." : "Unable to create event.");
      }
    });
  };

  return (
    <form className="mx-auto max-w-3xl space-y-5 p-4 md:p-6" onSubmit={handleSubmit}>
      <div>
        <p className={`${eventLabelClass} mb-2`}>Cover Photo</p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
          {coverPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-800">
              <img src={coverPreview} alt="" className="h-44 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-lg bg-slate-950/80 px-2 py-1 text-xs text-slate-100"
                >
                  Replace
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={clearCover}
                  className="rounded-lg bg-slate-950/80 p-1 text-slate-100"
                  aria-label="Remove cover"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => coverInputRef.current?.click()}
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 text-sm text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              <ImagePlus size={20} />
              Upload cover photo
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setCover(file);
            }}
          />
        </div>
      </div>

      <label className={eventLabelClass}>
        Event Title <span className="text-rose-400">*</span>
        <input
          className={`${eventInputClass} mt-1`}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
          maxLength={200}
          disabled={isBusy}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={eventLabelClass}>
          Event Type <span className="text-rose-400">*</span>
          <select
            className={`${eventInputClass} mt-1`}
            value={draft.eventType}
            onChange={(e) => setDraft({ ...draft, eventType: e.target.value as EventType })}
            required
            disabled={isBusy}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEventTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className={`${eventLabelClass} mb-1`}>
            Event Date &amp; Time <span className="text-rose-400">*</span>
          </p>
          <DateTimePicker
            value={draft.eventDateTime}
            onChange={(eventDateTime) => setDraft({ ...draft, eventDateTime })}
            disabled={isBusy}
            placeholder="Select date & time"
          />
        </div>
      </div>

      <div>
        <p className={`${eventLabelClass} mb-1`}>Location</p>
        <LocationPicker
          value={draft.location}
          onChange={(location) => setDraft({ ...draft, location })}
          inputClassName={eventInputClass}
        />
      </div>

      <div>
        <p className={`${eventLabelClass} mb-1`}>Members</p>
        <MemberMultiSelect
          selectedIds={draft.memberIds}
          onChange={(memberIds) => setDraft({ ...draft, memberIds })}
          disabled={isBusy}
        />
      </div>

      <label className={eventLabelClass}>
        Description
        <textarea
          className={`${eventInputClass} mt-1`}
          rows={4}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          maxLength={4000}
          disabled={isBusy}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {isEdit ? "Save changes" : "Create event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EventEditLoader({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void getEvent(eventId)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setEvent(null);
          setError(err instanceof ApiClientError ? err.message : "Unable to load event.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) return <LoadingState label="Loading event..." />;
  if (error) return <ErrorState message={error} />;
  if (!event) return <EmptyState title="Event not found" message="This event is no longer available." />;

  return (
    <EventForm
      initial={formFromDetail(event)}
      eventId={event.id}
      existingCoverUrl={event.coverImageUrl}
      onCancel={() => navigateTo(`/events/${event.id}`)}
    />
  );
}

function EventDetailsView({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isBusy, run } = useActionLock();
  const { memberRanks } = useFamilyData();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setEvent(await getEvent(eventId));
    } catch (err) {
      setEvent(null);
      setError(err instanceof ApiClientError ? err.message : "Unable to load event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [eventId]);

  if (loading) return <LoadingState label="Loading event..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!event) return <EmptyState title="Event not found" message="This event is no longer available." />;

  return (
    <article className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt=""
          className="h-52 w-full rounded-2xl border border-slate-800 object-cover"
        />
      ) : null}
      <p className="text-xs uppercase tracking-wider text-emerald-400">
        {formatEventTypeLabel(event.eventType)}
      </p>
      <h2 className="text-2xl font-semibold text-slate-100">{event.title}</h2>
      <p className="text-sm text-slate-400">{formatEventDateTime(event.eventDateTime)}</p>
      {event.locationName?.trim() ? (
        <p className="text-sm text-slate-300">{event.locationName}</p>
      ) : null}
      {event.description?.trim() ? (
        <p className="whitespace-pre-wrap text-slate-200">{event.description}</p>
      ) : null}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Members</p>
        {event.members.length ? (
          <div className="flex flex-wrap gap-2">
            {event.members.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-2 py-1 text-sm text-slate-200"
              >
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : null}
                {formatMemberLabel(memberRanks, String(member.id), member.fullName)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No members linked.</p>
        )}
      </div>
      {canEditFamily() && (
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigateTo(`/events/${event.id}/edit`)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
              void run(async () => {
                try {
                  await deleteEvent(event.id);
                  notify.success("Event deleted successfully.");
                  navigateTo("/events");
                } catch (err) {
                  if (err instanceof ApiClientError) notify.fromApiError(err);
                  else notify.error("Unable to delete event.");
                }
              });
            }}
            className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function EventCard({ event }: { event: EventListItem }) {
  return (
    <button
      type="button"
      onClick={() => navigateTo(`/events/${event.id}`)}
      className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-emerald-500/40"
    >
      {event.coverImageUrl ? (
        <img src={event.coverImageUrl} alt="" className="h-32 w-full object-cover" />
      ) : (
        <div className="flex h-20 items-center justify-center bg-slate-950/60 text-xs text-slate-600">
          No cover photo
        </div>
      )}
      <div className="space-y-1 p-4">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400">
          {formatEventTypeLabel(event.eventType)}
        </p>
        <p className="font-medium text-slate-100">{event.title}</p>
        <p className="text-xs text-slate-400">{formatEventDateTime(event.eventDateTime)}</p>
        {event.locationName?.trim() ? (
          <p className="text-xs text-slate-500">{event.locationName}</p>
        ) : null}
        {event.memberNames?.trim() ? (
          <p className="text-xs text-slate-500">{event.memberNames}</p>
        ) : event.memberCount > 0 ? (
          <p className="text-xs text-slate-500">{event.memberCount} member(s)</p>
        ) : null}
        {event.description?.trim() ? (
          <p className="text-xs text-slate-500">{truncateEventText(event.description, 100)}</p>
        ) : null}
      </div>
    </button>
  );
}

function EventsListView() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (term = query) => {
    setLoading(true);
    setError("");
    try {
      const data = await listEvents({
        search: term.trim() || undefined,
        sortBy: "date",
        page: 1,
        pageSize: 200
      });
      setEvents(data.items);
    } catch (err) {
      setEvents([]);
      setError(err instanceof ApiClientError ? err.message : "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upcoming = useMemo(
    () => events.filter((e) => isEventUpcoming(e.eventDateTime)),
    [events]
  );
  const past = useMemo(
    () => events.filter((e) => !isEventUpcoming(e.eventDateTime)).reverse(),
    [events]
  );

  const List = ({ title, items }: { title: string; items: EventListItem[] }) => (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-100">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">None yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );

  if (loading) return <LoadingState label="Loading events..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQuery(search);
                void load(search);
              }
            }}
            placeholder="Search events..."
            className={`${eventInputClass} pl-9`}
          />
        </div>
        {canEditFamily() && (
          <button
            type="button"
            onClick={() => navigateTo("/events/create")}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Create event
          </button>
        )}
      </div>
      <List title="Upcoming events" items={upcoming} />
      <List title="Past events" items={past} />
    </div>
  );
}

export function EventsPage({ pathname }: EventsPageProps) {
  if (pathname === "/events/create") {
    return (
      <div>
        <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6">
          <h1 className="text-xl font-semibold text-slate-100">Create Event</h1>
        </div>
        <EventForm onCancel={() => navigateTo("/events")} />
      </div>
    );
  }

  const editMatch = matchPath("/events/:id/edit", pathname);
  if (editMatch) {
    const id = Number(editMatch.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return <EmptyState title="Event not found" message="This event is no longer available." />;
    }
    return (
      <div>
        <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6">
          <h1 className="text-xl font-semibold text-slate-100">Edit Event</h1>
        </div>
        <EventEditLoader eventId={id} />
      </div>
    );
  }

  const detailMatch = matchPath("/events/:id", pathname);
  if (detailMatch && detailMatch.params.id !== "create") {
    const id = Number(detailMatch.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return <EmptyState title="Event not found" message="This event is no longer available." />;
    }
    return <EventDetailsView eventId={id} />;
  }

  return <EventsListView />;
}
