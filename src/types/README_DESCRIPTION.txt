================================================================================
FOLDER: src/types/
================================================================================

1. FOLDER PURPOSE
-----------------
TypeScript DTO / interface definitions mirroring MidnightApi response and
request shapes. Keeps pages/services strongly typed.

Note: canvas UI models also exist in src/types.ts (root) for the tree canvas.

2. FILES IN THIS FOLDER
-----------------------
api.ts — ApiResponse envelope types + error shapes used by apiClient
auth.ts — Login/register/session DTOs
accessToken.ts — Access token management DTOs
member.ts — Member + tree API models
memory.ts — Memory DTOs
event.ts — Event DTOs + EVENT_TYPES constant list

Each:
- Type: TypeScript types module
- Exports: interfaces/types/constants
- Used by: services/* and pages/components that consume API data

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: services/, pages/, components/
Depends on: MidnightApi model contracts (manual sync — no codegen assumed)
Related: src/types.ts for FamilyMember/MarriageUnion canvas types

4. REAL PROJECT EXAMPLES
------------------------
event.ts Event type fields (CoverImageUrl, Members, EventDateTime) match
OutputGetEvent from MidnightApi Models/EventModels.cs

5. HOW TO MODIFY SOMETHING
--------------------------
If API adds a field:
1) Update MidnightApi model + SP JSON
2) Update matching file here (e.g. types/event.ts)
3) Update UI that displays/edits it

6. SIMPLE FLOW DIAGRAM
----------------------
MidnightApi JSON
 ↓
apiClient unwrap
 ↓
typed as types/event.ts
 ↓
EventsPage state

7. .NET COMPARISON
------------------
≈ DTO / ViewModel class definitions (conceptual only).
