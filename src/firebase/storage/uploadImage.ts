/**
 * Persist a profile/cover image as a compressed data URL on the Firestore document.
 * Firebase Storage is not used from the browser — localhost is blocked by Storage CORS.
 */

import { FirebaseClientError } from "../errors/firebaseErrorHandler";
import { fileToCompressedDataUrl, isLikelyImageFile } from "../../utils/imageFile";

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadFamilyImage(input: {
  familyId: string;
  path: string;
  file: File;
}): Promise<string> {
  void input.familyId;
  void input.path;

  if (!isLikelyImageFile(input.file)) {
    throw new FirebaseClientError("Please choose an image file.", "invalid-argument");
  }
  if (input.file.size > MAX_BYTES) {
    throw new FirebaseClientError("Image must be 5 MB or smaller.", "invalid-argument");
  }

  try {
    return await fileToCompressedDataUrl(input.file);
  } catch {
    throw new FirebaseClientError("Could not read this image. Try a JPG or PNG.", "invalid-argument");
  }
}
