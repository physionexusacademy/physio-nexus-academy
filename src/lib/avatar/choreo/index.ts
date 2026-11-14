import type { Choreo } from "./types.ts";
import { maitlandShoulderPosteriorGlide } from "./maitland-shoulder-posterior-glide.ts";

/** Every technique Dr. Sajjad can demonstrate. Add a file for the next technique and list it here, then `npm run build:avatar-data`. */
export const CHOREOS: Choreo[] = [maitlandShoulderPosteriorGlide];
export const choreoBySlug = new Map(CHOREOS.map((c) => [c.slug, c]));
export type { Choreo } from "./types.ts";
