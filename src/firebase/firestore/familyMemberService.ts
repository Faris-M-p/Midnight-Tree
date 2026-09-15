/**
 * =============================================================================
 * FILE: src/firebase/firestore/familyMemberService.ts
 * ROLE: Firestore familyMembers/{familyId}_{userId} access records
 * =============================================================================
 * Not connected to existing access-token permissions UI.
 * Document ids match firestore.rules lookups.
 * =============================================================================
 */

import { setDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import {
  FIRESTORE_COLLECTIONS,
  familyMemberAccessId,
  type FirebaseFamilyMemberAccess,
  type FirebaseFamilyRole
} from "../types/firebaseTypes";
import { deleteDocument, firestoreDoc, firestoreNow, omitUndefined, queryCollection } from "./helpers";

export function addFamilyMemberAccess(
  input: Omit<FirebaseFamilyMemberAccess, "id" | "joinedAt"> & { joinedAt?: unknown }
): Promise<FirebaseFamilyMemberAccess> {
  return runFirebase("firebase.familyAccess.add", async () => {
    const id = familyMemberAccessId(input.familyId, input.userId);
    const payload = omitUndefined({
      ...input,
      id,
      joinedAt: input.joinedAt ?? firestoreNow()
    });
    await setDoc(firestoreDoc(FIRESTORE_COLLECTIONS.familyMembers, id), payload);
    return payload;
  });
}

export function getFamilyMembers(familyId: string): Promise<FirebaseFamilyMemberAccess[]> {
  return runFirebase("firebase.familyAccess.list", () =>
    queryCollection<FirebaseFamilyMemberAccess>(
      FIRESTORE_COLLECTIONS.familyMembers,
      where("familyId", "==", familyId)
    )
  );
}

export function getFamilyAccessByUser(userId: string): Promise<FirebaseFamilyMemberAccess[]> {
  return runFirebase("firebase.familyAccess.listByUser", () =>
    queryCollection<FirebaseFamilyMemberAccess>(
      FIRESTORE_COLLECTIONS.familyMembers,
      where("userId", "==", userId)
    )
  );
}

export function updateFamilyMemberRole(
  familyId: string,
  userId: string,
  role: FirebaseFamilyRole
): Promise<void> {
  return runFirebase("firebase.familyAccess.updateRole", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.familyMembers, familyMemberAccessId(familyId, userId)), {
      role
    })
  );
}

export function removeFamilyMemberAccess(familyId: string, userId: string): Promise<void> {
  return runFirebase("firebase.familyAccess.remove", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.familyMembers, familyMemberAccessId(familyId, userId))
  );
}
