import { useEffect } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";

interface VerifyEmailPageProps {
  onNavigate: (path: string) => void;
}

export function VerifyEmailPage({ onNavigate }: VerifyEmailPageProps) {
  useEffect(() => {
    onNavigate("/login");
  }, [onNavigate]);

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/verify-email" />
      <div className="mx-auto w-full max-w-md px-4 py-8 text-center text-sm text-slate-400">
        Email verification is no longer required. Please sign in.
      </div>
    </div>
  );
}
