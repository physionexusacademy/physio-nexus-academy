import { existsSync, readFileSync, statSync } from "node:fs";
import { approvedManualAvifCards } from "../src/lib/manual-therapy-avif-cards.ts";

const expected = [
  "maitland-joint-mobilization",
  "kaltenborn-evjenth-mobilization",
  "mulligan-snags-nags",
  "paivm-ppivm-spinal-assessment",
  "mckenzie-mdt",
  "paris-approach",
  "myofascial-release",
  "neurodynamic-mobilization",
  "muscle-energy-technique",
];
const keys = Object.keys(approvedManualAvifCards);
if (keys.length !== 9 || expected.some((slug) => !keys.includes(slug)) ||
  keys.includes("strain-counterstrain")) {
  throw new Error("AVIF mapping must contain exactly nine approved approaches, excluding SCS");
}
let total = 0;
for (const slug of expected) {
  const uri = approvedManualAvifCards[slug];
  const path = "public" + uri;
  if (!existsSync(path)) {
    throw new Error("Required AVIF asset missing from repository: " + path);
  }
  const bytes = statSync(path).size;
  if (bytes < 1000 || bytes > 45000) throw new Error(path + ": inappropriate AVIF size " + bytes);
  const buf = readFileSync(path);
  if (buf.toString("latin1", 4, 12) !== "ftypavif") {
    throw new Error(path + ": not a valid AVIF image header");
  }
  total += bytes;
}
if (total > 250000) throw new Error("Technique image pack exceeds performance budget");
console.log("Nine technique-matched AVIF assets verified, combined bytes: " + total);
