# src/components/

Reusable UI pieces used by pages and the tree screen.

## Tree canvas
| File | Purpose |
|------|---------|
| `FamilyTreeCanvas.tsx` | React Flow wrapper (zoom, pan, minimap) |
| `MemberCard.tsx` | Person card node |
| `MarriageNode.tsx` | Couple junction (+/− collapse) |
| `GenealogyEdge.tsx` | Parent→child T-shaped connector lines |

## Overlays / panels
| File | Purpose |
|------|---------|
| `CreateMemberModal.tsx` | Alias for shared Add Member modal |
| `members/AddMember.tsx` | Common add-member form (Members + Family Tree) |
| `members/EditMember.tsx` | Common edit-member form (Members + Family Tree) |
| `members/MemberDetails.tsx` | Common member details (page + tree modal) |
| `members/MemberDetailsModal.tsx` | Tree overlay for Member Details |
| `SearchHeader.tsx` | Top toolbar |
| `FilterSidebar.tsx` | Generation / location filters |
| `AnalyticsPanel.tsx` | Stats drawer |
| `TimelinePanel.tsx` | Milestones drawer |

**Rule:** keep visual code here; keep API calls in `services/`.
