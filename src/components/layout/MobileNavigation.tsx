import { useEffect } from "react";
import { X } from "lucide-react";
import { mockFamily } from "../../data/mockFamily";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { AppNavItems } from "./AppNavItems";
import { DrawerPortal } from "./DrawerPortal";

interface MobileNavigationProps {
  open: boolean;
  pathname: string;
  onClose: () => void;
}

export function MobileNavigation({ open, pathname, onClose }: MobileNavigationProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <DrawerPortal>
    <div
      className={`fixed inset-0 z-50 xl:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 flex h-dvh w-[min(20rem,85vw)] max-w-xs flex-col bg-slate-950 shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Application navigation"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <img src={mockFamily.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">{mockFamily.name}</p>
              <p className="truncate text-[11px] text-slate-500">Midnight Chronicle</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <AppNavItems pathname={pathname} onNavigate={onClose} />
      </aside>
    </div>
    </DrawerPortal>
  );
}
