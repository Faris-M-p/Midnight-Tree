# AI rules

- Read `context/README.md` and the relevant module before coding.
- Mark unknowns as TBD / Not implemented — do not invent APIs.
- Preserve Account vs Family permission split.
- Phase order: scaffold → Supabase → auth/family → tree → … payments last among core SaaS.
- When user says automate with credentials: put secrets in `.env.local` / Edge secrets, not chat.

## After-each-task next-step cadence

After **every** completed task, end the user-facing reply with:

1. **Done** — what finished
2. **Next step** — exactly one upcoming task (title, why, what the user must approve/provide)
3. **Later** — optional one-line look-ahead

Do not dump the full roadmap every time. Keep the long list in `project/roadmap.md`.
