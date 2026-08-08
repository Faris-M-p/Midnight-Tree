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
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-900 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="truncate text-base font-semibold text-slate-100 md:text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative rounded-lg p-2 text-slate-300 transition hover:bg-slate-900 hover:text-emerald-300"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950">
                {unread}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <img src={mockFamily.logo} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-700" />
            <span className="max-w-[140px] truncate text-sm font-medium text-slate-200">{mockFamily.name}</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-900"
              aria-label="More"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-30 w-40 rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-xl">
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
