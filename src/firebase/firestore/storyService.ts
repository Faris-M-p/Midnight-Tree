/**
 * =============================================================================
 * FILE: src/firebase/firestore/storyService.ts
 * ROLE: Firestore stories/{storyId}
 * =============================================================================
 */

import { addDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseStory } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, getDocumentById, queryCollection } from "./helpers";

export function createStory(
  input: Omit<FirebaseStory, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseStory> {
  return runFirebase("firebase.story.create", async () => {
    const payload: Omit<FirebaseStory, "id"> = {
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.stories), payload);
    return { id: reference.id, ...payload };
  });
}

export function getStory(storyId: string): Promise<FirebaseStory | null> {
  return runFirebase("firebase.story.get", () =>
    getDocumentById<FirebaseStory>(FIRESTORE_COLLECTIONS.stories, storyId)
  );
}

export function getStoriesByFamily(familyId: string): Promise<FirebaseStory[]> {
  return runFirebase("firebase.story.listByFamily", () =>
    queryCollection<FirebaseStory>(FIRESTORE_COLLECTIONS.stories, where("familyId", "==", familyId))
  );
}

export function updateStory(
  storyId: string,
  updates: Partial<Pick<FirebaseStory, "title" | "content" | "coverImageUrl">>
): Promise<void> {
  return runFirebase("firebase.story.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.stories, storyId), {
      ...updates,
      updatedAt: firestoreNow()
    })
  );
}

export function deleteStory(storyId: string): Promise<void> {
  return runFirebase("firebase.story.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.stories, storyId)
  );
}
