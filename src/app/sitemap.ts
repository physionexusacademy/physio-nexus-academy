import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { trainingHistory } from "@/lib/training-history";
import { knowledgeSpecialties } from "@/lib/knowledge-content";
import { allKnowledgeArticles } from "@/lib/all-knowledge-content";
import { clinicalCases } from "@/lib/all-clinical-cases";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { regionalManualApplications } from "@/lib/manual-therapy-regional";
import { treatmentPlans } from "@/lib/treatment-plans";
import { mskConditions } from "@/lib/msk-injury-hub";
import { atlasPublished, clinicalVisualAtlas } from "@/lib/clinical-visual-atlas";
import { facultyMembers } from "@/lib/faculty";
import { getAllCitySlugs } from "@/lib/locations";
import { publishedCaseReports } from "@/lib/case-report-library";

const routes = [
  "",
  "/about",
  "/founder",
  "/faculty",
  "/workshops",
  "/training",
  "/verify",
  "/resources",
  "/knowledge-hub",
  "/manual-therapy",
  "/manual-therapy/regions",
  "/treatment-plans",
  "/msk-injuries",
  "/msk-special-tests",
  "/case-lab",
  "/stupid-intern-diaries",
  "/clinical-quiz",
  "/daily-challenge",
  "/clinical-arena",
  "/visual-lab",
  "/visual-lab/manual-therapy",
  "/research",
  "/patient-services",
  "/symptom-checker",
  "/appointment",
  "/home-visit",
  "/gallery",
  "/updates",
  "/contact",
  "/reviews",
  "/faq",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
  ...(atlasPublished ? ["/clinical-visual-atlas"] : []),
];

const base = "https://physionexusacademy.com";

function getRoutePriority(route: string): number {
  if (route === "") return 1;
  if (route === "/home-visit" || route === "/appointment") return 0.9;
  if (route === "/case-lab" || route === "/stupid-intern-diaries") return 0.88;
  return 0.7;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("slug, updated_at")
    .eq("status", "published");

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "weekly",
    priority: getRoutePriority(route),
  }));

  const cityRoutes: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: `${base}/locations/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const workshopRoutes: MetadataRoute.Sitemap = (workshops ?? [])
    .filter((workshop) => typeof workshop.slug === "string" && workshop.slug.length > 0)
    .map((workshop) => {
      const updatedAt = workshop.updated_at ? new Date(workshop.updated_at) : undefined;
      const lastModified = updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : undefined;

      return {
        url: `${base}/workshops/${encodeURIComponent(workshop.slug)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

  const trainingRoutes: MetadataRoute.Sitemap = trainingHistory.map((item) => ({
    url: `${base}/training/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const knowledgeRoutes: MetadataRoute.Sitemap = allKnowledgeArticles.map((article) => ({
    url: `${base}/knowledge-hub/${encodeURIComponent(article.slug)}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const specialtyRoutes: MetadataRoute.Sitemap = knowledgeSpecialties.map((specialty) => ({
    url: `${base}/knowledge-hub/specialty/${encodeURIComponent(specialty.slug)}`,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const caseRoutes: MetadataRoute.Sitemap = clinicalCases.map((item) => ({
    url: `${base}/case-lab/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Published evidence-based research case reports (new Case Lab content)
  const researchCaseRoutes: MetadataRoute.Sitemap = publishedCaseReports.map((report) => ({
    url: `${base}/case-lab/research/${encodeURIComponent(report.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.86,
  }));

  const manualTherapyRoutes: MetadataRoute.Sitemap = [
    ...manualTherapyTechniques.map((item) => ({
      url: `${base}/manual-therapy/${encodeURIComponent(item.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...worldManualApproaches.map((item) => ({
      url: `${base}/manual-therapy/${encodeURIComponent(item.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];

  const treatmentPlanRoutes: MetadataRoute.Sitemap = treatmentPlans.map((item) => ({
    url: `${base}/treatment-plans/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const mskRoutes: MetadataRoute.Sitemap = mskConditions.map((item) => ({
    url: `${base}/msk-injuries/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.82,
  }));

  const regionalManualRoutes: MetadataRoute.Sitemap = regionalManualApplications.map((item) => ({
    url: `${base}/manual-therapy/regions/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.82,
  }));

  const facultyRoutes: MetadataRoute.Sitemap = facultyMembers.map((member) => ({
    url: `${base}/faculty/${encodeURIComponent(member.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const atlasRoutes: MetadataRoute.Sitemap = clinicalVisualAtlas
    .filter((item) => item.assetReady)
    .map((item) => ({
      url: `${base}/clinical-visual-atlas/${encodeURIComponent(item.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.84,
    }));

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...cityRoutes,
    ...workshopRoutes,
    ...trainingRoutes,
    ...knowledgeRoutes,
    ...specialtyRoutes,
    ...caseRoutes,
    ...researchCaseRoutes,
    ...manualTherapyRoutes,
    ...regionalManualRoutes,
    ...treatmentPlanRoutes,
    ...mskRoutes,
    ...facultyRoutes,
    ...atlasRoutes,
  ];

  // Keep each canonical URL only once if content collections overlap.
  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of sitemapEntries) {
    if (!uniqueEntries.has(entry.url)) uniqueEntries.set(entry.url, entry);
  }

  return [...uniqueEntries.values()];
}
