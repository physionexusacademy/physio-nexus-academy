import type { Choreo } from "./types.ts";
import { maitlandShoulderPosteriorGlide } from "./maitland-shoulder-posterior-glide.ts";

/** Every technique Dr. Sajjad can demonstrate. Add a file for the next technique and list it here, then `npm run build:avatar-data`. */
export const CHOREOS: Choreo[] = [maitlandShoulderPosteriorGlide];
export const choreoBySlug = new Map(CHOREOS.map((c) => [c.slug, c]));
export type { Choreo } from "./types.ts";

/**
 * The "demo" beat the lesson generator adds right after a technique's "steps" beat when Dr. Sajjad can demonstrate it. The key
 * "avatar/<slug>" is played by components/avatar/AvatarStage.tsx. This is interface wording, not clinical content.
 */
export function avatarDemoBeat(lessonSlug: string) {
  const choreo = CHOREOS.find((c) => c.lessonSlug === lessonSlug);
  if (!choreo) return null;
  return {
    type: "demo" as const,
    demo: `avatar/${choreo.slug}`,
    title: choreo.title.en,
    intro: {
      en: "Now watch it on a 3D patient. The AI teaching assistant based on Dr. Sajjad Raza PT walks through these steps and places his hands for you.",
      ur: "Ab 3D patient par dekhiye. AI teaching assistant (Dr. Sajjad Raza PT par based) in steps ko ek ek karke dikhata hai aur apne haath patient par rakhta hai.",
    },
  };
}
