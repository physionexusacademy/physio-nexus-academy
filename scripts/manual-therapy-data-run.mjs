// Shared by build-manual-therapy-data.mjs and validate-manual-therapy-data.mjs: bundles src/lib/manual-therapy-chapter-build.ts with esbuild
// (the data modules import each other with the "@/" alias, which plain Node cannot resolve) and loads it.
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export async function loadChapterBuilder(root = process.cwd()) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-manual-therapy-"));
  const outfile = path.join(dir, "chapter-build.mjs");
  await build({
    entryPoints: [path.join(root, "src/lib/manual-therapy-chapter-build.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    alias: { "@": path.join(root, "src") },
    loader: { ".json": "json" },
    logLevel: "error",
  });
  const mod = await import(pathToFileURL(outfile).href);
  fs.rmSync(dir, { recursive: true, force: true });
  return mod;
}
