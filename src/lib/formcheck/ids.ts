/**
 * The exercises that have a camera specification, as a plain list so a page can decide whether to offer the camera check without loading the specs themselves
 * (the specs, the engine and the pose model are loaded only when a patient opens the check). scripts/validate-formcheck-specs.ts keeps this list equal to the specs.
 */
export const FORMCHECK_EXERCISE_IDS: readonly string[] = [
  "chin-tuck", "neck-rotation", "neck-side-bend", "upper-trapezius-stretch", "supine-nod", "chin-tuck-head-lift", "shoulder-blade-squeeze", "levator-scapulae-stretch", "scalene-stretch",
  "knee-to-chest", "knee-rock", "glute-bridge", "single-leg-bridge", "dead-bug", "bird-dog", "front-plank", "supine-marching", "mcgill-curl-up", "bridge-with-ball",
  "standing-side-bend", "prone-on-elbows", "open-book", "seated-thoracic-rotation", "thoracic-extension-chair", "cat-camel", "quadruped-thoracic-rotation", "prone-thoracic-extension",
];
export const hasFormCheck = (exerciseId: string) => FORMCHECK_EXERCISE_IDS.includes(exerciseId);
