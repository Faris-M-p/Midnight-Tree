# Frontend (Next.js)

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Principles

- Tree page is the primary authenticated product surface
- Feature folders for auth, family, tree, billing
- Client components for canvas; server components where they help data/auth gates
- Central permission helpers for UI; RLS for real security
- Theme: white light + full dark (see `design/`)

## Tree UI

Target: Lineage-like interaction (zoom, fit, search, generation focus, separate person cards).

Engine preference: React Flow (`@xyflow/react`) when added — same class of tool as Midnight-Tree.

## Do not

- Call privileged APIs with secrets from the browser
- Persist image binaries in client-only storage as “done”
- Port Firebase SDK into this project
