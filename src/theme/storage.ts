import { DEFAULT_THEME_ID, isThemeId } from "./registry";

export const THEME_STORAGE_KEY = "midnight.theme-id";

export function readStoredThemeId(): string {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isThemeId(stored)) return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return DEFAULT_THEME_ID;
}

export function persistThemeId(id: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore quota / privacy errors */
  }
}
