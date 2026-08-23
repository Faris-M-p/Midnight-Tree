================================================================================
FOLDER: Midnight Tree/public/
================================================================================

1. FOLDER PURPOSE
-----------------
Static files copied/served by Vite without bundling through the React module
graph. Used for favicons and similar assets that must be addressable by URL.

2. FILES IN THIS FOLDER
-----------------------
favicon.svg
- Type: SVG icon
- What it does: Browser tab icon
- Why it exists: Branding / bookmark icon
- Used by: index.html / browser

icons.svg
- Type: SVG sprite/icons
- What it does: Static icon artwork available publicly
- Used by: Pages/components that reference /icons.svg when needed

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: Browser directly; referenced from HTML/CSS/components
Depends on: None (static)
Does NOT depend on: src/services or MidnightApi

4. REAL PROJECT EXAMPLES
------------------------
Opening the site loads /favicon.svg from this folder.

5. HOW TO MODIFY SOMETHING
--------------------------
If you need to change the tab icon:
→ Replace favicon.svg
→ Hard refresh the browser

6. SIMPLE FLOW DIAGRAM
----------------------
Browser request /favicon.svg
 ↓
Vite/public static file
 ↓
Icon shown in tab

7. .NET COMPARISON
------------------
≈ wwwroot static files in ASP.NET (conceptual only).
