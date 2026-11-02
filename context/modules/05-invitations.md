# M5 — Email invitations

## Purpose

Family-scoped collaboration for real Auth users.

## Flow

Owner/Admin invites email + role → secure token → recipient auth → validate → `family_memberships` → mark invitation accepted.

## Rules

- One family per invitation
- Hash token; expiry; pending/accepted/expired/cancelled
- No reuse after accept
- Does not grant account billing/token powers
