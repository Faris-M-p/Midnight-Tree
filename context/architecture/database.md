# Database (Supabase PostgreSQL)

Starting tables (refine in Phase 2 migrations):

## Identity & family

- `profiles` — Auth user profile
- `families`
- `family_memberships` — user_id, family_id, role, status (unique active pair)
- `invitations` — email, role, token hash, expiry, status

## Tree

- `members` — uuid PK, family_id, names, gender, dates, member_type, member_code, …
- `relationships` — family_id, source_member_id, target_member_id, type, status, dates

## Billing

- `subscription_plans` — Free / Family / Family Plus config
- `subscriptions`
- `payment_transactions`
- `payment_webhook_events`

## Tokens

- `access_tokens` — hash, preview, status, validity, created_by account owner
- `access_token_families` — explicit family_id + permission (no auto-all-families)

## Content

- `family_events`
- `member_notes`
- memories tables as needed (no image binary columns)

## Rules

- FK + indexes on family_id, user_id, member ids
- Unique constraints to prevent duplicate memberships / relationships
- Timestamps on all tables
- No profile_image_data / base64 columns
