import { JsonLd, breadcrumbList, orgRef, siteUrl, type Crumb } from "@/lib/seo/jsonld";

/** Page-level data for a hub/listing page: a CollectionPage plus its breadcrumb. Rendered by the hub's own page.tsx (not a layout) so detail pages below it never inherit it. */
export function HubJsonLd({ name, description, path, crumbs }: { name: string; description: string; path: string; crumbs: Crumb[] }) {
  const page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteUrl}${path}`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={page} />
      <JsonLd data={breadcrumbList(crumbs)} />
    </>
  );
}
