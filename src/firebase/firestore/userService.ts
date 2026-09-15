/**
 * =============================================================================
 * FILE: src/firebase/firestore/userService.ts
 * ROLE: Firestore users/{uid} — not connected to MidnightApi auth
 * =============================================================================
 */

import { setDoc, updateDoc } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseUserProfile } from "../types/firebaseTypes";
import { firestoreDoc, firestoreNow, getDocumentById, omitUndefined } from "./helpers";

export function createUserProfile(
  profile: Omit<FirebaseUserProfile, "createdAt"> & { createdAt?: unknown }
): Promise<FirebaseUserProfile> {
  return runFirebase("firebase.user.create", async () => {
    const payload = omitUndefined({
      ...profile,
      createdAt: profile.createdAt ?? firestoreNow()
    });
    await setDoc(firestoreDoc(FIRESTORE_COLLECTIONS.users, profile.uid), payload, { merge: true });
    return payload;
  });
}

export function getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  return runFirebase("firebase.user.get", async () => {
    const document = await getDocumentById<FirebaseUserProfile>(FIRESTORE_COLLECTIONS.users, uid);
    if (!document) {
      return null;
    }

    return {
      ...document,
      uid: document.uid || document.id
    };
  });
}

export function updateUserProfile(
  uid: string,
  updates: Partial<Omit<FirebaseUserProfile, "uid" | "createdAt">>
): Promise<void> {
  return runFirebase("firebase.user.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.users, uid), omitUndefined(updates))
  );
}
