================================================================================
FOLDER: src/services/
================================================================================

1. FOLDER PURPOSE
-----------------
Frontend API access layer. Pages/components should call these modules instead
of calling fetch() directly. All HTTP goes through apiClient.ts.

Why it exists:
- Centralize endpoints, FormData shaping, and typing
- Keep JWT / envelope / loader / 401 handling in one place (apiClient)

2. FILES IN THIS FOLDER
-----------------------
apiClient.ts
- Central fetch wrapper: Bearer token, ApiResponse unwrap, ApiClientError,
  loadingTracker begin/end, 401 logout redirect
- Exports: apiRequest, apiFormRequest, ApiClientError
- Used by: every other *Service in this folder

authSessionService.ts — Persist/read/clear JWT session in localStorage
authService.ts — Register/login/verify/forgot/reset password APIs
accessTokenService.ts — Access-token login + admin CRUD APIs
memberService.ts — Member CRUD + related member endpoints
treeService.ts — Family tree API → canvas member/union mapping
familyService.ts — Family profile get/update + cover upload
memoryService.ts — Memories list/detail CRUD + images
eventService.ts — Events list/detail CRUD + cover FormData
loadingTracker.ts — In-flight request counter for GlobalLoader

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/, components/, auth/, context/
Depends on: config/env.ts, types/*, auth/session (via apiClient), utils/notify (indirectly)
Calls: MidnightApi /api/* endpoints

4. REAL PROJECT EXAMPLES
------------------------
createEvent in eventService.ts builds FormData and calls
apiFormRequest('/api/events', formData, 'POST')

5. HOW TO MODIFY SOMETHING
--------------------------
Change request shape for update event:
→ eventService.updateEvent
→ EventsPage form payload
→ EventsController.Update + InputUpdateEventView / ProEventUpdate

Change global 401 behavior:
→ apiClient.ts only

6. SIMPLE FLOW DIAGRAM
----------------------
Page
 ↓
eventService / memberService / ...
 ↓
apiClient (JWT + envelope)
 ↓
MidnightApi Controller

7. .NET COMPARISON
------------------
≈ HttpClient service / API client layer calling Web API controllers
(Conceptual only — not a server Repository.)
