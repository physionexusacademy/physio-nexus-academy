/**
 * What a patient wants to know about an exercise at a glance, read from the exercise's own data (no new fields to keep in step):
 * the position it is done in, about how long it takes, whether it needs anything beyond home furniture, and what it is for.
 */
import type { Bi, ExerciseDef } from "./types";

export type Position = "lying" | "sitting" | "standing" | "kneeling";

export const POSITION_LABEL: Record<Position, Bi> = {
  lying: { en: "Lying down", ru: "Let kar" },
  sitting: { en: "Sitting", ru: "Baith kar" },
  standing: { en: "Standing", ru: "Khare ho kar" },
  kneeling: { en: "On hands and knees", ru: "Haathon aur ghutnon par" },
};

export function positionOf(e: ExerciseDef): Position {
  const s = e.setup.en.toLowerCase();
  if (/kneel|hands and knees|all fours/.test(s)) return "kneeling";
  if (/\blie\b|lying|on your back|on your front|on your side/.test(s)) return "lying";
  if (/\bsit|seated|chair|forearm on a table|table, palm/.test(s)) return "sitting";
  return "standing";
}

/** About how many minutes one session takes (a repetition ≈ 3 s plus its hold; the rests between sets). */
export function minutesOf(e: ExerciseDef): number {
  const d = e.dosage as { sets?: number; reps?: number; holdSeconds?: number; restSeconds?: number; side?: string } | undefined;
  if (!d) return 3;
  const sets = d.sets ?? 2, reps = d.reps ?? 10, hold = d.holdSeconds ?? 0, rest = d.restSeconds ?? 30;
  const sides = d.side === "each" ? 2 : 1;
  const seconds = sets * reps * (3 + hold) * sides + Math.max(0, sets - 1) * rest;
  return Math.max(2, Math.round(seconds / 60));
}

/** Needs something beyond what every home has (a band, a weight, a ball, a step, a strap, a foam roller). */
export function needsKit(e: ExerciseDef): boolean {
  const q = String(e.equipment ?? "").toLowerCase();
  if (!q || q === "none") return false;
  return /band|dumbbell|weight|ball|step|strap|roller|theraband|kettlebell|cuff|bottle/.test(q);
}

/** Who the exercise is for, read from its indications and summary. */
export const GOALS: { id: string; label: Bi; re: RegExp }[] = [
  { id: "surgery", label: { en: "After surgery", ru: "Surgery ke baad" }, re: /surgery|surgical|operation|replacement|reconstruction|post-?op|arthroplasty|repair/i },
  { id: "arthritis", label: { en: "Arthritis and stiffness", ru: "Arthritis aur akdan" }, re: /arthritis|osteoarthritis|stiff|frozen|capsulitis/i },
  { id: "sport", label: { en: "Sports and strains", ru: "Khel aur moch" }, re: /sprain|strain|tendin|athlet|sport|return to (play|run)/i },
  { id: "nerve", label: { en: "Nerve pain", ru: "Nas ka dard" }, re: /sciatica|radicul|nerve|neural|tunnel/i },
  { id: "posture", label: { en: "Desk work and posture", ru: "Desk ka kaam aur posture" }, re: /posture|desk|sitting|computer|forward head|screen/i },
  { id: "balance", label: { en: "Balance and falls", ru: "Balance aur girna" }, re: /balance|fall|stability|proprioce|unsteady|older adult/i },
  { id: "breathing", label: { en: "Breathing", ru: "Saans" }, re: /breathless|COPD|asthma|pulmonary|chest expansion|breathing pattern/i },
  { id: "pelvic", label: { en: "Pelvic floor and bladder", ru: "Pelvic floor aur peshab ka control" }, re: /pelvic floor|incontinence|bladder|postnatal|childbirth|prostate/i },
  { id: "neuro", label: { en: "Stroke and Parkinson's", ru: "Falij (stroke) aur Parkinson's" }, re: /stroke|parkinson|neurolog|multiple sclerosis/i },
];

export function goalsOf(e: ExerciseDef): string[] {
  const text = `${(e.indications ?? []).join(" ")} ${e.summary.en} ${e.targets}`;
  return GOALS.filter((g) => g.re.test(text)).map((g) => g.id);
}
