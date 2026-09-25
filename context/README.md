# Midnight context

This folder is the permanent project context for AI-assisted work on Midnight. Read it before changing code so the product, rules, and current gaps do not have to be re-explained.

The facts in these files come from the `Midnight-Tree` source as inspected on 25 Sep 2026. If code and a context file disagree, trust the code and update the context file. Do not invent APIs, collections, screens, or business rules.

## How this folder is organized

| Folder | What it holds | Change it when |
|---|---|---|
| `project/` | What the product is, the stated vision, and what is built versus not built | The product definition changes |
| `rules/` | Permanent behavior: business rules, tree rules, permissions, security | A rule in code or Firebase rules changes |
| `architecture/` | How the app is structured | Folders, data flow, Firebase, or deploy setup changes |
| `features/` | What each feature actually does today | A feature is added, removed, or rewired |
| `design/` | UI patterns and the family-tree canvas | Visual rules or tree UI behavior changes |
| `development/` | Coding conventions, AI instructions, local workflow | Team workflow or conventions change |
| `status/` | What is true right now, the active task, and known problems | After meaningful work |

## Which files are which

Permanent rules:

- `rules/business-rules.md`
- `rules/family-tree-rules.md`
- `rules/user-permissions.md`
- `rules/security-rules.md`
- `development/coding-rules.md`
- `development/ai-rules.md`

Architecture:

- `architecture/overview.md`
- `architecture/frontend.md`
- `architecture/backend.md`
- `architecture/database.md`
- `architecture/storage.md`

Feature knowledge:

- `features/authentication.md`
- `features/family-management.md`
- `features/family-tree.md`
- `features/member-management.md`
- `features/memories.md`
- `features/subscription.md`
- `features/notifications.md`

Design:

- `design/ui-ux-rules.md`
- `design/design-system.md`
- `design/family-tree-ui.md`

Development and AI instructions:

- `development/coding-rules.md`
- `development/ai-rules.md`
- `development/workflow.md`

Current status:

- `status/current-status.md`
- `status/current-task.md`
- `status/known-issues.md`

## Read this before starting a task

1. `status/current-status.md`
2. `status/current-task.md`
3. `status/known-issues.md`
4. `development/ai-rules.md`
5. `architecture/overview.md`
6. The feature file and rule file that match the task

Then open the source files those docs name. Do not rely on `Midnight-Tree/ARCHITECTURE.md` or file-header comments when they still mention ASP.NET or MidnightApi. Several of those comments are stale.

## Recommended reading order

1. This README
2. `project/overview.md`
3. `architecture/overview.md`
4. `rules/business-rules.md`
5. `rules/user-permissions.md`
6. `rules/security-rules.md`
7. `status/current-status.md` and `status/known-issues.md`
8. The specific `features/*.md` and `design/*.md` files for the task
