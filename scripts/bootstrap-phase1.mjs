#!/usr/bin/env node
/**
 * Rebuilds complete Phase 1 apply script from 19 base64 parts, then runs it.
 *   node scripts/bootstrap-phase1.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const parts = [];
for (let i = 0; i < 19; i++) {
  const p = join(root, `scripts/phase1-s${i}.b64`);
  if (!existsSync(p)) {
    console.error("Missing required file:", p);
    process.exit(1);
  }
  parts.push(readFileSync(p, "utf8").trim());
}
const script = Buffer.from(parts.join(""), "base64").toString("utf8");
const out = join(root, "scripts/apply-phase1-wire-complete.mjs");
writeFileSync(out, script);
console.log("Wrote", out, "(" + script.length + " chars)");
execSync("node \"" + out + "\"", { cwd: root, stdio: "inherit" });
