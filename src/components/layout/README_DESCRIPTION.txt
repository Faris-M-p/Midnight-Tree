================================================================================
FOLDER: src/components/layout/
================================================================================

1. FOLDER PURPOSE
-----------------
Application chrome: authenticated shell, sidebar, header, mobile nav, public
header, notification drawer. Wraps page content after login.

2. FILES IN THIS FOLDER
-----------------------
AppLayout.tsx — Authenticated layout composing sidebar/header/content
Sidebar.tsx — Desktop side navigation
Header.tsx — Top header (branding, actions, theme, notifications)
MobileNavigation.tsx — Mobile nav pattern
AppNavItems.tsx — Renders items from navigation/appNav.ts
PublicHeader.tsx — Header for public marketing/auth pages
NotificationDrawer.tsx — Notifications slide-over UI
DrawerPortal.tsx — Portal helper for drawers

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: App.tsx (AppLayout), public pages (PublicHeader)
Depends on: navigation/appNav.ts, navigation/publicNav.ts, theme/ThemeToggle,
  hooks, auth permissions for some links
Children: page content passed as children into AppLayout

4. REAL PROJECT EXAMPLES
------------------------
After login, App.tsx renders FamilyDataProvider → AppLayout → EventsPage

5. HOW TO MODIFY SOMETHING
--------------------------
Change header actions → Header.tsx
Change sidebar links list → navigation/appNav.ts (not hardcode in Sidebar)
Change public marketing header → PublicHeader.tsx + publicNav.ts

6. SIMPLE FLOW DIAGRAM
----------------------
App.tsx
 ↓
AppLayout
 ├─ Sidebar / AppNavItems
 ├─ Header
 └─ Page children

7. .NET COMPARISON
------------------
≈ _Layout.cshtml / shared layout components (conceptual only).
