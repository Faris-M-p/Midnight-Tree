# Roadmap

## Scaffold (done when this folder exists)

- [x] Create `midnight-web` Next.js app (isolated from Midnight-Tree)
- [x] Create `context/` with rules and module map

## Phase 2 — Supabase foundation

- Env template, Supabase client
- Schema: profiles, families, memberships, plans
- RLS stubs
- No tree rewrite yet

## Phase 3 — Auth + onboarding

- Register / login / session
- Create family (no mandatory “create myself”)
- Account Owner membership

## Phase 4 — Family tree UI

- Lineage-style canvas on React Flow (or chosen engine)
- Separate person cards, zoom/fit/search

## Phase 5 — Members + relationships

- UUID + display codes
- Placeholders, existing-member marriage, integrity

## Phase 6 — Images (local only)

- Select / preview / size validation
- No DB binary / no Storage / no R2 yet

## Phase 7 — Plans / entitlements

- Free / Family / Family Plus from DB config

## Phase 8 — Razorpay

- Edge Functions: order, verify, webhook

## Phase 9 — Collaboration + content

- Email invitations, access tokens, events, settings, dashboard

## Phase 10 — Security review

- Role matrix, RLS isolation, payment/token tests
