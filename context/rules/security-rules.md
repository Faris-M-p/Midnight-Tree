# Security rules

## Non-negotiable

1. Enable RLS on every exposed application table.
2. Never put service-role key, DB password, or Razorpay secret in `NEXT_PUBLIC_*` / browser env.
3. Family data isolation by membership (and token claims where applicable).
4. Changing `family_id` in the client must not grant access.
5. Invitation tokens: store hash, single-use, expiry, family-bound.
6. Access tokens: store hash + preview; raw secret shown once at creation.
7. Payment entitlement changes only in Edge Functions / secure DB paths after signature verification.
8. Webhooks idempotent (store event ids).

## Auth answers vs membership answers

- Auth: who is logged in?
- Membership / token: which family and what role/permission?

## Guest / token users

Must not bypass family checks. Read-only or scoped edit only as configured.
