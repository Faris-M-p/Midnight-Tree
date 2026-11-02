# User permissions

Two layers. Never conflate them.

## Account layer (Account Owner only)

- Subscription / billing
- Create and manage **public access tokens**
- Account security settings
- Create owned families (within plan)

Family Admin / Editor / Viewer **never** get these.

## Family layer

| Capability | Owner | Admin | Editor | Viewer |
|---|---|---|---|---|
| View tree / profiles | yes | yes | yes | yes |
| Add / edit members | yes | yes | yes | no |
| Manage relationships | yes | yes | yes | no |
| Delete members | yes | yes | limited | no |
| Family settings | yes | limited | no | no |
| Invite collaborators | yes | yes | no | no |
| Manage family roles | yes | limited | no | no |
| Delete family / transfer ownership | yes | no | no | no |
| Billing / account tokens | account only | no | no | no |

## Token sessions

- Token grants only explicitly assigned families + permission (View/Edit + optional scope).
- Token cannot open Account Token Management or billing.
- Deactivated / expired / revoked tokens deny access immediately (enforced server-side).

## UI is not security

Hiding buttons is UX only. RLS + trusted functions / Edge Functions enforce access.
