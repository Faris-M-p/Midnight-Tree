# UI and UX rules

Taken from the current screens. There is no separate UX spec.

## Shell

- Signed-in app: left sidebar (`Sidebar` / `AppNavItems`), top `Header`, content in `AppLayout`.
- Family tree route uses `contentClassName` `overflow-hidden p-0` so the canvas can fill the pane (`isTreePath`).
- Mobile nav is `MobileNavigation` (a drawer). Desktop nav is the sidebar.
- Public pages use `PublicHeader` and a dark slate background even when a light theme exists. Theme tokens are applied globally by `ThemeProvider`; public pages also use hardcoded `slate` classes.

## Navigation labels

From `appNav.ts`: Home, Family, Members, Family Tree, Memories, Timeline, Events, Access Tokens (admin), Logout.

## Feedback

- Save and load failures use `notify` (Sonner toasts), not `window.alert`.
- Buttons that submit use `useActionLock` and `BusyContent` / `RoundSpinner` so a second click does not fire another write.
- A global loader (`GlobalLoader`) listens to `loadingTracker`.
- Empty panels use `EmptyState` in `components/ui/PageStates.tsx`.
- Confirm before destructive actions where `ConfirmDialog` is used (memories). Member delete on the tree should be checked in `FamilyTreePage` before changing it; do not assume every delete has the same dialog.

## Forms

- Inputs on memories and events use shared class strings (`memoryInputClass`, `eventInputClass`): full width, rounded-xl, dark border, emerald focus.
- Dates use `DatePicker` and `DateTimePicker`.
- Member location is a map picker, not a plain text field only.

## Permissions in the UI

Hide or block write controls with `canEdit`, `canEditFamily`, `canCreateMember`, and `canEditMember`. Do not show admin tools to token users. Access Tokens is the only nav item with `requiresAdmin`.

## Copy tone

Public pages call the product Midnight Chronicle and describe a private family legacy, not a CRM or a business admin console.

## Not specified

- Accessibility audit, breakpoint pixel spec, and animation spec are **TBD**.
- Internationalization is **Not implemented**. Strings are English in the components.
