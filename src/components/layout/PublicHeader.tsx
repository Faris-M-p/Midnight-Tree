import { useEffect, useState } from "react";
import { GitBranch, Menu, X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { ThemeSelector } from "../theme/ThemeSelector";
import { isPublicNavActive, publicNavItems } from "../../navigation/publicNav";
import { navigateTo } from "../../routing/navigate";
import { DrawerPortal } from "./DrawerPortal";

interface PublicHeaderProps {
  pathname?: string;
}

export function PublicHeader({ pathname }: PublicHeaderProps) {
  const currentPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const [open, setOpen] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    navigateTo(href);
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-edge/80 bg-header/90 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-3 xl:h-16 xl:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-900 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 xl:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <button type="button" onClick={() => go("/")} className="inline-flex min-w-0 flex-1 items-center gap-2 text-left xl:flex-none">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-100">Midnight Chronicle</span>
            <span className="hidden truncate text-xs text-slate-400 sm:block">Family Tree Platform</span>
          </span>
        </button>

        <div className="hidden shrink-0 items-center gap-1 whitespace-nowrap xl:flex">
          {publicNavItems.map((item) => {
            const active = isPublicNavActive(currentPath, item.href);
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className={`rounded-lg px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                  active
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <ThemeSelector variant="menu" />
      </nav>
    </header>

    <DrawerPortal>
      <div className={`fixed inset-0 z-50 xl:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-overlay transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 flex h-dvh w-[min(20rem,85vw)] max-w-xs flex-col bg-sidebar shadow-theme transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Public navigation"
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-3">
            <p className="text-sm font-semibold text-slate-100">Midnight Chronicle</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              aria-label="Close navigation"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Public">
            {publicNavItems.map((item) => {
              const active = isPublicNavActive(currentPath, item.href);
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className={`flex min-h-11 w-full items-center rounded-xl px-3 text-sm transition ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-edge p-3">
            <ThemeSelector variant="panel" />
          </div>
        </aside>
      </div>
    </DrawerPortal>
    </>
  );
}
