export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return !file.type && /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);
}

export function fileToCompressedDataUrl(file: File, maxEdge = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not process this image."));
        return;
      }
      context.drawImage(image, 0, 0, width, height);

      let nextQuality = quality;
      let dataUrl = canvas.toDataURL("image/jpeg", nextQuality);
      while (dataUrl.length > 700_000 && nextQuality > 0.4) {
        nextQuality -= 0.15;
        dataUrl = canvas.toDataURL("image/jpeg", nextQuality);
      }
      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read this image."));
    };
    image.src = objectUrl;
  });
}
