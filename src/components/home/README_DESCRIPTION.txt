================================================================================
FOLDER: src/components/home/
================================================================================

1. FOLDER PURPOSE
-----------------
Home dashboard building blocks: sections, charts, age distribution, tree preview.

2. FILES IN THIS FOLDER
-----------------------
HomeSection.tsx — Section wrapper for home layout
HomeCharts.tsx — Chart widgets for dashboard stats
AgeDistributionPanel.tsx — Age distribution visualization
FamilyTreePreview.tsx — Small tree preview on home

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/app/HomePage.tsx
Depends on: data/mockHome.ts and/or live family/member data, FamilyDataContext
May combine mock + live sources depending on widget

4. REAL PROJECT EXAMPLES
------------------------
HomePage composes HomeCharts + AgeDistributionPanel + FamilyTreePreview

5. HOW TO MODIFY SOMETHING
--------------------------
Change chart metrics → HomeCharts.tsx + data source (mock or API)
Change preview tree → FamilyTreePreview.tsx + context/tree data

6. SIMPLE FLOW DIAGRAM
----------------------
HomePage
 ↓
home/* components
 ↓
mockHome and/or FamilyDataContext
 ↓
UI widgets

7. .NET COMPARISON
------------------
≈ dashboard partial views (conceptual only).
