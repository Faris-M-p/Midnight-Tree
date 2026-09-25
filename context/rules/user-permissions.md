# User permissions

Permission checks live in `src/auth/permissions.ts`. The file comment says UI checks are for visibility only. Firestore rules do not repeat them. See `rules/security-rules.md`.

## Session shapes

| Session | How it is created | `isAdmin` | Permission | Scope |
|---|---|---|---|---|
| Email/password | `persistFirebaseSession` | true | `ADMIN_FULL` | `EntireFamily` |
| Access token | `applyAccessTokenSession` | false | `View` or `Edit` from the token | `EntireFamily`, `SelectedMember`, or `MemberDescendants` |
| Missing / empty token | `getAccessContext` fallback | false | `View` | `EntireFamily`, display name Guest |

A session with no `authType`, `authType === "admin"`, or `isAdmin` is treated as admin. That includes older sessions saved before `authType` existed.

## Helpers

| Helper | True when |
|---|---|
| `canView` | A session `accessToken` exists |
| `isAdmin` | Access context is admin |
| `canEdit` | Admin, or token permission is `Edit` |
| `canEditFamily` | Admin only |
| `canCreateMember` | Admin, or Edit on `EntireFamily` or `MemberDescendants`. Edit on `SelectedMember` cannot create. |
| `canEditMember` / `canDeleteMember` | Admin; or Edit + entire family; or Edit + selected member id match; or Edit + member-and-descendants (the scope member or anyone below them in `MarriageUnion.childrenIds`) |
| `canDelete` | Deprecated. Returns `isAdmin()` only. Call sites should use `canDeleteMember`. |

Descendants are walked from union children. Spouses of descendants are not added unless they appear as children.

## Where the UI applies them

| Area | Check |
|---|---|
| Access Tokens nav and page | `isAdmin` / `requiresAdmin` |
| Family profile edits and cover | `canEditFamily` |
| Memories create, edit, delete, images | `canEditFamily` |
| Events create, edit, delete | `canEditFamily` |
| Add member | `canCreateMember` |
| Edit or delete a member | `canEditMember` / `canDeleteMember` |
| Map spouse control | `canEdit` |
| Stories and Gallery pages | `canEdit`, but those pages are not routed |

View-only token users can open the app and read what the services load. They do not get family, memory, or event write buttons. Member writes depend on scope.

`familyMembers.role` (`owner`, `editor`, `viewer`) is written as `owner` at registration. The UI does not read that role. Authorization uses the auth session flags above, not the Firestore role.
