/**
 * Procedure-specific teaching cues (not substitutes for supervised hands-on training).
 * A deliberate manual guide is authored for every test. No generic force template.
 */
export type MskTechniqueGuide = {
  name: string;
  therapist: string;
  hands: string;
  force: string;
  visualize: string;
  avoid: string;
};

export function techniqueGuide(
  name: string, therapist: string, hands: string, force: string, visualize: string, avoid: string
): MskTechniqueGuide {
  return { name, therapist, hands, force, visualize, avoid };
}
