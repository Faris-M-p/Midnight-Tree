/**
 * =============================================================================
 * FILE: src/App.tsx
 * ROLE: Application router + authenticated shell
 * =============================================================================
 * History API routing (same convention as before). Family Tree lives in
 * pages/app/FamilyTreePage.tsx with its original relationship logic intact.
 * =============================================================================
 */

import { useEffect, useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { FamilyDataProvider } from "./context/FamilyDataContext";
import { isAdmin } from "./auth/permissions";
import { isAuthenticated } from "./auth/session";
import { matchPath, navigateTo } from "./routing/navigate";
import { getPageTitle, isTreePath } from "./routing/titles";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ForgotPasswordVerifyPage } from "./pages/ForgotPasswordVerifyPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/app/HomePage";
import { FamilyPage } from "./pages/app/FamilyPage";
import { MembersPage } from "./pages/app/MembersPage";
import { MemberDetailsPage } from "./pages/app/MemberDetailsPage";
import { EditMemberPage } from "./pages/app/EditMemberPage";
import { FamilyTreePage } from "./pages/app/FamilyTreePage";
import { StoriesPage } from "./pages/app/StoriesPage";
import { GalleryPage } from "./pages/app/GalleryPage";
import { TimelinePage } from "./pages/app/TimelinePage";
import { EventsPage } from "./pages/app/EventsPage";
import { AccessTokensPage } from "./pages/app/AccessTokensPage";

const PUBLIC_PATHS = new Set([
  "/",
  "/features",
  "/about",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/forgot-password/verify",
  "/forgot-password/reset"
]);

function renderAuthenticatedPage(pathname: string) {
  if (pathname === "/home") return <HomePage />;
  if (pathname === "/family" || pathname === "/family/edit") return <FamilyPage pathname={pathname} />;
  if (pathname === "/members") return <MembersPage />;
  if (matchPath("/members/:id/edit", pathname)) return <EditMemberPage pathname={pathname} />;
  if (matchPath("/members/:id", pathname)) return <MemberDetailsPage pathname={pathname} />;
  if (pathname === "/family-tree") return <FamilyTreePage />;
  if (pathname.startsWith("/stories")) return <StoriesPage pathname={pathname} />;
  if (pathname.startsWith("/gallery")) return <GalleryPage pathname={pathname} />;
  if (pathname === "/timeline") return <TimelinePage />;
  if (pathname.startsWith("/events")) return <EventsPage pathname={pathname} />;
  if (pathname.startsWith("/access-tokens")) {
    if (!isAdmin()) {
      return (
        <div className="p-6 text-sm text-slate-400">
          You do not have permission to manage access tokens.
        </div>
      );
    }
    return <AccessTokensPage pathname={pathname} />;
  }

  return <HomePage />;
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (pathname === "/tree") {
      navigateTo("/family-tree");
      return;
    }
    if (!PUBLIC_PATHS.has(pathname) && !isAuthenticated()) {
      navigateTo("/login");
      return;
    }
    if ((pathname === "/login" || pathname === "/register") && isAuthenticated()) {
      navigateTo("/home");
    }
  }, [pathname]);

  if (pathname === "/") {
    return <LandingPage onNavigate={navigateTo} />;
  }
  if (pathname === "/features") {
    return <FeaturesPage />;
  }
  if (pathname === "/about") {
    return <AboutPage />;
  }
  if (pathname === "/login") {
    return <LoginPage onNavigate={navigateTo} />;
  }
  if (pathname === "/register") {
    return <RegisterPage onNavigate={navigateTo} />;
  }
  if (pathname === "/verify-email") {
    return <VerifyEmailPage onNavigate={navigateTo} />;
  }
  if (pathname === "/forgot-password") {
    return <ForgotPasswordPage onNavigate={navigateTo} />;
  }
  if (pathname === "/forgot-password/verify") {
    return <ForgotPasswordVerifyPage onNavigate={navigateTo} />;
  }
  if (pathname === "/forgot-password/reset") {
    return <ResetPasswordPage onNavigate={navigateTo} />;
  }

  if (!isAuthenticated()) {
    return <LoginPage onNavigate={navigateTo} />;
  }

  return (
    <FamilyDataProvider>
      <AppLayout
        pathname={pathname}
        title={getPageTitle(pathname)}
        contentClassName={isTreePath(pathname) ? "overflow-hidden p-0" : ""}
      >
        {renderAuthenticatedPage(pathname)}
      </AppLayout>
    </FamilyDataProvider>
  );
}
