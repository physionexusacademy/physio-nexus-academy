import type { KnowledgeArticle } from "@/lib/knowledge-content";
export const article: KnowledgeArticle = {
 slug:"cluster-randomized-trials-icc-analysis-reporting-20261015",
 title:"Cluster-Randomized Trials: Intracluster Correlation, Analysis and Reporting",
 excerpt:"Appraise trials that randomize clinics, schools or teams rather than individuals, including design effect, analysis and reporting essentials.",
 specialty:"Research & Evidence", category:"Clinical Research Methods", audience:"Professionals", level:"Advanced", readTime:"8 min read", publishedAt:"2026-10-15",
 learningObjectives:["Identify the unit of randomization and unit of measurement.","Explain how intracluster correlation affects precision and sample size.","Recognize cluster-aware analyses and reporting omissions."],
 references:[{title:"CONSORT 2010 statement: extension to cluster randomised trials",organization:"The BMJ",year:"2012",url:"https://www.bmj.com/content/345/bmj.e5661"}],
 sections:[
 {heading:"Design and units",paragraphs:["In a cluster-randomized trial, groups such as clinics, hospitals or schools are allocated to arms. Outcomes may be measured in individual patients, but people within one cluster can be more alike than people across clusters. The unit of allocation, intervention and analysis should be explicit."]},
 {heading:"Intracluster correlation",bullets:["The intracluster correlation coefficient (ICC) describes outcome similarity within clusters. Even a small ICC can reduce effective information when clusters are large.","For equally sized clusters, a common approximation is design effect = 1 + (m − 1) × ICC, where m is average cluster size. Unequal cluster sizes and complex designs need more careful methods.","Check the sample-size assumptions for ICC, cluster size, number of clusters and attrition. A large participant count cannot compensate reliably for too few clusters."]},
 {heading:"Analysis and reporting",bullets:["Look for mixed-effects models, generalized estimating equations or other methods that account for the allocation structure and outcome type.","Check effect estimates with confidence intervals, cluster-aware methods, flow of clusters and individuals, losses at both levels, and appropriate sample-size calculations.","Ignoring clustering may produce standard errors that are too small. CONSORT improves transparency but does not itself prove low risk of bias."]},
 {heading:"Clinical appraisal",paragraphs:["Ask what was randomized, whether the analysis reflects that design, and whether the number of clusters supports the conclusions. Then assess generalizability to both the participating clinics and the individuals treated within them."]}
 ]};
