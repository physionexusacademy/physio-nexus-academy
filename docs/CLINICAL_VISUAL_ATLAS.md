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

## Multidisciplinary expansion — Phase 1 (October 2026)

The structured editorial roadmap lives in `src/lib/clinical-visual-atlas-roadmap.ts` and currently contains 130 topic records across MSK (53), Neurology (26), Pediatrics (23), and Cardiopulmonary (28). This is a planning inventory, **not a count of published images**. The aspirational 500-visual target is not a claim of completed content.

### Taxonomy and publishing
- Retain the existing live atlas manifest and `assetReady` gates. Never mark a new item ready without a verified asset and clinical review.
- Each topic can have three or more visual views: healthy anatomy, pathology/mechanism, and a clinically relevant comparison. Clinical assessment images are optional and require procedure-level review.
- Cross-listed conditions (e.g. cerebral palsy) should share a canonical visual set with specialty tags rather than duplicate assets.
- Use plain-English titles, specialty and region filters, and descriptive accessible alt text. Distinguish pathology illustrations from diagnostic imaging.
- Record a clinical reviewer, references, review date, asset license/provenance, and approval state before publishing any visual.
- The existing atlas documentation references ImageKit, while the current page mentions Cloudinary. Resolve the delivery-provider mismatch before expanding image upload automation.

### First 20-image pilot — editorial specification
1. MSK: cervical spine normal anatomy; cervical disc/foraminal narrowing; rotator cuff normal anatomy; supraspinatus full-thickness tear; knee normal anatomy; ACL tear; ankle lateral ligament anatomy; ATFL injury.
2. Neurology: brain vascular territories; ischemic stroke illustration; corticospinal tract; Parkinson-related basal ganglia circuit.
3. Pediatrics: age-appropriate developmental motor milestones; cerebral palsy motor patterns (non-stigmatizing, clinically accurate); pediatric hip anatomy; developmental dysplasia of the hip.
4. Cardiopulmonary: normal heart anatomy; coronary artery narrowing; normal lung/airway anatomy; emphysema alveolar changes.

Pilot images must have correct anatomy, no invented labels, neutral backgrounds, and human clinical sign-off. Do not publish all 20 just because files exist. Images of children should be medical illustrations without identifying real patients.

### Release phases
1. Finish the 20-image pilot and record clinical approvals.
2. Integrate specialty/region navigation with only approved images visible.
3. Expand the index and asset inventory in small reviewed batches, checking performance and broken links at each release.
4. Reconcile the 500-image target against coverage gaps and quality, not arbitrary quotas.
