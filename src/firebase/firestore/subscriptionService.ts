/**
 * =============================================================================
 * FILE: src/firebase/firestore/subscriptionService.ts
 * ROLE: Firestore subscriptions/{id} — no payment verification
 * =============================================================================
 * New subscriptions are always stored as pending. The client cannot mark a
 * payment successful; that stays for a later server-side function.
 * =============================================================================
 */

import { addDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseSubscription } from "../types/firebaseTypes";
import { firestoreCollection, firestoreNow, getDocumentById, queryCollection } from "./helpers";

export function createSubscription(
  input: Omit<FirebaseSubscription, "id" | "createdAt" | "status">
): Promise<FirebaseSubscription> {
  return runFirebase("firebase.subscription.create", async () => {
    const payload: Omit<FirebaseSubscription, "id"> = {
      ...input,
      status: "pending",
      createdAt: firestoreNow()
    };
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.subscriptions), payload);
    return { id: reference.id, ...payload };
  });
}

export function getSubscription(subscriptionId: string): Promise<FirebaseSubscription | null> {
  return runFirebase("firebase.subscription.get", () =>
    getDocumentById<FirebaseSubscription>(FIRESTORE_COLLECTIONS.subscriptions, subscriptionId)
  );
}

export function getSubscriptionsByUser(userId: string): Promise<FirebaseSubscription[]> {
  return runFirebase("firebase.subscription.listByUser", () =>
    queryCollection<FirebaseSubscription>(
      FIRESTORE_COLLECTIONS.subscriptions,
      where("userId", "==", userId)
    )
  );
}

export function getSubscriptionsByFamily(familyId: string): Promise<FirebaseSubscription[]> {
  return runFirebase("firebase.subscription.listByFamily", () =>
    queryCollection<FirebaseSubscription>(
      FIRESTORE_COLLECTIONS.subscriptions,
      where("familyId", "==", familyId)
    )
  );
}
