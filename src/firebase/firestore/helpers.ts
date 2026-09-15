/**
 * =============================================================================
 * FILE: src/firebase/firestore/helpers.ts
 * ROLE: Small Firestore helpers for Firebase services only
 * =============================================================================
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot
} from "firebase/firestore";
import { getFirestoreDb } from "../config/firebase";

export function firestoreCollection(name: string): CollectionReference<DocumentData> {
  return collection(getFirestoreDb(), name);
}

export function firestoreDoc(collectionName: string, id: string) {
  return doc(getFirestoreDb(), collectionName, id);
}

export function firestoreNow() {
  return serverTimestamp();
}

export function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

export function mapDocument<T>(snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>): (T & { id: string }) | null {
  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as T)
  };
}

export async function getDocumentById<T>(collectionName: string, id: string): Promise<(T & { id: string }) | null> {
  const snapshot = await getDoc(firestoreDoc(collectionName, id));
  return mapDocument<T>(snapshot);
}

export async function queryCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<Array<T & { id: string }>> {
  const snapshot = await getDocs(query(firestoreCollection(collectionName), ...constraints));
  return snapshot.docs
    .map((item) => mapDocument<T>(item))
    .filter((item): item is T & { id: string } => item !== null);
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(firestoreDoc(collectionName, id));
}
