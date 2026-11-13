/**
 * The RehabVerse exercise library, split by region. The content is authored in TypeScript
 * (library/*.ts, see source.ts) and published as static JSON (public/rehabverse-data/<region>.json)
 * that the browser fetches when it needs it, so it never adds to the server bundle.
 * Exercises that serve two regions live in their main region's file and list both in `regions`.
 */
import type { ExerciseDef, Region } from "../types.ts";
import { REGIONS } from "../types.ts";

const regionCache = new Map<Region, Promise<ExerciseDef[]>>();

export function loadRegion(region: Region): Promise<ExerciseDef[]> {
  let pending = regionCache.get(region);
  if (!pending) {
    pending = fetch(`/rehabverse-data/${region}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`exercise data ${region}: ${response.status}`);
        return response.json() as Promise<ExerciseDef[]>;
      })
      .catch((error) => {
        regionCache.delete(region); // allow a retry
        throw error;
      });
    regionCache.set(region, pending);
  }
  return pending;
}

let everything: Promise<ExerciseDef[]> | null = null;
/** Every exercise (loads all region files once). */
export function loadAllExercises(): Promise<ExerciseDef[]> {
  everything ??= Promise.all(REGIONS.map((r) => loadRegion(r)))
    .then((lists) => {
      const seen = new Map<string, ExerciseDef>();
      for (const list of lists) for (const exercise of list) seen.set(exercise.id, exercise);
      return [...seen.values()];
    })
    .catch((error) => {
      everything = null;
      throw error;
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
