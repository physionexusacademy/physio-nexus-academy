import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: 'Weekly Physiotherapy Leagues',
    description: 'Free weekly physiotherapy leagues: earn XP from lessons, Skills Lab and the Daily Clinical Challenge and climb seven tiers from Bronze to Diamond.',
    url: `${siteUrl}/leagues`,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: 'Weekly Leagues', path: "/leagues" }])} />
      {children}
    </>
  );
}
