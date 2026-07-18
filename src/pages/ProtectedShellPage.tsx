import { GitBranch, LogOut } from "lucide-react";
import type { AuthUser } from "../types/auth";

interface ProtectedShellPageProps {
  title: string;
  description: string;
  currentPath: "/dashboard" | "/family" | "/members" | "/timeline" | "/gallery" | "/analytics" | "/tree";
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

export function ProtectedShellPage({
  title,
  description,
  currentPath,
  onNavigate,
  onLogout,
  currentUser,
  isLoggingOut
}: ProtectedShellPageProps) {
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
                  currentPath === item.path
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

      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-black/20">
          <h1 className="font-serif text-3xl text-white">{title}</h1>
          <p className="mt-3 max-w-2xl text-slate-400">{description}</p>
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-sm text-slate-400">
            This module is protected and ready for API integration in upcoming tasks.
          </div>
        </div>
      </main>
    </div>
  );
}
