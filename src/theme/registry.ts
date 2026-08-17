import type { ThemeDefinition } from "./types";
import { midnightTheme } from "./themes/midnight";
import { oceanBreezeTheme } from "./themes/oceanBreeze";

/**
 * Register a theme by adding its definition here.
 *
 * To add Lavender Mist (or any future theme):
 * 1. Create `src/theme/themes/lavenderMist.ts` with the same ThemeDefinition tokens.
 * 2. Import it and append it to THEME_REGISTRY.
 * 3. Optionally copy the token values into `src/index.css` under `[data-theme="lavender-mist"]`
 *    so the first paint matches before JavaScript runs.
 *
 * Do not add theme checks in pages or components. They already read CSS variables.
 */
export const THEME_REGISTRY: ThemeDefinition[] = [midnightTheme, oceanBreezeTheme];

export const DEFAULT_THEME_ID = midnightTheme.id;

const themesById = new Map(THEME_REGISTRY.map((theme) => [theme.id, theme]));

export function listThemes(): ThemeDefinition[] {
  return THEME_REGISTRY;
}

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return (id && themesById.get(id)) || midnightTheme;
}

export function isThemeId(id: string): boolean {
  return themesById.has(id);
}
