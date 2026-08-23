================================================================================
FOLDER: src/pages/app/
================================================================================

1. FOLDER PURPOSE
-----------------
Authenticated application screens rendered inside AppLayout after login.
These are the main product pages: home, family, members, tree, memories,
events, timeline, access tokens, etc.

2. FILES IN THIS FOLDER
-----------------------
HomePage.tsx — Dashboard / charts / previews
FamilyPage.tsx — Family profile view/edit (+ cover)
MembersPage.tsx — Member list
MemberDetailsPage.tsx — Member detail route wrapper
EditMemberPage.tsx — Member edit route wrapper
FamilyTreePage.tsx — Interactive genealogy canvas page
MemoriesPage.tsx — Memories list/create/detail/edit by pathname
EventsPage.tsx — Events list/create/detail/edit by pathname (full CRUD UI)
AccessTokensPage.tsx — Admin access-token management
TimelinePage.tsx — Timeline feature page
GalleryPage.tsx / StoriesPage.tsx — Feature pages (may use mock data)

Each:
- Type: React page component
- What it does: Owns screen state, loads data via services, composes components
- Used by: App.tsx renderAuthenticatedPage()

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: App.tsx (authenticated branch)
Depends on: components/*, services/*, auth/permissions, context/FamilyDataContext,
  hooks/useActionLock, types/*
Data flow: Page → Component → Service → apiClient → MidnightApi

4. REAL PROJECT EXAMPLES
------------------------
EventsPage pathname switch:
  /events           list
  /events/create    form → createEvent
  /events/:id       details → getEvent / deleteEvent
  /events/:id/edit  form → updateEvent

5. HOW TO MODIFY SOMETHING
--------------------------
Change Events UI:
→ Start EventsPage.tsx
→ Check eventService.ts + types/event.ts
→ Check EventsController + ProEvent* SQL

Change Family Tree interactions:
→ FamilyTreePage.tsx → FamilyTreeCanvas.tsx → layout/computeFamilyTreeLayout.ts

6. SIMPLE FLOW DIAGRAM
----------------------
AppLayout
 ↓
EventsPage
 ↓
DateTimePicker / MemberMultiSelect / LocationPicker
 ↓
eventService
 ↓
EventsController → EventsRepository → ProEvent*

7. .NET COMPARISON
------------------
≈ Area Controllers + Views for the logged-in app (conceptual only).
