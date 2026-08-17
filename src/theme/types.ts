export type ThemeScheme = "dark" | "light";

/**
 * Shared token set every theme must provide.
 * Components consume these via CSS variables / Tailwind utilities — never by theme id.
 */
export interface ThemeColors {
  page: string;
  sidebar: string;
  header: string;
  card: string;
  surface: string;
  surfaceHover: string;
  fg: string;
  fgSecondary: string;
  fgMuted: string;
  border: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  accentFg: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  dangerFg: string;
  dangerSoft: string;
  input: string;
  inputBorder: string;
  overlay: string;
  overlayStrong: string;
  shadow: string;
  map: string;
  ring: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  scheme: ThemeScheme;
  colors: ThemeColors;
}

export const THEME_COLOR_TO_CSS: Record<keyof ThemeColors, string> = {
  page: "--theme-page",
  sidebar: "--theme-sidebar",
  header: "--theme-header",
  card: "--theme-card",
  surface: "--theme-surface",
  surfaceHover: "--theme-surface-hover",
  fg: "--theme-fg",
  fgSecondary: "--theme-fg-secondary",
  fgMuted: "--theme-fg-muted",
  border: "--theme-border",
  accent: "--theme-accent",
  accentHover: "--theme-accent-hover",
  accentMuted: "--theme-accent-muted",
  accentFg: "--theme-accent-fg",
  accentSoft: "--theme-accent-soft",
  success: "--theme-success",
  warning: "--theme-warning",
  danger: "--theme-danger",
  dangerFg: "--theme-danger-fg",
  dangerSoft: "--theme-danger-soft",
  input: "--theme-input",
  inputBorder: "--theme-input-border",
  overlay: "--theme-overlay",
  overlayStrong: "--theme-overlay-strong",
  shadow: "--theme-shadow",
  map: "--theme-map",
  ring: "--theme-ring"
};
