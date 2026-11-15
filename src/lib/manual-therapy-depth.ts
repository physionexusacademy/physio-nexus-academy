import { DEPTH_A } from "./manual-therapy-depth-a.ts";
import { DEPTH_B } from "./manual-therapy-depth-b.ts";
import { DEPTH_W } from "./manual-therapy-depth-world.ts";
import type { TechniqueDepth } from "./manual-therapy-depth-types.ts";

export { DEPTH_NOTE, type DemoKind, type TechniqueDepth } from "./manual-therapy-depth-types.ts";

const DEPTH: Record<string, TechniqueDepth> = { ...DEPTH_A, ...DEPTH_B, ...DEPTH_W };

/** The expert-depth block of one technique, or undefined for a slug without one. */
export const getTechniqueDepth = (slug: string): TechniqueDepth | undefined => DEPTH[slug];
export const techniqueDepthSlugs = () => Object.keys(DEPTH);
