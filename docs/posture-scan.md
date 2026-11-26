# Full Posture Scan (local, not deployed)

Route: `/health-calculators/posture/scan`. Four short phone captures (front, side, back, forward bend) are turned into angles, each with a margin of error, and shown on a 3D skeleton.

## What it is, and is not
- A **screen for learning and awareness**. Not a diagnosis. Every number has a plus-or-minus; the cut-offs are provisional until the validation study (docs/posture-validation.md) has compared them with a reference.
- The skeleton is an **illustration**: a standard adult male reference skeleton, moved through the points the phone could measure (head, shoulders, hips, knees). It is not an X-ray and does not show the person's bones or spine.
- It does not measure spinal curves, a rib hump or scoliosis, and says so on the page. The forward bend is described (trunk bend, hip angle, knee angle, where the hands reach), not graded.
- Pictures stay in the page while it is open, are never saved, sent or printed. "Save numbers on this device" keeps numbers only (localStorage, `pna-posture-scan-v1`).

## Code
- `src/lib/posture/scan.ts`: pure maths (back view without trusting the model's left/right, forward bend, capture summary, combining four views, severity per region, skeleton pose, scan comparison). Tested by `npm run validate:posture-scan` against hand-worked examples.
- `src/lib/posture/scan-text.ts`: English and Roman Urdu wording.
- `src/app/health-calculators/posture/scan/`: `ScanScreen.tsx` (capture), `ScanReport.tsx` (report), `ScanLoader.tsx` (browser-only load), `page.tsx`, `scan.css`. The camera, pose library and 3D code never enter the Cloudflare Worker.
- `src/components/posture/skeleton-rig.ts` and `SkeletonViewer.tsx`: load and pose the bones with three.js.
- `next.config.js`: the camera policy covers `/health-calculators/posture/:path*`.

## The bones (licence: read this before deploying)
`public/posture-skeleton/skeleton-male.glb` (1.3 MB) and `skeleton-meta.json` are built by `scripts/posture-skeleton/build.mjs` from `models/anatomy-male.glb` of the npm package `open-anatomy-3d` 0.1.0. That model adapts **BodyParts3D 4.0** (The Database Center for Life Science), which the package states is **CC BY 4.0** (the package also notes that the 2013 OBJ headers still carry the older "CC BY-SA 2.1 Japan" notice). The package could not be checked against the original source from the build machine (the DBCLS site was not reachable), so **confirm the licence terms before the first deploy**. Owner decision (26 Nov 2026): no credit or licence text is shown on the website. The source and licence texts are kept in `docs/posture-skeleton/` (not served). CC BY 4.0 asks for credit; leaving it out is the owner's decision and risk.

To rebuild: `npm pack open-anatomy-3d`, unpack it in a scratch folder, then `node scripts/posture-skeleton/build.mjs <anatomy-male.glb> public/posture-skeleton <catalog.json>` (needs @gltf-transform/* and meshoptimizer; set `GLTF_TOOLS` to a folder that has them).

## Known limits
- Back and forward-bend views are the least tested: the pose model was checked on a bent-forward photo (shoulders, hips and ears read well; the far leg is partly hidden) but not on a back view. The page says when a measure could not be read.
- A slow phone may need up to 9 seconds to collect enough good frames; the capture waits for them.
- Pressure-plate data (foot pressure) is not possible with a phone.
