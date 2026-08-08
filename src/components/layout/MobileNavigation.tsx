import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileNavigationProps {
  open: boolean;
  pathname: string;
  onClose: () => void;
}

export function MobileNavigation({ open, pathname, onClose }: MobileNavigationProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-950/70" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-[min(20rem,90vw)] flex-col bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-end p-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Sidebar pathname={pathname} onNavigate={onClose} variant="drawer" />
        </div>
      </div>
    </div>
  );
}
