# Frontend

App root: `Midnight-Tree/`.

## Entry and routing

- `index.html` → `src/main.tsx` → `src/App.tsx`
- Routing is the History API: `navigateTo` in `src/routing/navigate.ts` pushes state and dispatches `popstate`.
- `matchPath` supports one dynamic segment, for example `/members/:id`.
- `/tree` redirects to `/family-tree`.

Public paths: `/`, `/features`, `/about`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/forgot-password/verify`, `/forgot-password/reset`.

Authenticated routes in `renderAuthenticatedPage`:

| Path | Page |
|---|---|
| `/home` | `HomePage` |
| `/family`, `/family/edit` | `FamilyPage` |
| `/members` | `MembersPage` |
| `/members/:id` | `MemberDetailsPage` |
| `/members/:id/edit` | `EditMemberPage` |
| `/family-tree` | `FamilyTreePage` |
| `/memories` and subpaths | `MemoriesPage` |
| `/timeline` | `TimelinePage` |
| `/events` and subpaths | `EventsPage` |
| `/access-tokens` | `AccessTokensPage` if `isAdmin()` |

Unknown authenticated paths fall through to `HomePage` (the function returns `<HomePage />` after the access-token branch).

Nav items are `src/navigation/appNav.ts`. Stories and Gallery are not in the nav.

## Folders

| Folder | Role |
|---|---|
| `src/pages` | Screens |
| `src/components` | UI. Tree canvas, members, memories, layout, home |
| `src/services` | Functions the UI calls |
| `src/firebase` | Firebase SDK wrappers |
| `src/auth` | Session gate and permission helpers |
| `src/context` | `FamilyDataContext` only |
| `src/layout` | Unused tree math (`computeFamilyTreeLayout`). The live canvas uses `computeDynamicLayout` in `FamilyTreePage.tsx`. |
| `src/types` | UI and legacy API-shaped TypeScript types |
| `src/theme` | Midnight and Ocean Breeze tokens |
| `src/data` | Mock stores and default cover art |
| `src/hooks` | Branding, scroll lock, action lock |
| `src/utils` | Dates, images, dashboard math, toasts |

## UI libraries

- Tailwind 4 via `@tailwindcss/vite`
- Icons: `lucide-react`
- Toasts: `sonner` (`AppToaster`)
- Tree: `@xyflow/react` (`FamilyTreeCanvas`, `MemberCard`, `MarriageNode`, `GenealogyEdge`)
- Maps: Leaflet on member location picker/view
- Tree export: `html-to-image` (`toPng` in `FamilyTreePage`)
- Confetti: `canvas-confetti` on the tree page

## State

- No Redux, Zustand, or React Query.
- Auth session: `localStorage` key `midnight.auth.session`.
- Theme id: `localStorage` key `midnight.theme-id`.
- Family members/unions: React context.
- Loading overlay: `loadingTracker` plus `useActionLock` (`beginApiRequest` / `endApiRequest`). The names still say “api”; they do not call HTTP.

## Forms and feedback

Pages validate locally and catch `FirebaseClientError` and sometimes `ApiClientError`. User-visible errors go through `src/utils/notify.tsx`.
