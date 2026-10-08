# Manual Therapy AVIF covers — pending binary upload

Nine approved, distinct editorial thumbnail assets are prepared for these routes.
Copy the contents of `PNA_Manual_Therapy_9_AVIF.zip` (the `*.avif` files only) to this directory, preserving names:

- maitland-joint-mobilization.avif
- kaltenborn-evjenth-mobilization.avif
- mulligan-snags-nags.avif
- paivm-ppivm-spinal-assessment.avif
- mckenzie-mdt.avif
- paris-approach.avif
- myofascial-release.avif
- neurodynamic-mobilization.avif
- muscle-energy-technique.avif

Optimized dimensions: 400 × 500 px. Each AVIF is between 8.8 and 13.9 KiB;
combined total is approximately 107 KiB. The originals were each ~2 MiB PNG,
so this is significantly smaller. The images are intended as decorative card
covers; they do **not** constitute medically verified step-by-step instructions.

**Do not deploy until all files exist** and this command succeeds:

```sh
node --experimental-strip-types scripts/validate-manual-avif.mjs
```

The site keeps its existing cover imagery in production until this draft feature
is ready. The Strain Counterstrain cover is intentionally NOT replaced.
