import { getTheme } from "./registry";
import { THEME_COLOR_TO_CSS, type ThemeDefinition } from "./types";

export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  root.style.colorScheme = theme.scheme;

  for (const [token, cssVar] of Object.entries(THEME_COLOR_TO_CSS)) {
    root.style.setProperty(cssVar, theme.colors[token as keyof ThemeDefinition["colors"]]);
  }
}

export function applyThemeById(id: string): ThemeDefinition {
  const theme = getTheme(id);
  applyTheme(theme);
  return theme;
}

export function readThemeCssVar(cssVar: string, fallback = ""): string {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || fallback;
}
