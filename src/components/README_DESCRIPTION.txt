================================================================================
FOLDER: src/components/
================================================================================

1. FOLDER PURPOSE
-----------------
Reusable React UI building blocks used by pages. Domain-specific pieces are
grouped into subfolders (layout, members, memories, home, family, theme, ui).
Shared tree/search/date components sit at this root level.

Why it exists:
- Avoid duplicating UI across pages
- Keep pages thinner (orchestration) while components handle presentation

2. FILES IN THIS FOLDER (ROOT)
------------------------------
FamilyTreeCanvas.tsx — @xyflow/react canvas for genealogy
MemberCard.tsx — Member node card on the tree
MarriageNode.tsx — Marriage/union node on the tree
GenealogyEdge.tsx — Edge renderer between nodes
SearchHeader.tsx — Shared search header (e.g. members/tree search by name/#id)
DatePicker.tsx — Date-only picker control
DateTimePicker.tsx — Combined date+time picker (Events forms)
CreateMemberModal.tsx — Modal shell to create a member
TimelinePanel.tsx / AnalyticsPanel.tsx — Panels used by home/timeline areas
AppToaster.tsx — Sonner toaster host

Subfolders: layout/, members/, memories/, home/, family/, theme/, ui/

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/, pages/app/
Depends on: hooks/, context/, services/ (sometimes), types/, utils/, theme/
Does not replace services — components call services or receive callbacks from pages

4. REAL PROJECT EXAMPLES
------------------------
EventsPage uses DateTimePicker + members/MemberMultiSelect + members/LocationPicker
FamilyTreePage uses FamilyTreeCanvas + MemberCard + MarriageNode + GenealogyEdge

5. HOW TO MODIFY SOMETHING
--------------------------
Change tree node look → MemberCard.tsx
Change event datetime UX → DateTimePicker.tsx then EventsPage wiring
Change global toasts host → AppToaster.tsx (+ utils/notify.tsx)

6. SIMPLE FLOW DIAGRAM
----------------------
Page
 ↓
Component (this folder)
 ↓
Hook / callback / service
 ↓
API

7. .NET COMPARISON
------------------
≈ reusable Razor/View components / UserControls (conceptual only).
