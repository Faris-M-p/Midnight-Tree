================================================================================
FOLDER: src/navigation/
================================================================================

1. FOLDER PURPOSE
-----------------
Declarative navigation item definitions (labels, paths, icons) for public and
authenticated chrome. Keeps link lists out of layout components.

2. FILES IN THIS FOLDER
-----------------------
appNav.ts
- Type: TypeScript config module
- What it does: Authenticated sidebar/nav items (Home, Family, Members, Tree,
  Memories, Events, Access Tokens, …)
- Exports: nav item arrays/helpers
- Used by: components/layout/AppNavItems.tsx, Sidebar, MobileNavigation

publicNav.ts
- Type: TypeScript config module
- What it does: Public marketing header links (Features, About, Login, …)
- Exports: public nav items
- Used by: components/layout/PublicHeader.tsx

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: components/layout/
Depends on: routing paths that App.tsx must also understand
Does not fetch data

4. REAL PROJECT EXAMPLES
------------------------
Sidebar Events link comes from appNav.ts → AppNavItems → Sidebar

5. HOW TO MODIFY SOMETHING
--------------------------
Rename sidebar "Events" label:
→ Edit appNav.ts label
Add new sidebar page:
→ Add item here AND wire route in App.tsx

6. SIMPLE FLOW DIAGRAM
----------------------
appNav.ts definitions
 ↓
AppNavItems / Sidebar
 ↓
navigateTo(path)
 ↓
App.tsx page render

7. .NET COMPARISON
------------------
≈ Menu configuration / _Layout nav links (conceptual only).
