# Storage

## What the app does

`src/firebase/storage/uploadImage.ts` does not upload to Cloud Storage. Its header says Firebase Storage is not used from the browser because localhost is blocked by Storage CORS.

`uploadFamilyImage`:

- Rejects non-images and files larger than 5 MB
- Returns `fileToCompressedDataUrl` (max edge 1200, quality 0.82)
- Ignores `familyId` and `path` (`void` them)

Callers store that data URL on the Firestore document:

- Member `photoUrl`
- Family `photoUrl` and `coverUrl`

Memory images use `compressMemoryImage` in `memoryService.ts` instead: max source 10 MB, compress max edge 1000, quality 0.78, stored on `memoryPhotos.fileUrl`.

Event covers use `compressCover` in `src/services/eventService.ts`: same data-URL helper, max edge 1000, quality 0.78. `EVENT_MAX_IMAGE_BYTES` is 10 MB. The result is stored on `events.coverImageUrl`.

Default avatars when `photoUrl` is empty come from `src/utils/defaultAvatar.ts`, not Storage.

`DEFAULT_FAMILY_COVER` is a static asset/URL in `src/data/mockFamily.ts` when the family has no cover.

## Rules that exist but are unused by these helpers

`storage.rules` allows signed-in read/write under `families/{familyId}/**` when the uploaded object is under 5 MB.

`getFirebaseStorage()` in `firebase.ts` initializes the Storage SDK. No application service calls `uploadBytes` or `getDownloadURL`. A repo search of `src/` for those APIs is not required to state this: `uploadImage.ts` is the only storage module and it returns a data URL.

## Limits to remember

| Image | Max original size | Stored as |
|---|---|---|
| Family logo, cover, member photo | 5 MB | Data URL on the parent document |
| Memory photo | 10 MB, max 10 per memory | Data URL on `memoryPhotos` |
| Storage rules object size | 5 MB | Not used by current helpers |

Large data URLs count against Firestore’s 1 MiB document limit. That limit is a Firebase platform limit, not a check in this code. Memory photos are separate documents, which avoids putting every image on the memory document. Member and family images sit on the parent document.
