/**
 * =============================================================================
 * FILE: src/firebase/firestore/devTestService.ts
 * ROLE: Isolated writes to _dev_firebase_test only
 * =============================================================================
 * Never call these against users/families/members.
 * =============================================================================
 */

import { addDoc } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseDevTestDocument } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreNow, getDocumentById } from "./helpers";

export function createDevTestDocument(message: string): Promise<FirebaseDevTestDocument> {
  return runFirebase("firebase.devTest.create", async () => {
    const payload: Omit<FirebaseDevTestDocument, "id"> = {
      message,
      createdAt: firestoreNow()
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.devTest), payload);
    return { id: reference.id, ...payload };
  });
}

export function getDevTestDocument(id: string): Promise<FirebaseDevTestDocument | null> {
  return runFirebase("firebase.devTest.get", () =>
    getDocumentById<FirebaseDevTestDocument>(FIRESTORE_COLLECTIONS.devTest, id)
  );
}

export function deleteDevTestDocument(id: string): Promise<void> {
  return runFirebase("firebase.devTest.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.devTest, id)
  );
}
