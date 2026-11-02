# Project overview

## Product name

**Midnight** (working package: `midnight-web`) — private family-tree SaaS.

Marketing tone may use “Midnight Chronicle” later; this codebase folder is `midnight-web`.

## Product type

Interactive family-tree product (builder-first), inspired by [Lineage](https://lineage.tools/) for structure and navigation — not an admin dashboard with a tree page bolted on.

## Core purpose

Families create a multi-generation tree, manage members and relationships, collaborate via invites and access tokens, and subscribe yearly for higher limits.

## Tenancy

- **Account** = billing + access tokens + security (Account Owner)
- **Family** = tree data + memberships + family roles
- Tree **members** are not Auth users
- One Auth user may access many families

## New vs old

| | Old (`Midnight-Tree`) | New (`midnight-web`) |
|---|---|---|
| Framework | Vite SPA | Next.js App Router |
| Backend | Firebase | Supabase |
| Payments | Not live | Razorpay via Edge Functions |
| Images | Data URLs in Firestore | Preview only until Cloudflare R2 |

Do not copy Firebase code into this project; reimplement against Supabase using these context rules.
