import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { trainingHistory } from "@/lib/training-history";

const routes = [
  "",
  "/about",
  "/founder",
  "/workshops",
  "/training",
  "/verify",
  "/courses",
  "/resources",
  "/research",
  "/patient-services",
  "/appointment",
  "/home-visit",
  "/gallery",
  "/updates",
  "/contact",
  "/faq",
  "/legal/privacy",
  "/legal/terms",
  "/legal/refund",
  "/legal/disclaimer",
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
    ...(item.date ? { lastModified: new Date(item.date) } : {}),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...workshopRoutes, ...trainingRoutes];
}
