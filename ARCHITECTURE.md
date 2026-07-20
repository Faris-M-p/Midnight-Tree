# Midnight Tree — Frontend Architecture

This document explains how the React app is organized.
You do **not** need deep React knowledge to navigate the folders.

---

## High-level flow

```
Browser URL
    │
    ▼
main.tsx          → starts React and mounts App
    │
    ▼
App.tsx           → chooses which page to show (Landing / Login / Register / Tree)
    │
    ├─ pages/     → full screens (Landing, Login, Register)
    └─ Tree view  → AppContent inside App.tsx
           │
           ├─ components/  → UI pieces (cards, modals, canvas)
           ├─ services/    → talks to the ASP.NET API
           ├─ layout/      → calculates X/Y positions for the family tree
           ├─ types/       → TypeScript shapes for API data
           └─ config/      → environment settings (API base URL)
```

---

## Folder guide

| Folder | Purpose |
|--------|---------|
| `src/pages/` | Full-page screens users navigate to |
| `src/components/` | Reusable UI blocks (tree cards, modals, header) |
| `src/services/` | API calls + auth token helpers (no UI here) |
| `src/layout/` | Pure math: where each family member is placed on the canvas |
| `src/types/` | Shared TypeScript interfaces for API request/response |
| `src/config/` | Reads `.env` values like `VITE_API_BASE_URL` |
| `src/context/` | (if present) Global React state such as auth |

---

## Family tree data path

1. User opens `/tree`
2. `treeService.getFamilyTreeData()` loads members/relationships from API
3. `App.tsx` stores `members` + `unions` in React state
4. `computeFamilyTreeLayout()` (or inline layout in App) computes `{ x, y }` for each node
5. `FamilyTreeCanvas` draws nodes with React Flow
6. `GenealogyEdge` draws clean parent→child lines (T-junction style)

---

## Important rules

- **UI components** should not call `fetch` directly — use `services/`
- **Layout math** stays separate from drawing — easier to fix hierarchy bugs
- **API shapes** live in `types/` so frontend matches backend contracts
- Comments at the **top of each main file** describe that file’s job

---

## Backend

API project: `MidnightApi` (ASP.NET Core)  
Typical base URL: `https://localhost:7187` (see `Midnight Tree/.env`)
