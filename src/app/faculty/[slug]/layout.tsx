import type { ReactNode } from "react";
import { JsonLd, breadcrumbList, orgRef, siteUrl } from "@/lib/seo/jsonld";
import { getFacultyMember } from "@/lib/faculty";
import { fitDescription } from "@/lib/seo/text";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = getFacultyMember(slug);
  if (!member) return <>{children}</>;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.professionalTitle,
    description: fitDescription(member.summary, `${member.academyRole} at Physio Nexus Academy.`),
    url: `${siteUrl}/faculty/${member.slug}`,
    ...(member.image ? { image: `${siteUrl}${member.image.src}` } : {}),
    worksFor: orgRef,
  };
  return (
    <>
      <JsonLd data={person} />
      <JsonLd data={breadcrumbList([{ name: "Faculty", path: "/faculty" }, { name: member.name, path: `/faculty/${member.slug}` }])} />
      {children}
    </>
  );
}
