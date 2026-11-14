import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: '3D Rehab Exercise Library',
    description: 'Rehabilitation exercises for the neck, back, shoulder, hand, hip, knee and ankle, performed in 3D by a virtual physiotherapist guide.',
    url: `${siteUrl}/rehabverse/library`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "RehabVerse", path: "/rehabverse" }, { name: "3D Exercise Library", path: "/rehabverse/library" }])} />
      {children}
    </>
  );
}
