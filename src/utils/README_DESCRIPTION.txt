================================================================================
FOLDER: src/utils/
================================================================================

1. FOLDER PURPOSE
-----------------
Pure helpers shared across UI: toasts, logging, name formatting, image
validation helpers, date/time helpers for events, default avatars.

2. FILES IN THIS FOLDER
-----------------------
notify.tsx — Toast helpers including fromApiError mapping (Sonner)
logFailure.ts — Console/error logging helpers
memberName.ts — Format member display names
memberRanks.ts — Rank labels for tree/home
eventDateTime.ts — Local ↔ UTC helpers for event datetime picker
eventImages.ts — Cover image validation helpers for events
memoryImages.ts — Memory image helpers
defaultAvatar.ts — Fallback avatar URL/helper

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/, components/, sometimes services consumers
Depends on: types (occasionally), Sonner via AppToaster
Does not own HTTP endpoints

4. REAL PROJECT EXAMPLES
------------------------
EventsPage submits ISO UTC via eventDateTime helpers and shows toasts via notify.

5. HOW TO MODIFY SOMETHING
--------------------------
Change how API errors appear:
→ utils/notify.tsx (+ apiClient error shape)
Change event datetime display:
→ eventDateTime.ts + EventsPage

6. SIMPLE FLOW DIAGRAM
----------------------
API throws ApiClientError
 ↓
notify.fromApiError
 ↓
AppToaster (Sonner) shows message

7. .NET COMPARISON
------------------
≈ shared helper/extension methods (conceptual only).
