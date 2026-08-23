================================================================================
FOLDER: src/theme/
================================================================================

1. FOLDER PURPOSE
-----------------
Visual theming system: theme registry, CSS variable application, persistence,
and React ThemeProvider. Lets users switch looks (e.g. midnight, oceanBreeze).

2. FILES IN THIS FOLDER
-----------------------
ThemeProvider.tsx — React context for current theme
applyTheme.ts — Writes CSS variables onto document
storage.ts — Persist selected theme id in localStorage
registry.ts — Lookup theme definition by id
types.ts — Theme TypeScript types
index.ts — Public re-exports
themes/ — Concrete theme definitions (see themes/README_DESCRIPTION.txt)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: main.tsx (initial apply + provider), components/theme/ThemeToggle.tsx
Depends on: theme/themes/* definitions, index.css variables consumption
Independent of MidnightApi

4. REAL PROJECT EXAMPLES
------------------------
main.tsx: applyThemeById(readStoredThemeId()) before render
ThemeToggle cycles registry themes and persists via storage.ts

5. HOW TO MODIFY SOMETHING
--------------------------
Add a new theme:
→ Create themes/myTheme.ts
→ Register in registry.ts
→ Toggle will pick it up

6. SIMPLE FLOW DIAGRAM
----------------------
ThemeToggle
 ↓
ThemeProvider + storage
 ↓
applyTheme → CSS variables
 ↓
Components styled via Tailwind/CSS vars

7. .NET COMPARISON
------------------
≈ theming / resource dictionaries (conceptual only).
