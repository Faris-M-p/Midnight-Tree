# Storage

## Current phase

**No uploads.**

- React `File` selection + object URL / local preview
- Size from `file.size`
- Validate type and size against plan entitlements
- On profile save: persist non-image fields only; clear or keep preview in memory until R2

## Future: Cloudflare R2

- Replaceable image service interface (e.g. `ImageStorageAdapter`)
- Path convention: `families/{familyId}/members/{memberId}/...`
- Do not redesign member module when R2 lands

## Forbidden until R2 phase

- Supabase Storage uploads for profile photos
- Postgres bytea / base64 image fields
- Saving blob: URLs to the database
