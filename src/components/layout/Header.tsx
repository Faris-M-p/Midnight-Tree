import { Bell, Menu, MoreVertical } from "lucide-react";
import { useState } from "react";
import { mockFamily } from "../../data/mockFamily";
import { logout } from "../../auth/session";
import { navigateTo } from "../../routing/navigate";
import { NotificationDrawer, unreadNotificationCount } from "./NotificationDrawer";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = unreadNotificationCount();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-slate-800 bg-slate-950/90 px-3 backdrop-blur xl:h-16 xl:px-4">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-900 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 xl:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 xl:gap-3">
          <img
            src={mockFamily.logo}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full border border-slate-700 object-cover xl:hidden"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100 xl:hidden">{mockFamily.name}</p>
            <h1 className="hidden truncate text-base font-semibold text-slate-100 xl:block xl:text-lg">{title}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 xl:gap-2">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-900 hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            aria-label="Notifications"
          >
            <Bell size={18} aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-4 text-slate-950">
                {unread}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 xl:flex">
            <img src={mockFamily.logo} alt="" className="h-8 w-8 rounded-full border border-slate-700 object-cover" />
            <span className="max-w-[160px] truncate text-sm font-medium text-slate-200">{mockFamily.name}</span>
          </div>

          <div className="relative hidden xl:block">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              aria-label="More"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={18} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-40 rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigateTo("/login");
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
