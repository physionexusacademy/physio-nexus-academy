import type { KnowledgeArticle } from "@/lib/knowledge-content";
export const article: KnowledgeArticle = {
  slug: "confidence-intervals-effect-size-clinical-interpretation-2026",
  title: "Confidence Intervals and Effect Sizes: Reading Rehabilitation Research Clinically",
  excerpt: "A clinician-friendly guide to magnitude, precision and uncertainty beyond p-values.",
  specialty: "Research & Evidence",
  category: "Critical Appraisal",
  audience: "Professionals",
  level: "Advanced",
  readTime: "12 min read",
  publishedAt: "2026-10-06",
  learningObjectives: ["Differentiate statistical significance from effect magnitude.","Interpret confidence intervals as estimates of precision.","Relate effects to clinically meaningful thresholds cautiously.","Avoid common p-value interpretation errors."],
  references: [{title:"Cochrane Handbook for Systematic Reviews of Interventions",organization:"Cochrane",url:"https://training.cochrane.org/handbook"}],
  sections: [
    {heading:"Why magnitude matters",paragraphs:["A p-value does not tell you whether an effect is large enough to matter clinically. Effect estimates and their uncertainty are more informative for decision-making."]},
    {heading:"Confidence intervals",paragraphs:["A confidence interval communicates the precision around an effect estimate. Narrower intervals generally indicate greater precision than wider intervals and should not be reduced to a simple significant or non-significant label."]},
    {heading:"Clinical interpretation",bullets:["Identify the effect measure and direction.","Examine the point estimate and full confidence interval.","Compare plausible effects with valid clinically important thresholds.","Consider risk of bias, population and applicability before changing practice."]},
    {heading:"Common mistakes",bullets:["Equating statistical significance with clinical importance.","Calling a non-significant result proof of no effect.","Ignoring wide intervals and imprecision.","Reading an effect estimate without considering study quality."]},
    {heading:"Clinical pearl",paragraphs:["Ask three questions: how large is the estimated effect, how uncertain is it, and is the evidence applicable to the patient or population?"]},
    {heading:"Summary",paragraphs:["Good appraisal moves beyond significance testing to magnitude, precision, bias and clinical relevance."]}
  ]
};