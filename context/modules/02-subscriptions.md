# M2 — Subscriptions / entitlements

## Plans

1. Free  
2. Family  
3. Family Plus  

Config in DB: name, description, yearly price, max owned families, max members, total image bytes, max single image bytes, feature flags, active, sort order.

## Free defaults (initial)

- 1 owned family
- 150 members
- 100 MB total image allowance
- 2 MB per image

## Enforcement

Central entitlement helper used by family create, member create, image validation, premium features.

Client checks for UX; DB constraints / RPCs / Edge Functions for real enforcement.
