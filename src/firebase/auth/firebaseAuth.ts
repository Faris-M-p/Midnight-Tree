/**
 * =============================================================================
 * FILE: src/firebase/auth/firebaseAuth.ts
 * ROLE: Firebase Auth foundation (not wired to Login/Register UI)
 * =============================================================================
 * Existing src/services/authService.ts still talks to MidnightApi.
 * Do not import this file from LoginPage or session.ts yet.
 * =============================================================================
 */

import { getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type Unsubscribe,
  type User,
  type UserCredential
} from "firebase/auth";
import { getFirebaseApp, getFirebaseAuth } from "../config/firebase";
import { runFirebase } from "../errors/firebaseErrorHandler";

let persistenceReady: Promise<void> | null = null;

function ensureAuthPersistence(): Promise<void> {
  if (!persistenceReady) {
    persistenceReady = setPersistence(getFirebaseAuth(), browserLocalPersistence).catch(() => undefined);
  }
  return persistenceReady;
}

export async function waitForCurrentFirebaseUser(timeoutMs = 8000): Promise<User | null> {
  const auth = getFirebaseAuth();
  await ensureAuthPersistence();
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const finish = (user: User | null) => {
      window.clearTimeout(timer);
      unsub();
      resolve(user);
    };
    const timer = window.setTimeout(() => finish(auth.currentUser), timeoutMs);
    const unsub = onAuthStateChanged(auth, (user) => finish(user));
  });
}

export function firebaseSendPasswordReset(email: string): Promise<void> {
  return runFirebase("firebase.auth.resetEmail", async () => {
    await ensureAuthPersistence();
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  });
}

function getTokenIssuerAuth(): Auth {
  const name = "access-token-issuer";
  const existing = getApps().find((app) => app.name === name);
  const app = existing ?? initializeApp(getFirebaseApp().options, name);
  const auth = getAuth(app);
  void setPersistence(auth, inMemoryPersistence).catch(() => undefined);
  return auth;
}

export function accessTokenAuthEmail(tokenId: string): string {
  return `token.${tokenId.slice(0, 32)}@midnight-tree.firebaseapp.com`;
}

/** Creates a Firebase Auth user for an access token without replacing the admin session. */
export function createAccessTokenAuthUser(email: string, password: string): Promise<void> {
  return runFirebase("firebase.auth.accessTokenUser", async () => {
    const auth = getTokenIssuerAuth();
    await setPersistence(auth, inMemoryPersistence).catch(() => undefined);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code !== "auth/email-already-in-use") throw error;
    } finally {
      await signOut(auth).catch(() => undefined);
    }
  });
}

export function firebaseLogin(email: string, password: string): Promise<UserCredential> {
  return runFirebase("firebase.auth.login", () =>
    signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  );
}

export function firebaseRegister(email: string, password: string): Promise<UserCredential> {
  return runFirebase("firebase.auth.register", () =>
    createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  );
}

export function firebaseLogout(): Promise<void> {
  return runFirebase("firebase.auth.logout", () => signOut(getFirebaseAuth()));
}

export function subscribeToFirebaseAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function getCurrentFirebaseUser(): User | null {
  return getFirebaseAuth().currentUser;
}
