import type { Arm, SequenceRow } from "./types.ts";

/**
 * Allocation lists: stratified permuted blocks with random block sizes. The lists made here are a PLACEHOLDER for testing and small pilots: in the real trial an
 * independent person (for example a statistician) prepares the list and the owner imports it, so the people who enrol participants cannot know what comes next.
 */

/** A small seeded random generator (mulberry32 over an xmur3 hash of the seed text). Deterministic so a list can be reproduced from its seed. */
export function makeRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export type GenerateOptions = { seed: string; strata: string[]; perStratum: number; blockSizes?: number[] };

/** 1:1 permuted blocks. Each block holds the same number of each arm, so the groups can never differ by more than half the largest block. */
export function generateSequence({ seed, strata, perStratum, blockSizes = [4, 6] }: GenerateOptions): SequenceRow[] {
  if (!seed.trim()) throw new Error("A seed is required");
  if (!strata.length) throw new Error("At least one group is required");
  if (!Number.isInteger(perStratum) || perStratum < 4 || perStratum > 2000) throw new Error("Rows per group must be between 4 and 2000");
  if (!blockSizes.length || blockSizes.some((b) => !Number.isInteger(b) || b < 2 || b % 2 !== 0)) throw new Error("Block sizes must be even numbers of at least 2");
  const out: SequenceRow[] = [];
  for (const stratum of strata) {
    const rng = makeRng(`${seed}|${stratum}`); // a separate stream per group
    let position = 0;
    while (position < perStratum) {
      const size = blockSizes[Math.floor(rng() * blockSizes.length)];
      const block: Arm[] = shuffle([...Array<Arm>(size / 2).fill("ai"), ...Array<Arm>(size / 2).fill("no_ai")], rng);
      for (const arm of block) { position += 1; out.push({ stratum, position, arm }); }
    }
  }
  return out;
}

export type ParsedList = { rows: SequenceRow[]; problems: string[]; warnings: string[] };

/** Reads a list prepared elsewhere: CSV (stratum,position,arm) with a header row. Arms are "ai" and "no_ai" (also accepts A/B only through an explicit map). */
export function parseSequenceCsv(text: string, strata: string[], armMap?: Record<string, Arm>): ParsedList {
  const problems: string[] = [];
  const warnings: string[] = [];
  const rows: SequenceRow[] = [];
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { rows, problems: ["The file has no rows."], warnings };
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const col = { stratum: header.indexOf("stratum"), position: header.indexOf("position"), arm: header.indexOf("arm") };
  if (col.stratum < 0 || col.position < 0 || col.arm < 0) return { rows, problems: ["The first line must name the columns: stratum, position, arm."], warnings };
  const seen = new Set<string>();
  lines.slice(1).forEach((line, i) => {
    const cells = line.split(",").map((c) => c.trim());
    const stratum = cells[col.stratum];
    const position = Number(cells[col.position]);
    const rawArm = (cells[col.arm] ?? "").toLowerCase();
    const arm = (armMap ? armMap[cells[col.arm] ?? ""] : undefined) ?? (rawArm === "ai" || rawArm === "no_ai" ? (rawArm as Arm) : undefined);
    const where = `Line ${i + 2}`;
    if (!strata.includes(stratum)) return void problems.push(`${where}: group "${stratum}" is not one of ${strata.join(", ")}.`);
    if (!Number.isInteger(position) || position < 1) return void problems.push(`${where}: position must be a whole number from 1.`);
    if (!arm) return void problems.push(`${where}: arm "${cells[col.arm]}" is not "ai" or "no_ai".`);
    const key = `${stratum}#${position}`;
    if (seen.has(key)) return void problems.push(`${where}: position ${position} is repeated in group ${stratum}.`);
    seen.add(key);
    rows.push({ stratum, position, arm });
  });
  if (problems.length) return { rows: [], problems: problems.slice(0, 12), warnings };
  for (const s of strata) {
    const mine = rows.filter((r) => r.stratum === s).sort((a, b) => a.position - b.position);
    if (!mine.length) { problems.push(`There are no rows for group ${s}.`); continue; }
    if (mine.some((r, i) => r.position !== i + 1)) problems.push(`Positions in group ${s} must run 1, 2, 3 ... with no gap.`);
    const diff = Math.abs(mine.filter((r) => r.arm === "ai").length - mine.filter((r) => r.arm === "no_ai").length);
    if (diff > 3) warnings.push(`Group ${s} is not balanced overall (the arms differ by ${diff}). Permuted blocks should keep the difference small.`);
  }
  return { rows: problems.length ? [] : rows.sort((a, b) => (a.stratum < b.stratum ? -1 : a.stratum > b.stratum ? 1 : a.position - b.position)), problems, warnings };
}

export function sequenceToCsv(rows: SequenceRow[]): string {
  return ["stratum,position,arm", ...rows.map((r) => `${r.stratum},${r.position},${r.arm}`)].join("\n");
}

/** The largest gap between the two arms at any point of a list (a permuted-block list never exceeds half its largest block). */
export function maxImbalance(rows: SequenceRow[]): number {
  let worst = 0;
  for (const s of new Set(rows.map((r) => r.stratum))) {
    let d = 0;
    for (const r of rows.filter((x) => x.stratum === s).sort((a, b) => a.position - b.position)) {
      d += r.arm === "ai" ? 1 : -1;
      worst = Math.max(worst, Math.abs(d));
    }
  }
  return worst;
}
