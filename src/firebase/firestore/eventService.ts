/**
 * Firestore events/{eventId}
 */

import { addDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseEvent } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, getDocumentById, omitUndefined, queryCollection } from "./helpers";

export function createEvent(
  input: Omit<FirebaseEvent, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseEvent> {
  return runFirebase("firebase.event.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.events), payload);
    return { id: reference.id, ...payload };
  });
}

export function getEvent(eventId: string): Promise<FirebaseEvent | null> {
  return runFirebase("firebase.event.get", () =>
    getDocumentById<FirebaseEvent>(FIRESTORE_COLLECTIONS.events, eventId)
  );
}

export function getEventsByFamily(familyId: string): Promise<FirebaseEvent[]> {
  return runFirebase("firebase.event.listByFamily", () =>
    queryCollection<FirebaseEvent>(FIRESTORE_COLLECTIONS.events, where("familyId", "==", familyId))
  );
}

export function updateEvent(
  eventId: string,
  updates: Partial<Omit<FirebaseEvent, "id" | "createdAt" | "createdBy" | "familyId">>
): Promise<void> {
  return runFirebase("firebase.event.update", () =>
    updateDoc(
      firestoreDoc(FIRESTORE_COLLECTIONS.events, eventId),
      omitUndefined({
        ...updates,
        updatedAt: firestoreNow()
      })
    )
  );
}

export function deleteEvent(eventId: string): Promise<void> {
  return runFirebase("firebase.event.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.events, eventId)
  );
}
