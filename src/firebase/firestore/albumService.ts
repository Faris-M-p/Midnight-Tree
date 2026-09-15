/**
 * =============================================================================
 * FILE: src/firebase/firestore/albumService.ts
 * ROLE: Firestore albums/{albumId}
 * =============================================================================
 */

import { addDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseAlbum } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, queryCollection } from "./helpers";

export function createAlbum(
  input: Omit<FirebaseAlbum, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseAlbum> {
  return runFirebase("firebase.album.create", async () => {
    const payload: Omit<FirebaseAlbum, "id"> = {
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.albums), payload);
    return { id: reference.id, ...payload };
  });
}

export function getAlbumsByFamily(familyId: string): Promise<FirebaseAlbum[]> {
  return runFirebase("firebase.album.listByFamily", () =>
    queryCollection<FirebaseAlbum>(FIRESTORE_COLLECTIONS.albums, where("familyId", "==", familyId))
  );
}

export function updateAlbum(
  albumId: string,
  updates: Partial<Pick<FirebaseAlbum, "name" | "description">>
): Promise<void> {
  return runFirebase("firebase.album.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.albums, albumId), {
      ...updates,
      updatedAt: firestoreNow()
    })
  );
}

export function deleteAlbum(albumId: string): Promise<void> {
  return runFirebase("firebase.album.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.albums, albumId)
  );
}
