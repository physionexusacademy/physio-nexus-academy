#!/usr/bin/env node
/**
 * Applies Phase 1 structured-forms wire-up to ClinicalRegistrySecureClient.tsx
 *
 *   node scripts/apply-phase1-wire.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchFile = join(root, "scripts/phase1-wire.patch");
const target = join(root, "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx");

if (!existsSync(patchFile)) throw new Error("Missing " + patchFile);
if (!existsSync(target)) throw new Error("Missing " + target);

const before = readFileSync(target, "utf8");
if (before.includes("ClinicalDocumentationForms")) {
  console.log("Already wired. Nothing to do.");
  process.exit(0);
}

try {
  execSync("git apply --verbose \"" + patchFile + "\"", { cwd: root, stdio: "inherit" });
} catch (e1) {
  try {
    execSync("patch -p1 < \"" + patchFile + "\"", { cwd: root, stdio: "inherit", shell: true });
  } catch (e2) {
    console.error("Failed to apply patch with git apply and patch.");
    process.exit(1);
  }
}

const after = readFileSync(target, "utf8");
if (!after.includes("ClinicalDocumentationForms")) {
  throw new Error("Patch applied but ClinicalDocumentationForms not found");
}
if (after.includes("assessmentJson")) {
  throw new Error("Patch applied but assessmentJson still present");
}
console.log("Phase 1 wire-up applied successfully.");
