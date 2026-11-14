/** Small helpers for page-level structured data (the site-wide Organization/WebSite graph lives in the root layout). */
const SITE = "https://physionexusacademy.com";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList for rich results: "Home › Section › Page". `path` is a site path such as "/skills/goniometry". */
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}${c.path === "/" ? "" : c.path}` })),
  };
}

export const orgRef = { "@id": `${SITE}/#organization` };
export const siteUrl = SITE;
