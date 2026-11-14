# Dr. Sajjad likeness: regenerating the face fit and face texture

Offline tools (Python 3 + numpy + Pillow; Node + Playwright for the mesh dump). Nothing here runs in production.

Inputs (not committed): the reference photograph `reference/dr-sajjad-raza.png` (gitignored) and a dump of the shared body (`mesh.json`).

1. `dump-mesh.cjs` — loads `public/virtual-patient/patient.glb` in a browser through the avatar's own loader and writes `mesh.json`
   (rest positions, normals, UVs, triangles, bone of every vertex). It was run from a small esbuild harness; any page that exposes
   `window.H.figure` (an avatar `Figure`) works.
2. `fit.py` — measured landmarks on the photo (eye corners and lid edges, nostrils, mouth, chin, jaw, cheeks, ears, hairline) are
   symmetrised and paired with the matching points on the generic head. A thin-plate spline gives the displacement of every vertex above the neck,
   written to `public/teacher/dr-sajjad-fit.bin`. The photo (eyes removed, shadows flattened, background wall masked out) is then
   projected on the fitted head and baked into the body's 2048 px UV layout: `public/teacher/dr-sajjad-face.webp` (RGBA).
3. Runtime: `src/lib/avatar/fit.ts` applies the displacement; `dress.ts` composites the face over the recoloured skin.

If the landmarks change, run steps 1–2 again and re-check with the side-by-side renders (photo | avatar).
Privacy: the photograph never leaves the machine; only the derived face texture is shipped.
