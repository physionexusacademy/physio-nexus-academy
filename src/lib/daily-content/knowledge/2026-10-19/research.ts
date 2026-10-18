import type { KnowledgeArticle } from "@/lib/knowledge-content";
export const article: KnowledgeArticle = {
  slug: "diagnostic-test-accuracy-sensitivity-specificity-likelihood-ratios-20261019",
  title: "Diagnostic Test Accuracy: Sensitivity, Specificity and Likelihood Ratios",
  excerpt: "Interpret test results through pre-test probability, likelihood ratios and study quality rather than relying on a single accuracy number.",
  specialty: "Research & Evidence",
  category: "Diagnostic Reasoning & Evidence Appraisal",
  audience: "Students",
  level: "Advanced",
  readTime: "11 min read",
  publishedAt: "2026-10-19",
  learningObjectives: ["Explain sensitivity, specificity and predictive values.", "Interpret likelihood ratios alongside pre-test probability.", "Recognize common biases in diagnostic-accuracy studies.", "Use test results to inform decisions without replacing clinical reasoning."],
  references: [
    { title: "Simplifying likelihood ratios", organization: "JAMA / PubMed", year: "2002", url: "https://pubmed.ncbi.nlm.nih.gov/12020306/" },
    { title: "Cochrane Handbook for Systematic Reviews of Diagnostic Test Accuracy", organization: "Cochrane", url: "https://training.cochrane.org/handbook-diagnostic-test-accuracy" }
  ],
  sections: [
    { heading: "Start with the clinical question", paragraphs: ["A test is useful in relation to a target condition, a defined patient population and a decision. Ask what diagnosis it is intended to detect, in whom it was studied, and what action a positive or negative result would change.", "Accuracy can differ between primary care, specialist clinics and highly selected populations; do not transfer estimates blindly between settings."] },
    { heading: "Sensitivity, specificity and predictive values", bullets: ["Sensitivity is the proportion of people with the condition who test positive. A highly sensitive test may help reduce suspicion when negative, if the evidence and context support that use.", "Specificity is the proportion without the condition who test negative. A highly specific test may increase suspicion when positive, but does not independently establish a diagnosis.", "Positive and negative predictive values describe the chance of the condition given a result and depend strongly on prevalence or pre-test probability."] },
    { heading: "Likelihood ratios and probability", paragraphs: ["The positive likelihood ratio describes how much more likely a positive result is in people with the condition than in those without it; the negative likelihood ratio describes the corresponding change for a negative result.", "Estimate pre-test probability from history and examination, use the likelihood ratio to update probability, then decide whether further testing, treatment or referral is justified. No single value is decisive in every setting."] },
    { heading: "Study quality and bias", bullets: ["Spectrum bias occurs when study participants differ from routine patients.", "Verification bias occurs when not everyone receives the reference standard or testing depends on the index result.", "Check blinding, timing, reference-standard quality, thresholds and confidence intervals.", "A wide confidence interval signals imprecision even when the point estimate looks impressive."] },
    { heading: "Clinical use and common mistakes", paragraphs: ["Combine results with symptom pattern, base rates, red flags and the consequences of missing the condition. A test suitable for routine classification may be insufficient when a missed diagnosis would be serious.", "Do not confuse reliability with diagnostic accuracy, predictive values with sensitivity/specificity, or statistical significance with clinical usefulness. Document what decision the test result actually changed."] },
    { heading: "Clinical pearl and summary", paragraphs: ["The value of a test lies in how much it changes a decision, not in how impressive its name sounds. Interpret it through pre-test probability, likelihood ratios, study quality and the consequences of error."] }
  ]
};