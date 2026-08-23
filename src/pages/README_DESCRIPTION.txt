================================================================================
FOLDER: src/pages/
================================================================================

1. FOLDER PURPOSE
-----------------
Top-level route screens for PUBLIC (unauthenticated) pages: landing, auth,
marketing. Authenticated app screens live in pages/app/.

Why it exists:
- One file (or small set) per URL screen
- Keep route screens separate from reusable components/

2. FILES IN THIS FOLDER
-----------------------
LandingPage.tsx — Marketing home at /
FeaturesPage.tsx — Features marketing page
AboutPage.tsx — About marketing page
LoginPage.tsx — Email/password (or related) login → authService
RegisterPage.tsx — Registration → authService + pendingAuth
VerifyEmailPage.tsx — OTP email verification
ForgotPasswordPage.tsx — Start password reset
ForgotPasswordVerifyPage.tsx — OTP step for reset
ResetPasswordPage.tsx — Set new password

Each file:
- Type: React page component
- Exports: named page component
- Imports: layout/public pieces, auth services, notify, routing
- Used by: App.tsx PUBLIC_PATHS matching

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: App.tsx
Depends on: services/authService.ts, auth/, components/layout/PublicHeader,
  utils/notify.tsx, routing/navigate.ts
Child folder: pages/app/ (authenticated)

4. REAL PROJECT EXAMPLES
------------------------
/login → LoginPage → authService.login → saveAuthSession → navigateTo('/home')

5. HOW TO MODIFY SOMETHING
--------------------------
Change login fields:
→ LoginPage.tsx
→ types/auth.ts
→ authService.ts
→ MidnightApi AccountController + AccountModels

6. SIMPLE FLOW DIAGRAM
----------------------
App.tsx public path
 ↓
pages/LoginPage.tsx
 ↓
authService
 ↓
apiClient
 ↓
AccountController

7. .NET COMPARISON
------------------
≈ MVC Views / Razor Pages for public screens (conceptual only).
