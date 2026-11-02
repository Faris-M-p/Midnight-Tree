# M6 — Members

## Purpose

Tree people (not Auth accounts). Profiles and placeholders.

## Fields (core)

id (uuid), family_id, first/middle/last/display name, gender, DOB/DOD, living/deceased, optional contact, biography, occupation, location, member_type (`real` | `placeholder`), member_code, created_by, timestamps.

## Rules

- UUID for relationships; `MEM-######` for display (family-scoped unique)
- Placeholder convertible to real / merge carefully (no duplicates)
- No image binary persistence

## Actions

Add relative types (father/mother/son/daughter/sibling/spouse) via relationship module; allow picking existing member.
