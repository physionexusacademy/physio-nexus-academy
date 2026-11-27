import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { areas } from "@/lib/conditions/taxonomy";
import { ConditionsExplorer, type ExplorerItem } from "./ConditionsExplorer";
import foundations from "@/lib/conditions/generated/foundations.json";
import type { FoundationItem } from "@/lib/conditions/types";
import { BOOK } from "@/lib/conditions/book-types";

export const dynamic = "force-static";
export const revalidate = false;

const url = "https://physionexusacademy.com/conditions";
const title = "Conditions & Treatment Guide — Assessment to Treatment";
const description = "68 physiotherapy conditions from The Complete Physiotherapy Clinical Mastery by Dr. Sajjad Raza PT: questions, examination, special tests, red flags, decision pathway, treatment and a case for each.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["physiotherapy treatment plans", "musculoskeletal injuries", "rehabilitation by body area", "tendinopathy rehab", "ACL rehabilitation", "low back pain exercises", "stroke rehabilitation", "physiotherapy guide Pakistan"],
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Physio Nexus Academy", type: "website", locale: "en_PK", images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA Conditions & Treatment Guide" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function ConditionsPage() {
  const items: ExplorerItem[] = conditionCatalog.map(({ slug, name, area, type, summary, stages, kind, aka, vol, ch, letters, tests }) => ({ slug, name, area, type, summary, stages, kind, aka, vol, ch, letters, tests }));
  const shelf = foundations as FoundationItem[];
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
        title={<>From the story <span className="nx-gradient-text">to the treatment.</span></>}
        lead={`Every guide is a chapter of ${BOOK.title} by ${BOOK.author}, in the same order each time: understand it, recognise it, ask, examine, test, rule out, act on red flags, decide, treat, reassess and practise on a case.`}
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
          { value: shelf.length, label: "foundation chapters" },
        ]}
      />
      <ConditionsExplorer items={items} />
      <section aria-labelledby="cg-foundations" className="container-content pb-16">
        <div className="rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#0f766e_0%,#0b2545_50%,#06142b_100%)] p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Read these first</p>
          <h2 id="cg-foundations" className="mt-1 text-2xl font-bold text-white sm:text-3xl">Clinical Foundations</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-teal-50/90">The reasoning method every guide uses, history taking, examination planning, test accuracy, outcome measures, and the treatment methods: manual therapy concepts, exercise prescription and modalities.</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {shelf.map((f) => (
              <li key={f.slug}>
                <a href={`/conditions/foundations/${f.slug}`} className="group flex h-full flex-col rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 hover:ring-teal-300/60">
                  <span className="font-mono text-[11px] font-bold text-teal-200">Vol {f.vol} · Ch {f.ch}</span>
                  <strong className="mt-1 text-sm font-bold leading-snug text-white group-hover:text-teal-100">{f.title}</strong>
                </a>
              </li>
            ))}
          </ul>
          <a href="/conditions/foundations" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-bold text-navy-950 hover:bg-teal-200">Open the Foundations shelf →</a>
        </div>
      </section>
    </>
  );
}
