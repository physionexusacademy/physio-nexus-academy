import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import {
  completeRegionalManualApplications,
  isTechniqueSpecificRegionalApplication,
  manualRegions,
} from "@/lib/manual-therapy-regional";

type PageProps = { params: Promise<{ slug: string }> };

function regionSlug(region: string) {
  return region.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function generateStaticParams() {
  return manualRegions.map((region) => ({ slug: regionSlug(region) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const region = manualRegions.find((region) => regionSlug(region) === slug);
  if (!region) return {};
  return {
    title: region + " | General Manual Therapy Overviews | PNA",
    description: "Introductory manual therapy orientation for " + region + ". These are general regional frameworks, not fully authored technique-specific protocols.",
    robots: { index: false, follow: true },
  };
}

export default async function RegionOverviewsPage({ params }: PageProps) {
  const { slug } = await params;
  const region = manualRegions.find((value) => regionSlug(value) === slug);
  if (!region) notFound();

  const items = completeRegionalManualApplications.filter(
    (item) => item.region === region && !isTechniqueSpecificRegionalApplication(item)
  );

  return (
    <div className="container-content section-padding" data-pna-region-overviews="v1">
      <a href="/manual-therapy/regions" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All detailed regional techniques
      </a>

      <header className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 p-7 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.19em] text-cyan-100">
          PNA Regional Library · General regional overviews
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{region}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-indigo-50">
          {items.length} introductions to regional clinical concepts. These pages offer
          assessment, safety and reassessment principles; they are not complete
          region-specific manual protocols. For actual application, use trained supervision
          and an individually authored clinical procedure.
        </p>
      </header>

      {items.length ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="General regional overviews">
          {items.map((item) => (
            <a key={item.slug} href={"/manual-therapy/regions/" + item.slug}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md">
              <BookOpen className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-teal-700">{item.techniqueName}</p>
              <h2 className="mt-1 text-lg font-bold leading-7 text-slate-900">{item.title}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{item.clinicalUse[0]}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
                Explore general principles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </a>
          ))}
        </section>
      ) : (
        <p className="mt-8 text-sm text-slate-600">No general overviews remain for this region. Browse the authored guides instead.</p>
      )}
    </div>
  );
}
