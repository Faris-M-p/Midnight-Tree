# Database

Database is Cloud Firestore. There is no SQL schema in the repo. `firestore.indexes.json` has empty `indexes` and `fieldOverrides`. Queries in code are single-field `where("familyId", "==", ...)` or `where("userId", "==", ...)`, plus document gets. Extra composite indexes are not declared.

Collection names are `FIRESTORE_COLLECTIONS` in `src/firebase/types/firebaseTypes.ts`.

## Collections

### `users/{uid}`

Profile: `uid`, `firstName`, `lastName`, `email`, optional `familyId`, optional phone and `profileImage`, `status` (`active` | `inactive`), `createdAt`. Document id is the Auth uid. Writes go through `setDoc` in `userService` (not re-listed here).

### `families/{familyId}`

`name`, `ownerId`, optional `memberCount`, `description`, `photoUrl`, `coverUrl`, `status`, `createdAt`, optional `updatedAt`. Auto id from `addDoc`.

### `familyMembers/{familyId}_{userId}`

Access row: `familyId`, `userId`, `role` (`owner` | `editor` | `viewer`), `status`, `joinedAt`. Id helper: `familyMemberAccessId`. Registration writes `owner` / `active`. The UI does not read roles.

### `members/{memberId}`

`familyId`, `firstName`, optional `lastName`, `nickname`, `gender`, `dateOfBirth`, `dateOfDeath`, `photoUrl`, `profession`, `biography`, `email`, `phone`, `locationName`, `latitude`, `longitude`, `isRoot`, `createdBy`, `createdAt`, `updatedAt`.

### `relationships/{id}`

`familyId`, `member1Id`, `member2Id`, `relationshipType` (`parent` | `child` | `spouse`), timestamps. See `rules/family-tree-rules.md` for how the tree interprets them.

### `memories/{id}` and `memoryPhotos/{id}`

Memory: `familyId`, `title`, `description`, `memoryDate`, optional `location`, `coverUrl`, `coverPhotoId`, `imageCount`, `createdBy`, timestamps.

Photo: `familyId`, `memoryId`, `fileUrl` (compressed data URL), optional `fileName` and `fileSize`, `sortOrder`, `isCover`, `createdAt`.

### `events/{id}`

`familyId`, `title`, `eventType`, `eventDateTime`, optional location fields, `description`, `coverImageUrl`, `memberIds[]`, `createdBy`, timestamps.

### `accessTokens/{sha256}`

Document id is SHA-256 of the raw token. Fields: `familyId`, `tokenName`, `permission` (`View` | `Edit`), `scope`, optional `memberId`, `tokenPreview`, `authEmail`, `status` (`Active` | `Inactive`), `expiresOn`, `lastUsedOn`, `usageCount`, `createdBy`, timestamps.

### `plans/{id}` and `subscriptions/{id}`

Plan: `name`, `price`, `duration` (`yearly`), `maxMembers`, `status`. Client create exists but rules deny writes.

Subscription: `userId`, `familyId`, `planId`, `startDate`, `expiryDate`, `status` (`pending` | `active` | `expired` | `cancelled`), optional `paymentId`, `createdAt`. Create always sets `pending`. No UI.

### `stories`, `albums`, `albumPhotos`

Typed and have Firestore service files. No routed UI writes them. Shapes are in `firebaseTypes.ts`: story title/content/cover; album name/description; photo `fileUrl` and caption.

### `_dev_firebase_test`

Named in `FIRESTORE_COLLECTIONS.devTest`. Used by `devTestService` / `FirebaseTest`. Not in security rules, so client access is denied unless rules are changed outside this file.

## Timestamps

`createdAt` / `updatedAt` are Firestore `serverTimestamp()` sentinels. Readers accept a string, a `Date`, or a Timestamp with `toDate()`.
