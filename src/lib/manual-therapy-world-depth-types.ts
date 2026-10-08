/** Additional long-form clinical education for the 13 worldwide approaches.
 * Educational, fictional cases; neither unsupervised training nor efficacy guarantees.
 */
export type WorldDeepChapter = {
  opening: string;
  principles: { title: string; body: string }[];
  assessment: { title: string; body: string }[];
  application: { title: string; body: string }[];
  caseStudy: { scene: string; findings: string; decision: string; twist: string; finish: string };
  dose: string;
  caution: string;
  evidence: { known: string; unknown: string; communication: string };
  memoryHook: string;
  checks: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
};
