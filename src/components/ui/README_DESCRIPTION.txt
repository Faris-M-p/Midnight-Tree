================================================================================
FOLDER: src/components/ui/
================================================================================

1. FOLDER PURPOSE
-----------------
Generic cross-feature UI primitives: global loader, page state placeholders,
profile photo picker. Not domain-specific like members/memories.

2. FILES IN THIS FOLDER
-----------------------
GlobalLoader.tsx — Full-app loading overlay driven by loadingTracker
PageStates.tsx — Loading / Error / Empty state blocks for pages
ProfilePhotoPicker.tsx — Reusable profile photo file picker control

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: main.tsx (GlobalLoader), many pages (PageStates), member forms
Depends on: services/loadingTracker.ts (GlobalLoader), utils for toasts elsewhere
Independent of a single domain controller

4. REAL PROJECT EXAMPLES
------------------------
Any apiClient call increments loadingTracker → GlobalLoader visible
Events list uses PageStates while listEvents loads

5. HOW TO MODIFY SOMETHING
--------------------------
Change spinner look → GlobalLoader.tsx
Change empty-list message pattern → PageStates.tsx consumers + PageStates itself

6. SIMPLE FLOW DIAGRAM
----------------------
apiClient begin/end
 ↓
loadingTracker
 ↓
GlobalLoader

Page fetch
 ↓
PageStates (loading/error/empty/content)

7. .NET COMPARISON
------------------
≈ shared UI widgets / partials (conceptual only).
