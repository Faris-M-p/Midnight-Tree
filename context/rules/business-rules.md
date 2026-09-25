# Business rules

These are behaviors enforced or assumed by the current client. They are not a legal policy. Where Firestore rules are weaker than the UI, that is called out.

## Account and family

- Registration requires email, password, and a family name (`RegisterPage` → `registerWithFirebase`).
- Registration creates a Firebase Auth user, a `users/{uid}` profile, a `families` document, and a `familyMembers` access row with role `owner`.
- The user profile stores one `familyId`. Login calls `ensureCurrentFamilyId()`, which reuses that family or creates one named from the session, or `"Your Family"` if no name is stored.
- Email/password sessions are stored as family admin (`authType: "admin"`, `isAdmin: true`, `permission: "ADMIN_FULL"`).
- Email verification is not required. The verify-email route tells the user to sign in.

## Access tokens

Implemented in `src/services/accessTokenService.ts`.

- Raw token format: `mct_` plus url-safe base64 of 24 random bytes.
- The Firestore document id is the SHA-256 hex of the raw token. The raw token is not stored. A short preview is stored.
- Creating a token also creates a Firebase Auth user on a secondary in-memory app. Email is `token.{first 32 chars of token id}@midnight-tree.firebaseapp.com`. Password is the raw token.
- Login hashes the pasted token, loads that document, rejects missing, expired, or inactive tokens, then signs in with that auth email and the raw token as the password.
- Expiry presets: 30 days, 90 days (default when the preset is not 30 days, 6 months, or 1 year), 6 months (182 days), 1 year (365 days), or a custom date.
- A token whose `expiresOn` is in the past is treated as Expired even if `status` is Active.
- An expired token cannot be set back to Active until the expiry date is extended. That error is thrown by `setAccessTokenStatus`.
- Token users are never admins.
- `activeSessions` on the list model is always `0`. Session counting is **Not implemented**.
- `usageCount` and `lastUsedOn` update on login. If that write fails, login still succeeds.

## Members

- A member belongs to one `familyId`.
- Create can attach one parent (`relationshipType: "parent"`, parent is `member1Id`, new member is `member2Id`) and one spouse (`relationshipType: "spouse"`).
- Update changes profile fields. It does not change parent or spouse links.
- Spouse links can also be added later with `mapSpouse`.
- Delete removes the member document only. It does not delete relationships. See `status/known-issues.md`.
- `isRoot` is a boolean on the member. The tree layout does not use it to pick the root. Roots are people who are not children and not already placed under a union.
- Deceased is derived in the tree UI when `dateOfDeath` is set (`treeService.toFamilyMember`).
- Last name `"-"` is a hidden last name (`HIDDEN_LAST_NAME` in `src/utils/memberName.ts`).

## Family profile

- Admin-only in the UI (`canEditFamily`).
- Editable fields used by `familyService`: name, description, photo, cover.
- If no cover is stored, the UI falls back to `DEFAULT_FAMILY_COVER` from `src/data/mockFamily.ts`.

## Memories

- Admin-only writes in the UI (`canEditFamily`).
- At most 10 images (`MEMORY_MAX_IMAGES`).
- Accepted types: jpeg, jpg, png, webp. Max source file size 10 MB.
- The first image is the cover. Deleting the cover promotes the next image.
- Deleting a memory deletes its `memoryPhotos` documents first.

## Events

- Admin-only create/update/delete in the UI.
- Types: `birthday`, `anniversary`, `memorial`, `gathering`, `achievement`, `custom`.
- An event stores `memberIds` (string array). It does not create tree relationships.
- Upcoming is `eventDateTime` in the future (`isEventUpcoming`).

## Subscription and plans

- Plan duration in code is `"yearly"` only. `getPlans` filters to yearly plans.
- Client writes to `plans` are denied by `firestore.rules`. The plan service comment says to seed plans in the Firebase console.
- `createSubscription` always sets `status: "pending"`. No UI calls it.
- No rule in code ties member count to `maxMembers`. Enforcement is **Not implemented**.

## Data scope

- Reads and writes in services pass the current family id from `ensureCurrentFamilyId()`.
- Firestore security rules do not check that `familyId`. Any signed-in user can read and write another family’s documents if they know or query them. See `rules/security-rules.md`.
