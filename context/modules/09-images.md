# M9 — Image selection (no upload yet)

## Purpose

Preview + size validation against plan entitlements.

## Do

- File picker, preview, replace, remove
- Show KB/MB, remaining allowance
- Reject oversize / bad type

## Do not

- Upload to Supabase Storage or R2
- Write image bytes/base64/blob URLs to Postgres

## Adapter

Design `ImageStorageAdapter` stub so R2 can plug in later.
