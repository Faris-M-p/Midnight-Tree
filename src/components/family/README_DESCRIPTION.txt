================================================================================
FOLDER: src/components/family/
================================================================================

1. FOLDER PURPOSE
-----------------
Family-profile-specific UI pieces, currently focused on changing the family
cover image.

2. FILES IN THIS FOLDER
-----------------------
ChangeCoverModal.tsx
- Type: React modal component
- What it does: Lets user pick/upload a new family cover image
- Exports: ChangeCoverModal
- Imports: familyService, notify, file input UI
- Used by: pages/app/FamilyPage.tsx

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: FamilyPage
Depends on: services/familyService.ts, MidnightApi FamilyController
Related storage: LocalFileStorageService / family cover endpoints

4. REAL PROJECT EXAMPLES
------------------------
FamilyPage opens ChangeCoverModal → multipart upload → family cover URL updates

5. HOW TO MODIFY SOMETHING
--------------------------
Change cover upload validation → ChangeCoverModal + familyService
  + FamilyController cover action + storage quota checks

6. SIMPLE FLOW DIAGRAM
----------------------
FamilyPage
 ↓
ChangeCoverModal
 ↓
familyService
 ↓
FamilyController → storage + SP

7. .NET COMPARISON
------------------
≈ modal partial for Family profile (conceptual only).
