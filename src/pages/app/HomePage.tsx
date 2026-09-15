import { useEffect, useMemo, useState } from "react";
import { Cake, CalendarHeart, Flower2, GitBranch, Users } from "lucide-react";
import { useFamilyData } from "../../context/FamilyDataContext";
import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { navigateTo } from "../../routing/navigate";
import { GenderDonut, GrowthChart } from "../../components/home/HomeCharts";
import { AgeDistributionPanel } from "../../components/home/AgeDistributionPanel";
import { FamilyTreePreview } from "../../components/home/FamilyTreePreview";
import { formatHomeDate, HomeSection } from "../../components/home/HomeSection";
import { FamilyLogo } from "../../components/family/FamilyLogo";
import { listEvents } from "../../services/eventService";
import { listMemories } from "../../services/memoryService";
import type { EventListItem } from "../../types/event";
import type { MemoryListItem } from "../../types/memory";
import {
  buildFamilyTimeline,
  buildGrowthSeries,
  buildGrowthSummary,
  buildGenderSlices,
  buildMemoryCards,
  buildRecentMembers,
  buildTreePreview,
  buildUpcomingDates,
  countGenerations,
  toHomeTimeline
} from "../../utils/homeDashboard";

function HomeEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function dateIcon(type: string) {
  if (type === "Birthday") return Cake;
  if (type === "Anniversary") return CalendarHeart;
  if (type === "Remembrance") return Flower2;
  return CalendarHeart;
}

export function HomePage() {
  const family = useFamilyBranding();
  const { members, unions, isLoading } = useFamilyData();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [memories, setMemories] = useState<MemoryListItem[]>([]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [eventPage, memoryPage] = await Promise.all([
          listEvents({ pageSize: 50, sortBy: "date" }).catch(() => ({ items: [] as EventListItem[] })),
          listMemories({ pageSize: 8, sortBy: "recent" }).catch(() => ({ items: [] as MemoryListItem[] }))
        ]);
        if (!alive) return;
        setEvents(eventPage.items);
        setMemories(memoryPage.items);
      } catch {
        if (!alive) return;
        setEvents([]);
        setMemories([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [members]);

  const totalMembers = members.length;
  const generationsCount = countGenerations(members, unions);
  const upcomingDates = useMemo(() => buildUpcomingDates(members, events), [members, events]);
  const upcomingCount = upcomingDates.length;
  const genderSlices = buildGenderSlices(members);
  const hasDemographicData = members.length > 0;
  const recentMembers = buildRecentMembers(members);
  const treePreview = buildTreePreview(members, unions);
  const growthPoints = buildGrowthSeries(members);
  const growthSummary = buildGrowthSummary(members);
  const memoryCards = buildMemoryCards(memories);
  const timelineItems = useMemo(
    () => toHomeTimeline(buildFamilyTimeline(members, events, memories)),
    [members, events, memories]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:space-y-10 md:p-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div
          className="relative h-48 bg-cover bg-center sm:h-56 md:h-72"
          style={{ backgroundImage: `url(${family.cover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <FamilyLogo
                  name={family.name}
                  src={family.logo}
                  className="h-20 w-20 rounded-2xl border-4 border-slate-900 object-cover shadow-xl md:h-24 md:w-24"
                />
                <div className="min-w-0 pb-1">
                  <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">{family.name}</h1>
                  {family.description ? (
                    <p className="mt-1 max-w-2xl text-sm text-slate-300">{family.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{isLoading ? "…" : generationsCount} generations</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo("/family-tree")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                <GitBranch size={15} /> View Family Tree
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Total Members</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{isLoading ? "…" : totalMembers}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="flex items-center gap-2 text-teal-400">
            <GitBranch size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Generations</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{isLoading ? "…" : generationsCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="flex items-center gap-2 text-sky-400">
            <CalendarHeart size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Upcoming Events</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{isLoading ? "…" : upcomingCount}</p>
        </article>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <HomeSection
          title="Family Growth"
          description="How the chronicle has grown over recent years."
          className="flex h-full flex-col"
        >
          <div className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
            {growthPoints.length ? (
              <GrowthChart points={growthPoints} />
            ) : (
              <HomeEmpty message="No growth data yet." />
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Members Added</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-300">+{growthSummary.membersAdded}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Deceased</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-rose-300">-{growthSummary.deceased}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Net Growth</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-100">+{growthSummary.netGrowth}</p>
              </div>
            </div>
          </div>
        </HomeSection>

        <HomeSection
          title="Member Demographics"
          description="A simple view of who makes up the family today."
          className="flex h-full flex-col"
        >
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
            {hasDemographicData ? (
              <>
                <GenderDonut slices={genderSlices} />
                <div className="mt-auto border-t border-slate-800 pt-3">
                  <AgeDistributionPanel members={members} />
                </div>
              </>
            ) : (
              <HomeEmpty message="No demographic data yet." />
            )}
          </div>
        </HomeSection>
      </div>

      <HomeSection
        title="Upcoming Family Dates"
        description="Birthdays, anniversaries, remembrances, and gatherings."
        actionLabel="View all"
        actionHref="/events"
      >
        {upcomingDates.length ? (
          <div className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            {upcomingDates.map((item) => {
              const Icon = dateIcon(item.eventType);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.href)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-900/80 sm:items-center"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-emerald-400">
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{item.personName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.eventType}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatHomeDate(item.date)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <HomeEmpty message="No upcoming family dates yet." />
        )}
      </HomeSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <HomeSection title="Recently Added Members" actionLabel="View all" actionHref="/members">
          {recentMembers.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => navigateTo(member.href)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-left transition hover:border-emerald-500/40"
                >
                  <FamilyLogo name={member.name} src={member.avatar} className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.relation}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <HomeEmpty message="No members added yet." />
          )}
        </HomeSection>

        <HomeSection title="Family Tree Preview" description="A small glimpse of how the lineage connects.">
          <FamilyTreePreview root={treePreview} />
        </HomeSection>
      </div>

      <HomeSection title="Family Memories" description="Recent photos from the family gallery." actionLabel="View all" actionHref="/memories">
        {memoryCards.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {memoryCards.map((memory) => (
              <button
                key={memory.id}
                type="button"
                onClick={() => navigateTo(memory.href)}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 text-left transition hover:border-emerald-500/40"
              >
                {memory.imageUrl ? (
                  <img src={memory.imageUrl} alt="" className="h-32 w-full object-cover sm:h-36" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-slate-950/60 text-xs text-slate-500 sm:h-36">
                    No photo
                  </div>
                )}
                <p className="truncate px-3 py-2 text-sm text-slate-200 group-hover:text-emerald-300">{memory.title}</p>
              </button>
            ))}
          </div>
        ) : (
          <HomeEmpty message="No memories yet." />
        )}
      </HomeSection>

      <HomeSection title="Family Timeline" description="Recent moments across the chronicle." actionLabel="View Timeline" actionHref="/timeline">
        {timelineItems.length ? (
          <ol className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            {timelineItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => item.href && navigateTo(item.href)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-900/80"
                >
                  <span className="mt-0.5 w-16 shrink-0 text-xs text-emerald-400">{item.dateLabel}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.kind}
                      {item.description ? ` · ${item.description}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <HomeEmpty message="No timeline entries yet." />
        )}
      </HomeSection>
    </div>
  );
}
