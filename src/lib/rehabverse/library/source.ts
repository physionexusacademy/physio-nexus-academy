/**
 * The exercise library as authored (TypeScript, reviewed by the physiotherapist). Used only by the
 * build script and the validator — never imported by pages, so none of this text ships in the
 * Cloudflare worker. Pages read the generated JSON in public/rehabverse-data/ at runtime.
 */
import type { ExerciseDef, Region } from "../types.ts";
import { cervicalExercises } from "./cervical.ts";
import { thoracicExercises } from "./thoracic.ts";
import { lumbarExercises } from "./lumbar.ts";
import { shoulderExercises } from "./shoulder.ts";
import { elbowHandExercises } from "./elbow-hand.ts";
import { hipExercises } from "./hip.ts";
import { kneeExercises } from "./knee.ts";
import { ankleFootExercises } from "./ankle-foot.ts";

export const SOURCE: Record<Region, ExerciseDef[]> = {
  cervical: cervicalExercises,
  thoracic: thoracicExercises,
  lumbar: lumbarExercises,
  shoulder: shoulderExercises,
  elbow_hand: elbowHandExercises,
  hip: hipExercises,
  knee: kneeExercises,
  ankle_foot: ankleFootExercises,
};

/** file path (relative to repo root) → file content */
export function serializeRehabverseData(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [region, list] of Object.entries(SOURCE)) files[`public/rehabverse-data/${region}.json`] = JSON.stringify(list);
  return files;
}
