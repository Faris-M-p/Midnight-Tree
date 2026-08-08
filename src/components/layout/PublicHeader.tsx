import { GitBranch } from "lucide-react";
import { navigateTo } from "../../routing/navigate";

interface PublicHeaderProps {
  active: "home" | "features" | "about" | "login" | "register";
}

export function PublicHeader({ active }: PublicHeaderProps) {
  const link = (path: string, key: PublicHeaderProps["active"], label: string) => (
    <button
      type="button"
      onClick={() => navigateTo(path)}
      className={`rounded-lg px-3 py-2 text-sm transition ${
        active === key ? "bg-emerald-500/20 text-emerald-300" : "text-slate-300 hover:text-emerald-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={() => navigateTo("/")} className="inline-flex items-center gap-2 text-left">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
            <GitBranch className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-100">Midnight Chronicle</span>
            <span className="block text-xs text-slate-400">Family Tree Platform</span>
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {link("/", "home", "Home")}
          {link("/features", "features", "Features")}
          {link("/about", "about", "About")}
          {link("/login", "login", "Login")}
          <button
            type="button"
            onClick={() => navigateTo("/register")}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Register
          </button>
        </div>
      </nav>
    </header>
  );
}
