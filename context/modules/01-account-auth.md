# M1 — Account / Authentication

## Purpose

Create and identify the Account Owner. Session restoration. Logout. Protected routes.

## Includes

- Register: name, email, password, confirm password
- Login: email + password
- Password reset (Supabase Auth)
- Session via Supabase Auth (no hand-rolled JWT store as source of truth)
- Distinguish Account Owner from family collaborators

## Token login

See `04-access-tokens.md`. Preserve Midnight-Tree behavior as **token-only shared key** unless product changes it.

## Out of scope here

- Family create UI details (M3)
- Billing checkout (M10)
