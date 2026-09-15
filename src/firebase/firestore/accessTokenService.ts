/**
 * Firestore accessTokens/{tokenHash}
 */

import { setDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseAccessToken } from "../types/firebaseTypes";
import { deleteDocument, firestoreDoc, firestoreNow, getDocumentById, omitUndefined, queryCollection } from "./helpers";

export function createAccessToken(
  tokenId: string,
  input: Omit<FirebaseAccessToken, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseAccessToken> {
  return runFirebase("firebase.accessToken.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    await setDoc(firestoreDoc(FIRESTORE_COLLECTIONS.accessTokens, tokenId), payload);
    return { id: tokenId, ...payload };
  });
}

export function getAccessToken(tokenId: string): Promise<FirebaseAccessToken | null> {
  return runFirebase("firebase.accessToken.get", () =>
    getDocumentById<FirebaseAccessToken>(FIRESTORE_COLLECTIONS.accessTokens, tokenId)
  );
}

export function getAccessTokensByFamily(familyId: string): Promise<FirebaseAccessToken[]> {
  return runFirebase("firebase.accessToken.listByFamily", () =>
    queryCollection<FirebaseAccessToken>(FIRESTORE_COLLECTIONS.accessTokens, where("familyId", "==", familyId))
  );
}

export function updateAccessToken(
  tokenId: string,
  updates: Partial<Omit<FirebaseAccessToken, "id" | "createdAt" | "createdBy" | "familyId">>
): Promise<void> {
  return runFirebase("firebase.accessToken.update", () =>
    updateDoc(
      firestoreDoc(FIRESTORE_COLLECTIONS.accessTokens, tokenId),
      omitUndefined({
        ...updates,
        updatedAt: firestoreNow()
      })
    )
  );
}

export function deleteAccessToken(tokenId: string): Promise<void> {
  return runFirebase("firebase.accessToken.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.accessTokens, tokenId)
  );
}
