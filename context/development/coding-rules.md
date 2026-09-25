# Coding rules

Follow the patterns already in `Midnight-Tree`. Do not revive the removed HTTP API.

## Where code goes

- Screens: `src/pages`. Authenticated app screens go in `src/pages/app`.
- Reusable UI: `src/components`. No `fetch` and no Firestore imports in components. Call `src/services`.
- Feature operations: `src/services`. They map Firestore documents into the types in `src/types`.
- Firebase SDK calls: `src/firebase/firestore`, `src/firebase/auth`, `src/firebase/storage`.
- Permission checks: `src/auth/permissions.ts`. Do not re-derive admin rules inside a page.
- Tree math used by the live canvas is `computeDynamicLayout` in `FamilyTreePage.tsx`. `src/layout/computeFamilyTreeLayout.ts` is unused. Do not fork a third layout.
- Domain UI types for the canvas: `src/types.ts` (`FamilyMember`, `MarriageUnion`). Firestore document types: `src/firebase/types/firebaseTypes.ts`.

`LoginPage` and `RegisterPage` call `firebaseAccount` directly. New features should still go through `src/services` unless they are auth entry points like those two.

## Data rules

- Scope queries with `ensureCurrentFamilyId()`. Do not hardcode a family id.
- Document ids are strings. Coerce with the local `asId` helper when a type still allows `string | number`.
- Do not call `apiRequest`. It throws.
- New Firestore collections need a name in `FIRESTORE_COLLECTIONS`, a type, a service, and a match in `firestore.rules`.
- Images for family, members, memories, and events are compressed data URLs (`fileToCompressedDataUrl`), not Storage uploads.

## UI rules

- Routing stays in `App.tsx` plus `navigateTo` / `matchPath`. Do not add React Router unless the task explicitly changes the router.
- Use `notify` for errors and success toasts.
- Guard submits with `useActionLock`.
- Use existing theme tokens when touching new UI. Do not add a third theme casually.
- Icons from `lucide-react`.

## Comments

File headers are often stale (they still mention MidnightApi). When a header disagrees with the function body, trust the body and update the header if you touch the file.

## Tooling

- TypeScript strictness is whatever `tsconfig*.json` already sets. Do not weaken it.
- Lint script: `oxlint` (`npm run lint`).
- Package manager files already present: `package-lock.json`. Do not add another lockfile.
- Node `>=20` (`package.json` `engines`).

## Do not

- Install packages unless the task needs a library that is not already depended on.
- Commit `.env` or paste Firebase secrets into context files.
- Change Firestore rules to be more open.
- Delete `Midnight-Api` or rewrite history.
