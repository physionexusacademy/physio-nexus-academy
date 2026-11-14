import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Manual Therapy by Body Region",
    description: "Region-by-region manual therapy technique guides for the spine, shoulder, elbow, wrist, hip, knee and ankle, with indications and safety notes.",
    url: `${siteUrl}/manual-therapy/regions`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Manual Therapy", path: "/manual-therapy" }, { name: "By Body Region", path: "/manual-therapy/regions" }])} />
      {children}
    </>
  );
}
