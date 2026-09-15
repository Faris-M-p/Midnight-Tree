/**
 * =============================================================================
 * FILE: src/firebase/firestore/relationshipService.ts
 * ROLE: Firestore relationships/{id} — compatible with parent/spouse/child
 * =============================================================================
 * Existing treeService.ts still builds the canvas from MidnightApi nested tree.
 * These functions store the same relationship kinds without changing the UI.
 * =============================================================================
 */

import { addDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseRelationship } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreNow, omitUndefined, queryCollection } from "./helpers";

export function createRelationship(
  input: Omit<FirebaseRelationship, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseRelationship> {
  return runFirebase("firebase.relationship.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.relationships), payload);
    return { id: reference.id, ...payload };
  });
}

export function getRelationshipsByFamily(familyId: string): Promise<FirebaseRelationship[]> {
  return runFirebase("firebase.relationship.listByFamily", () =>
    queryCollection<FirebaseRelationship>(
      FIRESTORE_COLLECTIONS.relationships,
      where("familyId", "==", familyId)
    )
  );
}

export function deleteRelationship(relationshipId: string): Promise<void> {
  return runFirebase("firebase.relationship.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.relationships, relationshipId)
  );
}
