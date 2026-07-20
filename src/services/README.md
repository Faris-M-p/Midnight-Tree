# src/services/

All backend communication lives here (no React UI).

| File | Purpose |
|------|---------|
| `apiClient.ts` | Shared `fetch` + JWT + error mapping |
| `authService.ts` | Register / login endpoints |
| `authSessionService.ts` | Save / read / clear token in localStorage |
| `memberService.ts` | Members list / details / create / tree |
| `treeService.ts` | Maps API data → `FamilyMember[]` + `MarriageUnion[]` |

**Rule:** pages and components import these helpers — they should not call `fetch()` themselves.
