import { Cake, CalendarHeart, Flower2, GitBranch, MapPin, TrendingUp, Users } from "lucide-react";
import { mockFamily } from "../../data/mockFamily";
import { mockEvents } from "../../data/mockEvents";
import { mockStories } from "../../data/mockStories";
import {
  homeFamilyDates,
  homeGenderFallback,
  homeGenerations,
  homeGrowthSeries,
  homeGrowthSummary,
  homeLocationsFallback,
  homeMemories,
  homeRecentMembersFallback,
  homeTimelineEvents,
  homeTreePreview,
  type HomeGenderSlice,
  type HomeLocation,
  type HomeRecentMember
} from "../../data/mockHome";
import { useFamilyData } from "../../context/FamilyDataContext";
import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { navigateTo } from "../../routing/navigate";
import { GenderDonut, GrowthChart } from "../../components/home/HomeCharts";
import { AgeDistributionPanel } from "../../components/home/AgeDistributionPanel";
import { FamilyTreePreview } from "../../components/home/FamilyTreePreview";
import { formatHomeDate, HomeSection } from "../../components/home/HomeSection";
import type { FamilyMember } from "../../types";

function buildGenderSlices(members: FamilyMember[]): HomeGenderSlice[] {
  if (!members.length) return homeGenderFallback;
  const counts = { male: 0, female: 0, other: 0 };
  for (const member of members) {
    if (member.gender === "female") counts.female += 1;
    else if (member.gender === "other") counts.other += 1;
    else counts.male += 1;
  }
  return [
    { label: "Male", value: counts.male, color: "#34d399" },
    { label: "Female", value: counts.female, color: "#fb7185" },
    { label: "Other", value: counts.other, color: "#64748b" }
  ].filter((slice) => slice.value > 0);
}

function buildLocations(members: FamilyMember[]): HomeLocation[] {
  if (!members.length) return homeLocationsFallback;
  const map = new Map<string, number>();
  for (const member of members) {
    const name = member.location?.trim();
    if (!name || name.toLowerCase() === "unknown") continue;
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  const rows = [...map.entries()]
    .map(([name, memberCount], index) => ({ id: `loc-${index}`, name, memberCount }))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 6);
  return rows.length ? rows : homeLocationsFallback;
}

function buildRecentMembers(members: FamilyMember[]): HomeRecentMember[] {
  if (!members.length) return homeRecentMembersFallback;
  return [...members]
    .slice(-4)
    .reverse()
    .map((member) => ({
      id: member.id,
      name: member.name,
      relation: member.nickname || member.relation,
      avatar: member.avatar,
      addedOn: "In family tree",
      href: `/members/${member.id}`
    }));
}

function dateIcon(type: string) {
  if (type === "Birthday") return Cake;
  if (type === "Anniversary") return CalendarHeart;
  if (type === "Remembrance") return Flower2;
  return CalendarHeart;
}

function mergeUpcomingDates() {
  const fromEvents = mockEvents
    .filter((event) => event.date >= new Date().toISOString().slice(0, 10))
    .map((event) => ({
      id: event.id,
      personName: event.title,
      eventType:
        event.type === "birthday"
          ? ("Birthday" as const)
          : event.type === "anniversary"
            ? ("Anniversary" as const)
            : event.type === "memorial"
              ? ("Remembrance" as const)
              : ("Family event" as const),
      date: event.date,
      location: event.location,
      href: `/events/${event.id}`
    }));

  const combined = [...fromEvents, ...homeFamilyDates];
  const seen = new Set<string>();
  return combined
    .filter((item) => {
      const key = `${item.date}-${item.personName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
}

export function HomePage() {
  const family = useFamilyBranding();
  const { members, isLoading } = useFamilyData();
  const totalMembers = members.length || homeGenderFallback.reduce((sum, slice) => sum + slice.value, 0);
  const generationsCount = homeGenerations.length;
  const upcomingDates = mergeUpcomingDates();
  const upcomingCount = upcomingDates.length;
  const genderSlices = buildGenderSlices(members);
  const locations = buildLocations(members);
  const recentMembers = buildRecentMembers(members);
  const featuredStory = mockStories.find((story) => story.status === "published") ?? mockStories[0];
  const maxLocation = Math.max(...locations.map((loc) => loc.memberCount), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:space-y-10 md:p-6">
      {/* 1. Family Hero */}
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div
          className="relative h-48 bg-cover bg-center sm:h-56 md:h-72"
          style={{ backgroundImage: `url(${mockFamily.cover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <img
                  src={family.logo}
                  alt=""
                  className="h-20 w-20 rounded-2xl border-4 border-slate-900 object-cover shadow-xl md:h-24 md:w-24"
                />
                <div className="min-w-0 pb-1">
                  <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">{family.name}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-slate-300">{family.description || mockFamily.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {mockFamily.origin}
                    </span>
                    <span>{generationsCount} generations</span>
                    <span>{mockFamily.location}</span>
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

      {/* 2. Family Statistics */}
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
          <p className="mt-2 text-3xl font-semibold text-slate-100">{generationsCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="flex items-center gap-2 text-sky-400">
            <CalendarHeart size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Upcoming Events</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{upcomingCount}</p>
        </article>
      </section>

      {/* 3 + 4. Growth & Demographics */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <HomeSection
          title="Family Growth"
          description="How the chronicle has grown over recent years."
          className="flex h-full flex-col"
        >
          <div className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
            <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <TrendingUp size={12} /> {homeGrowthSummary.status}
              </span>
              <span className="text-sm text-slate-400">{homeGrowthSummary.deltaLabel}</span>
            </div>

            <div className="min-h-0 flex-1">
              <GrowthChart points={homeGrowthSeries} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Members Added</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-300">
                  +{homeGrowthSummary.membersAdded}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Deceased</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-rose-300">-{homeGrowthSummary.deceased}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Net Growth</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-100">
                  +{homeGrowthSummary.netGrowth}
                </p>
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
            <GenderDonut slices={genderSlices} />
            <div className="mt-auto border-t border-slate-800 pt-3">
              <AgeDistributionPanel members={members} />
            </div>
          </div>
        </HomeSection>
      </div>

      {/* 5. Upcoming Family Dates */}
      <HomeSection
        title="Upcoming Family Dates"
        description="Birthdays, anniversaries, remembrances, and gatherings."
        actionLabel="View all"
        actionHref="/events"
      >
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
      </HomeSection>

      {/* 6 + 7. Recently Added & Tree Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HomeSection title="Recently Added Members" actionLabel="View all" actionHref="/members">
          <div className="grid gap-3 sm:grid-cols-2">
            {recentMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => navigateTo(member.href)}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-left transition hover:border-emerald-500/40"
              >
                <img src={member.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{member.name}</p>
                  <p className="truncate text-xs text-slate-500">{member.relation}</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {member.addedOn.includes("-") ? formatHomeDate(member.addedOn) : member.addedOn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </HomeSection>

        <HomeSection title="Family Tree Preview" description="A small glimpse of how the lineage connects.">
          <FamilyTreePreview root={homeTreePreview} />
        </HomeSection>
      </div>

      {/* 9. Family Memories */}
      <HomeSection title="Family Memories" description="Recent photos from the family gallery." actionLabel="View Gallery" actionHref="/gallery">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {homeMemories.map((memory) => (
            <button
              key={memory.id}
              type="button"
              onClick={() => navigateTo(memory.href)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-800"
            >
              <img src={memory.imageUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-2 pb-2 pt-6 text-left text-[11px] text-slate-100">
                {memory.title}
              </span>
            </button>
          ))}
        </div>
      </HomeSection>

      {/* 10. Featured Family Story */}
      {featuredStory ? (
        <HomeSection title="Featured Family Story">
          <button
            type="button"
            onClick={() => navigateTo(`/stories/${featuredStory.id}`)}
            className="grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 text-left transition hover:border-emerald-500/40 md:grid-cols-[1.2fr_1fr]"
          >
            <img src={featuredStory.coverImage} alt="" className="h-48 w-full object-cover md:h-full" />
            <div className="flex flex-col justify-center p-5 md:p-7">
              <p className="text-xs uppercase tracking-wider text-emerald-400">{formatHomeDate(featuredStory.date)}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-100">{featuredStory.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{featuredStory.description}</p>
              <span className="mt-5 inline-flex w-fit rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
                Read Story
              </span>
            </div>
          </button>
        </HomeSection>
      ) : null}

      {/* 11. Family Locations */}
      <HomeSection
        title="Family Locations"
        description={`${locations.length} places where the family lives today.`}
        actionLabel="View Family Map"
        actionHref="/family"
      >
        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-[1fr_1.1fr] sm:p-5">
          <div className="relative min-h-44 overflow-hidden rounded-2xl border border-edge bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--theme-accent)_18%,transparent),transparent_45%),radial-gradient(circle_at_70%_60%,color-mix(in_srgb,var(--theme-accent-hover)_12%,transparent),transparent_40%),linear-gradient(160deg,var(--theme-surface),var(--theme-page))]">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
            {locations.slice(0, 5).map((loc, index) => (
              <span
                key={loc.id}
                className="absolute rounded-full border border-emerald-400/50 bg-emerald-400/20 px-2 py-1 text-[10px] text-emerald-200"
                style={{
                  left: `${12 + index * 14}%`,
                  top: `${18 + ((index * 17) % 50)}%`
                }}
              >
                {loc.name}
              </span>
            ))}
            <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
              {locations.length} locations · stylized map preview
            </div>
          </div>
          <ul className="space-y-3">
            {locations.map((loc) => (
              <li key={loc.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-200">{loc.name}</span>
                  <span className="text-slate-500">{loc.memberCount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-400/80"
                    style={{ width: `${(loc.memberCount / maxLocation) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </HomeSection>

      {/* 12. Family Timeline */}
      <HomeSection title="Family Timeline" description="Recent moments across the chronicle." actionLabel="View Timeline" actionHref="/timeline">
        <ol className="relative space-y-0 border-l border-slate-800 ml-3">
          {homeTimelineEvents.map((event) => (
            <li key={event.id} className="relative pb-5 pl-5 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <button
                type="button"
                onClick={() => (event.href ? navigateTo(event.href) : undefined)}
                className="w-full rounded-xl px-1 py-0.5 text-left hover:bg-slate-900/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-emerald-400">{event.dateLabel}</span>
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                    {event.kind}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-100">{event.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
              </button>
            </li>
          ))}
        </ol>
      </HomeSection>
    </div>
  );
}
