# Supabase

## Apply migrations (both, in order)

1. Create a Supabase project.
2. Copy Project URL + anon key into `midnight-web/.env.local` (see `.env.example`).
3. Optional: `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for invitation links.
4. SQL Editor — run in order:
   - [`migrations/20261102120000_phase2_foundation.sql`](migrations/20261102120000_phase2_foundation.sql)
   - [`migrations/20261102140000_phase4_tree_collab.sql`](migrations/20261102140000_phase4_tree_collab.sql)

## Tables

Phase 2: `profiles`, `families`, `family_memberships`, `subscription_plans`  
Phase 4+: `members`, `relationships`, `invitations`, `access_tokens`, `access_token_families`, `family_events`, `memories`, `subscriptions`

Service role and Razorpay secrets stay in Edge Function secrets — never in `NEXT_PUBLIC_*`.

Razorpay stubs: `supabase/functions/razorpay-*` (return 501 until secrets are set).
