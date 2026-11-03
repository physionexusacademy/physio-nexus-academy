#!/usr/bin/env node
/**
 * Phase 1 wire-up assembler for PNA Clinical Registry.
 * Decodes base64 parts and writes ClinicalRegistrySecureClient.tsx
 *
 *   node scripts/apply-phase1-wire.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wireDir = join(root, "src/app/clinical-registry/.wire");
const target = join(root, "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx");

const parts = [];
for (let i = 0; i < 8; i++) {
  const p = join(wireDir, `part${i}.b64`);
  if (!existsSync(p)) throw new Error("Missing " + p);
  parts.push(Buffer.from(readFileSync(p, "utf8").trim(), "base64").toString("utf8"));
}

const assembled = parts.join("");
if (!assembled.includes("ClinicalDocumentationForms")) {
  throw new Error("Assembled client missing ClinicalDocumentationForms — aborting");
}
if (assembled.includes("assessmentJson") || assembled.includes("followUpJson")) {
  throw new Error("Assembled client still has JSON assessment state — aborting");
}
if (!assembled.startsWith('"use client"')) {
  throw new Error("Assembled client does not start with use client — aborting");
}

writeFileSync(target, assembled, "utf8");
console.log("Wrote", target);
console.log("Size:", assembled.length, "chars,", assembled.split("\n").length, "lines");
console.log("Phase 1 structured forms are now wired. Review, test, then commit.");
