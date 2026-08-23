================================================================================
FOLDER: src/assets/
================================================================================

1. FOLDER PURPOSE
-----------------
Bundled static assets imported by modules (as opposed to public/ URL assets).
Typically leftover Vite/React starter images.

2. FILES IN THIS FOLDER
-----------------------
react.svg / vite.svg
- Type: SVG assets
- What they do: Default starter logos
- Used by: Only if some component still imports them (often unused in production UI)

3. RELATIONSHIP WITH OTHER FOLDERS
----------------------------------
Used by: Components that import these files
Depends on: Vite asset pipeline

4. REAL PROJECT EXAMPLES
------------------------
Prefer feature images from API URLs (CoverImageUrl) for family media.

5. HOW TO MODIFY SOMETHING
--------------------------
To add a bundled illustration:
→ Place file here
→ import url from '../assets/file.svg' in a component

6. SIMPLE FLOW DIAGRAM
----------------------
import asset
 ↓
Vite emits hashed URL
 ↓
<img src={assetUrl} />

7. .NET COMPARISON
------------------
≈ embedded/content resources (conceptual only).
