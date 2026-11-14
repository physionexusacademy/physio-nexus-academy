import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import { getRegionalManualApplication } from "@/lib/manual-therapy-regional";
import { fitDescription } from "@/lib/seo/text";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) return <>{children}</>;
  const data = {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "MedicalWebPage"],
    name: item.title,
    description: fitDescription(`${item.title}: ${item.clinicalUse[0]}`, "Indications, step-by-step method, safety checks and evidence for physiotherapists."),
    url: `${siteUrl}/manual-therapy/regions/${item.slug}`,
    inLanguage: "en",
    isAccessibleForFree: true,
    educationalLevel: "Professional",
    about: { "@type": "MedicalTherapy", name: item.title },
    isPartOf: { "@type": "CollectionPage", name: "Regional Manual Therapy", url: `${siteUrl}/manual-therapy/regions` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Manual Therapy", path: "/manual-therapy" }, { name: "Regional techniques", path: "/manual-therapy/regions" }, { name: item.title, path: `/manual-therapy/regions/${item.slug}` }])} />
      {children}
    </>
  );
}
