# PNA Manual Therapy Visual Upload System — 35 unique technique covers

This workflow is **staging-only** until all 35 clinical visuals are approved.
The published site keeps its existing Cloudinary art and clinical content during preparation.

## How to upload source images (once all 35 are ready)

1. In GitHub, select the non-production branch `assets/manual-visuals-inbox`.
2. Open `assets/manual-therapy/inbox/`, then **Add file → Upload files**.
3. Upload **one ZIP** named `manual-therapy-masters.zip`. Put exactly one image inside the ZIP per technique, named with the matching published slug: `slug.png`, `slug.jpg`, `slug.jpeg`, or `slug.webp`. Do not use human-readable titles. All 35 technique slugs are in `src/data/manual-therapy-visual-manifest.json`.
4. Commit the ZIP **only to the inbox branch**; never to `cloudflare-deploy`.
5. Go to GitHub → Actions → **Stage Manual Therapy AVIF/WebP Covers** → Run workflow. Keep the default inbox branch.
6. When it finishes, download the **manual-therapy-visual-review** artifact and inspect the contact sheet and sizes. Check manual positioning, hand placement, regions, cropping and misleading anatomy against authoritative references. Re-render failures.
7. Mark each entry `status: "approved"` in the manifest ONLY after clinical image QA, update `crop.x` / `crop.y` (0–100) if needed, and document review decisions.
8. When all 35/35 entries are approved and both optimized formats are present, run:
   ```sh
   node scripts/validate-manual-visuals.mjs --publish
   ```
   This fails if a single image is missing, duplicated, too large, incorrectly named or unapproved.
9. Review the image-only draft PR and merge only the approved binary pairs. The source ZIP **never** belongs in the production branch.
10. Set `publish:true` in the reviewed manifest and configure `MANUAL_THERAPY_VISUALS_LIVE=true` at production build time **in the same verified release**. The release cannot show new cards without BOTH switches and all approvals. If either switch is off, previous Cloudinary visuals remain.
11. Verify 35 image HTTP 200s and browser AVIF→WebP support on staging before switching on live.

## Performance contract

- Exports: 480×600 pixels, one AVIF + one WebP fallback per technique.
- AVIF: 1–65 KB each; WebP: 1–85 KB each; combined image budget: 4 MB.
- Original PNG/JPEG source ZIP is never served by the site.
- Non-hero covers use lazy loading and async decoding. No WebGL viewer or heavy image animation.
- Images are decorative concept thumbnails, not authenticated medical demonstrations.
- `strain-counterstrain` requires shortening-position review before final approval.
- Historical or disputed methods should never show supposed tissue effects as established scientific fact.

## Command-line manual processor

With Python 3.12 available:

```sh
python -m pip install -r scripts/requirements-manual-visuals.txt
python scripts/optimize-manual-visuals.py --zip manual-therapy-masters.zip
node scripts/validate-manual-visuals.mjs
```

The result includes `public/images/manual-therapy/cards/<slug>.avif`, `<slug>.webp`,
and a private `.manual-visual-preview/manual-therapy-contact-sheet.jpg`.
Never commit the preview or the raw ZIP to the main application branch.

**Abort and rollback:** keep `MANUAL_THERAPY_VISUALS_LIVE` unset to revert immediately to the original Cloudinary art on the next build.
