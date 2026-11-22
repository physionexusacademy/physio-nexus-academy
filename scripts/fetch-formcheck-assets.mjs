/**
 * The Form Check's browser runtime files, hosted with the site as static files (never in the Cloudflare worker, never in git):
 *   public/formcheck/wasm/*    copied from the pinned @mediapipe/tasks-vision package in node_modules
 *   public/formcheck/models/*  downloaded once from the official model storage
 * Every file is checked against the SHA-256 in src/lib/formcheck/assets.lock.json, so the files a participant's phone runs are exactly the files frozen for the study
 * (the same hashes are stored with every trial). A file that does not match is refused, not used.
 *
 *   node scripts/fetch-formcheck-assets.mjs            fetch what is missing, verify everything
 *   node scripts/fetch-formcheck-assets.mjs --check    verify only (fails when anything is missing or different)
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lock = JSON.parse(fs.readFileSync(path.join(root, "src/lib/formcheck/assets.lock.json"), "utf8"));
const out = path.join(root, "public/formcheck");
const checkOnly = process.argv.includes("--check");
const sha = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const problems = [];

fs.mkdirSync(path.join(out, "wasm"), { recursive: true });
fs.mkdirSync(path.join(out, "models"), { recursive: true });

const pkg = path.join(root, "node_modules/@mediapipe/tasks-vision");
const installed = fs.existsSync(path.join(pkg, "package.json")) ? JSON.parse(fs.readFileSync(path.join(pkg, "package.json"), "utf8")).version : null;
if (installed !== lock.library.version) problems.push(`@mediapipe/tasks-vision ${installed ?? "is not installed"}, the lock says ${lock.library.version}`);

for (const [name, hash] of Object.entries(lock.wasm)) {
  const target = path.join(out, "wasm", name);
  const source = path.join(pkg, "wasm", name);
  if (!checkOnly && fs.existsSync(source) && (!fs.existsSync(target) || sha(target) !== hash)) fs.copyFileSync(source, target);
  if (!fs.existsSync(target)) problems.push(`missing public/formcheck/wasm/${name}`);
  else if (sha(target) !== hash) problems.push(`public/formcheck/wasm/${name} does not match the locked hash`);
}

for (const [name, info] of Object.entries(lock.models)) {
  const target = path.join(out, "models", name);
  if (!checkOnly && (!fs.existsSync(target) || sha(target) !== info.sha256)) {
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const response = await fetch(info.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (createHash("sha256").update(bytes).digest("hex") !== info.sha256) throw new Error("the downloaded file does not match the locked hash");
        fs.writeFileSync(target, bytes);
        ok = true;
      } catch (error) {
        if (attempt === 3) problems.push(`could not fetch ${name}: ${error.message}`);
        else await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }
  if (fs.existsSync(target) && sha(target) !== info.sha256) { problems.push(`public/formcheck/models/${name} does not match the locked hash`); fs.rmSync(target); }
  else if (!fs.existsSync(target) && !problems.some((p) => p.includes(name))) problems.push(`missing public/formcheck/models/${name}`);
}

if (problems.length) {
  console.error("Form Check files: " + problems.join("; "));
  process.exit(1);
}
console.log(`Form Check files verified: ${Object.keys(lock.wasm).length} wasm/js files and ${Object.keys(lock.models).length} models match the locked hashes (library ${lock.library.version}).`);
