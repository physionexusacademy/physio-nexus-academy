import type { KnowledgeArticle } from "@/lib/knowledge-content";

export const article: KnowledgeArticle = {
  slug: "effect-size-confidence-interval-clinical-importance-2026",
  title: "Effect Size and Confidence Intervals: Reading Beyond the P Value",
  excerpt: "A clinical research guide to treatment-effect estimates, confidence intervals, precision and the difference between statistical significance and clinical importance.",
  specialty: "Research & Evidence",
  category: "Critical Appraisal",
  audience: "Students",
  level: "Advanced",
  readTime: "15 min read",
  publishedAt: "2026-10-04",
  learningObjectives: [
    "Identify common effect measures for continuous and binary outcomes.",
    "Interpret confidence intervals as a range of values compatible with the observed data.",
    "Distinguish statistical significance from clinical importance.",
    "Recognize when imprecision limits confidence in a treatment effect."
  ],
  references: [
    {
      title: "CONSORT 2025 explanation and elaboration: updated guideline for reporting randomised trials",
      organization: "The BMJ / CONSORT",
      year: "2025",
      url: "https://www.bmj.com/content/389/bmj-2024-081124"
    }
  ],
  sections: [
    {
      heading: "Start with the treatment effect",
      paragraphs: [
        "A trial should tell you how much the groups differed, not only whether a P value crossed a conventional threshold.",
        "For continuous outcomes the effect may be a mean difference; for binary outcomes it may be a risk ratio, odds ratio or risk difference."
      ]
    },
    {
      heading: "What a confidence interval adds",
      paragraphs: [
        "A confidence interval shows the precision around the estimated treatment effect. A narrow interval suggests greater precision; a wide interval means a broader range of effects remains compatible with the data.",
        "CONSORT 2025 emphasizes reporting effect estimates together with confidence intervals rather than relying on P values alone."
      ]
    },
    {
      heading: "Statistical significance is not clinical importance",
      paragraphs: [
        "A tiny difference can be statistically significant in a very large sample while still being clinically trivial.",
        "A non-significant result can also remain compatible with a clinically important benefit or harm when the confidence interval is wide."
      ]
    },
    {
      heading: "Continuous outcomes",
      bullets: [
        "Mean difference is easiest to interpret when studies use the same measurement scale.",
        "Standardized mean difference is useful when studies measure the same construct with different scales, but it is less intuitive clinically.",
        "Always compare the magnitude of change with measurement properties and clinically meaningful thresholds when available."
      ]
    },
    {
      heading: "Binary outcomes",
      bullets: [
        "Risk ratio describes the relative difference in event risk.",
        "Risk difference gives the absolute difference and often communicates clinical impact more directly.",
        "Absolute and relative effects can tell different stories, especially when baseline risk is low."
      ]
    },
    {
      heading: "Imprecision",
      paragraphs: [
        "A confidence interval that spans meaningful benefit, little or no effect, and meaningful harm is a warning that the result is imprecise.",
        "Small samples and few events often produce wide confidence intervals."
      ]
    },
    {
      heading: "Example",
      paragraphs: [
        "Suppose a trial reports a mean improvement of 4 points with a 95% confidence interval from 1 to 7. The estimate favors treatment, but the clinical interpretation depends on the outcome scale and what size of difference patients consider meaningful.",
        "The interval should be interpreted with the effect size, outcome measurement properties and risk of bias—not in isolation."
      ]
    },
    {
      heading: "Common mistakes",
      bullets: [
        "Reporting only P values.",
        "Calling a non-significant result proof of no difference.",
        "Calling every statistically significant result clinically important.",
        "Ignoring absolute effects when only relative effects are presented.",
        "Interpreting a very imprecise estimate with excessive certainty."
      ]
    },
    {
      heading: "Clinical pearl",
      paragraphs: [
        "When reading a trial, ask three questions: How large is the effect, how precise is the estimate, and is that magnitude meaningful for this patient?"
      ]
    },
    {
      heading: "Summary",
      paragraphs: [
        "Effect sizes tell you the magnitude of a difference; confidence intervals tell you how precise that estimate is. Together they are more informative than a P value alone."
      ]
    }
  ]
};
