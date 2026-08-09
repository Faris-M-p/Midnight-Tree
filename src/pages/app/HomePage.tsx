import { BookOpen, CalendarDays, MapPin, Users } from "lucide-react";
import { mockFamily } from "../../data/mockFamily";
import { mockEvents } from "../../data/mockEvents";
import { mockStories } from "../../data/mockStories";
import { mockTimeline } from "../../data/mockTimeline";
import { useFamilyData } from "../../context/FamilyDataContext";
import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { navigateTo } from "../../routing/navigate";
import { LoadingState } from "../../components/ui/PageStates";

export function HomePage() {
  const family = useFamilyBranding();
  const { members, isLoading } = useFamilyData();
  const upcoming = mockEvents
    .filter((event) => event.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const recentStories = mockStories.filter((story) => story.status === "published").slice(0, 3);
  const recentActivity = [...mockTimeline].sort((a, b) => b.year - a.year).slice(0, 5);
  const generations = new Set(members.map((m) => m.relation)).size || 4;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="h-40 bg-cover bg-center md:h-52" style={{ backgroundImage: `url(${mockFamily.cover})` }} />
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-end md:justify-between md:-mt-10">
          <div className="flex items-end gap-4">
            <img
              src={family.logo}
              alt=""
              className="h-20 w-20 rounded-2xl border-4 border-slate-900 object-cover shadow-xl"
            />
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">{family.name}</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-400">{family.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateTo("/family")}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
          >
            View family
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={16} />
            <p className="text-xs font-semibold uppercase tracking-wider">Total members</p>
          </div>
          {isLoading ? <LoadingState label="Loading members" /> : <p className="mt-3 text-3xl font-semibold">{members.length || "—"}</p>}
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-teal-400">
            <MapPin size={16} />
            <p className="text-xs font-semibold uppercase tracking-wider">Generations</p>
          </div>
          <p className="mt-3 text-3xl font-semibold">{generations}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Upcoming events</h3>
            <button type="button" onClick={() => navigateTo("/events")} className="text-xs text-emerald-400 hover:text-emerald-300">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcoming.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigateTo(`/events/${event.id}`)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left hover:border-emerald-500/40"
              >
                <p className="text-sm font-medium text-slate-100">{event.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays size={12} /> {event.date} · {event.location}
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Recent stories</h3>
            <button type="button" onClick={() => navigateTo("/stories")} className="text-xs text-emerald-400 hover:text-emerald-300">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentStories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => navigateTo(`/stories/${story.id}`)}
                className="flex w-full gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left hover:border-emerald-500/40"
              >
                <img src={story.coverImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{story.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{story.description}</p>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-100">Recent family activity</h3>
          <button type="button" onClick={() => navigateTo("/timeline")} className="text-xs text-emerald-400 hover:text-emerald-300">
            Open timeline
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex gap-3 border-b border-slate-800/80 pb-3 last:border-0">
              <span className="w-12 shrink-0 text-sm font-semibold text-emerald-400">{item.year}</span>
              <div>
                <p className="text-sm text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 inline-flex items-center gap-1 text-xs text-slate-500">
          <BookOpen size={12} /> What is happening with the family right now.
        </p>
      </section>
    </div>
  );
}
