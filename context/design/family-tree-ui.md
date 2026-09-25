# Family tree UI

## Canvas

`src/components/FamilyTreeCanvas.tsx` wraps React Flow: pan, zoom, and the node/edge renderers.

| Piece | File | Role |
|---|---|---|
| Person card | `MemberCard.tsx` | Name, avatar, and the fields the card currently renders |
| Couple junction | `MarriageNode.tsx` | Small node between spouses. Collapse control lives here. |
| Connector | `GenealogyEdge.tsx` | Parent-to-child lines, T-junction style as described in `Midnight-Tree/ARCHITECTURE.md` |

Positions come from `computeDynamicLayout` in `FamilyTreePage.tsx`, then become React Flow nodes. The unused helper `src/layout/computeFamilyTreeLayout.ts` is not on this path.

Marriage node ids and ghost nodes for cross-branch couples are created inside `computeDynamicLayout`. Read that function before adding a new node type.

## Toolbar

`SearchHeader.tsx` sits on the tree screen: search, add member (`canCreateMember`), map spouse (`canEdit`).

`AnalyticsPanel` and `TimelinePanel` are drawers on the tree. The timeline panel on this page imports `familyMilestones` from `src/mockData.ts` (static sample milestones). It is not the `/timeline` page.

## Member actions from the tree

- Add: `components/members/AddMember.tsx`
- Edit: `components/members/EditMember.tsx`
- Details: `MemberDetailsModal` → `MemberDetails`
- Map spouse: `MapSpouseModal`
- Delete: handled in `FamilyTreePage` via `deleteMember`

## Export

The tree page can rasterize the canvas with `html-to-image` `toPng`. Confetti (`canvas-confetti`) is imported on the same page.

## Home preview

`components/home/FamilyTreePreview.tsx` is a small static preview built by `buildTreePreview`. It does not mount React Flow.

## Interaction that is not persisted

Collapse state and viewport (zoom/pan) stay in component state. A reload recalculates layout from Firestore members and relationships.
