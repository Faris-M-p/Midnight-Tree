import { apiFormRequest, apiRequest } from "./apiClient";
import type {
  MemoryDetail,
  MemoryImageAction,
  MemoryListItem,
  MemoryListQuery,
  MemoryImageItem,
  MemoryCover,
  PagedMemories
} from "../types/memory";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function pick<T>(obj: AnyRecord, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key] as T;
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

function mapListItem(raw: unknown): MemoryListItem {
  const item = asRecord(raw);
  return {
    id: Number(pick<number>(item, "id", "Id") ?? 0),
    title: String(pick<string>(item, "title", "Title") ?? ""),
    description: pick<string | null>(item, "description", "Description") ?? null,
    memoryDate: String(pick<string>(item, "memoryDate", "MemoryDate") ?? ""),
    location: pick<string | null>(item, "location", "Location") ?? null,
    coverImageId: pick<number | null>(item, "coverImageId", "CoverImageId", "coverMediaId", "CoverMediaId") ?? null,
    coverUrl: pick<string | null>(item, "coverUrl", "CoverUrl", "coverImageUrl", "CoverImageUrl") ?? null,
    imageCount: Number(pick<number>(item, "imageCount", "ImageCount") ?? 0),
    createdOn: pick<string>(item, "createdOn", "CreatedOn")
  };
}

function mapMedia(raw: unknown): MemoryImageItem {
  const item = asRecord(raw);
  const imageUrl = pick<string | null>(item, "imageUrl", "ImageUrl", "fileUrl", "FileUrl") ?? null;
  const isCover = Boolean(pick<boolean>(item, "isCoverImage", "IsCoverImage", "isCover", "IsCover"));
  return {
    id: Number(pick<number>(item, "id", "Id") ?? 0),
    fileName: pick<string | null>(item, "fileName", "FileName") ?? null,
    storageKey: pick<string | null>(item, "storageKey", "StorageKey") ?? null,
    imageUrl,
    fileUrl: imageUrl,
    mimeType: pick<string | null>(item, "mimeType", "MimeType") ?? null,
    fileSize: pick<number | null>(item, "fileSize", "FileSize") ?? null,
    sortOrder: Number(pick<number>(item, "sortOrder", "SortOrder") ?? 0),
    isCoverImage: isCover,
    isCover
  };
}

function mapCover(raw: unknown): MemoryCover | null {
  const cover = asRecord(raw);
  const id = Number(pick<number>(cover, "id", "Id") ?? 0);
  if (!id) return null;
  const imageUrl = pick<string | null>(cover, "imageUrl", "ImageUrl", "fileUrl", "FileUrl") ?? null;
  return {
    id,
    fileName: pick<string | null>(cover, "fileName", "FileName") ?? null,
    storageKey: pick<string | null>(cover, "storageKey", "StorageKey") ?? null,
    imageUrl,
    fileUrl: imageUrl,
    mimeType: pick<string | null>(cover, "mimeType", "MimeType") ?? null,
    fileSize: pick<number | null>(cover, "fileSize", "FileSize") ?? null
  };
}

function mapDetail(raw: unknown): MemoryDetail {
  const data = asRecord(raw);
  const imagesRaw = pick<unknown[]>(data, "images", "Images") ?? [];
  return {
    id: Number(pick<number>(data, "id", "Id") ?? 0),
    title: String(pick<string>(data, "title", "Title") ?? ""),
    description: pick<string | null>(data, "description", "Description") ?? null,
    memoryDate: String(pick<string>(data, "memoryDate", "MemoryDate") ?? ""),
    location: pick<string | null>(data, "location", "Location") ?? null,
    coverImageId: pick<number | null>(data, "coverImageId", "CoverImageId", "coverMediaId", "CoverMediaId") ?? null,
    coverUrl: pick<string | null>(data, "coverUrl", "CoverUrl", "coverImageUrl", "CoverImageUrl") ?? null,
    cover: mapCover(pick(data, "cover", "Cover")),
    images: Array.isArray(imagesRaw) ? imagesRaw.map(mapMedia) : [],
    createdOn: pick<string>(data, "createdOn", "CreatedOn"),
    updatedOn: pick<string | null>(data, "updatedOn", "UpdatedOn") ?? null
  };
}

function mapImageAction(raw: unknown): MemoryImageAction {
  const data = asRecord(raw);
  return {
    imageId: Number(pick<number>(data, "imageId", "ImageId", "mediaId", "MediaId") ?? 0),
    url: pick<string | null>(data, "url", "Url") ?? null,
    fileSize: Number(pick<number>(data, "fileSize", "FileSize") ?? 0),
    imageCount: Number(pick<number>(data, "imageCount", "ImageCount") ?? 0),
    maxImageCount: Number(pick<number>(data, "maxImageCount", "MaxImageCount") ?? 10),
    storageUsedBytes: Number(pick<number>(data, "storageUsedBytes", "StorageUsedBytes") ?? 0),
    storageLimitBytes: Number(pick<number>(data, "storageLimitBytes", "StorageLimitBytes") ?? 0)
  };
}

function buildListQuery(query: MemoryListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listMemories(query: MemoryListQuery = {}): Promise<PagedMemories> {
  const data = asRecord(await apiRequest<unknown>(`/api/memories${buildListQuery(query)}`));
  const itemsRaw = pick<unknown[]>(data, "items", "Items") ?? [];
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(mapListItem) : [],
    page: Number(pick<number>(data, "page", "Page") ?? 1),
    pageSize: Number(pick<number>(data, "pageSize", "PageSize") ?? 12),
    totalCount: Number(pick<number>(data, "totalCount", "TotalCount") ?? 0),
    totalPages: Number(pick<number>(data, "totalPages", "TotalPages") ?? 0)
  };
}

export async function getMemory(id: number): Promise<MemoryDetail> {
  return mapDetail(await apiRequest<unknown>(`/api/memories/${id}`));
}

export async function createMemory(input: {
  title: string;
  description: string;
  memoryDate: string;
  location?: string;
  coverImage: File;
  images?: File[];
}): Promise<MemoryDetail> {
  const form = new FormData();
  form.append("Title", input.title);
  form.append("Description", input.description);
  form.append("MemoryDate", input.memoryDate);
  if (input.location?.trim()) form.append("Location", input.location.trim());
  form.append("CoverImage", input.coverImage);
  for (const image of input.images ?? []) {
    form.append("Images", image);
  }
  return mapDetail(await apiFormRequest<unknown>("/api/memories", form, "POST"));
}

export async function updateMemory(
  id: number,
  input: {
    title: string;
    description: string;
    memoryDate: string;
    location?: string;
    coverImage?: File | null;
  }
): Promise<MemoryDetail> {
  const form = new FormData();
  form.append("Title", input.title);
  form.append("Description", input.description);
  form.append("MemoryDate", input.memoryDate);
  if (input.location?.trim()) form.append("Location", input.location.trim());
  if (input.coverImage) form.append("CoverImage", input.coverImage);
  return mapDetail(await apiFormRequest<unknown>(`/api/memories/${id}`, form, "PUT"));
}

export async function deleteMemory(id: number): Promise<void> {
  await apiRequest(`/api/memories/${id}`, { method: "DELETE" });
}

export async function uploadMemoryImage(memoryId: number, image: File): Promise<MemoryImageAction> {
  const form = new FormData();
  form.append("Image", image);
  return mapImageAction(await apiFormRequest<unknown>(`/api/memories/${memoryId}/images`, form, "POST"));
}

export async function deleteMemoryImage(memoryId: number, imageId: number): Promise<MemoryImageAction> {
  return mapImageAction(
    await apiRequest<unknown>(`/api/memories/${memoryId}/images/${imageId}`, { method: "DELETE" })
  );
}

export async function setMemoryCover(memoryId: number, imageId: number): Promise<MemoryDetail> {
  return mapDetail(
    await apiRequest<unknown, { imageId: number }>(`/api/memories/${memoryId}/cover`, {
      method: "PUT",
      body: { imageId }
    })
  );
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
