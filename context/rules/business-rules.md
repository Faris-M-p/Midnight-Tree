# Business rules

## Account

- Registration creates an Auth user + `profiles` row.
- That user is the **Account Owner** of their billing account.
- Free plan: create/own **1** family. Invites into other families are still allowed.
- Paid plan limits come from `subscription_plans` rows, not hardcoded React checks alone.

## Family

- Creating a family creates `families` + `family_memberships` with role `owner`.
- No mandatory “add myself as first tree member.”
- Tree can start from any person and grow in any direction.
- Every family-owned row includes `family_id`.

## Members vs users

- **Auth user** ≠ **tree member**.
- Relatives in the tree do not automatically get login access.
- Spouse relationships never auto-grant membership.

## Collaboration

1. **Email invitation** — family-scoped role; becomes `family_memberships` after accept.
2. **Public Access Token** — Account Owner only; shared credential; explicit family assignment(s).

## Images (until R2)

- Select and preview in React only.
- Calculate per-file and total sizes.
- Free defaults: max **2 MB** per image, **100 MB** family allowance (configurable via plan).
- Do **not** store binaries, base64, blob URLs, or Supabase Storage objects yet.

## Payments

- Yearly billing only in v1.
- Activate paid entitlement only after Edge Function verification / webhook — never from client “success” alone.
