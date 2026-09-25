# Family tree

Status: **Implemented** at `/family-tree`.

## Screen

`src/pages/app/FamilyTreePage.tsx` is the orchestrator. It uses:

- `useFamilyData()` for members and unions
- `getFamilyTreeData()` when it needs a reload
- `computeDynamicLayout` in this same file for coordinates. `src/layout/computeFamilyTreeLayout.ts` is not imported.
- `FamilyTreeCanvas` (`@xyflow/react`)
- Nodes: `MemberCard`, `MarriageNode`
- Edges: `GenealogyEdge` (parent-to-child connectors)
- Overlays: `AddMember`, `EditMember`, `MapSpouseModal`, `MemberDetailsModal`, `AnalyticsPanel`, `TimelinePanel`, `SearchHeader`

`SearchHeader` can show add-member when `canCreateMember` and map-spouse when `canEdit`.

## Data mapping

`getFamilyTreeData` in `src/services/treeService.ts`:

1. Wait for Firebase user. If none, return empty members and unions.
2. Load `members` and `relationships` for the current family.
3. Map each member to `FamilyMember` (display name, gender, avatar, deceased flag).
4. Build `MarriageUnion[]` from spouse and parent rows. Rules: `rules/family-tree-rules.md`.

Errors are logged and the function returns empty arrays, so the canvas shows an empty tree instead of the Firestore error.

## Other tree UI

- Home shows `FamilyTreePreview` from the same members and unions (`buildTreePreview`). It is not a second data source.
- `/tree` redirects to `/family-tree`.
- Export to PNG uses `html-to-image` on the tree page.
- `familyMilestones` is imported from `src/mockData.ts` on the tree page. Those milestones are static sample data, not Firestore events. The separate Timeline page uses real events and memories.

## Not implemented

- Dragging cards to change who is the parent
- Deleting or editing a relationship from a dedicated relationship editor
- Persisted expand/collapse
- Using `relationshipType: "child"` in the layout
- Collaborative cursors or realtime listeners. Loads are `getDocs`, not `onSnapshot`.
