# Workflow

```bash
cd d:\WorkSpace\Midnight\midnight-web
npm install
npm run dev      # only when user asks
npm run build
npm run lint
```

Env: `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).

Apply SQL from `supabase/migrations/` in the Supabase SQL editor (or CLI) before Auth/family features can persist data.

Context updates live in `context/`.

## Cadence

After each finished task: **Done → Next step → Later** (see `development/ai-rules.md`).
