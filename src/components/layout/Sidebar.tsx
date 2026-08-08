import {
  BookOpen,
  CalendarDays,
  GitBranch,
  Home,
  Image,
  KeyRound,
  LogOut,
  TreePine,
  Users,
  Clock3
} from "lucide-react";
import { navigateTo } from "../../routing/navigate";
import { isAdmin } from "../../auth/permissions";
import { logout } from "../../auth/session";

interface SidebarProps {
  pathname: string;
  onNavigate?: () => void;
  variant?: "desktop" | "drawer";
}

const mainItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/family", label: "Family", icon: TreePine },
  { href: "/members", label: "Members", icon: Users },
  { href: "/family-tree", label: "Family Tree", icon: GitBranch },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/events", label: "Events", icon: CalendarDays }
];

function isActive(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ pathname, onNavigate, variant = "desktop" }: SidebarProps) {
  const showAdmin = isAdmin();

  const go = (path: string) => {
    navigateTo(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    navigateTo("/login");
    onNavigate?.();
  };

  return (
    <aside
      className={`${
        variant === "desktop" ? "hidden lg:flex" : "flex"
      } h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950/95`}
    >
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Midnight</p>
        <p className="mt-1 text-sm font-semibold text-slate-100">Family Chronicle</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => go(item.href)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}

        {showAdmin && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Administration
            </p>
            <button
              type="button"
              onClick={() => go("/access-tokens")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                pathname.startsWith("/access-tokens")
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <KeyRound size={16} />
              Access Tokens
            </button>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-rose-950/40 hover:text-rose-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
