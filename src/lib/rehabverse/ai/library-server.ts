import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { REGIONS, type Bi, type ExerciseDef } from "../types.ts";
import type { CoachDef } from "./coach-spec.ts";

/**
 * The exercise library on the server, for the coach. The library is published as static files (public/rehabverse-data/<region>.json) and is
 * deliberately NOT bundled into the worker (it would cost hundreds of KiB), so it is read from the static assets when needed: through the ASSETS
 * binding on Cloudflare, or from the site itself in local development. Only the patient-facing fields are kept in memory (not the 3D motion data).
 */
type Assets = { fetch: (request: Request) => Promise<Response> };
let cache: Promise<{ defs: Map<string, CoachDef>; catalogue: Bi[] }> | null = null;

async function fetchRegion(region: string): Promise<ExerciseDef[]> {
  const path = `/rehabverse-data/${region}.json`;
  try {
    const assets = (getCloudflareContext() as unknown as { env?: { ASSETS?: Assets } }).env?.ASSETS;
    if (assets) {
      const response = await assets.fetch(new Request(`https://assets.invalid${path}`));
      if (response.ok) return (await response.json()) as ExerciseDef[];
    }
  } catch {
    /* not on Cloudflare: fall through to the site itself */
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${origin}${path}`);
  if (!response.ok) throw new Error(`exercise data ${region}: ${response.status}`);
  return (await response.json()) as ExerciseDef[];
}

const slim = (e: ExerciseDef): CoachDef => ({ id: e.id, name: e.name, summary: e.summary, targets: e.targets, equipment: e.equipment, setup: e.setup, steps: e.steps, breathing: e.breathing, mistakes: e.mistakes, safety: e.safety, dosage: e.dosage });

export function coachLibrary(): Promise<{ defs: Map<string, CoachDef>; catalogue: Bi[] }> {
  cache ??= Promise.all(REGIONS.map(fetchRegion))
    .then((lists) => {
      const defs = new Map<string, CoachDef>();
      for (const list of lists) for (const exercise of list) defs.set(exercise.id, slim(exercise));
      return { defs, catalogue: [...defs.values()].map((d) => d.name) };
    })
    .catch((error) => {
      cache = null; // allow a retry on the next request
      throw error;
    });
  return cache;
}
