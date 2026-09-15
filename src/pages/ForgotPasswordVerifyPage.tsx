import { useEffect } from "react";
import { PublicHeader } from "../components/layout/PublicHeader";

interface ForgotPasswordVerifyPageProps {
  onNavigate: (path: string) => void;
}

export function ForgotPasswordVerifyPage({ onNavigate }: ForgotPasswordVerifyPageProps) {
  useEffect(() => {
    onNavigate("/forgot-password");
  }, [onNavigate]);

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <PublicHeader pathname="/forgot-password/verify" />
      <div className="mx-auto w-full max-w-md px-4 py-8 text-center text-sm text-slate-400">
        Use the reset link sent to your email.
      </div>
    </div>
  );
}
