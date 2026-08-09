import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { AppNavItems } from "./AppNavItems";

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  const family = useFamilyBranding();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950/95 xl:flex">
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-800 px-4 py-4">
        <img
          src={family.logo}
          alt=""
          className="h-10 w-10 rounded-xl border border-slate-700 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{family.name}</p>
          <p className="truncate text-[11px] text-slate-500">Midnight Chronicle</p>
        </div>
      </div>
      <AppNavItems pathname={pathname} />
    </aside>
  );
}
