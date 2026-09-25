# AI rules

Use this when writing or reviewing Midnight code.

## Before editing

1. Read `context/README.md` and the reading order there.
2. Read the feature file and the rule file for the area you will change.
3. Open the source files named in those docs. Context can lag the code.
4. If a behavior is not in the code, mark it `Not implemented`, `Planned`, `Unknown`, or `TBD`. Do not invent it in code or in docs.

## Product facts that are easy to get wrong

- The live app is `Midnight-Tree`. `Midnight-Api` has no source.
- Persistence is Firebase Auth + Firestore. `apiClient.ts` is a stub.
- Marketing name in the UI is Midnight Chronicle. Package name is midnight-tree.
- Email login is an admin session. Access-token login is not.
- UI permission helpers are not enforced by `firestore.rules`.
- Stories, gallery, notifications, and subscription billing are not live features. Services or mock files may exist. See `project/roadmap.md`.
- The tree the user sees is laid out by `computeDynamicLayout` in `FamilyTreePage.tsx`.
- Image “uploads” are data URLs stored in Firestore.

## While editing

- Match existing folder boundaries in `development/coding-rules.md`.
- Keep changes limited to the task. Do not reformat unrelated files.
- Do not add a backend server, payment SDK, or React Router as a drive-by.
- Do not put secrets from `.env` into context, commits, or chat summaries.
- When you change behavior, update the matching `context/` file in the same task if the user asked for context to stay accurate. If they did not, do not rewrite context unprompted.
- Preserve user edits in context files. Do not blank a file that already has content.

## After editing

- Say what changed and what you could not verify.
- Do not claim a screen works unless it was exercised. This project has no automated test script in `package.json` (`dev`, `build`, `lint`, `preview` only).
- If Firestore rules or token scope are involved, state that the UI check and the security rule are different layers.
