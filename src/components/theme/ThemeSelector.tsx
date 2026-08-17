import { Check, Palette } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "../../theme";

interface ThemeSelectorProps {
  variant?: "panel" | "menu";
}

function ThemeSwatches({ colors }: { colors: { page: string; sidebar: string; card: string; accent: string } }) {
  return (
    <span className="flex shrink-0 overflow-hidden rounded-md border border-edge" aria-hidden="true">
      <span className="h-7 w-3.5" style={{ backgroundColor: colors.page }} />
      <span className="h-7 w-3.5" style={{ backgroundColor: colors.sidebar }} />
      <span className="h-7 w-3.5" style={{ backgroundColor: colors.card }} />
      <span className="h-7 w-3.5" style={{ backgroundColor: colors.accent }} />
    </span>
  );
}

function ThemeOptions({ onPicked }: { onPicked?: () => void }) {
  const { themeId, themes, setThemeId } = useTheme();

  return (
    <div role="listbox" aria-label="Application theme" className="space-y-1.5">
      {themes.map((theme) => {
        const selected = theme.id === themeId;
        return (
          <button
            key={theme.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              setThemeId(theme.id);
              onPicked?.();
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
              selected
                ? "border-accent bg-accent-soft"
                : "border-edge bg-card hover:border-accent/40 hover:bg-surface-hover"
            }`}
          >
            <ThemeSwatches
              colors={{
                page: theme.colors.page,
                sidebar: theme.colors.sidebar,
                card: theme.colors.card,
                accent: theme.colors.accent
              }}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-fg">{theme.name}</span>
              <span className="mt-0.5 block truncate text-[10px] leading-snug text-fg-muted">{theme.description}</span>
            </span>
            {selected ? <Check size={14} className="shrink-0 text-accent" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSelector({ variant = "panel" }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "panel") {
    return (
      <section className="space-y-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">Appearance</p>
        <ThemeOptions />
      </section>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-fg-secondary transition hover:bg-surface hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Theme: ${theme.name}`}
        title="Theme"
      >
        <Palette size={18} aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-[80] mt-2 w-[min(18.5rem,calc(100vw-1.5rem))] rounded-2xl border border-edge bg-card p-2 shadow-theme"
        >
          <ThemeOptions onPicked={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
