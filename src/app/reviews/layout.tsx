import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: 'Reviews and feedback',
    description: 'Rate Physio Nexus Academy, send private feedback to the PNA team, or leave an honest Google review.',
    url: `${siteUrl}/reviews`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: 'Reviews', path: "/reviews" }])} />
      {children}
    </>
  );
}
