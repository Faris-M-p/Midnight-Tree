================================================================================
FOLDER: src/config/
================================================================================

1. FOLDER PURPOSE
-----------------
Environment/configuration values for the frontend. Currently holds the API
base URL read from Vite env vars.

2. FILES IN THIS FOLDER
-----------------------
env.ts
- Type: TypeScript config module
- What it does: Reads import.meta.env.VITE_API_BASE_URL; throws if missing
- Exports: env object (apiBaseUrl)
- Imports: Vite env
- Used by: services/apiClient.ts (every HTTP call)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: services/
Depends on: .env / .env.local at Midnight Tree root (not committed secrets)
Does not call MidnightApi itself — only provides the base URL string

4. REAL PROJECT EXAMPLES
------------------------
apiClient prefixes paths like "/api/events" with env.apiBaseUrl.

5. HOW TO MODIFY SOMETHING
--------------------------
Change backend address:
→ Set VITE_API_BASE_URL in .env.local
→ Restart Vite dev server
→ Confirm env.ts still reads the same variable name

6. SIMPLE FLOW DIAGRAM
----------------------
.env VITE_API_BASE_URL
 ↓
config/env.ts
 ↓
services/apiClient.ts
 ↓
fetch(fullUrl)

7. .NET COMPARISON
------------------
≈ appsettings.json URL / BaseAddress for HttpClient (conceptual only).
