import { useFamilyBranding } from "../../hooks/useFamilyBranding";
import { AppNavItems } from "./AppNavItems";

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  const family = useFamilyBranding();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-edge bg-sidebar xl:flex">
      <div className="flex shrink-0 items-center gap-3 border-b border-edge px-4 py-4">
        <img
          src={family.logo}
          alt=""
          className="h-10 w-10 rounded-xl border border-input-border object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{family.name}</p>
          <p className="truncate text-[11px] text-fg-muted">Midnight Chronicle</p>
        </div>
      </div>
      <AppNavItems pathname={pathname} />
    </aside>
  );
}
