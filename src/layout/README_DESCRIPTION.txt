================================================================================
FOLDER: src/layout/
================================================================================

1. FOLDER PURPOSE
-----------------
Family-tree layout computation helpers (positioning algorithm), separate from
React layout chrome in components/layout/.

Why it exists:
- Keep heavy tree geometry logic out of UI components
- FamilyTreeCanvas / tree pages can import pure functions

2. FILES IN THIS FOLDER
-----------------------
computeFamilyTreeLayout.ts
- Type: TypeScript module (pure layout algorithm)
- What it does: Computes positions for members/unions on the genealogy canvas
- Exports: layout computation functions
- Imports: tree UI types from types.ts / related structures
- Used by: FamilyTreeCanvas / FamilyTreePage pipeline

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: components/FamilyTreeCanvas.tsx, pages/app/FamilyTreePage.tsx
Depends on: src/types.ts canvas models
Does not call APIs

4. REAL PROJECT EXAMPLES
------------------------
Changing spacing between generations starts in computeFamilyTreeLayout.ts.

5. HOW TO MODIFY SOMETHING
--------------------------
If nodes overlap:
→ Adjust spacing constants/algorithm in computeFamilyTreeLayout.ts
→ Re-test FamilyTreePage visually

6. SIMPLE FLOW DIAGRAM
----------------------
treeService data
 ↓
computeFamilyTreeLayout
 ↓
FamilyTreeCanvas (@xyflow/react)
 ↓
MemberCard / MarriageNode positions

7. .NET COMPARISON
------------------
≈ Domain helper / geometry utility class (conceptual only).
