#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const a = readFileSync(join(root, "scripts/phase1-complete.a.b64"), "utf8").trim();
const b = readFileSync(join(root, "scripts/phase1-complete.b.b64"), "utf8").trim();
const script = Buffer.from(a + b, "base64").toString("utf8");
const out = join(root, "scripts/apply-phase1-wire-complete.mjs");
writeFileSync(out, script);
console.log("Wrote", out);
execSync("node \"" + out + "\"", { cwd: root, stdio: "inherit" });
