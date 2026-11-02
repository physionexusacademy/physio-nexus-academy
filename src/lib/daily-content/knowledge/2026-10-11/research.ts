import type { KnowledgeArticle } from "@/lib/knowledge-content";

export const article: KnowledgeArticle = {
  "specialty": "Research & Evidence",
  "slug": "meta-analysis-heterogeneity-i2-tau2-prediction-intervals-2026",
  "title": "Meta-Analysis Heterogeneity: I², Tau² and Prediction Intervals Explained",
  "category": "Evidence Synthesis",
  "excerpt": "A practical, evidence-informed guide to meta-analysis heterogeneity: i², tau² and prediction intervals explained, with safety screening, clinical reasoning, intervention progression and outcome-based reassessment.",
  "audience": "Professionals",
  "level": "Advanced",
  "readTime": "9–12 min read",
  "publishedAt": "2026-10-11",
  "learningObjectives": [
    "Differentiate clinical, methodological and statistical heterogeneity.",
    "Interpret I² and Tau² without rigid cutoffs.",
    "Explain why a pooled confidence interval is not a prediction interval."
  ],
  "references": [
    {
      "title": "Cochrane Handbook, Chapter 10: Analysing data and undertaking meta-analyses",
      "organization": "Cochrane",
      "url": "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10",
      "year": "2024"
    }
  ],
  "sections": [
    {
      "heading": "Start with the clinical question",
      "bullets": [
        "Before pooling rehabilitation trials, compare populations, diagnosis definitions, treatment dose, comparator, follow-up and outcome scales. Statistical software cannot fix a clinically incoherent comparison.",
        "Heterogeneity can be clinical (patients/interventions), methodological (study design or bias) or statistical (effects differ more than expected from sampling error)."
      ]
    },
    {
      "heading": "What I² means",
      "bullets": [
        "I² estimates the proportion of observed variability in study effect estimates attributed to heterogeneity rather than chance, under the model assumptions.",
        "It is not 'the percentage of patients who differ' and not the size of the treatment effect. With few studies its uncertainty is often substantial."
      ]
    },
    {
      "heading": "What Tau² means",
      "bullets": [
        "Tau² estimates between-study variance in true effects on the analysis scale; Tau is its square root and has the same units as the effect measure.",
        "Tau² values cannot be interpreted meaningfully without considering the outcome scale and clinical context."
      ]
    },
    {
      "heading": "Confidence interval versus prediction interval",
      "bullets": [
        "A 95% confidence interval around the random-effects pooled mean describes uncertainty about the average effect.",
        "A 95% prediction interval aims to describe the range of underlying effects expected in a similar new study, incorporating between-study variation; it may be wide and unstable with few studies."
      ]
    },
    {
      "heading": "Worked clinical interpretation",
      "bullets": [
        "Suppose pooled pain improvement favors treatment, but studies range from small to large effects and a prediction interval crosses no effect. The average may be beneficial while a new setting could experience little benefit.",
        "Ask whether intervention dose, chronicity or comparator differences plausibly explain the variation before applying the pooled estimate to an individual patient."
      ]
    },
    {
      "heading": "Analytic workflow",
      "bullets": [
        "Pre-specify eligible comparisons and subgroup hypotheses. Check extraction units, standard deviations versus standard errors, outcome direction and missing data before attributing differences to biology.",
        "Consider random-effects analysis when justified, sensitivity analyses for risk of bias, and narrative synthesis if pooling would mislead."
      ]
    },
    {
      "heading": "Reporting and limitations",
      "bullets": [
        "Report effect estimate, 95% confidence interval, I², Tau² where available, prediction interval when appropriate, number of studies and clinical differences.",
        "Avoid rigid 'low/moderate/high' I² labels, especially with only two or three trials; heterogeneity statistics are imprecise in small meta-analyses."
      ]
    },
    {
      "heading": "Common mistakes and summary",
      "bullets": [
        "A significant pooled P value does not guarantee consistent benefit. Good evidence synthesis explains the spread of plausible effects and the conditions under which the result applies."
      ]
    }
  ]
};
