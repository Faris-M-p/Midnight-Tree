# Current status

Inspected 25 Sep 2026 from `Midnight-Tree` source. No app server was started for this write-up.

## Product

Midnight Chronicle / Midnight Tree is a family genealogy SPA. Auth and data are Firebase. The .NET API is gone from this workspace.

## Working in the routed app

- Register, email login, Firebase password-reset email, logout
- Access token create/list/update/deactivate/delete and token login
- Single family profile (name, description, logo, cover)
- Members CRUD, location, spouse mapping, parent link on create
- Family tree canvas at `/family-tree`
- Home dashboard from members, events, and memories
- Memories with up to 10 images
- Events and a timeline built from real records
- Admin-only access token screen
- Themes: Midnight (default) and Ocean Breeze

## In the repo but not a live feature

- Stories and Gallery pages (mock `src/data/stores.ts`, not mounted in `App.tsx`)
- Firestore story, album, plan, and subscription services (no page imports)
- Notification drawer (always empty)
- `src/layout/computeFamilyTreeLayout.ts` (no imports)
- `FirebaseTest.tsx` (not mounted)
- Verify-email and in-app reset-password routes (redirect away)

## Security snapshot

Firestore rules allow any signed-in user to read and write almost all family data. Plans cannot be written by the client. Access-token documents can be gotten without auth. UI permissions are stricter than the rules.

## Docs drift

`Midnight-Tree/ARCHITECTURE.md`, `src/services/README.md`, and several `src/firebase` file headers still describe ASP.NET and MidnightApi. `src/config/env.ts` and `apiClient.ts` do not.
