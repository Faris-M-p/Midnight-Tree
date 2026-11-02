# Family tree rules

## Identity

- One real person = one `members` UUID inside a family.
- Human-friendly `member_code` (e.g. `MEM-000001`) is display-only; relationships use UUID.
- Placeholder / unknown person = `member_type = placeholder` (distinct from real).
- Visual reference node = UI-only pointer to an existing UUID; **no** second member row.

## Relationships (separate table)

Support at minimum:

- Partner / marriage (including multiple over time, ended status)
- Parent–child

Prevent:

- Self-relationships
- Duplicate identical relationship rows
- Cross-family member links
- Circular parent–child chains

Connecting existing Member A to existing Member B as partners **must not** duplicate either person.

## Layout / UX contract (Lineage-inspired)

- Separate card per person; spouses linked by connector
- Zoom, fit, pan, search-to-member, generation/branch focus
- Ghost / visual reference for cross-branch appearance of the same UUID

## Start flexibility

No required root. Roots are derived from relationship graph (people without parents shown as top-level branches, plus orphans as needed).
