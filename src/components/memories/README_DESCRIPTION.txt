================================================================================
FOLDER: src/components/memories/
================================================================================

1. FOLDER PURPOSE
-----------------
Memory feature UI views: list, create, edit, details, lightbox, confirm dialog.
MemoriesPage composes these based on pathname.

2. FILES IN THIS FOLDER
-----------------------
MemoriesListView.tsx — Grid/list of memories
MemoryCreateView.tsx — Create memory + images form
MemoryEditView.tsx — Edit memory form
MemoryDetailsView.tsx — Memory detail display
MemoryLightbox.tsx — Fullscreen image viewer
ConfirmDialog.tsx — Confirm destructive actions (delete)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/app/MemoriesPage.tsx
Depends on: services/memoryService.ts, types/memory.ts, utils/memoryImages.ts,
  hooks/useActionLock, notify
Backend: MemoriesController → MemoriesService → MemoriesRepository → ProMemory*

4. REAL PROJECT EXAMPLES
------------------------
/memories/create → MemoryCreateView → memoryService.create → multipart upload

5. HOW TO MODIFY SOMETHING
--------------------------
Change memory image limits UX → MemoryCreateView + memoryImages utils
  + MidnightApi MemoriesService MaxImages rules
Change delete confirm copy → ConfirmDialog usage in details/list

6. SIMPLE FLOW DIAGRAM
----------------------
MemoriesPage
 ↓
MemoryCreateView
 ↓
memoryService
 ↓
MemoriesController → MemoriesService → SP + file storage

7. .NET COMPARISON
------------------
≈ feature Views for Memories module (conceptual only).
