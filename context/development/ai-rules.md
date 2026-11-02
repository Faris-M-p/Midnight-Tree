# AI rules

- Read `context/README.md` and the relevant module before coding.
- Mark unknowns as TBD / Not implemented — do not invent APIs.
- Preserve Account vs Family permission split.
- Phase order: scaffold → Supabase → auth/family → tree → … payments last among core SaaS.
- When user says automate with credentials: put secrets in `.env.local` / Edge secrets, not chat.
