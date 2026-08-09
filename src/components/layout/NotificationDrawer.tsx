import { Bell, BookOpen, CalendarDays, Gift, Heart, Image, X } from "lucide-react";
import { mockNotifications, type NotificationKind } from "../../data/mockNotifications";
import { navigateTo } from "../../routing/navigate";
import { DrawerPortal } from "./DrawerPortal";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const kindIcon: Record<NotificationKind, typeof Bell> = {
  birthday: Gift,
  anniversary: Heart,
  event: CalendarDays,
  story: BookOpen,
  other: Image
};

export function unreadNotificationCount() {
  return mockNotifications.filter((n) => !n.read).length;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  if (!open) return null;

  return (
    <DrawerPortal>
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-950/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-dvh w-full max-w-md border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Notifications</h2>
            <p className="text-xs text-slate-500">Birthdays, stories, events, and family updates</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-[calc(100%-72px)] overflow-y-auto p-4 space-y-2">
          {mockNotifications.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo(item.href);
                }}
                className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-500/40 ${
                  item.read ? "border-slate-800 bg-slate-900/40" : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-slate-900 p-2 text-emerald-400">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.message}</p>
                  </div>
                  {!item.read && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
    </DrawerPortal>
  );
}
