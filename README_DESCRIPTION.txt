================================================================================
FOLDER: Midnight Tree/
================================================================================

1. FOLDER PURPOSE
-----------------
This folder is the entire React frontend SPA for Midnight ("Midnight Tree").
It is the UI users open in the browser. It does not contain the ASP.NET API
or the PostgreSQL database scripts (those live in MidnightApi/).

Why it exists:
- Render public marketing + auth pages
- Render the authenticated family app (tree, members, events, memories, ...)
- Call MidnightApi over HTTP

2. FILES IN THIS FOLDER (ROOT LEVEL)
------------------------------------
package.json
- Type: NPM package manifest
- What it does: Declares React/Vite/Tailwind dependencies and scripts (dev/build/lint)
- Exports: N/A
- Imports: N/A (consumed by npm/vite)
- Used by: Developers running npm run dev / build

vite.config.ts
- Type: Vite configuration
- What it does: Configures React + Tailwind Vite plugins
- Used by: Vite tooling

index.html
- Type: HTML shell
- What it does: Provides #root mount point for React
- Used by: Browser / Vite entry

tsconfig.json / tsconfig.app.json / tsconfig.node.json
- Type: TypeScript configs
- What they do: Type-check frontend code

src/
- Type: Folder
- What it does: All application source code (see src/README_DESCRIPTION.txt)

public/
- Type: Folder
- What it does: Static assets served as-is (favicon, icons)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: End users (browser)
Depends on: MidnightApi (HTTP API via VITE_API_BASE_URL)
Data flow: Browser → Midnight Tree → MidnightApi → PostgreSQL

.NET comparison (conceptual only):
≈ A React SPA client talking to a Web API, similar to a Blazor WASM or SPA
  front-end in front of ASP.NET controllers — not an exact equivalent.

4. REAL PROJECT EXAMPLES
------------------------
- src/App.tsx routes /events* to pages/app/EventsPage.tsx
- src/services/eventService.ts calls /api/events on MidnightApi

5. HOW TO MODIFY SOMETHING
--------------------------
If you need to change UI behavior:
→ Start in src/pages or src/pages/app
→ Then components/
→ Then services/
→ Then MidnightApi Controllers if the API contract must change

6. SIMPLE FLOW DIAGRAM
----------------------
Browser
 ↓
index.html
 ↓
src/main.tsx
 ↓
src/App.tsx
 ↓
Page + Components
 ↓
services/* + apiClient
 ↓
MidnightApi

7. .NET COMPARISON
------------------
Midnight Tree/ ≈ frontend client project
MidnightApi/   ≈ ASP.NET Web API project
(Conceptual only — different runtimes.)
