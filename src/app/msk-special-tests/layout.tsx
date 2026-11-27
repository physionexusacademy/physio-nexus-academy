import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: 'MSK Special Tests',
    description: 'Upper-limb, lower-limb, cervical and lumbar special tests: patient position, hand placement, how to apply them and what a positive sign means.',
    url: `${siteUrl}/msk-special-tests`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: 'MSK Special Tests', path: "/msk-special-tests" }])} />
      {children}
    </>
  );
}
