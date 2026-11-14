import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { fitDescription } from "@/lib/seo/text";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);
  const world = worldManualApproaches.find((item) => item.slug === slug);
  const name = world?.title ?? technique?.name;
  if (!name) return <>{children}</>;
  const url = `${siteUrl}/manual-therapy/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "MedicalWebPage"],
    name,
    description: fitDescription(world?.summary ?? technique?.summary ?? "", "Technique, indications, safety and evidence for physiotherapists."),
    url,
    inLanguage: "en",
    isAccessibleForFree: true,
    educationalLevel: "Professional",
    audience: { "@type": "EducationalAudience", educationalRole: "physiotherapist or physiotherapy student" },
    about: { "@type": "MedicalTherapy", name },
    isPartOf: { "@type": "CollectionPage", name: "Manual Therapy Encyclopedia", url: `${siteUrl}/manual-therapy` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Manual Therapy", path: "/manual-therapy" }, { name, path: `/manual-therapy/${slug}` }])} />
      {children}
    </>
  );
}
