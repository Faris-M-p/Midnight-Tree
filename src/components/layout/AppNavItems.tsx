import { isAdmin } from "../../auth/permissions";
import { logout } from "../../auth/session";
import { appNavItems, isAppNavActive } from "../../navigation/appNav";
import { navigateTo } from "../../routing/navigate";

interface AppNavItemsProps {
  pathname: string;
  onNavigate?: () => void;
}

const itemClass = (active: boolean) =>
  `flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
    active
      ? "bg-accent-soft text-accent"
      : "text-fg-secondary hover:bg-surface hover:text-fg"
  }`;

export function AppNavItems({ pathname, onNavigate }: AppNavItemsProps) {
  const showAdmin = isAdmin();
  const mainItems = appNavItems.filter((item) => item.section === "main");
  const adminItems = appNavItems.filter((item) => item.section === "admin" && showAdmin);
  const bottomItems = appNavItems.filter((item) => item.section === "bottom");

  const go = (href: string) => {
    navigateTo(href);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    navigateTo("/login");
    onNavigate?.();
  };

  return (
    <>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Application">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = item.href ? isAppNavActive(pathname, item.href) : false;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.href && go(item.href)}
              className={itemClass(active)}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}

        {adminItems.length > 0 && (
          <div className="mt-6 border-t border-edge pt-4">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
              Administration
            </p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = item.href ? isAppNavActive(pathname, item.href) : false;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.href && go(item.href)}
                  className={itemClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-edge p-3">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-fg-secondary transition hover:bg-danger-soft hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
