import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/founder",
  "/workshops",
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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://physionexusacademy.com";
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
