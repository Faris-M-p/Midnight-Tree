# Family tree rules

Source of truth for the canvas is `src/services/treeService.ts` plus `src/layout/computeFamilyTreeLayout.ts`.

## Stored relationships

Collection: `relationships`.

| `relationshipType` | Meaning in code |
|---|---|
| `spouse` | `member1Id` and `member2Id` are partners. Order is not significant. Duplicate pairs collapse to one union key. |
| `parent` | `member1Id` is the parent. `member2Id` is the child. |
| `child` | Allowed by the TypeScript type `FirebaseRelationshipType`. `buildUnions` ignores it. Creating a `child` row does not place anyone on the tree. |

There is no sibling, cousin, or adoption type.

## How unions are built

1. Each spouse pair becomes a `MarriageUnion` with `childrenIds: []`.
2. Each parent link finds the first union where that parent is `spouse1Id` or `spouse2Id`, and appends the child.
3. If the parent has no spouse union, the code creates a synthetic union whose `spouse1Id` and `spouse2Id` are both the parent id. The child hangs under that node.

Consequences that are in the code, not a separate product spec:

- A child of someone with two spouse unions attaches to the first union found, not necessarily the union of the biological couple.
- A single parent is drawn as a couple node with the same person on both sides.
- Nothing prevents linking a person as their own spouse, a cycle, or more than one spouse. No validation function does those checks.
- `updateMember` does not edit relationships. Removing a spouse or parent from the tree is **Not implemented** except by deleting documents outside the UI.

## Layout rules

The canvas uses `computeDynamicLayout` inside `src/pages/app/FamilyTreePage.tsx`. Its comment says only true roots become top-level trees and children stay nested under their parents.

Observed in that function:

- Card size 220×100, spouse gap 120, marriage marker 24×24.
- It builds a tree of single members and unions, and it has a cross-branch case (`isCrossBranchUnion`) that inserts a ghost spouse node so the same couple is not drawn as two unrelated roots.
- `isRoot` on the member record is not what selects the visual root.

`src/layout/computeFamilyTreeLayout.ts` is a second algorithm (spouse gap 100, sibling gap 72, vertical gap 170). Nothing imports it. Do not change the live tree by editing only that file.

Generation rows, centering, and orphan placement differ between the two functions. Read `computeDynamicLayout` before changing spacing or root selection.

## Ranks

`computeMemberRanks` assigns display numbers used in labels. It is presentation. It does not change stored relationships.

## What the tree screen can change

From `FamilyTreePage` and member services:

- Add a member with an optional parent and optional spouse.
- Map an additional spouse (`mapSpouse`).
- Edit member profile fields.
- Delete a member document.

Expand/collapse of marriage nodes is UI state in the canvas components (`MarriageNode`). It is not stored in Firestore.
