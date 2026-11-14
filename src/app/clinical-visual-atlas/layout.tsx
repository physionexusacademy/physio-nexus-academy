import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Clinical Visual Atlas",
    description: "Free visual atlas of musculoskeletal anatomy, injuries and clinical findings for physiotherapy students and clinicians.",
    url: `${siteUrl}/clinical-visual-atlas`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Clinical Visual Atlas", path: "/clinical-visual-atlas" }])} />
      {children}
    </>
  );
}
