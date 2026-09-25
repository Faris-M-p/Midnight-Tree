# Backend

## What exists

There is no application server in this workspace.

- `Midnight-Api/` contains a README and git metadata. No C# project files.
- `src/services/apiClient.ts` does not send HTTP. Both helpers throw.
- `authService.registerAccount`, `loginAccount`, `verifyEmail`, `resendVerification`, `verifyForgotPasswordOtp`, and `resetPassword` throw “This action uses Firebase sign-in only.”
- Password reset that does run is `sendPasswordResetEmail` in `requestForgotPassword`.
- No Cloud Functions source directory is in the repo.

Firebase is the backend the client uses:

- Authentication for email users and for synthetic access-token users
- Firestore for all persisted family data
- Security rules deployed from `firestore.rules` and `storage.rules` when someone deploys them

`firebase.json` does not define Hosting, Functions, or App Hosting.

## Service layer

Pages should call `src/services`, not `src/firebase`, except auth screens that already call `firebaseAccount` directly:

- `LoginPage` → `loginWithFirebase`
- `RegisterPage` → `registerWithFirebase`

| Service file | Firebase module it wraps |
|---|---|
| `authService.ts` | Password reset email only |
| `authSessionService.ts` | localStorage, not Firebase |
| `familyService.ts` | `firestore/familyService`, image helper |
| `memberService.ts` | members, relationships, image helper |
| `treeService.ts` | members + relationships → canvas model |
| `memoryService.ts` | memories + memoryPhotos |
| `eventService.ts` | events + member names |
| `accessTokenService.ts` | accessTokens + secondary Auth user |

Firestore modules with no UI caller:

- `storyService.ts`
- `albumService.ts`
- `albumPhotoService.ts`
- `planService.ts`
- `subscriptionService.ts`
- `devTestService.ts`

## IDs

Firestore document ids are strings. Some UI types still say `id: number` (`FamilyProfile.id`, parts of `types/member.ts` and `types/auth.ts`). Services often coerce with `String(...)`. `FamilyProfile.id` returned by `getFamily` is hardcoded `0`. The real id is `familyCode` (the Firestore family id). Numeric `familyId` on access-token login is hardcoded `0`; the Firestore id is `firebaseFamilyId`.
