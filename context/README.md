# Midnight Web — Project Context

This folder is the permanent product and engineering context for **midnight-web**.

Read it before implementing features so Account Owner → Family → Tree rules stay consistent.

## Isolation rule

- **This app:** `d:\WorkSpace\Midnight\midnight-web` (Next.js)
- **Do not modify:** `Midnight-Tree` or `Midnight-Api`
- Old Midnight-Tree is a **read-only** reference for feature parity (token login, tree canvas ideas, memories, events)

## How context is organized

| Folder | Purpose |
|---|---|
| `project/` | Product name, vision, roadmap |
| `rules/` | Permanent business, tree, permission, security rules |
| `architecture/` | Next.js + Supabase + Edge Functions + storage |
| `modules/` | Module-by-module specs (implementation order) |
| `design/` | UI / Lineage-inspired tree UX |
| `development/` | Coding and AI rules, workflow |
| `status/` | Current phase and known gaps |

## Recommended reading order

1. This README
2. `project/overview.md`
3. `modules/00-module-map.md`
4. `rules/user-permissions.md`
5. `rules/security-rules.md`
6. `architecture/overview.md`
7. The specific `modules/*.md` for the task
8. `status/current-status.md`

## Stack (target)

- Next.js (App Router) + React + TypeScript + Tailwind
- Supabase Auth + PostgreSQL + RLS
- Supabase Edge Functions (Razorpay, token validation, privileged ops)
- Razorpay (yearly subscriptions)
- Cloudflare R2 later for images (not Phase 1–6 persistence)
