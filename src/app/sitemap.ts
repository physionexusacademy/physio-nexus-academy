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
  "/clinical-arena",
  "/clinical-quiz",
  "/daily-challenge",
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
  "/locations/karachi",
  "/locations/hyderabad",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
  ...(atlasPublished ? ["/clinical-visual-atlas"] : []),
];

const base = "https://physionexusacademy.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("slug, updated_at")
    .eq("status", "published");

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
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

  const manualTherapyRoutes: MetadataRoute.Sitemap = manualTherapyTechniques.map((item) => ({
    url: `${base}/manual-therapy/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const worldManualApproachRoutes: MetadataRoute.Sitemap = worldManualApproaches.map((item) => ({
    url: `${base}/manual-therapy/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

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

  return [
    ...staticRoutes,
    ...workshopRoutes,
    ...trainingRoutes,
    ...knowledgeRoutes,
    ...specialtyRoutes,
    ...caseRoutes,
    ...manualTherapyRoutes,
    ...worldManualApproachRoutes,
    ...regionalManualRoutes,
    ...treatmentPlanRoutes,
    ...mskRoutes,
    ...facultyRoutes,
    ...atlasRoutes,
  ];
}
