/**
 * =============================================================================
 * FILE: src/firebase/firestore/memberService.ts
 * ROLE: Firestore members/{memberId} — not wired to Family Tree UI
 * =============================================================================
 */

import { addDoc, updateDoc, where } from "firebase/firestore";
import { runFirebase } from "../errors/firebaseErrorHandler";
import { FIRESTORE_COLLECTIONS, type FirebaseFamilyMember } from "../types/firebaseTypes";
import { deleteDocument, firestoreCollection, firestoreDoc, firestoreNow, getDocumentById, omitUndefined, queryCollection } from "./helpers";

export function createMember(
  input: Omit<FirebaseFamilyMember, "id" | "createdAt" | "updatedAt">
): Promise<FirebaseFamilyMember> {
  return runFirebase("firebase.member.create", async () => {
    const payload = omitUndefined({
      ...input,
      createdAt: firestoreNow(),
      updatedAt: firestoreNow()
    });
    const reference = await addDoc(firestoreCollection(FIRESTORE_COLLECTIONS.members), payload);
    return { id: reference.id, ...payload };
  });
}

export function getMember(memberId: string): Promise<FirebaseFamilyMember | null> {
  return runFirebase("firebase.member.get", () =>
    getDocumentById<FirebaseFamilyMember>(FIRESTORE_COLLECTIONS.members, memberId)
  );
}

export function getMembersByFamily(familyId: string): Promise<FirebaseFamilyMember[]> {
  return runFirebase("firebase.member.listByFamily", async () => {
    const members = await queryCollection<FirebaseFamilyMember>(
      FIRESTORE_COLLECTIONS.members,
      where("familyId", "==", familyId)
    );
    return members.sort((left, right) => left.firstName.localeCompare(right.firstName));
  });
}

export function updateMember(
  memberId: string,
  updates: Partial<Omit<FirebaseFamilyMember, "id" | "createdAt" | "createdBy" | "familyId">>
): Promise<void> {
  return runFirebase("firebase.member.update", () =>
    updateDoc(firestoreDoc(FIRESTORE_COLLECTIONS.members, memberId), omitUndefined({
      ...updates,
      updatedAt: firestoreNow()
    }))
  );
}

export function deleteMember(memberId: string): Promise<void> {
  return runFirebase("firebase.member.delete", () =>
    deleteDocument(FIRESTORE_COLLECTIONS.members, memberId)
  );
}
