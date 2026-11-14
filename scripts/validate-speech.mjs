// Bundles scripts/speech-checks.ts and runs it (voice choice with a mocked synthesiser, Roman Urdu preparation).
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pna-speech-"));
const outfile = path.join(dir, "checks.mjs");
await build({ entryPoints: ["scripts/speech-checks.ts"], bundle: true, format: "esm", platform: "node", outfile, logLevel: "error", target: "node22" });
try {
  await import(pathToFileURL(outfile).href);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
