================================================================================
FOLDER: src/auth/
================================================================================

1. FOLDER PURPOSE
-----------------
Authentication helpers for the React app: session checks, logout, permission
helpers, and temporary pending-auth storage used between multi-step auth pages
(register → verify email, forgot password steps).

Why it exists:
- Keep JWT/session logic out of pages
- Centralize UI permission checks (admin / edit / view)

2. FILES IN THIS FOLDER
-----------------------
session.ts
- Type: TypeScript module
- What it does: isAuthenticated(), logout(), applyAccessTokenSession helpers
- Exports: auth gate helpers
- Imports: authSessionService
- Used by: App.tsx (route gate), apiClient 401 handling, login flows

permissions.ts
- Type: TypeScript module
- What it does: isAdmin(), canEditFamily(), view-scope helpers from JWT session
- Exports: permission predicates
- Imports: auth session data
- Used by: App.tsx (/access-tokens guard), EventsPage, Members pages, nav UI

pendingAuth.ts
- Type: TypeScript module
- What it does: sessionStorage bridge for email/OTP multi-step flows
- Exports: get/set/clear pending auth payload helpers
- Used by: RegisterPage, VerifyEmailPage, ForgotPassword* pages

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: App.tsx, pages/, services/apiClient.ts, components that hide edit UI
Depends on: services/authSessionService.ts, types/auth.ts
Data flow: Login saves session → auth/session reads it → App allows private routes

4. REAL PROJECT EXAMPLES
------------------------
- App.tsx calls isAuthenticated() before rendering AppLayout
- EventsPage uses canEditFamily() to show Create/Edit/Delete

5. HOW TO MODIFY SOMETHING
--------------------------
Change who can edit events:
→ permissions.ts
→ Confirm MidnightApi AccessAuthorizationService still enforces server-side

Change logout behavior:
→ session.ts + authSessionService.ts + apiClient 401 branch

6. SIMPLE FLOW DIAGRAM
----------------------
LoginPage → authService → authSessionService (localStorage)
 ↓
session.isAuthenticated()
 ↓
App.tsx allows /home, /events, ...
 ↓
permissions.canEditFamily() controls buttons

7. .NET COMPARISON
------------------
≈ Client-side ClaimsPrincipal helpers / [Authorize] UI gating
(Conceptual only — real authorization is still on MidnightApi.)
