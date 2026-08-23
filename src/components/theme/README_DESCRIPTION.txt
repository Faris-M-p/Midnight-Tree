================================================================================
FOLDER: src/components/theme/
================================================================================

1. FOLDER PURPOSE
-----------------
UI controls for switching the visual theme (distinct from theme/ token engine).

2. FILES IN THIS FOLDER
-----------------------
ThemeToggle.tsx
- Type: React component
- What it does: Button/control to cycle or select themes
- Exports: ThemeToggle
- Imports: theme/ThemeProvider, registry, storage/apply helpers
- Used by: components/layout/Header.tsx (and possibly public header)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: layout Header
Depends on: src/theme/* (provider, registry, themes/)
Does not call MidnightApi

4. REAL PROJECT EXAMPLES
------------------------
Header shows ThemeToggle → user switches midnight ↔ oceanBreeze

5. HOW TO MODIFY SOMETHING
--------------------------
Change toggle UI → ThemeToggle.tsx
Change available themes → theme/themes + registry.ts

6. SIMPLE FLOW DIAGRAM
----------------------
Header
 ↓
ThemeToggle
 ↓
ThemeProvider / applyTheme
 ↓
CSS variables update

7. .NET COMPARISON
------------------
≈ theme switcher user control (conceptual only).
