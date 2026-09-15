import { X } from "lucide-react";
import { EmptyState } from "../ui/PageStates";
import { DrawerPortal } from "./DrawerPortal";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function unreadNotificationCount() {
  return 0;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  if (!open) return null;

  return (
    <DrawerPortal>
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-dvh w-full max-w-md border-l border-edge bg-card shadow-theme">
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

        <div className="h-[calc(100%-72px)] overflow-y-auto p-4">
          <EmptyState title="No notifications" message="Family updates will appear here." />
        </div>
      </aside>
    </div>
    </DrawerPortal>
  );
}
