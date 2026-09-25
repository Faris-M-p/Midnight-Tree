# Workflow

## Local app

From `Midnight-Tree/`:

| Script | Command | What it does |
|---|---|---|
| Dev server | `npm run dev` | Vite |
| Production build | `npm run build` | `tsc -b` then `vite build` |
| Lint | `npm run lint` | oxlint |
| Preview | `npm run preview` | Serves the production build |

Node `>=20` is required by `package.json`.

Copy `Midnight-Tree/.env.example` to `.env` and fill the `VITE_FIREBASE_*` values. The example file says not to commit real values. Vite inlines these at build time. Vercel needs the same variables in project settings (comment in `.env.example`).

There is no `npm test` script.

## Firebase

`firebase.json` deploys rules and indexes only:

- `firestore.rules`
- `firestore.indexes.json` (currently empty)
- `storage.rules`

No Hosting target is configured there. The SPA rewrite for deployment that is in repo is `vercel.json`.

Firebase CLI login and project selection are **not scripted** in package.json. How this workspace’s Firebase project alias is named is **Unknown** unless `.firebaserc` exists. A search of the tree config files used for this context did not include a `.firebaserc`. Treat the active Firebase project as **Unknown** from the repo.

## Git

`Midnight-Tree` and `Midnight-Api` are separate git repositories. `context/` at the workspace root is outside both of those repos unless a parent repo is added later. Status of a parent git repo: **Unknown**.

## CI

No GitHub Actions or other CI config was found while inspecting `Midnight-Tree` for this documentation. CI is **Not implemented** in the tree that was inspected.

## Order of work for a feature

1. Read the context files for that feature.
2. Change the Firestore type and service if the data shape changes.
3. Change `src/services` so pages do not import Firestore directly.
4. Change the page and permission checks.
5. Update `firestore.rules` if a new collection is added. Do not widen existing rules as a shortcut.
6. Run `npm run lint` and `npm run build` in `Midnight-Tree` when the change is TypeScript.
