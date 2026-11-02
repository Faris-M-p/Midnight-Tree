# M4 — Account Access Tokens

## Ownership

**Account Owner only.** Not visible to family collaborators.

## Purpose

Preserve Midnight-Tree public token access: shared credential for View/Edit (and scopes as designed).

## Capabilities

- Create / edit / activate / deactivate / revoke
- Name, description, validity dates
- Explicit family assignment(s) + permission per family
- Never auto-include future families
- Store hash + preview; show raw secret once

## Login

Validate token server-side (Edge Function). Issue permitted session/claims. Enforce active + dates + family list.

Reference behavior from Midnight-Tree: token-only field on login (not email+password+token) unless product changes.
