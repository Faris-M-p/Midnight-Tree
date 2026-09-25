# Project overview

## Product name

Two names appear in the repo:

- **Midnight Chronicle** — copy on the landing, features, and about pages.
- **Midnight Tree** — npm package name `midnight-tree`, folder `Midnight-Tree`.

There is no separate product name in configuration beyond those.

## Product type

A private family genealogy web app. It is a single-page React client. Data is stored in Firebase (Auth, Firestore, and Storage rules). There is no running .NET API in this workspace.

The features page states: “Midnight Chronicle is a private family legacy platform — not a CRM.”

## Core purpose

From the landing page:

> Build, preserve, and explore your family story.

From the about page: keep the tree, stories, photographs, and dates so the next generation knows who they come from. Administrators stay inside the same app. There is no separate admin product.

## Who uses it

Implemented roles, from `src/auth/permissions.ts`:

- **Family admin** — email/password registration and login. Stored as `authType: "admin"` with `ADMIN_FULL`.
- **Access-token user** — signs in with a family access token. Permission is `View` or `Edit`. Scope is the whole family, one member, or a member plus descendants.
- **Signed-out visitor** — landing, features, about, login, register, and password-reset pages.

## What a family can do today

Implemented and reachable from `src/App.tsx`:

- Register a family and sign in
- View and edit the family profile (admin)
- Add, edit, view, and delete members
- Draw an interactive family tree from spouse and parent relationships
- Create memories with images
- Create events and see a timeline built from members, memories, and events
- Issue and manage access tokens (admin)
- Switch between Midnight (dark) and Ocean Breeze (light) themes

## Workspace layout

| Path | Status |
|---|---|
| `Midnight-Tree/` | The application. Vite + React + TypeScript. |
| `Midnight-Api/` | Git checkout with a one-line README. No `.cs` or `.csproj` files are present. |
| `context/` | This documentation. |

## Stack in use

From `Midnight-Tree/package.json`:

- React 19, TypeScript, Vite 8
- Tailwind CSS 4
- Firebase JS SDK 12
- `@xyflow/react` for the tree canvas
- Leaflet / react-leaflet for member location
- Sonner for toasts
- Node `>=20`

Deploy config present: `vercel.json` rewrites every path to `index.html`. `firebase.json` points at Firestore and Storage rules only. No Hosting or App Hosting config is in `firebase.json`.
