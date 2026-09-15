/**
 * =============================================================================
 * FILE: src/firebase/firestore/familyService.ts
 * ROLE: Firestore families/{familyId} — does not replace src/services/familyService.ts
 * =============================================================================
 */

import { addDoc, updateDoc } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseFamily } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, getDocumentById, omitUndefined } from "./helpers";

export function createFamily(
  input: Omit<FirebaseFamily, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseFamily> {
  return runFirebase("firebase.family.create", async () => {
    const payload = omitUndefined({
      ...input,
      memberCount: input.memberCount ?? 0,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.families), payload);
    return { id: reference.id, ...payload };
  });
}

export function getFamily(familyId: string): Promise<FirebaseFamily | null> {
  return runFirebase("firebase.family.get", () =>
    getDocumentById<FirebaseFamily>(FIRESTORE_COLLECTIONS.families, familyId)
  );
}

export function updateFamily(
  familyId: string,
  updates: Partial<Omit<FirebaseFamily, "id" | "createdAt" | "ownerId">>
): Promise<void> {
  return runFirebase("firebase.family.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.families, familyId), omitUndefined({
      ...updates,
      updatedAt: firestoreNow()
    }))
  );
}

export function deleteFamily(familyId: string): Promise<void> {
  return runFirebase("firebase.family.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.families, familyId)
  );
}
