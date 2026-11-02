/**
 * Concept-first teaching guide for one manual therapy chapter.
 * Written so a reader can understand and apply the idea without any other book or dictionary.
 */
export type MasteryGuide = {
  slug: string;
  /** One plain sentence, also shown on the library card. */
  oneLine: string;
  /** Plain-language definition: what it is and what it is for. */
  whatItIs: string;
  /** A real-life comparison that makes the idea stick. */
  analogy: string;
  /** The 3 ideas that explain how and why the technique is used. */
  coreIdeas: string[];
  /** Every technical word the chapter relies on, defined simply. */
  terms: { term: string; meaning: string }[];
  whenToUse: string[];
  whenNot: string[];
  /** How you actually do it, in order, with the reasoning for each step. */
  steps: { title: string; detail: string }[];
  /** Typical teaching ranges. Always adjusted to the patient's response. */
  dose: string;
  /** One realistic patient followed from first assessment to reassessment. */
  example: { patient: string; assessment: string; treatment: string; reassess: string };
  mistakes: string[];
  selfTest: { q: string; a: string }[];
  /** One line to remember. */
  recap: string;
  /** Honest summary of what research does and does not support. */
  evidence: string;
};
