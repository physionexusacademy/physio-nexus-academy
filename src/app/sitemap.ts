import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { trainingHistory } from "@/lib/training-history";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { regionalManualApplications } from "@/lib/manual-therapy-regional";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { atlasPublished, clinicalVisualAtlas } from "@/lib/clinical-visual-atlas";
import { facultyMembers } from "@/lib/faculty";
import { getAllCitySlugs } from "@/lib/locations";
import { canonicalCaseReports } from "@/lib/case-report-library";
import { conceptLessonMetas } from "@/lib/teacher/lesson-index";
import { teacherPaths } from "@/lib/teacher/paths";
import { skillIndex } from "@/lib/skills/catalog";

const routes = [
  "",
  "/learn",
  "/skills",
  "/virtual-patient",
  "/rehabverse",
  "/rehabverse/library",
  "/about",
  "/founder",
  "/faculty",
  "/workshops",
  "/training",
  "/verify",
  "/resources",
  "/conditions",
  "/manual-therapy",
  "/manual-therapy/regions",
  "/msk-special-tests",
  "/case-lab",
  "/stupid-intern-diaries",
  "/daily-challenge",
  "/research",
  "/patient-services",
  "/symptom-checker",
  "/appointment",
  "/home-visit",
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
  if (route === "/learn" || route === "/skills" || route === "/virtual-patient") return 0.95;
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

  // Legacy /case-lab/<slug> pages permanently redirect to /case-lab, so they are not listed.

  // Published evidence-based research case reports (new Case Lab content)
  const researchCaseRoutes: MetadataRoute.Sitemap = canonicalCaseReports.map((report) => ({
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

  const conditionRoutes: MetadataRoute.Sitemap = conditionCatalog.map((item) => ({
    url: `${base}/conditions/${encodeURIComponent(item.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.84,
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

  const teacherRoutes: MetadataRoute.Sitemap = [
    ...conceptLessonMetas.map((lesson) => ({
      url: `${base}/learn/${encodeURIComponent(lesson.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...teacherPaths.map((path) => ({
      url: `${base}/learn/paths/${encodeURIComponent(path.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.88,
    })),
    ...skillIndex.map((skill) => ({
      url: `${base}/skills/${encodeURIComponent(skill.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...teacherRoutes,
    ...cityRoutes,
    ...workshopRoutes,
    ...trainingRoutes,
    ...conditionRoutes,
    ...researchCaseRoutes,
    ...manualTherapyRoutes,
    ...regionalManualRoutes,
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
