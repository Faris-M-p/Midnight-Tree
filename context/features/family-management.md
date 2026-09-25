# Family management

Status: **Implemented** for a single family owned by the signed-in admin.

## Create

Happens inside registration and inside `ensureCurrentFamilyId` if the user has no reachable family:

- `createFamily` with `name`, `ownerId` (Auth uid), `memberCount: 0`, `status: "active"`
- `addFamilyMemberAccess` with role `owner`
- `updateUserProfile` sets `familyId`

`memberCount` is set to 0 at create. No code path was found that increments it when members are added. Treat `memberCount` as unused by the UI.

## Read and update

`src/services/familyService.ts`:

- `getFamily` loads the current family and maps it to `FamilyProfile`.
- `familyCode` is the Firestore id.
- `id` is always `0`.
- Missing cover uses `DEFAULT_FAMILY_COVER`.
- `updateFamily` writes `name`, `description`, and optional logo data URL.
- `updateFamilyCover` writes `coverUrl`.

UI: `src/pages/app/FamilyPage.tsx` and `src/components/family/ChangeCoverModal.tsx`. Edits require `canEditFamily()` (admin only).

Branding on other pages uses `useFamilyBranding` / `loadFamilyBranding` in `src/data/familyBranding.ts`, which calls `getFamily`.

## Not implemented

- Rename flow separate from the family page (the page is the editor)
- Leaving a family, transferring ownership, or deleting a family
- Inviting another Firebase user as `editor` or `viewer` through `familyMembers` (the role type exists; only `owner` is written)
- Multiple families per account
- Family code that the user types at login. Access tokens carry the family id. The login page comment says the family code is embedded in the token.
