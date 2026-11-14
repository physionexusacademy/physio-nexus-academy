import { fitDescription, fitTitle } from "@/lib/seo/text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { conditionCatalog, conditionUrl, getCondition } from "@/lib/conditions/catalog";
import { areaLabel } from "@/lib/conditions/taxonomy";
import { ConditionGuide } from "../ConditionGuide";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return conditionCatalog.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCondition(slug);
  if (!item) return {};
  const title = `${fitTitle(`${item.name} — Assessment & Rehab Plan`, 54)}`;
  return {
    title: { absolute: `${title} | PNA` },
    description: fitDescription(item.summary, "Assessment, treatment plan and rehab stages from the PNA Conditions & Treatment Guide."),
    alternates: { canonical: conditionUrl(item.slug) },
    openGraph: { title, description: item.summary, url: conditionUrl(item.slug), siteName: "Physio Nexus Academy", type: "article", locale: "en_PK" },
  };
}

export default async function ConditionPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getCondition(slug);
  if (!item) notFound();
  const related = conditionCatalog
    .filter((c) => c.slug !== item.slug && c.area === item.area)
    .slice(0, 4)
    .map((c) => ({ slug: c.slug, name: c.name, area: areaLabel(c.area) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: item.name,
        description: item.summary,
        url: conditionUrl(item.slug),
        about: { "@type": "MedicalCondition", name: item.name },
        audience: { "@type": "Audience", audienceType: "Physiotherapy students, clinicians and patients" },
        isPartOf: { "@type": "WebSite", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
        publisher: { "@type": "Organization", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://physionexusacademy.com" },
          { "@type": "ListItem", position: 2, name: "Conditions & Treatment Guide", item: "https://physionexusacademy.com/conditions" },
          { "@type": "ListItem", position: 3, name: item.name, item: conditionUrl(item.slug) },
        ],
      },
    ],
  };
  return (
    <div className="container-content section-padding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold text-slate-600">
        <a href="/conditions" className="text-teal-800 hover:underline">← All conditions</a>
      </nav>
      <ConditionGuide item={item} related={related} />
    </div>
  );
}
