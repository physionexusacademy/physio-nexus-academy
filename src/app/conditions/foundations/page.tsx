import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import foundations from "@/lib/conditions/generated/foundations.json";
import type { FoundationItem } from "@/lib/conditions/types";
import { BOOK, VOLUMES } from "@/lib/conditions/book-types";

export const dynamic = "force-static";
export const revalidate = false;

const url = "https://physionexusacademy.com/conditions/foundations";
const title = "Clinical Foundations — Reasoning, Assessment & Treatment Methods";
const description = "The reasoning method, history taking, examination, test accuracy, outcome measures and treatment methods from The Complete Physiotherapy Clinical Mastery by Dr. Sajjad Raza PT.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Physio Nexus Academy", type: "website", locale: "en_PK" },
};

export default function FoundationsPage() {
  const shelf = foundations as FoundationItem[];
  const byVol = [...new Set(shelf.map((f) => f.vol))].map((vol) => ({ vol, items: shelf.filter((f) => f.vol === vol) }));
  return (
    <>
      <NexusHero
        kicker="Learn wing · Conditions & Treatment Guide"
        title={<>Clinical <span className="nx-gradient-text">Foundations</span></>}
        lead={`The chapters of ${BOOK.title} that every condition guide builds on. Students before rotation: read Volume 1 first. It explains the reasoning method used in every other chapter.`}
        crumbs={[{ label: "Learn", href: "/learn" }, { label: "Conditions & Treatment", href: "/conditions" }, { label: "Clinical Foundations" }]}
        actions={<a href="/conditions" className="nx-btn nx-btn-ghost">All conditions</a>}
        stats={[{ value: shelf.length, label: "chapters" }, { value: byVol.length, label: "volumes" }]}
      />
      <div className="container-content section-padding !pt-8 space-y-8">
        {byVol.map((g) => (
          <section key={g.vol} aria-labelledby={`vol-${g.vol}`}>
            <p className="font-mono text-xs font-bold text-teal-700">Volume {g.vol}</p>
            <h2 id={`vol-${g.vol}`} className="text-xl font-bold text-navy-800 sm:text-2xl">{VOLUMES[g.vol]}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((f) => (
                <li key={f.slug}>
                  <a href={`/conditions/foundations/${f.slug}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md">
                    <span className="font-mono text-[11px] font-bold text-slate-500">Vol {f.vol} · Ch {f.ch}</span>
                    <strong className="mt-1 text-base font-bold leading-snug text-navy-800 group-hover:text-teal-800">{f.title}</strong>
                    {f.lead ? <span className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">{f.lead}</span> : null}
                    <span className="mt-auto pt-3 text-xs font-bold text-teal-800">Open →</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
