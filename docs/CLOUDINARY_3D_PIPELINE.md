# PNA Cloudinary 3D Anatomy Pipeline

## Purpose
Deliver approved 3D clinical anatomy visuals directly from Cloudinary without storing image bytes in Supabase or serving them through the PNA application.

## Current flow
1. Generate or approve a clinical anatomy image.
2. Import the image into the PNA OpenArt project when a public transfer URL is needed.
3. Add the image URL to `automation/cloudinary-upload-batch.json`.
4. GitHub Actions runs `.github/workflows/cloudinary-direct-upload.yml`.
5. Cloudinary returns a public ID and secure CDN URL.
6. `automation/cloudinary-upload-results.json` stores the upload result.
7. Approved public IDs are mapped in `src/lib/manual-therapy-3d-assets.ts`.
8. Regional manual-therapy cards load the image only after the user opens the 3D anatomy panel.

## Performance rules
- Cloudinary serves the image bytes directly to the visitor.
- Supabase is not used for 3D image storage or delivery.
- The main page remains lightweight because the 3D image is requested on demand.
- Responsive Cloudinary transformations provide 480 / 720 / 900 / 1200 px delivery sizes.
- The full-detail link requests up to 1800 px.
- Cards without an approved image do not request a missing Cloudinary asset.

## Approved assets
### Batch 1
- Masseter
- Temporalis
- Suboccipital
- TMJ
- Thoracic paraspinals
- Intercostal / rib-angle
- Quadratus lumborum
- Glenohumeral posterior glide

### Batch 2
- Glenohumeral inferior glide
- Glenohumeral anterior glide
- Patellar tendon
- Posterior talar glide

## Publishing rule
Only map an asset in `READY_3D_ASSETS` after the Cloudinary upload result reports `status: success`.

## Quality standard
- Clinically plausible anatomy and proportions
- Clean white or light neutral background
- Minimal, accurate labels
- No invented structures
- No unnecessary treatment arrows on anatomy-only assets
- Clear target emphasis without hiding important landmarks
- No exaggerated pathology
- Consistent PNA visual language
