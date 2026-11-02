# Architecture overview

```text
Browser (Next.js App Router)
    |
    |-- Supabase Auth (session)
    |
    |-- Supabase JS SDK
    |       |-- PostgreSQL + RLS
    |       |-- Realtime (optional later)
    |
    |-- Supabase Edge Functions
    |       |-- Razorpay order / verify / webhook
    |       |-- Access token validate / privileged ops
    |
    |-- Cloudflare R2 (future images)
```

No separate .NET / Python / custom Node API host.

## App location

`d:\WorkSpace\Midnight\midnight-web`

## Phase 2 foundation (in repo)

- Client/server/middleware: `src/lib/supabase/`
- Types: `src/types/database.ts`
- SQL: `supabase/migrations/20261102120000_phase2_foundation.sql`
- Apply steps: `supabase/README.md`

## Suggested app folders (evolve as modules land)

```text
src/
  app/                 # routes
  components/
  features/            # auth, family, tree, ...
  lib/supabase/
  lib/permissions/
  lib/entitlements/
  lib/image-utils/
```

Prefer feature modules over a big rewrite of conventions later.
