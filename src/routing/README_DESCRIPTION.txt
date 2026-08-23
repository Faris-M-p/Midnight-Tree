================================================================================
FOLDER: src/routing/
================================================================================

1. FOLDER PURPOSE
-----------------
Custom client-side routing helpers (History API). This project does not use
react-router.

2. FILES IN THIS FOLDER
-----------------------
navigate.ts
- Type: TypeScript module
- What it does: navigateTo(path), matchPath(pattern, pathname)
- Exports: navigation helpers
- Used by: App.tsx, pages, services/apiClient (401 redirect), buttons/links

titles.ts
- Type: TypeScript module
- What it does: Page title mapping + tree path detection helpers
- Exports: getPageTitle, isTreePath, related helpers
- Used by: App.tsx / layout title display

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: App.tsx, pages/, navigation/, apiClient
Depends on: Browser History API
Works with: navigation/appNav.ts (link definitions)

4. REAL PROJECT EXAMPLES
------------------------
After creating an event: navigateTo(`/events/${id}`)
App.tsx uses matchPath("/members/:id", pathname)

5. HOW TO MODIFY SOMETHING
--------------------------
Add a new route:
1) Create page under pages/ or pages/app/
2) Add match in App.tsx
3) Add nav item in navigation/appNav.ts
4) Add title in routing/titles.ts

6. SIMPLE FLOW DIAGRAM
----------------------
navigateTo('/events')
 ↓
history.pushState
 ↓
App popstate/pathname state
 ↓
render EventsPage

7. .NET COMPARISON
------------------
≈ MapControllers route table, but client-side only (conceptual).
