# Authentication

Status: **Implemented** for email/password and access tokens. OTP verification is **Not implemented**.

## Email and password

- Register: `src/pages/RegisterPage.tsx` → `registerWithFirebase` in `src/firebase/auth/firebaseAccount.ts`.
- Login: `src/pages/LoginPage.tsx` → `loginWithFirebase`. The page calls `logout()` first, then signs in, then `markPasswordLoginAdmin` with the email.
- Firebase calls: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, persistence `browserLocalPersistence`.
- After register, the client creates `users`, `families`, and `familyMembers` (role `owner`), then saves the family id on the session.
- After login, `ensureCurrentFamilyId()` finds or creates the family and the session is saved again with that id.
- Session record: `saveAuthSession` in `src/services/authSessionService.ts`, key `midnight.auth.session`.
- Fields set for this login: Firebase ID token as `accessToken`, expiry 55 minutes from now, `authProvider: "firebase"`, `authType: "admin"`, `isAdmin: true`, `permission: "ADMIN_FULL"`.
- Password minimum length is whatever Firebase Auth enforces. The register page’s own checks were not copied here; read `RegisterPage` before changing validation.

## Password reset

- `ForgotPasswordPage` calls `requestForgotPassword`, which sends Firebase’s reset email.
- Success copy: “If an account exists for this email, a reset link has been sent.”
- `/forgot-password/verify` immediately navigates back to `/forgot-password`.
- `/forgot-password/reset` immediately navigates to `/login` and says to use the email link.
- `verifyForgotPasswordOtp` and `resetPassword` in `authService.ts` throw. In-app new-password form is **Not implemented**.

## Email verification

- `/verify-email` immediately navigates to `/login` and says verification is no longer required.
- `verifyEmail` and `resendVerification` throw.
- Status: **Not implemented** (routes remain so old links do not 404 inside the SPA).

## Access token login

- Login page mode `"token"` calls `loginWithAccessTokenAndPersist`.
- Details of token creation and the synthetic Auth user are in `rules/business-rules.md`.
- The resulting session is `authType: "access_token"`, `isAdmin: false`, with the token’s permission and scope.
- `firebaseFamilyId` is the token’s `familyId`. Numeric `familyId` on the session is `0`.

## Sign-out

`logout()` in `src/auth/session.ts` clears `midnight.auth.session` and legacy keys `midnight.token.session` and `midnight.mock.user`, then Firebase `signOut` when Firebase is configured.

## App gate

`App.tsx`: if the path is not public and `isAuthenticated()` is false, redirect to `/login`. `isAuthenticated` only checks that a session object with a token is stored. It does not re-check Firebase `currentUser` before rendering the shell. Data loads then call `waitForCurrentFirebaseUser`.

## Not implemented

- Social login, phone auth, MFA, email link sign-in
- Server sessions
- Refreshing the 55-minute localStorage expiry from a new ID token
- Mapping `familyMembers.role` to permissions
