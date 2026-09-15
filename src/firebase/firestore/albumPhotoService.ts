/**
 * =============================================================================
 * FILE: src/firebase/firestore/albumPhotoService.ts
 * ROLE: Firestore albumPhotos/{photoId} metadata only
 * =============================================================================
 * fileUrl will later point at Cloudflare R2. This task does not upload files.
 * =============================================================================
 */

import { addDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseAlbumPhoto } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreNow, queryCollection } from "./helpers";

export function createAlbumPhoto(
  input: Omit<FirebaseAlbumPhoto, "id" | "createdAt">
): Promise<FirebaseAlbumPhoto> {
  return runFirebase("firebase.albumPhoto.create", async () => {
    const payload: Omit<FirebaseAlbumPhoto, "id"> = {
      ...input,
      createdAt: firestoreNow()
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.albumPhotos), payload);
    return { id: reference.id, ...payload };
  });
}

export function getAlbumPhotos(albumId: string): Promise<FirebaseAlbumPhoto[]> {
  return runFirebase("firebase.albumPhoto.listByAlbum", () =>
    queryCollection<FirebaseAlbumPhoto>(
      FIRESTORE_COLLECTIONS.albumPhotos,
      where("albumId", "==", albumId)
    )
  );
}

export function getAlbumPhotosByFamily(familyId: string): Promise<FirebaseAlbumPhoto[]> {
  return runFirebase("firebase.albumPhoto.listByFamily", () =>
    queryCollection<FirebaseAlbumPhoto>(
      FIRESTORE_COLLECTIONS.albumPhotos,
      where("familyId", "==", familyId)
    )
  );
}

export function deleteAlbumPhoto(photoId: string): Promise<void> {
  return runFirebase("firebase.albumPhoto.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.albumPhotos, photoId)
  );
}
