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

## The bones
`public/posture-skeleton/skeleton-male.glb` and `skeleton-meta.json` are **PNA's own model**: no third-party mesh is used, so there is no outside licence or credit. Every bone is modelled from adult male reference anatomy (about 1.75 m tall) as a signed distance field and meshed. The script is `scripts/posture-skeleton/own/`:
- `spine.py`: C1 to L5, each vertebra on its own. The body, pedicles, laminae, spinous and transverse processes, facets and foramina change level by level. C1 has the atlas ring, C2 has the dens and C2–C6 have bifid spines.
- `thorax.py`: 12 ribs a side and the costal cartilages of ribs 1–10 (11 and 12 float), and the sternum (manubrium, body, xiphoid).
- `upper.py`: clavicle, scapula (blade, spine, acromion, coracoid, glenoid), humerus, ulna, radius and the hand (carpals, metacarpals, phalanges).
- `lower.py`: hip bones (ilium, ischium, pubis, acetabulum, obturator foramen), sacrum and coccyx, femur, patella, tibia, fibula and the foot (tarsals, metatarsals, phalanges, sesamoids).
- `skull.py`: cranium (orbits, nasal aperture, zygomatic arches, mastoids, condyles, foramen magnum), mandible and 32 teeth.
- `digits.py` builds the metacarpals, metatarsals and phalanges (blocky base, slim waisted shaft, knuckle or pulley head, spade tuft).
- `mesh.py` meshes each field (marching cubes), smooths and reduces it, and bakes ambient occlusion from the field into the vertex colours.

To rebuild (Python 3 with numpy, scipy, scikit-image and fast-simplification; Node with @gltf-transform/* and meshoptimizer, folder set by `GLTF_TOOLS`):
```
python3 scripts/posture-skeleton/own/build_parts.py /tmp/parts
node scripts/posture-skeleton/own/assemble.mjs /tmp/parts public/posture-skeleton
```

## Known limits
- Back and forward-bend views are the least tested: the pose model was checked on a bent-forward photo (shoulders, hips and ears read well; the far leg is partly hidden) but not on a back view. The page says when a measure could not be read.
- A slow phone may need up to 9 seconds to collect enough good frames; the capture waits for them.
- Pressure-plate data (foot pressure) is not possible with a phone.
