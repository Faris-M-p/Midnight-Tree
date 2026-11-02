# M7 — Relationships

## Purpose

Separate relationship graph from member documents.

## Core actions

Add Parent, Add Child, Add Partner, Connect Existing Member.

## Integrity

- Same family only
- No self links
- No duplicate identical rows
- No parent–child cycles
- Existing A marries existing B → one relationship row, zero new people

## Visual references

UI may render the same UUID twice for cross-branch clarity; DB still one member.
