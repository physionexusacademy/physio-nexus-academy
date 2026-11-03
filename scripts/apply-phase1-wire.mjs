#!/usr/bin/env node
/**
 * Assembles ClinicalRegistrySecureClient.tsx from Phase 1 wire parts.
 * Run from repo root: node scripts/apply-phase1-wire.mjs
 *
 * This exists only because the full ~97KB client exceeds some editor/API
 * payload limits. Parts are committed under src/app/clinical-registry/.wire/
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wireDir = join(root, "src/app/clinical-registry/.wire");
const target = join(root, "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx");

const parts = [0, 1, 2, 3].map((i) => {
  const p = join(wireDir, `part${i}.txt`);
  if (!existsSync(p)) throw new Error(`Missing ${p}`);
  return readFileSync(p, "utf8");
});

const assembled = parts.join("");
if (!assembled.includes("ClinicalDocumentationForms")) {
  throw new Error("Assembled client does not include ClinicalDocumentationForms — aborting");
}
if (assembled.includes("assessmentJson")) {
  throw new Error("Assembled client still has assessmentJson — aborting");
}

writeFileSync(target, assembled, "utf8");
console.log("Wrote", target, "(", assembled.length, "chars)");
console.log("Phase 1 wire-up applied. Review diff, then commit.");
