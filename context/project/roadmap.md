# Roadmap

There is no roadmap file in the application repo. This page records what the code does today. Items under “Not a committed roadmap” are gaps, not scheduled work.

## Implemented and routed

- Email/password register and login (Firebase Auth)
- Password reset email (Firebase `sendPasswordResetEmail`)
- One family per registering user, created at signup
- Family profile: name, description, logo, cover
- Members: list, details, create, update, delete, location
- Relationships: spouse and parent links stored in Firestore
- Family tree canvas (React Flow)
- Home dashboard computed from members, events, and memories
- Memories with up to 10 images
- Events (birthday, anniversary, memorial, gathering, achievement, custom)
- Timeline page built from those records
- Access tokens: create, list, update, activate/deactivate, delete, login
- Theme switch: Midnight and Ocean Breeze
- Vercel SPA rewrite

## Present in code, not in the live app shell

- `StoriesPage` and `GalleryPage` render mock data from `src/data/stores.ts`. `App.tsx` does not mount them. Nav does not link to them.
- Firestore services exist for `stories`, `albums`, and `albumPhotos`. No page calls them.
- `src/data/mockNotifications.ts` exists. The notification drawer does not read it.
- `planService` and `subscriptionService` exist. No page imports them.
- `FirebaseTest.tsx` is a dev helper. It is not mounted by `App.tsx`.

## Not implemented

- .NET / MidnightApi backend. `src/services/apiClient.ts` throws “This app uses Firebase only.”
- Email OTP verification. `/verify-email` redirects to `/login` and says verification is no longer required.
- In-app OTP password reset. `/forgot-password/verify` and `/forgot-password/reset` redirect away. Reset is the Firebase email link.
- Payment capture or marking a subscription active. `subscriptionService` always writes `status: "pending"` and its comment says payment success is for a later server-side function.
- Push notifications, email notifications, and a notifications collection. **Not implemented.**
- Server-side authorization. Permission checks are client-side. See `rules/security-rules.md`.
- Firebase Storage uploads from the browser. Images are compressed data URLs on Firestore documents. See `architecture/storage.md`.
- Multiple families per user. **Not implemented.** `ensureCurrentFamilyId` keeps a single `familyId` on the user profile.
- A written product roadmap. **TBD.**
