import type { KnowledgeArticle } from "@/lib/knowledge-content";
export const article: KnowledgeArticle = {
  "slug": "rob-2-randomized-trials-result-level-assessment-2026",
  "title": "RoB 2: Risk of Bias Assessment for Randomized Trial Results",
  "specialty": "Research & Evidence",
  "category": "Critical Appraisal",
  "audience": "Professionals",
  "level": "Advanced",
  "readTime": "9 min read",
  "publishedAt": "2026-10-10",
  "excerpt": "Apply Cochrane RoB 2 to a specific randomized-trial result, not to an entire paper.",
  "learningObjectives": [
    "Identify the five RoB 2 domains.",
    "Distinguish assignment from adherence effects.",
    "Write justified, result-specific judgments."
  ],
  "references": [
    {
      "title": "Cochrane Handbook Chapter 8: Assessing risk of bias in a randomized trial",
      "organization": "Cochrane",
      "year": "2024",
      "url": "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-08"
    }
  ],
  "sections": [
    {
      "heading": "What is assessed?",
      "paragraphs": [
        "RoB 2 assesses potential systematic distortion of a particular result in a randomized trial. One trial may require different assessments for different outcomes or time points."
      ]
    },
    {
      "heading": "Domain 1: randomization",
      "bullets": [
        "Check sequence generation and allocation concealment.",
        "Inspect baseline differences for possible randomization problems."
      ]
    },
    {
      "heading": "Domain 2: deviations",
      "bullets": [
        "Specify whether the effect of assignment or adherence is of interest.",
        "Examine trial-context deviations and whether the analysis addresses them."
      ]
    },
    {
      "heading": "Domain 3: missing data",
      "bullets": [
        "Review how much data are missing and why.",
        "There is no universally safe dropout percentage; consider whether missingness depends on the outcome."
      ]
    },
    {
      "heading": "Domain 4: outcome measurement",
      "bullets": [
        "Assess method suitability and consistency.",
        "Consider whether knowledge of intervention could influence outcome assessment."
      ]
    },
    {
      "heading": "Domain 5: selective reporting",
      "bullets": [
        "Compare registry, protocol and statistical plan with the published outcome and time point.",
        "Look for selection among multiple eligible analyses."
      ]
    },
    {
      "heading": "Judgment and documentation",
      "bullets": [
        "Use signalling questions and record evidence for every decision.",
        "Judgments are low risk, some concerns or high risk; overall risk follows the least favorable relevant domain.",
        "RoB 2 is not a numerical quality score or a substitute for GRADE certainty."
      ]
    },
    {
      "heading": "Common mistakes and clinical pearl",
      "bullets": [
        "Do not assume randomization prevents all bias.",
        "Do not label an entire paper low risk without specifying the result.",
        "Document exact supporting pages or quotations for reproducibility."
      ]
    },
    {
      "heading": "Summary",
      "paragraphs": [
        "A reproducible assessment names the result, clarifies the target effect, evaluates all five domains and explains each judgment."
      ]
    }
  ]
};
