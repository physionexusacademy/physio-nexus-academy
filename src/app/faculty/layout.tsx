import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: 'Physio Nexus Academy faculty',
    description: 'Meet the Physio Nexus Academy faculty and clinical training team.',
    url: `${siteUrl}/faculty`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: 'Faculty', path: "/faculty" }])} />
      {children}
    </>
  );
}
