================================================================================
FOLDER: src/data/
================================================================================

1. FOLDER PURPOSE
-----------------
Client-side data helpers and mock datasets. Some screens still use mocks for
demo content; family branding/stores support live app chrome.

2. FILES IN THIS FOLDER
-----------------------
familyBranding.ts — Load/cache family name/photo branding
stores.ts — Lightweight client store helpers
mockHome.ts — Mock home dashboard data
mockMembers.ts — Mock members
mockEvents.ts — Mock events (legacy/demo)
mockFamily.ts — Mock family profile
mockGallery.ts / mockStories.ts / mockTimeline.ts — Feature mocks
mockNotifications.ts — Notification drawer mock items
mockAccessTokens.ts — Mock tokens (if used by UI stubs)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/app (some), components/home, layout NotificationDrawer,
  hooks/useFamilyBranding
Depends on: sometimes services/familyService for live branding
Note: Live Events CRUD uses eventService — not mockEvents

4. REAL PROJECT EXAMPLES
------------------------
NotificationDrawer may read mockNotifications.ts while EventsPage uses APIs.

5. HOW TO MODIFY SOMETHING
--------------------------
If a page shows fake data:
→ Check whether it imports mock*.ts
→ Replace with the matching *Service.ts call when wiring to API

6. SIMPLE FLOW DIAGRAM
----------------------
Page/Component
 ↓
mock*.ts  OR  familyBranding/stores
 ↓
UI render

7. .NET COMPARISON
------------------
≈ in-memory seed/demo data + small client caches (conceptual only).
