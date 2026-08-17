import { Moon, Sun } from "lucide-react";
import { getThemeByScheme, useTheme } from "../../theme";

/**
 * Compact day/dark control. It only sets the selected theme id;
 * colors come from the theme registry via CSS tokens.
 */
export function ThemeToggle() {
  const { theme, setThemeId } = useTheme();
  const dayTheme = getThemeByScheme("light");
  const nightTheme = getThemeByScheme("dark");
  const isDay = theme.scheme === "light";

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="relative inline-flex h-9 shrink-0 items-center rounded-full border border-edge bg-surface p-0.5"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0.5 h-8 w-8 rounded-full bg-card shadow-theme transition-transform duration-300 ease-out ${
          isDay ? "translate-x-0" : "translate-x-8"
        }`}
      />
      <button
        type="button"
        role="radio"
        aria-checked={isDay}
        aria-label={dayTheme.name}
        onClick={() => setThemeId(dayTheme.id)}
        className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
          isDay ? "text-accent" : "text-fg-muted hover:text-fg-secondary"
        }`}
      >
        <Sun size={15} strokeWidth={2.25} aria-hidden="true" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isDay}
        aria-label={nightTheme.name}
        onClick={() => setThemeId(nightTheme.id)}
        className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
          isDay ? "text-fg-muted hover:text-fg-secondary" : "text-accent"
        }`}
      >
        <Moon size={15} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}
