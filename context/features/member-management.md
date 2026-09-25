# Member management

Status: **Implemented**.

## Screens

| Path | UI |
|---|---|
| `/members` | `MembersPage` list, search, create, delete |
| `/members/:id` | `MemberDetailsPage` → `members/MemberDetails.tsx` |
| `/members/:id/edit` | `EditMemberPage` → `members/EditMember.tsx` |
| Tree overlays | `AddMember`, `EditMember`, `MemberDetailsModal`, `MapSpouseModal` |

Shared form components live in `src/components/members/`. `CreateMemberModal.tsx` is an alias for the add-member modal.

## Service

`src/services/memberService.ts` → Firestore `memberService` and `relationshipService`.

Create payload fields that are written: first name, last name, nickname, gender, date of birth, date of death, profession, biography, email, phone, location name, latitude, longitude, `isRoot`, optional primary image, optional `parentId`, optional `spouseId`.

`createdBy` is the Firebase uid, or `"unknown"` if `getCurrentFirebaseUser()` is null.

List: `getMembers` filters the current family’s members in memory for the query object (`MembersQuery`: search and paging fields). It is not a Firestore cursor. Read the function before changing page size.

Details: `getMemberDetails` loads one document and `toMemberProfile`, which also loads relationships for parent/spouse summaries.

Update: profile fields and optional new photo. Parent and spouse ids on the update payload are not written as new relationships in `updateMember`.

Delete: deletes the member document only.

Map spouse: creates one `spouse` relationship. It does not check for an existing pair.

## Location

`LocationPicker` and `LocationView` use Leaflet. Coordinates are stored on the member.

## Permissions

See `rules/user-permissions.md`. Selected-member Edit tokens cannot create members. Member-and-descendants Edit can create, and can edit the scope member plus descendants derived from unions.

## Display

- Avatar: stored photo, else `defaultAvatar(gender)`.
- Rank labels: `computeMemberRanks` / `formatMemberLabel`.
- Home “recent members” and growth charts use `createdAt` and dates of birth from these records (`src/utils/homeDashboard.ts`).

## Not implemented

- Member social links on the Firebase model. `FamilyMember.socials` exists on the canvas type. `toFamilyMember` does not set `socials`. `education` is set to `""`.
- Cascade delete of relationships, memories, or events that mention the member.
- Merge duplicate people.
- Linking a member to a Firebase Auth user. Members are documents, not accounts. Accounts are `users/{uid}`.
