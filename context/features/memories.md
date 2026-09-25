# Memories

Status: **Implemented** for admin users at `/memories`.

## UI

`src/pages/app/MemoriesPage.tsx` switches subviews:

- List: `components/memories/MemoriesListView.tsx`
- Create: `MemoryCreateView.tsx`
- Details: `MemoryDetailsView.tsx`
- Edit: `MemoryEditView.tsx`
- Lightbox: `MemoryLightbox.tsx`

Writes are hidden unless `canEditFamily()` (admin). Token users with Edit permission do not get memory write buttons.

## Data

`src/services/memoryService.ts`.

List/get/create/update/delete plus image upload, image delete, and set cover.

A memory has title, description, `memoryDate`, optional location, cover, image count, and `createdBy`.

Images are `memoryPhotos` documents. `fileUrl` is a compressed data URL. Max 10 images. First image becomes the cover. Deleting the cover marks the next photo as cover.

Sort and search in `listMemories` run on the client after `getMemoriesByFamily`. Sort values on `MemoryListQuery`: `recent`, `oldest`, `title`.

## Home and timeline

Home loads `listMemories` and builds cards with `buildMemoryCards`. The timeline page merges memories with events and member dates in `buildFamilyTimeline`.

## Not the same as gallery or stories

- Gallery (`GalleryPage`, albums) is mock local state and is not routed. **Not implemented** as a product screen.
- Stories (`StoriesPage`) are mock local state and are not routed. Firestore `storyService` is unused by pages. **Not implemented** in the UI.

## Not implemented

- Video or non-image attachments
- Sharing a memory outside the family
- Comments or reactions
- Storage bucket files for memory images
