import { readFile, writeFile, stat } from "node:fs/promises";
import sharp from "sharp";

async function optimizePng(path) {
  const original = await readFile(path);
  const before = await sharp(original).metadata();
  const optimized = await sharp(original)
    .png({ compressionLevel: 9, palette: true, quality: 100, effort: 10 })
    .toBuffer();

  if (optimized.length < original.length) await writeFile(path, optimized);
  const finalBytes = (await stat(path)).size;
  const finalMeta = await sharp(path).metadata();
  console.log(JSON.stringify({
    path,
    beforeBytes: original.length,
    afterBytes: finalBytes,
    savedBytes: original.length - finalBytes,
    dimensions: `${finalMeta.width}x${finalMeta.height}`,
    format: finalMeta.format,
    transparencyPreserved: finalMeta.hasAlpha ?? false,
    changed: finalBytes < original.length
  }));
}

async function optimizeJpeg(path) {
  const original = await readFile(path);
  const before = await sharp(original).metadata();
  const optimized = await sharp(original)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
    .toBuffer();

  if (optimized.length < original.length) await writeFile(path, optimized);
  const finalBytes = (await stat(path)).size;
  const finalMeta = await sharp(path).metadata();
  console.log(JSON.stringify({
    path,
    beforeBytes: original.length,
    afterBytes: finalBytes,
    savedBytes: original.length - finalBytes,
    originalDimensions: `${before.width}x${before.height}`,
    dimensions: `${finalMeta.width}x${finalMeta.height}`,
    format: finalMeta.format,
    changed: finalBytes < original.length
  }));
}

await optimizePng("public/images/pna-logo.png");
await optimizeJpeg("public/images/founder-dr-sajjad.jpg");
