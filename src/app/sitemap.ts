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
  "/account",
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
  "/leagues",
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

// Honest <lastmod> dates: the day each part of the site last changed in a release. Google ignores sitemaps whose dates are always
// "today", so these are fixed per section and only move when that section's content actually changes (update them with the content).
const day = (iso: string) => new Date(`${iso}T00:00:00+05:00`);
const EXACT_UPDATED: Record<string, Date> = {
  "": day("2026-11-14"), "/learn": day("2026-11-14"), "/skills": day("2026-11-14"), "/virtual-patient": day("2026-11-13"),
  "/rehabverse": day("2026-11-14"), "/rehabverse/library": day("2026-11-13"), "/account": day("2026-11-14"), "/leagues": day("2026-11-14"),
  "/daily-challenge": day("2026-11-14"), "/symptom-checker": day("2026-11-14"), "/conditions": day("2026-11-13"), "/msk-special-tests": day("2026-11-13"),
  "/contact": day("2026-11-13"), "/appointment": day("2026-11-13"), "/home-visit": day("2026-11-13"), "/research": day("2026-11-13"), "/resources": day("2026-11-13"),
  "/about": day("2026-11-12"), "/founder": day("2026-11-12"), "/faq": day("2026-11-12"), "/workshops": day("2026-11-12"), "/manual-therapy": day("2026-11-12"),
  "/legal/privacy": day("2026-11-14"), "/legal/terms": day("2026-11-07"), "/legal/disclaimer": day("2026-11-07"),
  "/reviews": day("2026-11-08"), "/patient-services": day("2026-11-07"), "/training": day("2026-11-07"), "/verify": day("2026-11-07"),
  "/case-lab": day("2026-11-06"), "/stupid-intern-diaries": day("2026-11-06"), "/faculty": day("2026-11-03"), "/clinical-visual-atlas": day("2026-11-13"),
  "/manual-therapy/regions": day("2026-11-03"),
};
const SECTION_UPDATED: [string, Date][] = [
  ["/learn/", day("2026-11-14")], ["/skills/", day("2026-11-14")], ["/conditions/", day("2026-11-13")], ["/clinical-visual-atlas/", day("2026-11-13")],
  ["/case-lab/", day("2026-11-07")], ["/manual-therapy/", day("2026-11-03")], ["/locations/", day("2026-11-03")], ["/faculty/", day("2026-11-03")], ["/training/", day("2026-11-03")],
];
function lastModifiedFor(url: string): Date | undefined {
  const path = url.replace(base, "");
  if (path in EXACT_UPDATED) return EXACT_UPDATED[path];
  return SECTION_UPDATED.find(([prefix]) => path.startsWith(prefix))?.[1];
}

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

  return [...uniqueEntries.values()].map((entry) => ({ ...entry, lastModified: entry.lastModified ?? lastModifiedFor(entry.url) }));
}
