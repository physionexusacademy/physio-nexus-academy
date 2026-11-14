import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import { getAtlasEntry } from "@/lib/clinical-visual-atlas";
import { fitDescription } from "@/lib/seo/text";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getAtlasEntry(slug);
  if (!item || !item.assetReady) return <>{children}</>;
  const data = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "MedicalWebPage"],
    name: item.title,
    description: fitDescription(item.summary, "A 3D clinical visual from the PNA Clinical Visual Atlas."),
    url: `${siteUrl}/clinical-visual-atlas/${item.slug}`,
    inLanguage: "en",
    about: { "@type": "MedicalCondition", name: item.shortTitle },
    isPartOf: { "@type": "CollectionPage", name: "PNA Clinical Visual Atlas", url: `${siteUrl}/clinical-visual-atlas` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Clinical Visual Atlas", path: "/clinical-visual-atlas" }, { name: item.shortTitle, path: `/clinical-visual-atlas/${item.slug}` }])} />
      {children}
    </>
  );
}
