import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api", "/api/", "/rehabverse/me", "/rehabverse/start", "/rehabverse/login", "/rehabverse/register"],
    },
    sitemap: "https://physionexusacademy.com/sitemap.xml",
  };
}
