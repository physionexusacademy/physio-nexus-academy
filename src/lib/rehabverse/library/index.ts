/**
 * The RehabVerse exercise library, split by region so a page only downloads what it needs.
 * Exercises that serve two regions live in their main region's file and list both in `regions`.
 */
import type { ExerciseDef, Region } from "../types.ts";

const loaders: Record<Region, () => Promise<ExerciseDef[]>> = {
  cervical: () => import("./cervical.ts").then((m) => m.cervicalExercises),
  thoracic: () => import("./thoracic.ts").then((m) => m.thoracicExercises),
  lumbar: () => import("./lumbar.ts").then((m) => m.lumbarExercises),
  shoulder: () => import("./shoulder.ts").then((m) => m.shoulderExercises),
  elbow_hand: () => import("./elbow-hand.ts").then((m) => m.elbowHandExercises),
  hip: () => import("./hip.ts").then((m) => m.hipExercises),
  knee: () => import("./knee.ts").then((m) => m.kneeExercises),
  ankle_foot: () => import("./ankle-foot.ts").then((m) => m.ankleFootExercises),
};

export const loadRegion = (region: Region) => loaders[region]();

let everything: Promise<ExerciseDef[]> | null = null;
/** Every exercise (loads all region files once). */
export function loadAllExercises(): Promise<ExerciseDef[]> {
  everything ??= Promise.all((Object.keys(loaders) as Region[]).map((r) => loaders[r]())).then((lists) => {
    const seen = new Map<string, ExerciseDef>();
    for (const list of lists) for (const exercise of list) seen.set(exercise.id, exercise);
    return [...seen.values()];
  });
  return everything;
}

export async function loadExercise(id: string): Promise<ExerciseDef | null> {
  return (await loadAllExercises()).find((e) => e.id === id) ?? null;
}

export async function loadExercises(ids: string[]): Promise<Map<string, ExerciseDef>> {
  const all = await loadAllExercises();
  const wanted = new Set(ids);
  return new Map(all.filter((e) => wanted.has(e.id)).map((e) => [e.id, e]));
}
