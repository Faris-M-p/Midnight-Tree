================================================================================
FOLDER: Midnight Tree/src/
================================================================================

1. FOLDER PURPOSE
-----------------
This is the heart of the frontend application. Almost all React/TypeScript
code lives here: entry point, router, pages, components, services, auth,
theme, and utilities.

Why it exists:
- Organize the SPA by responsibility (pages vs components vs services)
- Keep API access in services/, UI in components/pages/, auth in auth/

2. FILES IN THIS FOLDER
-----------------------
main.tsx
- Type: React entry module
- What it does: Applies theme, mounts ThemeProvider, App, GlobalLoader, AppToaster
- Exports: (side-effect mount)
- Imports: react-dom/client, App, theme helpers, GlobalLoader, AppToaster
- Used by: index.html / Vite

App.tsx
- Type: React root component / custom router
- What it does: History API routing, auth gate, FamilyDataProvider + AppLayout
- Exports: default App
- Imports: pages/*, layout, auth, routing
- Used by: main.tsx

index.css
- Type: Global CSS / Tailwind entry
- What it does: Base styles and design tokens used across the app
- Used by: main.tsx / Vite CSS pipeline

types.ts
- Type: TypeScript types for tree canvas UI
- What it does: Defines FamilyMember, MarriageUnion, etc. for FamilyTreeCanvas
- Used by: tree canvas components + treeService mapping

Subfolders (each has README_DESCRIPTION.txt):
auth/, components/, config/, context/, data/, hooks/, layout/, navigation/,
pages/, routing/, services/, theme/, types/, utils/, assets/

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: Vite build / browser
Depends on: public/ (static), MidnightApi (via services)
Internal flow: pages → components → hooks/context → services → apiClient

4. REAL PROJECT EXAMPLES
------------------------
Authenticated /events route:
App.tsx → pages/app/EventsPage.tsx → services/eventService.ts → apiClient

5. HOW TO MODIFY SOMETHING
--------------------------
Change routing: App.tsx + routing/ + navigation/
Change a screen: pages/ or pages/app/
Change shared UI: components/
Change API calls: services/
Change login gate: auth/

6. SIMPLE FLOW DIAGRAM
----------------------
main.tsx
 ↓
App.tsx
 ↓
Page
 ↓
Components
 ↓
Services
 ↓
apiClient
 ↓
Backend

7. .NET COMPARISON
------------------
src/ ≈ the whole client "presentation + application" layer of a SPA.
Not the same as an ASP.NET Controllers folder.
