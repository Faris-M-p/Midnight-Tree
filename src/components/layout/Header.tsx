import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { NotificationDrawer, unreadNotificationCount } from "./NotificationDrawer";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  const family = useFamilyBranding();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
            src={family.logo}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full border border-slate-700 object-cover xl:hidden"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100 xl:hidden">{family.name}</p>
            <h1 className="hidden truncate text-base font-semibold text-slate-100 xl:block xl:text-lg">{title}</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-900 hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          aria-label="Notifications"
        >
          <Bell size={18} aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-4 text-slate-950">
              {unread}
            </span>
          )}
        </button>
      </header>

      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
