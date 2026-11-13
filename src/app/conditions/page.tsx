import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { areas } from "@/lib/conditions/taxonomy";
import { ConditionsExplorer, type ExplorerItem } from "./ConditionsExplorer";

export const dynamic = "force-static";
export const revalidate = false;

const url = "https://physionexusacademy.com/conditions";
const title = "Conditions & Treatment Guide — Injuries, Plans and Rehab by Body Area";
const description = `Find ${conditionCatalog.length} physiotherapy conditions by body area or type. Pick your depth — quick guide, clinical plan or expert detail — and follow a stage-by-stage treatment plan with doses and clear rules for when to progress.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ["physiotherapy treatment plans", "musculoskeletal injuries", "rehabilitation by body area", "tendinopathy rehab", "ACL rehabilitation", "low back pain exercises", "stroke rehabilitation", "physiotherapy guide Pakistan"],
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Physio Nexus Academy", type: "website", locale: "en_PK", images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA Conditions & Treatment Guide" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function ConditionsPage() {
  const items: ExplorerItem[] = conditionCatalog.map(({ slug, name, area, type, summary, stages, kind, aka }) => ({ slug, name, area, type, summary, stages, kind, aka }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: conditionCatalog.length,
      itemListElement: conditionCatalog.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `${url}/${c.slug}` })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <NexusHero
        kicker="Learn wing · Conditions & Treatment Guide"
        title={<>Understand it. <span className="nx-gradient-text">Plan the rehab.</span></>}
        lead="One place for injuries, long-term conditions and rehabilitation. Pick how deep you want to go, find the condition, and follow a stage-by-stage plan that tells you what to do, how much, and when to move on."
        crumbs={[{ label: "Learn", href: "/learn" }, { label: "Conditions & Treatment" }]}
        actions={
          <>
            <a href="#cg-find-title" className="nx-btn nx-btn-primary">Find a condition</a>
            <a href="/symptom-checker" className="nx-btn nx-btn-ghost">Symptom checker</a>
          </>
        }
        stats={[
          { value: conditionCatalog.length, label: "conditions" },
          { value: areas.length, label: "body areas & systems" },
          { value: 3, label: "depth levels" },
        ]}
      />
      <ConditionsExplorer items={items} />
    </>
  );
}
