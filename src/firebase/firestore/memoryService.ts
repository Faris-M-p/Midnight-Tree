/**
 * Firestore memories/{memoryId} and memoryPhotos/{photoId}
 */

import { addDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseMemory, type FirebaseMemoryPhoto } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, getDocumentById, omitUndefined, queryCollection } from "./helpers";

export function createMemory(
  input: Omit<FirebaseMemory, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseMemory> {
  return runFirebase("firebase.memory.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.memories), payload);
    return { id: reference.id, ...payload };
  });
}

export function getMemory(memoryId: string): Promise<FirebaseMemory | null> {
  return runFirebase("firebase.memory.get", () =>
    getDocumentById<FirebaseMemory>(FIRESTORE_COLLECTIONS.memories, memoryId)
  );
}

export function getMemoriesByFamily(familyId: string): Promise<FirebaseMemory[]> {
  return runFirebase("firebase.memory.listByFamily", () =>
    queryCollection<FirebaseMemory>(FIRESTORE_COLLECTIONS.memories, where("familyId", "==", familyId))
  );
}

export function updateMemory(
  memoryId: string,
  updates: Partial<Omit<FirebaseMemory, "id" | "createdAt" | "createdBy" | "familyId">>
): Promise<void> {
  return runFirebase("firebase.memory.update", () =>
    updateDoc(
      firestoreDoc(FIRESTORE_COLLECTIONS.memories, memoryId),
      omitUndefined({
        ...updates,
        updatedAt: firestoreNow()
      })
    )
  );
}

export function deleteMemory(memoryId: string): Promise<void> {
  return runFirebase("firebase.memory.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.memories, memoryId)
  );
}

export function createMemoryPhoto(
  input: Omit<FirebaseMemoryPhoto, "id" | "createdAt">
): Promise<FirebaseMemoryPhoto> {
  return runFirebase("firebase.memoryPhoto.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.memoryPhotos), payload);
    return { id: reference.id, ...payload };
  });
}

export function getMemoryPhotos(memoryId: string): Promise<FirebaseMemoryPhoto[]> {
  return runFirebase("firebase.memoryPhoto.listByMemory", async () => {
    const photos = await queryCollection<FirebaseMemoryPhoto>(
      FIRESTORE_COLLECTIONS.memoryPhotos,
      where("memoryId", "==", memoryId)
    );
    return photos.sort((left, right) => left.sortOrder - right.sortOrder);
  });
}

export function updateMemoryPhoto(
  photoId: string,
  updates: Partial<Pick<FirebaseMemoryPhoto, "isCover" | "sortOrder">>
): Promise<void> {
  return runFirebase("firebase.memoryPhoto.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.memoryPhotos, photoId), omitUndefined(updates))
  );
}

export function deleteMemoryPhoto(photoId: string): Promise<void> {
  return runFirebase("firebase.memoryPhoto.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.memoryPhotos, photoId)
  );
}
