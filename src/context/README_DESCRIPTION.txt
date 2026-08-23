================================================================================
FOLDER: src/context/
================================================================================

1. FOLDER PURPOSE
-----------------
React Context providers that share family-wide data across authenticated pages
without prop-drilling.

2. FILES IN THIS FOLDER
-----------------------
FamilyDataContext.tsx
- Type: React Context + Provider
- What it does: Loads members/unions/ranks (via treeService) for authenticated shell
- Exports: FamilyDataProvider, useFamilyData()
- Imports: treeService, member rank helpers, React
- Used by: App.tsx wraps authenticated routes; consumers include FamilyTreePage,
  MemberMultiSelect, member pickers, home previews

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/app/*, components/members/*, components/home/*
Depends on: services/treeService.ts, services/memberService-related data, types
Data flow: Provider fetches once (and refresh paths) → context → UI consumers

4. REAL PROJECT EXAMPLES
------------------------
Events MemberMultiSelect reads family members from useFamilyData().
FamilyTreePage uses the same shared graph data for the canvas.

5. HOW TO MODIFY SOMETHING
--------------------------
If member list is stale after create:
→ Find refresh/reload in FamilyDataContext.tsx
→ Ensure member create/edit pages call the refresh method after success

6. SIMPLE FLOW DIAGRAM
----------------------
App.tsx → FamilyDataProvider
 ↓
treeService.getFamilyTreeData()
 ↓
useFamilyData() in pages/components
 ↓
Tree / pickers update

7. .NET COMPARISON
------------------
≈ A scoped shared ViewModel / cache injected into multiple views
(Conceptual only — React Context, not DI.)
