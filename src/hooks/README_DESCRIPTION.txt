================================================================================
FOLDER: src/hooks/
================================================================================

1. FOLDER PURPOSE
-----------------
Reusable React hooks for UI behaviors that are not full contexts: submit locks,
scroll locking, family branding helpers.

2. FILES IN THIS FOLDER
-----------------------
useActionLock.ts
- Type: React hook
- What it does: Prevents double-submit by locking while an async action runs
- Exports: useActionLock
- Used by: EventsPage, Memories views, Member forms, destructive confirms

useFamilyBranding.ts
- Type: React hook
- What it does: Exposes family branding (name/photo) for headers/home
- Exports: useFamilyBranding
- Imports: data/familyBranding.ts / related loaders
- Used by: layout/header/home branding UI

useBodyScrollLock.ts
- Type: React hook
- What it does: Locks document body scroll when modals/drawers open
- Exports: useBodyScrollLock
- Used by: Modal/drawer components (members, notifications, etc.)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: pages/, components/
Depends on: data/, sometimes services/ indirectly
Does not own API endpoints itself

4. REAL PROJECT EXAMPLES
------------------------
Event delete uses useActionLock.run(() => deleteEvent(id))

5. HOW TO MODIFY SOMETHING
--------------------------
If double-submits still happen:
→ Ensure the button onClick uses lock.run
→ Check the async function awaits the service call

6. SIMPLE FLOW DIAGRAM
----------------------
Button click
 ↓
useActionLock.run(async () => serviceCall())
 ↓
Lock true → await API → lock false

7. .NET COMPARISON
------------------
≈ UI helper utilities / interaction guards (not a .NET Framework feature).
