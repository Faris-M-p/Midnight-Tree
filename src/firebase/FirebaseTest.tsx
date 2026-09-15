/**
 * =============================================================================
 * FILE: src/firebase/FirebaseTest.tsx
 * ROLE: Manual development check — not added to App.tsx routes
 * =============================================================================
 * Existing /login /register /family-tree routing is unchanged.
 * Import this component only when you want to verify Firebase locally.
 * Writes go only to _dev_firebase_test. No automatic writes on mount.
 * =============================================================================
 */

import { useState } from "react";
import { firebaseLogin, firebaseLogout, getCurrentFirebaseUser } from "./auth/firebaseAuth";
import { isFirebaseConfigured } from "./config/firebase";
import { FirebaseClientError } from "./errors/firebaseErrorHandler";
import { createDevTestDocument, deleteDevTestDocument, getDevTestDocument } from "./firestore/devTestService";

function errorText(error: unknown): string {
  if (error instanceof FirebaseClientError || error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function FirebaseTest() {
  const configured = isFirebaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [signedIn, setSignedIn] = useState(() => {
    if (!isFirebaseConfigured()) {
      return false;
    }

    try {
      return Boolean(getCurrentFirebaseUser()?.uid);
    } catch {
      return false;
    }
  });

  async function handleSignIn() {
    try {
      await firebaseLogin(email, password);
      setSignedIn(true);
      setMessage("Firebase Auth sign-in succeeded.");
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  async function handleSignOut() {
    try {
      await firebaseLogout();
      setSignedIn(false);
      setMessage("Signed out of Firebase Auth.");
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  async function handleCreate() {
    try {
      const document = await createDevTestDocument("Midnight Tree Firebase foundation check");
      setDocumentId(document.id ?? "");
      setMessage(`Created _dev_firebase_test/${document.id ?? ""}`);
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  async function handleRead() {
    try {
      if (!documentId) {
        setMessage("Create a test document first.");
        return;
      }
      const document = await getDevTestDocument(documentId);
      setMessage(document ? `Read ${document.id}: ${document.message}` : "Test document not found.");
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  async function handleDelete() {
    try {
      if (!documentId) {
        setMessage("Create a test document first.");
        return;
      }
      await deleteDevTestDocument(documentId);
      setMessage(`Deleted _dev_firebase_test/${documentId}`);
      setDocumentId("");
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4 p-6 text-sm">
      <h1 className="text-lg font-semibold">Firebase foundation check</h1>
      <p>This is a development helper. It is not part of the live login or family tree.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Firebase configured: {configured ? "yes" : "no"}</li>
        <li>Firebase Auth available: {configured ? "yes" : "no"}</li>
        <li>Firestore available: {configured ? "yes" : "no"}</li>
        <li>Firebase Auth signed in: {signedIn ? "yes" : "no"}</li>
      </ul>

      <div className="space-y-2">
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Firebase test email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Firebase test password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="flex gap-2">
          <button type="button" className="rounded border px-3 py-2" onClick={() => void handleSignIn()}>
            Sign in
          </button>
          <button type="button" className="rounded border px-3 py-2" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border px-3 py-2" onClick={() => void handleCreate()}>
          Create test document
        </button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => void handleRead()}>
          Read test document
        </button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => void handleDelete()}>
          Delete test document
        </button>
      </div>

      {message ? <p>{message}</p> : null}
    </section>
  );
}
