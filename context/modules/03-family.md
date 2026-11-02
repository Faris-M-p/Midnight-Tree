# M3 — Family + memberships

## Purpose

Tenant boundary. Active family context. Multi-family switcher.

## Create family

Fields: name, optional description, optional location; image selection preview-only.

On success:

1. Insert family
2. Insert membership role `owner`
3. Open family workspace

## Multi-family

User may own one (Free) and be invited to many. Switcher lists owned + shared with role labels. Never mix family data in one query without `family_id` filter + RLS.
