# Known issues

Confirmed from source. These are defects or traps, not a backlog of new features.

## Security

- `firestore.rules` does not limit reads or writes to the caller’s `familyId` or token scope. Any signed-in user who can query a collection can access other families’ documents.
- `accessTokens` allows unauthenticated `get`. The raw token is not in the document, but `authEmail`, permission, scope, and `familyId` are.
- Permission helpers in `src/auth/permissions.ts` only hide buttons.

## Data integrity

- `deleteMember` deletes the member document and leaves `relationships` rows in place. The tree can keep ids that no longer resolve to a person.
- A parent with no spouse becomes a union with `spouse1Id === spouse2Id` (`treeService.buildUnions`).
- A child is attached to the first union that contains that parent, not to a chosen couple.
- No guard against duplicate spouse links or cycles.
- `families.memberCount` stays at the value written at creation (`0` on register). The members list does not update it.
- `FamilyProfile.id` and access-token session `familyId` are hardcoded `0`. The real id is the Firestore string on `familyCode` / `firebaseFamilyId`.

## Auth

- Email sessions store a Firebase ID token with `expiresAtUtc` 55 minutes ahead. No code path was found that refreshes that localStorage timestamp. Firebase Auth persistence is separate, so behavior after 55 minutes is easy to get wrong. Exact expiry behavior in the UI is **Unknown** without a runtime check.
- Access-token `activeSessions` is always 0.

## UI versus dead code

- `StoriesPage` and `GalleryPage` still edit mock memory in `src/data/stores.ts`. They are not routed, so they are not the live stories/gallery feature.
- `computeFamilyTreeLayout` is unused. The live layout is the private `computeDynamicLayout` in `FamilyTreePage.tsx`. Editing the layout module does not change the canvas.
- Tree page timeline/milestones import `familyMilestones` from `src/mockData.ts`.
- Notification drawer is a permanent empty state. `mockNotifications` is unused.
- Several file comments say Firebase auth is not wired to login, or that services still call MidnightApi. Login uses `loginWithFirebase`. Those comments are wrong.
- `Midnight-Tree/ARCHITECTURE.md` still documents `VITE_API_BASE_URL` and an ASP.NET base URL.

## Storage

- Images are data URLs inside Firestore documents. `storage.rules` is unused by the upload helpers.
- A large member or family photo is stored on the parent document. Firestore’s 1 MiB document limit is not checked in code.

## Project layout

- `Midnight-Api` has no application code.
- `context/` lives in the workspace root, not inside the `Midnight-Tree` git repo.
