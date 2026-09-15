/**
 * Client environment. Firebase is required. MidnightApi is not used.
 */

function readOptional(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export const env = {
  firebase: {
    apiKey: readOptional(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: readOptional(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: readOptional(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: readOptional(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: readOptional(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: readOptional(import.meta.env.VITE_FIREBASE_APP_ID)
  }
};

export function isFirebaseConfigured(): boolean {
  const firebase = env.firebase;
  return Boolean(
    firebase.apiKey &&
      firebase.authDomain &&
      firebase.projectId &&
      firebase.storageBucket &&
      firebase.messagingSenderId &&
      firebase.appId
  );
}
