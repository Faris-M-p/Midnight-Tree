# Architecture overview

Midnight is a client-only web app. The browser talks to Firebase. The old ASP.NET API is not in this workspace and is not called.

```text
Browser
  └─ Midnight-Tree (Vite React SPA)
       ├─ src/pages, src/components     UI
       ├─ src/services                  feature API used by pages
       ├─ src/firebase                  Auth, Firestore, image helper
       └─ Firebase
            ├─ Authentication
            ├─ Cloud Firestore
            └─ Storage rules (uploads from the app are data URLs, not Storage)
```

`Midnight-Api/` has no application source.

## Request path

1. `src/main.tsx` mounts `App` inside `ThemeProvider`, plus a global loader and Sonner toaster.
2. `App.tsx` reads `window.location.pathname`. It does not use React Router.
3. Public pages render directly. Signed-in pages render inside `FamilyDataProvider` and `AppLayout`.
4. Pages call functions in `src/services/*`.
5. Those services call `src/firebase/firestore/*` or `src/firebase/auth/*`.
6. `src/services/apiClient.ts` is a stub. `apiRequest` and `apiFormRequest` throw `ApiClientError` with “This app uses Firebase only.”

## Shared family data

`FamilyDataContext` waits for the Firebase user, then calls `getFamilyTreeData()` once. Members and unions are shared by Home, Members, and the tree. `refresh` reloads them.

Events and memories are loaded by their own pages and by Home. They are not in that context.

## Configuration

`src/config/env.ts` reads:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

If any value is missing, `isFirebaseConfigured()` is false and `getFirebaseApp()` throws. There is no API base URL. `.env.example` lists only those Firebase variables.

Firebase init is in `src/firebase/config/firebase.ts`: Auth with local persistence, Firestore, and a Storage accessor.

## Deploy

- `vercel.json`: all routes rewrite to `/index.html`.
- `firebase.json`: Firestore rules, Firestore indexes, Storage rules. Indexes file is empty.

## Stale docs inside the app

`Midnight-Tree/ARCHITECTURE.md`, `src/services/README.md`, and several file headers still describe an ASP.NET API and `VITE_API_BASE_URL`. Those descriptions do not match `env.ts` or `apiClient.ts`.
