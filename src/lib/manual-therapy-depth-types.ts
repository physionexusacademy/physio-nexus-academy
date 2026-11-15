/**
 * Expert depth for each manual therapy technique: the reasoning an experienced clinician carries in their head, written for any reader (no levels).
 * `demo` picks the 2D animated demonstration (components/manual-therapy/TechniqueDemo2D). Parameters are the commonly taught ranges, not a
 * prescription: the clinician always adjusts them to the patient's irritability, and a supervisor signs off the protocol.
 */
export type DemoKind = "glide" | "contract" | "fascia" | "friction" | "neural" | "fluid" | "thrust" | "position" | "response" | "appraise";

export type TechniqueDepth = {
  demo: DemoKind;
  /** The mechanism in expert terms: tissue, nervous system and what is and is not proven. */
  why: string;
  /** Decision rules: choose this technique when…, prefer another when…. */
  choose: string[];
  /** The dose as commonly taught: label and value. */
  parameters: [string, string][];
  /** How to regress and progress it. */
  progress: string;
  /** What to measure before and after, so the effect is tested and not assumed. */
  measure: string[];
  /** A calibrated statement of the evidence, including what is uncertain. */
  evidence: string;
  /** Errors that experienced clinicians still make. */
  pitfalls: string[];
  /** Screening: when to stop and refer. */
  screen: string[];
};

export const DEPTH_NOTE =
  "Educational reference built from commonly taught clinical parameters and published reviews. Doses are ranges, not prescriptions: adjust to irritability, and have your supervisor approve the protocol.";
