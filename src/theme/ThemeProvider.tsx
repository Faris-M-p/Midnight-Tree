import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { applyTheme } from "./applyTheme";
import { getTheme, listThemes } from "./registry";
import { persistThemeId, readStoredThemeId } from "./storage";
import type { ThemeDefinition } from "./types";

interface ThemeContextValue {
  theme: ThemeDefinition;
  themeId: string;
  themes: ThemeDefinition[];
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(readStoredThemeId);
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const themes = useMemo(() => listThemes(), []);

  useLayoutEffect(() => {
    applyTheme(theme);
    persistThemeId(theme.id);
  }, [theme]);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(getTheme(id).id);
  }, []);

  const value = useMemo(
    () => ({ theme, themeId: theme.id, themes, setThemeId }),
    [theme, themes, setThemeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
