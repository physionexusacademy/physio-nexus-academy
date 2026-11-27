import { fitDescription, fitTitle } from "@/lib/seo/text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { conditionCatalog, conditionUrl, getCondition } from "@/lib/conditions/catalog";
import { areaLabel } from "@/lib/conditions/taxonomy";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ConditionDetail } from "@/lib/conditions/types";
import { ConditionGuide } from "../ConditionGuide";
import { BookGuide } from "../BookGuide";
import { typeLabel } from "@/lib/conditions/taxonomy";
import { REGION_COUNTS, REGION_PLAIN, libraryHref, regionForBodyArea } from "@/lib/rehabverse/area-map";
import { relatedForCondition } from "@/lib/related";
import { RelatedPanel } from "@/components/related/RelatedPanel";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * The guide text, read from public/conditions-data at build time so it is part of the prebuilt HTML (the pages are served from static assets).
 * The data is not imported, so it stays out of the Cloudflare worker; if the file cannot be read (e.g. a render inside the worker), the guide
 * falls back to loading it in the browser.
 */
async function readDetail(slug: string): Promise<ConditionDetail | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "public", "conditions-data", `${slug}.json`), "utf8")) as ConditionDetail;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return conditionCatalog.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCondition(slug);
  if (!item) return {};
  const title = `${fitTitle(`${item.name} — Assessment & Treatment`, 54)}`;
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
  const links = relatedForCondition(item.slug);
  const detail = await readDetail(item.slug);
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
  const ld = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />;
  if (detail?.book) {
    const region = regionForBodyArea(item.area);
    return (
      <div className="container-content section-padding">
        {ld}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold text-slate-600">
          <a href="/conditions" className="text-teal-800 hover:underline">← All conditions</a>
        </nav>
        <BookGuide
          chapter={detail.book}
          help={detail.help ?? null}
          chips={[{ label: areaLabel(item.area), href: `/conditions?area=${item.area}` }, { label: typeLabel(item.type) }]}
          glance={{ summary: detail.summary, redFlags: detail.quick.redFlags, firstSteps: detail.quick.firstSteps }}
          backHref="/conditions"
          backLabel="All conditions"
          footer={
            <div key="condition-footer" className="space-y-5 pt-2">
              {related.length ? (
                <div>
                  <h2 className="text-lg font-bold text-navy-800">Related conditions</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {related.map((r) => (
                      <li key={r.slug}><a href={`/conditions/${r.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-navy-800 hover:border-teal-400 hover:bg-teal-50">{r.name} →</a></li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 text-sm font-bold">
                <a href="/conditions/foundations" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Clinical Foundations</a>
                <a href="/symptom-checker" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Symptom checker</a>
                <a href="/msk-special-tests" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Special tests library</a>
                <a href="/manual-therapy" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Manual therapy</a>
                {region ? <a href={libraryHref(region, "condition")} className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-2.5 text-teal-900 hover:border-teal-500">Watch {REGION_PLAIN[region].toLowerCase()} exercises in 3D ({REGION_COUNTS[region]})</a> : null}
                <a href="/rehabverse" className="rounded-xl bg-teal-700 px-4 py-2.5 text-white hover:bg-teal-800">Guided 3D home rehab</a>
              </div>
              {detail.links.length ? (
                <p className="text-sm text-slate-600">See it in the atlas: {detail.links.map((l, i) => (<span key={l.href}>{i ? " · " : ""}<a className="font-bold text-teal-800 underline" href={l.href}>{l.label}</a></span>))}</p>
              ) : null}
              {links ? <RelatedPanel related={links} name={item.name} /> : null}
            </div>
          }
        />
      </div>
    );
  }
  return (
    <div className="container-content section-padding">
      {ld}
      <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold text-slate-600">
        <a href="/conditions" className="text-teal-800 hover:underline">← All conditions</a>
      </nav>
      <ConditionGuide item={item} related={related} initialDetail={detail} />
      {links ? <RelatedPanel related={links} name={item.name} /> : null}
    </div>
  );
}
