import { FirebaseClientError } from "../firebase/errors/firebaseErrorHandler";
import { getCurrentFirebaseUser } from "../firebase/auth/firebaseAuth";
import { ensureCurrentFamilyId } from "../firebase/auth/currentFamily";
import {
  createMemory as createFirebaseMemory,
  createMemoryPhoto,
  deleteMemory as deleteFirebaseMemory,
  deleteMemoryPhoto,
  getMemoriesByFamily,
  getMemory as getFirebaseMemory,
  getMemoryPhotos,
  updateMemory as updateFirebaseMemory,
  updateMemoryPhoto
} from "../firebase/firestore/memoryService";
import type { FirebaseMemory, FirebaseMemoryPhoto } from "../firebase/types/firebaseTypes";
import { fileToCompressedDataUrl, isLikelyImageFile } from "../utils/imageFile";
import type {
  MemoryDetail,
  MemoryImageAction,
  MemoryImageItem,
  MemoryListItem,
  MemoryListQuery,
  PagedMemories
} from "../types/memory";
import { MEMORY_MAX_IMAGE_BYTES, MEMORY_MAX_IMAGES } from "../types/memory";

function asId(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function toIsoDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function compressMemoryImage(file: File): Promise<{ url: string; fileName: string; fileSize: number }> {
  if (!isLikelyImageFile(file)) {
    throw new FirebaseClientError("Please choose a JPG, JPEG, PNG, or WEBP image.", "invalid-argument");
  }
  if (file.size > MEMORY_MAX_IMAGE_BYTES) {
    throw new FirebaseClientError("Image must be 10 MB or smaller.", "invalid-argument");
  }
  try {
    const url = await fileToCompressedDataUrl(file, 1000, 0.78);
    return { url, fileName: file.name, fileSize: url.length };
  } catch {
    throw new FirebaseClientError("Could not read this image. Try a JPG or PNG.", "invalid-argument");
  }
}

function toImageItem(photo: FirebaseMemoryPhoto, index: number): MemoryImageItem {
  const id = photo.id || String(index);
  return {
    id,
    fileName: photo.fileName ?? null,
    imageUrl: photo.fileUrl,
    fileUrl: photo.fileUrl,
    fileSize: photo.fileSize ?? null,
    sortOrder: photo.sortOrder ?? index,
    isCoverImage: Boolean(photo.isCover),
    isCover: Boolean(photo.isCover)
  };
}

function toListItem(memory: FirebaseMemory): MemoryListItem {
  const id = memory.id ?? "";
  return {
    id,
    title: memory.title,
    description: memory.description ?? null,
    memoryDate: memory.memoryDate,
    location: memory.location ?? null,
    coverImageId: memory.coverPhotoId ?? null,
    coverUrl: memory.coverUrl ?? null,
    imageCount: memory.imageCount ?? 0,
    createdOn: timestampToIso(memory.createdAt)
  };
}

function toDetail(memory: FirebaseMemory, photos: FirebaseMemoryPhoto[]): MemoryDetail {
  const id = memory.id ?? "";
  let images = photos.map((photo, index) => toImageItem(photo, index));
  if (images.length === 0 && memory.coverUrl) {
    images = [
      {
        id: memory.coverPhotoId || `${id}-cover`,
        imageUrl: memory.coverUrl,
        fileUrl: memory.coverUrl,
        sortOrder: 0,
        isCoverImage: true,
        isCover: true
      }
    ];
  }
  const cover = images.find((image) => image.isCover) ?? images[0] ?? null;
  return {
    id,
    title: memory.title,
    description: memory.description ?? null,
    memoryDate: memory.memoryDate,
    location: memory.location ?? null,
    coverImageId: cover?.id ?? memory.coverPhotoId ?? null,
    coverUrl: cover?.fileUrl ?? memory.coverUrl ?? null,
    cover: cover
      ? {
          id: cover.id,
          fileName: cover.fileName,
          imageUrl: cover.fileUrl,
          fileUrl: cover.fileUrl,
          fileSize: cover.fileSize
        }
      : null,
    images,
    createdOn: timestampToIso(memory.createdAt),
    updatedOn: timestampToIso(memory.updatedAt) ?? null
  };
}

function storageAction(imageId: string | number, images: MemoryImageItem[], fileSize = 0): MemoryImageAction {
  return {
    imageId,
    url: images.find((image) => String(image.id) === String(imageId))?.fileUrl ?? null,
    fileSize,
    imageCount: images.length,
    maxImageCount: MEMORY_MAX_IMAGES,
    storageUsedBytes: images.reduce((sum, image) => sum + (image.fileSize ?? 0), 0),
    storageLimitBytes: 0
  };
}

async function loadDetail(memoryId: string): Promise<MemoryDetail> {
  const memory = await getFirebaseMemory(memoryId);
  if (!memory?.id) {
    throw new FirebaseClientError("Memory not found.", "not-found");
  }
  const photos = await getMemoryPhotos(memoryId);
  return toDetail(memory, photos);
}

async function syncCoverAndCount(memoryId: string, photos: FirebaseMemoryPhoto[]): Promise<void> {
  const cover = photos.find((photo) => photo.isCover) ?? photos[0] ?? null;
  await updateFirebaseMemory(memoryId, {
    coverUrl: cover?.fileUrl ?? null,
    coverPhotoId: cover?.id ?? null,
    imageCount: photos.length
  });
}

export async function listMemories(query: MemoryListQuery = {}): Promise<PagedMemories> {
  const familyId = await ensureCurrentFamilyId();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 12);
  const search = (query.search ?? "").trim().toLowerCase();

  let rows = await getMemoriesByFamily(familyId);
  if (search) {
    rows = rows.filter((memory) => {
      const haystack = `${memory.title} ${memory.description ?? ""} ${memory.location ?? ""}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  rows.sort((left, right) => {
    if (query.sortBy === "title") return left.title.localeCompare(right.title);
    const leftDate = left.memoryDate || timestampToIso(left.createdAt) || "";
    const rightDate = right.memoryDate || timestampToIso(right.createdAt) || "";
    const compared = leftDate.localeCompare(rightDate);
    return query.sortBy === "oldest" ? compared : -compared;
  });

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize).map(toListItem),
    page,
    pageSize,
    totalCount,
    totalPages
  };
}

export async function getMemory(id: string | number): Promise<MemoryDetail> {
  return loadDetail(asId(id));
}

export async function createMemory(input: {
  title: string;
  description: string;
  memoryDate: string;
  location?: string;
  coverImage: File;
  images?: File[];
}): Promise<MemoryDetail> {
  const familyId = await ensureCurrentFamilyId();
  const user = getCurrentFirebaseUser();
  const extraFiles = (input.images ?? []).slice(0, Math.max(0, MEMORY_MAX_IMAGES - 1));
  const cover = await compressMemoryImage(input.coverImage);
  const extras = await Promise.all(extraFiles.map((file) => compressMemoryImage(file)));

  const created = await createFirebaseMemory({
    familyId,
    title: input.title,
    description: input.description,
    memoryDate: input.memoryDate,
    location: input.location,
    coverUrl: cover.url,
    coverPhotoId: null,
    imageCount: 1 + extras.length,
    createdBy: user?.uid ?? "unknown"
  });
  const memoryId = created.id ?? "";
  if (!memoryId) {
    throw new FirebaseClientError("Memory could not be created.", "failed-precondition");
  }

  const coverPhoto = await createMemoryPhoto({
    familyId,
    memoryId,
    fileUrl: cover.url,
    fileName: cover.fileName,
    fileSize: cover.fileSize,
    sortOrder: 0,
    isCover: true
  });

  for (let index = 0; index < extras.length; index += 1) {
    await createMemoryPhoto({
      familyId,
      memoryId,
      fileUrl: extras[index].url,
      fileName: extras[index].fileName,
      fileSize: extras[index].fileSize,
      sortOrder: index + 1,
      isCover: false
    });
  }

  if (coverPhoto.id) {
    await updateFirebaseMemory(memoryId, { coverPhotoId: coverPhoto.id });
  }

  return loadDetail(memoryId);
}

export async function updateMemory(
  id: string | number,
  input: {
    title: string;
    description: string;
    memoryDate: string;
    location?: string;
    coverImage?: File | null;
  }
): Promise<MemoryDetail> {
  const memoryId = asId(id);
  const familyId = await ensureCurrentFamilyId();
  const updates: Parameters<typeof updateFirebaseMemory>[1] = {
    title: input.title,
    description: input.description,
    memoryDate: input.memoryDate,
    location: input.location || ""
  };

  if (input.coverImage) {
    const photos = await getMemoryPhotos(memoryId);
    const cover = await compressMemoryImage(input.coverImage);
    const existingCover = photos.find((photo) => photo.isCover);
    if (existingCover?.id) {
      await deleteMemoryPhoto(existingCover.id);
    }
    const coverPhoto = await createMemoryPhoto({
      familyId,
      memoryId,
      fileUrl: cover.url,
      fileName: cover.fileName,
      fileSize: cover.fileSize,
      sortOrder: 0,
      isCover: true
    });
    updates.coverUrl = cover.url;
    updates.coverPhotoId = coverPhoto.id ?? null;
    updates.imageCount = photos.length - (existingCover ? 1 : 0) + 1;
  }

  await updateFirebaseMemory(memoryId, updates);
  return loadDetail(memoryId);
}

export async function deleteMemory(id: string | number): Promise<void> {
  const memoryId = asId(id);
  const photos = await getMemoryPhotos(memoryId);
  await Promise.all(photos.map((photo) => (photo.id ? deleteMemoryPhoto(photo.id) : Promise.resolve())));
  await deleteFirebaseMemory(memoryId);
}

export async function uploadMemoryImage(memoryId: string | number, image: File): Promise<MemoryImageAction> {
  const id = asId(memoryId);
  const familyId = await ensureCurrentFamilyId();
  const photos = await getMemoryPhotos(id);
  if (photos.length >= MEMORY_MAX_IMAGES) {
    throw new FirebaseClientError("A memory can have at most 10 images.", "invalid-argument");
  }
  const compressed = await compressMemoryImage(image);
  const isFirst = photos.length === 0;
  const created = await createMemoryPhoto({
    familyId,
    memoryId: id,
    fileUrl: compressed.url,
    fileName: compressed.fileName,
    fileSize: compressed.fileSize,
    sortOrder: photos.length,
    isCover: isFirst
  });
  const nextPhotos = [...photos, created];
  await syncCoverAndCount(id, nextPhotos);
  const detail = await loadDetail(id);
  return storageAction(created.id ?? detail.images.at(-1)?.id ?? "0", detail.images, compressed.fileSize);
}

export async function deleteMemoryImage(memoryId: string | number, imageId: string | number): Promise<MemoryImageAction> {
  const id = asId(memoryId);
  const photoId = asId(imageId);
  const photos = await getMemoryPhotos(id);
  const remaining = photos.filter((photo) => photo.id !== photoId);
  await deleteMemoryPhoto(photoId);
  if (photos.find((photo) => photo.id === photoId)?.isCover && remaining[0]?.id) {
    await updateMemoryPhoto(remaining[0].id, { isCover: true });
    remaining[0] = { ...remaining[0], isCover: true };
  }
  await syncCoverAndCount(id, remaining);
  const detail = await loadDetail(id);
  return storageAction(photoId, detail.images);
}

export async function setMemoryCover(memoryId: string | number, imageId: string | number): Promise<MemoryDetail> {
  const id = asId(memoryId);
  const photoId = asId(imageId);
  const photos = await getMemoryPhotos(id);
  const next = await Promise.all(
    photos.map(async (photo) => {
      const isCover = photo.id === photoId;
      if (photo.id && photo.isCover !== isCover) {
        await updateMemoryPhoto(photo.id, { isCover });
      }
      return { ...photo, isCover };
    })
  );
  await syncCoverAndCount(id, next);
  return loadDetail(id);
}

export function memoryDateInputValue(value?: string | null): string {
  return toIsoDateInput(value);
}

export function formatMemoryDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function truncateText(value: string | null | undefined, max = 120): string {
  const text = (value ?? "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
