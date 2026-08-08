/**
 * Sonner toaster styled like the success / info / warning / error cards.
 */

import type { ComponentType } from "react";
import { Toaster, toast } from "sonner";
import { Check, Lightbulb, X } from "lucide-react";

export type ToastKind = "success" | "info" | "warning" | "error";

interface ToastCardProps {
  id: string | number;
  kind: ToastKind;
  title: string;
  description: string;
}

function WarningMark({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`font-bold leading-none text-white ${className}`} style={{ fontSize: Math.max(12, size) }}>
      !
    </span>
  );
}

const kindStyles: Record<
  ToastKind,
  { wrap: string; iconWrap: string; Icon: ComponentType<{ size?: number; className?: string }> }
> = {
  success: {
    wrap: "bg-[#eefbf3] border-[#86d4a8]",
    iconWrap: "bg-[#22c55e]",
    Icon: Check
  },
  info: {
    wrap: "bg-[#eef6ff] border-[#8bb8ff]",
    iconWrap: "bg-[#3b82f6]",
    Icon: Lightbulb
  },
  warning: {
    wrap: "bg-[#fff8e8] border-[#f0c14b]",
    iconWrap: "bg-[#f5c518]",
    Icon: WarningMark
  },
  error: {
    wrap: "bg-[#fdeeee] border-[#e07a7a]",
    iconWrap: "bg-[#e11d48]",
    Icon: X
  }
};

export function ToastCard({ id, kind, title, description }: ToastCardProps) {
  const style = kindStyles[kind];
  const Icon = style.Icon;

  return (
    <div
      className={`w-[360px] max-w-[calc(100vw-24px)] rounded-xl border shadow-[0_8px_24px_rgba(15,23,42,0.12)] px-3.5 py-3 flex items-start gap-3 ${style.wrap}`}
    >
      <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${style.iconWrap}`}>
        <Icon size={14} className="text-white" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{title}</p>
        <p className="mt-0.5 text-[13px] text-slate-600 leading-snug break-words">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      visibleToasts={4}
      offset={16}
      toastOptions={{
        unstyled: true,
        className: "w-auto"
      }}
    />
  );
}
