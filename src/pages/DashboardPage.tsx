import { useEffect, useMemo, useState } from "react";
import { GitBranch, LogOut, RefreshCcw, Users, Network, HeartPulse, Shield } from "lucide-react";
import { ApiClientError } from "../services/apiClient";
import { getFamilyDashboard, getFamilyTimeline } from "../services/familyService";
import type { AuthUser } from "../types/auth";
import type { DashboardResponse } from "../types/dashboard";
import type { FamilyTimelineItem } from "../types/family";

interface DashboardPageProps {
  onNavigate: (path: "/" | "/register" | "/login" | "/dashboard" | "/family" | "/members" | "/timeline" | "/gallery" | "/analytics" | "/tree") => void;
  onLogout: () => void;
  currentUser: AuthUser | null;
  isLoggingOut: boolean;
}

const protectedNav: Array<{
  label: string;
  path: "/dashboard" | "/family" | "/members" | "/timeline" | "/gallery" | "/analytics";
}> = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Family", path: "/family" },
  { label: "Members", path: "/members" },
  { label: "Timeline", path: "/timeline" },
  { label: "Gallery", path: "/gallery" },
  { label: "Analytics", path: "/analytics" }
];

function formatDate(value?: string | null): string {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function DashboardPage({ onNavigate, onLogout, currentUser, isLoggingOut }: DashboardPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [recentActivity, setRecentActivity] = useState<FamilyTimelineItem[]>([]);

  const loadDashboard = async () => {
    setIsLoading(true);
    setIsActivityLoading(true);
    setErrorMessage("");

    try {
      const [data, timeline] = await Promise.all([
        getFamilyDashboard(),
        getFamilyTimeline()
      ]);
      setDashboard(data);
      setRecentActivity(timeline.slice(0, 8));
    } catch (error) {
      setDashboard(null);
      setRecentActivity([]);
      if (error instanceof ApiClientError) {
        setErrorMessage(error.statusCode >= 500
          ? "Unable to load dashboard right now. Please try again."
          : error.message);
      } else {
        setErrorMessage("Unable to load dashboard right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsActivityLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const isEmptyState = useMemo(() => {
    if (!dashboard) {
      return false;
    }

    return (
      dashboard.totalMembers === 0 &&
      dashboard.totalGenerations === 0 &&
      dashboard.recentMembers.length === 0 &&
      dashboard.upcomingBirthdays.length === 0
    );
  }, [dashboard]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => onNavigate("/dashboard")}
            className="inline-flex items-center gap-2 text-left"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <GitBranch className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-100">Midnight Chronicle</span>
              <span className="block text-xs text-slate-400">Authenticated Workspace</span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {protectedNav.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  item.path === "/dashboard"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <p className="max-w-[200px] truncate text-sm text-slate-400">
              {currentUser?.username ? `Signed in as ${currentUser.username}` : "Authenticated"}
            </p>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-white">Family Dashboard</h1>
            <p className="text-sm text-slate-400">
              Overview of your family records, recent members, and upcoming milestones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="inline-flex items-center gap-3 text-sm text-slate-300">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              Loading dashboard...
            </div>
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6">
            <p className="text-sm text-rose-300">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && isEmptyState ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-slate-100">No dashboard data yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your family dashboard is ready. Add family members to start seeing insights and timelines.
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && dashboard && !isEmptyState ? (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Users className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm text-slate-400">Total Members</p>
                <p className="text-2xl font-semibold text-white">{dashboard.totalMembers}</p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Network className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm text-slate-400">Generations</p>
                <p className="text-2xl font-semibold text-white">{dashboard.totalGenerations}</p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm text-slate-400">Living Members</p>
                <p className="text-2xl font-semibold text-white">{dashboard.stats.livingCount}</p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm text-slate-400">Family Code</p>
                <p className="text-2xl font-semibold text-white">{dashboard.family.familyCode}</p>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-lg font-semibold text-slate-100">Recent Members</h2>
                {dashboard.recentMembers.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No recent members found.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {dashboard.recentMembers.map((member) => (
                      <li key={member.id} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <p className="text-sm font-medium text-slate-100">{member.fullName}</p>
                        <p className="text-xs text-slate-400">
                          {member.gender || "Unknown"} • DOB: {formatDate(member.dateOfBirth)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-lg font-semibold text-slate-100">Upcoming Birthdays</h2>
                {dashboard.upcomingBirthdays.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No upcoming birthdays at the moment.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {dashboard.upcomingBirthdays.map((birthday) => (
                      <li key={birthday.memberId} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <p className="text-sm font-medium text-slate-100">{birthday.fullName}</p>
                        <p className="text-xs text-slate-400">
                          {formatDate(birthday.dateOfBirth)} • Turning {birthday.turningAge} in {birthday.daysUntil} day(s)
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-slate-100">Recent Activity</h2>
              {isActivityLoading ? (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  Loading activity...
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No recent activity available.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentActivity.map((item) => (
                    <li key={item.eventId} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <p className="text-sm font-medium text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        {item.memberName} • {item.eventType} • {formatDate(item.eventDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-slate-100">Family Snapshot</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm font-medium text-slate-100">{dashboard.family.familyName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {dashboard.family.description?.trim() || "No family description available yet."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                    <span className="text-slate-400">Male</span>
                    <p className="text-lg font-semibold text-slate-100">{dashboard.stats.maleCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                    <span className="text-slate-400">Female</span>
                    <p className="text-lg font-semibold text-slate-100">{dashboard.stats.femaleCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                    <span className="text-slate-400">Other</span>
                    <p className="text-lg font-semibold text-slate-100">{dashboard.stats.otherGenderCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                    <span className="text-slate-400">Deceased</span>
                    <p className="text-lg font-semibold text-slate-100">{dashboard.stats.deceasedCount}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
