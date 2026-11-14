import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";

export default function Layout({ children }: { children: ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PNA MSK Symptom Checker",
    description: "A free screening tool for adults: choose a body area, answer a few questions, pass a safety check and see which musculoskeletal patterns fit — with clear next steps. Screening only, not a diagnosis.",
    url: `${siteUrl}/symptom-checker`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
    audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
    publisher: orgRef,
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "MSK Symptom Checker", path: "/symptom-checker" }])} />
      {children}
    </>
  );
}
