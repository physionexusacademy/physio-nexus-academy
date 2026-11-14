import type { ReactNode } from "react";
import { JsonLd, orgRef, siteUrl } from "@/lib/seo/jsonld";

/** Legal pages share one lightweight WebPage node that points back to the academy; each page keeps its own title/description. */
export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Physio Nexus Academy legal information",
    url: `${siteUrl}/legal/terms`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      {children}
    </>
  );
}
