// Shared by build-avatar-data.mjs and validate-avatar.mjs: bundles scripts/avatar-data.ts with esbuild and loads it.
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export async function loadAvatarData(root = process.cwd()) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-avatar-"));
  const outfile = path.join(dir, "avatar-data.mjs");
  await build({
    entryPoints: [path.join(root, "scripts/avatar-data.ts")],
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
