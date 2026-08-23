================================================================================
FOLDER: src/theme/themes/
================================================================================

1. FOLDER PURPOSE
-----------------
Concrete named theme objects (color palettes / tokens) registered by the
theme system.

2. FILES IN THIS FOLDER
-----------------------
midnight.ts — Default/dark-family Midnight palette definition
oceanBreeze.ts — Alternate theme palette definition

Each:
- Type: TypeScript theme constant module
- Exports: theme definition object matching theme/types.ts
- Used by: theme/registry.ts

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: theme/registry.ts → ThemeProvider / applyTheme
Depends on: theme/types.ts
Consumed visually by all components via CSS variables

4. REAL PROJECT EXAMPLES
------------------------
Switching ThemeToggle to oceanBreeze loads oceanBreeze.ts tokens.

5. HOW TO MODIFY SOMETHING
--------------------------
Change primary accent for Midnight theme:
→ Edit color tokens in midnight.ts
→ Refresh app (theme re-apply)

6. SIMPLE FLOW DIAGRAM
----------------------
themes/midnight.ts
 ↓
registry.ts
 ↓
applyTheme.ts
 ↓
document CSS variables

7. .NET COMPARISON
------------------
≈ theme resource files (conceptual only).
