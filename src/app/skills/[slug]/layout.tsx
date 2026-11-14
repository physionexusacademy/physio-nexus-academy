import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import { getSkillEntry } from "@/lib/skills/catalog";
import { fitDescription } from "@/lib/seo/text";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillEntry(slug);
  if (!skill) return <>{children}</>;
  const data = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${skill.title} — Clinical Skills Lab`,
    description: fitDescription(skill.summary, "Practise this clinical skill with simulators, questions, flashcards and OSCE stations."),
    url: `${siteUrl}/skills/${skill.slug}`,
    inLanguage: ["en", "ur-Latn"],
    isAccessibleForFree: true,
    educationalLevel: "Beginner to expert",
    learningResourceType: ["Practice exercise", "Quiz", "Flashcards", "Simulation"],
    teaches: skill.title,
    audience: { "@type": "EducationalAudience", educationalRole: "physiotherapy student" },
    isPartOf: { "@type": "CollectionPage", name: "Clinical Skills Lab", url: `${siteUrl}/skills` },
    publisher: orgRef,
  };
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={breadcrumbList([{ name: "Clinical Skills Lab", path: "/skills" }, { name: skill.title, path: `/skills/${skill.slug}` }])} />
      {children}
    </>
  );
}
