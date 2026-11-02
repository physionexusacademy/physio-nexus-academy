# PNA Clinical Visuals — ImageKit Delivery Architecture

This setup is designed so clinical teaching images are delivered directly from ImageKit to the visitor's browser instead of being stored or served through Supabase or the PNA Cloudflare application.

## Traffic flow

PNA page HTML/code -> visitor browser -> ImageKit CDN -> optimized clinical image

The PNA app stores only the image path. It does not proxy the image bytes.

## Required public environment variable

Add this to the deployment environment:

```
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_imagekit_id>
```

This URL endpoint is public by design. Do not add ImageKit private API keys to client-side code.

## Recommended folder structure in ImageKit

```
pna/
  clinical-skills/
    manual-therapy/
      myofascial-release/
      iastm/
      neurodynamic-mobilization/
      maitland-joint-mobilization/
      ...
    kinesiology-taping/
    dry-needling/
    neurodynamics/
    therapeutic-exercise/
```

## Recommended master image policy

- Keep the master illustration high quality.
- Prefer clean white or light clinical backgrounds.
- Use a consistent PNA visual system for labels, arrows and anatomy.
- Upload one master; let ImageKit create delivery sizes through URL transformations.
- Do not upload duplicate 480 px / 768 px / 1024 px copies unless there is a special art-direction reason.

## Delivery behavior

The PNA `ClinicalImage` component:

- uses plain browser `<img>` delivery so image bytes come directly from ImageKit;
- uses responsive `srcset` widths;
- lazy-loads non-priority images;
- uses asynchronous image decoding;
- requests a larger detail view only when the user opens it.

Typical generated ImageKit URL:

```
https://ik.imagekit.io/<id>/tr:w-768,q-82/pna/clinical-skills/manual-therapy/myofascial-release/cross-hand-overview.webp
```

## Adding a visual to Manual Therapy

1. Upload the final image to ImageKit.
2. Copy its relative path.
3. Add one entry to `src/lib/manual-therapy-visuals.ts`.
4. Deploy.
5. The visual appears automatically on the corresponding technique page.

Never register an asset before it exists in ImageKit. This prevents broken image requests.

## Performance rules

- Technique-card thumbnails: target roughly 320–480 px delivery width.
- Main teaching illustrations: responsive 480 / 768 / 1024 / 1440 / 1800 px.
- Default quality target: 82.
- Detailed view quality target: 90.
- Keep below-the-fold images lazy-loaded.
- Only the most important above-the-fold hero visual should use eager loading.
- Avoid routing clinical images through Supabase Storage or the application server.

## Security

Delivery requires only the public ImageKit URL endpoint.

If authenticated uploads are added later, private keys must remain server-only and should never use a `NEXT_PUBLIC_` prefix.


## Deep Manual Therapy 3D Atlas

The deep regional manual-therapy cards support a second, realistic 3D anatomy layer.

### Performance behavior

- The normal structure-specific SVG map renders immediately and is tiny.
- The realistic 3D image is **not requested on initial page load**.
- The 3D image is requested directly from ImageKit only after the visitor taps **View realistic 3D anatomy**.
- Responsive ImageKit widths are requested at 480 / 720 / 900 / 1200 px.
- The full-detail link requests a 1800 px version.
- If the asset is missing, the page falls back to the lightweight SVG map.

### Feature flag

Keep this off until the first 3D assets are uploaded:

```
NEXT_PUBLIC_IMAGEKIT_3D_ENABLED=false
```

After uploading the first batch, set:

```
NEXT_PUBLIC_IMAGEKIT_3D_ENABLED=true
```

### Automatic asset path convention

No per-card code change is needed. Each deep technique automatically resolves to:

```
pna/clinical-skills/manual-therapy-3d/<technique-slug>/<region-slug>/<sub-technique-slug>.webp
```

Example:

```
pna/clinical-skills/manual-therapy-3d/maitland-joint-mobilization/shoulder/glenohumeral-posterior-glide.webp
```

Recommended first batch:

- TMJ / masseter / temporalis / suboccipital
- thoracic paraspinals / rib angle
- quadratus lumborum
- glenohumeral posterior / inferior / anterior glide
- patellar tendon
- posterior talar glide

The image should be a clean, copyright-safe PNA-created 3D anatomy render with the target structure clearly highlighted.
