import type { ThemeDefinition } from "../types";

/** Existing Midnight dark look, expressed as tokens. */
export const midnightTheme: ThemeDefinition = {
  id: "midnight",
  name: "Midnight",
  description: "Dark theme",
  scheme: "dark",
  colors: {
    page: "#020617",
    sidebar: "#020617",
    header: "#020617",
    card: "#0f172a",
    surface: "#0f172a",
    surfaceHover: "#1e293b",
    fg: "#f1f5f9",
    fgSecondary: "#cbd5e1",
    fgMuted: "#64748b",
    border: "#1e293b",
    accent: "#10b981",
    accentHover: "#34d399",
    accentMuted: "#6ee7b7",
    accentFg: "#020617",
    accentSoft: "rgba(16, 185, 129, 0.15)",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f43f5e",
    dangerFg: "#fda4af",
    dangerSoft: "rgba(136, 19, 55, 0.4)",
    input: "#020617",
    inputBorder: "#334155",
    overlay: "rgba(2, 6, 23, 0.7)",
    overlayStrong: "rgba(0, 0, 0, 0.9)",
    shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
    map: "#0f172a",
    ring: "#34d399",
    ghostCard: "#3b4657",
    ghostBorder: "#94a3b8",
    ghostFg: "#e2e8f0"
  }
};
