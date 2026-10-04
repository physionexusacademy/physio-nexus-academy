# PNA Clinical Visual Atlas

## Goal
Deliver a premium 3D-first clinical learning library without adding routine load to Supabase or making Cloudflare render heavy real-time 3D scenes.

## Runtime architecture
- **Cloudflare / Next.js:** interface, static atlas metadata, search/filter UI, hotspots and comparison controls.
- **ImageKit:** all approved 3D clinical visuals and thumbnails.
- **Supabase:** not used for atlas browsing, image delivery, search or filtering.
- **Client search:** local in-memory filtering of the static atlas manifest; no query-per-keystroke database calls.

## Image delivery rules
Use the existing ImageKit endpoint configured in `src/lib/imagekit.ts`.

Master folder:
`pna/clinical-visual-atlas/<region>/<asset>.webp`

Knee prototype:
`pna/clinical-visual-atlas/knee/`

Thumbnails:
`pna/clinical-visual-atlas/knee/thumbs/`

The website requests responsive ImageKit transformations and uses lazy loading for non-critical images.

## Knee prototype asset names
1. normal-knee-anatomy.webp
2. knee-osteoarthritis.webp
3. knee-oa-healthy.webp
4. knee-oa-degenerative.webp
5. acl-anatomy.webp
6. acl-tear.webp
7. acl-injury-mechanism.webp
8. meniscus-anatomy.webp
9. meniscus-tear.webp
10. patellofemoral-pain.webp
11. lachman-test.webp
12. mcmurray-test.webp
13. knee-range-of-motion.webp
14. knee-rehabilitation-overview.webp

Create matching thumbnails under `thumbs/` for each library card.

## Visual quality standard
Every final visual must:
- use clinically plausible anatomy and proportions;
- avoid invented labels or structures;
- use a clean white or very light neutral background;
- use the same camera language and PNA visual style;
- use no more labels than necessary for the learning objective;
- show force or movement arrows only when they teach biomechanics or technique;
- avoid exaggerated tissue damage;
- avoid implying one image or special test proves a diagnosis;
- be reviewed for spelling and anatomical accuracy before publication.

## Publish safety
Every atlas record includes `assetReady`.

- `assetReady: false` keeps the detail page hidden and prevents broken ImageKit requests.
- The main atlas remains unpublished until at least one approved asset is ready.
- Sitemap, homepage, MSK Hub and footer links appear only when approved assets are live.
- MSK condition pages show only ready visuals mapped to that condition.

This allows assets to be generated, reviewed and uploaded one by one without exposing unfinished pages.

## Interaction strategy
Prefer:
1. pre-rendered 3D image;
2. ImageKit responsive delivery;
3. lightweight HTML/CSS hotspots;
4. two-image comparison slider;
5. image swapping for future anatomy layers.

Reserve real-time WebGL/GLB viewers for a very small number of flagship modules and load them only after explicit user interaction.

## Performance target
- thumbnails first on listing pages;
- full visual only on detail open;
- lazy-load all non-hero images;
- no atlas image bytes in Supabase;
- no large visual library bundled into Cloudflare static assets;
- no database request for atlas search or filters;
- no autoplay video or GIF-based injury sequences.

## Expansion order
After the Knee collection is approved:
1. Shoulder
2. Lumbar / Spine
3. Hip & Groin
4. Ankle & Foot
5. Cervical / Upper Quarter
6. Elbow & Forearm
7. Wrist & Hand

Use the same manifest, page templates and ImageKit folder convention so expansion is content-only rather than a new engineering project each time.
