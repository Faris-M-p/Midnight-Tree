import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

interface MemoryLightboxProps {
  images: Array<{ id: number; url: string; alt?: string }>;
  index: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function MemoryLightbox({ images, index, onClose, onChangeIndex }: MemoryLightboxProps) {
  useBodyScrollLock(true);

  const current = images[index];
  const total = images.length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && index > 0) onChangeIndex(index - 1);
      if (event.key === "ArrowRight" && index < total - 1) onChangeIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, onClose, onChangeIndex]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-slate-100">
        <p className="text-sm font-medium tabular-nums">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-sm hover:bg-slate-900"
        >
          <X size={16} /> Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        <button
          type="button"
          aria-label="Previous"
          disabled={index <= 0}
          onClick={() => onChangeIndex(index - 1)}
          className="absolute left-3 z-10 rounded-full border border-slate-700 bg-slate-950/70 p-2 text-slate-100 disabled:opacity-30 sm:left-6"
        >
          <ChevronLeft size={22} />
        </button>

        <img
          src={current.url}
          alt={current.alt || "Memory photo"}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
        />

        <button
          type="button"
          aria-label="Next"
          disabled={index >= total - 1}
          onClick={() => onChangeIndex(index + 1)}
          className="absolute right-3 z-10 rounded-full border border-slate-700 bg-slate-950/70 p-2 text-slate-100 disabled:opacity-30 sm:right-6"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
