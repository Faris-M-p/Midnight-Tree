import { useState, type ReactNode } from "react";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  pathname: string;
  title: string;
  children: ReactNode;
  contentClassName?: string;
}

export function AppLayout({ pathname, title, children, contentClassName = "" }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>{children}</main>
      </div>
      <MobileNavigation
        open={mobileNavOpen}
        pathname={pathname}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
