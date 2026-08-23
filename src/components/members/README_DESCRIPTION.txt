================================================================================
FOLDER: src/components/members/
================================================================================

1. FOLDER PURPOSE
-----------------
Member-domain UI: create/edit forms, details, location pickers, spouse mapping,
and multi-select used by Events and other features.

2. FILES IN THIS FOLDER
-----------------------
AddMember.tsx — Create member form UI
EditMember.tsx — Edit member form UI
MemberDetails.tsx — Member details presentation
MemberDetailsModal.tsx — Modal wrapper for member details
LocationPicker.tsx — Map-based location picker (Leaflet) used by members/events
LocationView.tsx — Read-only location display
MapSpouseModal.tsx — UI to map spouse relationships
MemberMultiSelect.tsx — Multi member picker (Events forms use this)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/app/MembersPage, MemberDetailsPage, EditMemberPage, EventsPage
Depends on: memberService, FamilyDataContext, Location map libs, utils/memberName
Data from: MidnightApi MemberController endpoints

4. REAL PROJECT EXAMPLES
------------------------
Events create form embeds MemberMultiSelect (members) + LocationPicker (location)

5. HOW TO MODIFY SOMETHING
--------------------------
Change member create fields → AddMember.tsx → memberService → MemberController
Change event attendee picker UX → MemberMultiSelect.tsx
Change map provider behavior → LocationPicker.tsx

6. SIMPLE FLOW DIAGRAM
----------------------
MembersPage / EventsPage
 ↓
AddMember / MemberMultiSelect / LocationPicker
 ↓
memberService / family context
 ↓
MemberController

7. .NET COMPARISON
------------------
≈ feature-area partial views for Members (conceptual only).
