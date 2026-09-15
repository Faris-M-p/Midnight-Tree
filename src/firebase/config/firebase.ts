/**
 * =============================================================================
 * FILE: src/firebase/config/firebase.ts
 * ROLE: Firebase app / Auth / Firestore accessors
 * =============================================================================
 * Separate from the existing MidnightApi client. Nothing in src/services/
 * imports this file, so login/tree/members keep using .NET + PostgreSQL.
 *
 * Initialization is lazy: missing VITE_FIREBASE_* does not crash the app.
 * =============================================================================
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { env, isFirebaseConfigured } from "../../config/env";

export { isFirebaseConfigured };

function requireFirebaseConfig(): void {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values to .env.");
  }
}

export function getFirebaseApp(): FirebaseApp {
  requireFirebaseConfig();
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId
  });
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  void setPersistence(auth, browserLocalPersistence).catch(() => undefined);
  return auth;
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
