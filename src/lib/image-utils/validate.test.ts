import { describe, expect, it } from "vitest";
import {
  FREE_MAX_SINGLE_BYTES,
  formatBytes,
  noopImageStorage,
  validateImageFile
} from "./validate";

function fakeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("formatBytes", () => {
  it("formats B / KB / MB", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.00 MB");
  });
});

describe("validateImageFile", () => {
  it("accepts jpg under free limit", () => {
    const file = fakeFile("photo.jpg", "image/jpeg", 100_000);
    expect(validateImageFile(file)).toBeNull();
  });

  it("rejects bad types", () => {
    const file = fakeFile("doc.pdf", "application/pdf", 1000);
    expect(validateImageFile(file)).toMatch(/JPG, PNG, or WEBP/);
  });

  it("rejects oversized single file", () => {
    const file = fakeFile("big.png", "image/png", FREE_MAX_SINGLE_BYTES + 1);
    expect(validateImageFile(file)).toMatch(/or smaller/);
  });

  it("rejects when family allowance exceeded", () => {
    const file = fakeFile("a.webp", "image/webp", 1024);
    expect(validateImageFile(file, { totalUsed: 100 * 1024 * 1024, totalMax: 100 * 1024 * 1024 })).toMatch(
      /allowance/
    );
  });

  it("noop storage never persists", async () => {
    const file = fakeFile("x.jpg", "image/jpeg", 10);
    await expect(noopImageStorage.persist("fam", file)).resolves.toBeNull();
  });
});
