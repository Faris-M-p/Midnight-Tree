# Security rules

## Client gate

`src/auth/session.ts` `isAuthenticated` is true when `midnight.auth.session` exists in `localStorage` and has an access token (`hasAuthSession`). Public paths skip that gate. Unauthenticated visits to other paths redirect to `/login`.

The stored token for email login is a Firebase ID token copied into localStorage with a 55-minute `expiresAtUtc`. The code does not show a refresh of that localStorage expiry. Firebase Auth persistence is `browserLocalPersistence` separately.

Logout clears localStorage and calls Firebase `signOut`.

## Firestore rules

File: `Midnight-Tree/firestore.rules`. Rules version 2.

`signedIn()` means `request.auth != null`.

| Path | Rule in the file |
|---|---|
| `users/{uid}` | Read, create, update if the auth uid equals `{uid}`. Delete denied. |
| `families/{familyId}` | Read and write if signed in. |
| `familyMembers/{accessId}` | Read and write if signed in. |
| `members/{memberId}` | Read and write if signed in. |
| `relationships/{relationshipId}` | Read and write if signed in. |
| `plans/{planId}` | Read if signed in. Write denied. |
| `subscriptions/{subscriptionId}` | Read and write if signed in. |
| `albums`, `albumPhotos`, `stories`, `memories`, `memoryPhotos`, `events` | Read and write if signed in. |
| `accessTokens/{tokenId}` | `get` allowed with no auth. List, create, update, delete if signed in. |

Not matched, so denied by default: `_dev_firebase_test` and any collection not listed.

These rules do not check `familyId`, role, token permission, or token scope. A signed-in user is allowed to read and write other families’ member, relationship, memory, and event documents.

`accessTokens` get is public. The document id is the SHA-256 of the secret, and the raw token is not stored, but the document includes `authEmail`, permission, scope, and `familyId`.

## Storage rules

File: `Midnight-Tree/storage.rules`.

- Path: `families/{familyId}/{allPaths=**}`
- Read if `request.auth != null`
- Write if signed in and `request.resource.size < 5 * 1024 * 1024`

The current upload helpers do not call Firebase Storage. See `architecture/storage.md`.

## App Check, custom claims, Cloud Functions

**Not implemented** in this repo. No `functions/` directory was found. Subscription comments say a later server-side function should mark payment success. That function is not in the workspace.
