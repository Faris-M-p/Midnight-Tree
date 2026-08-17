export interface MemoryListItem {
  id: number;
  title: string;
  description?: string | null;
  memoryDate: string;
  location?: string | null;
  coverImageId?: number | null;
  coverUrl?: string | null;
  imageCount: number;
  createdOn?: string;
}

export interface MemoryImageItem {
  id: number;
  fileName?: string | null;
  storageKey?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  sortOrder: number;
  isCoverImage: boolean;
  isCover: boolean;
}

export interface MemoryCover {
  id: number;
  fileName?: string | null;
  storageKey?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

export interface MemoryDetail {
  id: number;
  title: string;
  description?: string | null;
  memoryDate: string;
  location?: string | null;
  coverImageId?: number | null;
  coverUrl?: string | null;
  cover?: MemoryCover | null;
  images: MemoryImageItem[];
  createdOn?: string;
  updatedOn?: string | null;
}

export interface PagedMemories {
  items: MemoryListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MemoryImageAction {
  imageId: number;
  url?: string | null;
  fileSize: number;
  imageCount: number;
  maxImageCount: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
}

export type MemorySortBy = "recent" | "oldest" | "title";

export interface MemoryListQuery {
  search?: string;
  sortBy?: MemorySortBy;
  page?: number;
  pageSize?: number;
}

export const MEMORY_MAX_IMAGES = 10;
export const MEMORY_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MEMORY_ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
export const MEMORY_ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
