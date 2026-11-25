/**
 * Works out how closely the posture screen agrees with the reference measurements, from the CSV the page exports in researcher mode.
 *   node --experimental-strip-types scripts/analyse-posture-validation.ts study.csv
 * Prints, for each metric, the number of pairs, the bias, the 95 percent limits of agreement, the mean absolute error and the correlation.
 */
import fs from "node:fs";
import { analyse, readStudy } from "../src/lib/posture/validation-csv.ts";

const file = process.argv[2];
if (!file) { console.error("usage: analyse-posture-validation.ts study.csv"); process.exit(1); }
const rows = readStudy(fs.readFileSync(file, "utf8"));
const out = analyse(rows);
const f = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "n/a");
console.log("| metric | pairs | bias | lower limit | upper limit | mean abs error | r |\n|---|---|---|---|---|---|---|");
for (const m of out) console.log(m.agreement ? `| ${m.metric} | ${m.pairs} | ${f(m.agreement.bias)} | ${f(m.agreement.lower)} | ${f(m.agreement.upper)} | ${f(m.agreement.mae)} | ${f(m.agreement.r)} |` : `| ${m.metric} | ${m.pairs} | ${m.note} | | | | |`);
