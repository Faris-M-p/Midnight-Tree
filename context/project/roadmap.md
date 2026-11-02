# Roadmap

## Scaffold (done when this folder exists)

- [x] Create `midnight-web` Next.js app (isolated from Midnight-Tree)
- [x] Create `context/` with rules and module map
- [x] After-each-task cadence (Done → Next → Later)

## Phase 2 — Supabase foundation

- [x] Env template, Supabase client / server / middleware
- [x] Schema SQL: profiles, families, memberships, plans + RLS stubs
- [x] No tree rewrite in this phase

## Phase 3 — Auth + onboarding

- [x] Register / login / logout
- [x] Create family (no mandatory “create myself”)
- [x] Account Owner membership + family list / workspace shell

## Phase 4 — Family tree UI

- [ ] Lineage-style canvas on React Flow (or chosen engine) — stubs only today
- [ ] Separate person cards, zoom/fit/search
- Feature folders: `src/features/tree|members|relationships`

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
