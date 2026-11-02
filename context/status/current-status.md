# Current status

**Date:** 2026-11-02

## Done in code (`midnight-web`)

- Auth: register / login / logout / create family
- Full SQL migrations (foundation + tree/collab)
- React Flow family tree (zoom/pan/fit/minimap)
- Add member, placeholders, connect existing partners
- Image preview + size validation (no upload)
- Family invites (create link + accept route)
- Account Owner access tokens UI
- Plans page from DB seeds
- Razorpay Edge Function stubs (501 until secrets)

## Blocked on you

There is **no Supabase MCP** in this Cursor workspace (only Firebase MCP). Keys must be provided manually:

1. Create Supabase project
2. `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ optional `NEXT_PUBLIC_SITE_URL`)
3. Run both SQL files in `supabase/migrations/` (see `supabase/README.md`)

## Not live yet

- Razorpay real checkout (stubs only)
- Cloudflare R2 uploads
- Token-login UI (create tokens works; login-with-token screen not wired like Midnight-Tree yet)
- Memories / events CRUD UI (tables exist)
