import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import "./account.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "My PNA — your personal learning record",
    description: "A free student account that records every lesson, skill, patient and challenge you finish and shows your strengths, gaps and weekly league.",
    url: `${siteUrl}/account`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <div className="acct-root">
      <JsonLd data={page} />
      <JsonLd data={breadcrumbList([{ name: "My PNA", path: "/account" }])} />
      {children}
    </div>
  );
}
