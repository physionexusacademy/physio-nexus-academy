import { DEPTH_A } from "./manual-therapy-depth-a.ts";
import { DEPTH_B } from "./manual-therapy-depth-b.ts";
import type { TechniqueDepth } from "./manual-therapy-depth-types.ts";

export { DEPTH_NOTE, type DemoKind, type TechniqueDepth } from "./manual-therapy-depth-types.ts";

const DEPTH: Record<string, TechniqueDepth> = { ...DEPTH_A, ...DEPTH_B };

/** The expert-depth block of one technique, or undefined for a slug without one (the world approaches have their own chapters). */
export const getTechniqueDepth = (slug: string): TechniqueDepth | undefined => DEPTH[slug];
export const techniqueDepthSlugs = () => Object.keys(DEPTH);
