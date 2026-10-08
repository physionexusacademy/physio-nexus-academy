import type { Metadata } from "next";
import { ArrowRight, Map, Hand, Activity, BookOpenCheck } from "lucide-react";
import {
  completeRegionalManualApplications,
  manualRegions,
  isTechniqueSpecificRegionalApplication,
} from "@/lib/manual-therapy-regional";

export const metadata: Metadata = {
  title: "Regional Manual Therapy Encyclopedia",
  description:
    "Browse detailed, authored regional manual therapy lessons and lightweight region-based libraries of introductory overviews.",
  alternates: { canonical: "https://physionexusacademy.com/manual-therapy/regions" },
};

function regionSlug(region: string) {
  return region.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RegionalManualTherapyPage() {
  const authored = completeRegionalManualApplications.filter(isTechniqueSpecificRegionalApplication);
  const overviewCount = completeRegionalManualApplications.length - authored.length;

  return (
    <div className="container-content section-padding" data-pna-regions-lite="v1">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
          PNA Manual Therapy Encyclopedia
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          Region-Wise Manual Therapy Applications
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-violet-50 sm:text-lg">
          Step into a patient's clinical story, follow the therapist's decision, and check the
          movement that matters. The detailed lessons come first. Browse general overviews
          by region when you want additional context—not a substitute for supervised techniques.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/10 px-4 py-2">{manualRegions.length} clinical regions</span>
          <span className="rounded-full bg-white/10 px-4 py-2">
            {authored.length} technique-specific guides · {overviewCount} general overviews
          </span>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-cyan-100 bg-cyan-50/60 p-6">
        <div className="flex items-start gap-3">
          <Map className="mt-1 h-6 w-6 flex-none text-cyan-700" />
          <div>
            <h2 className="text-xl font-bold text-navy-800">Start with the patient, not the technique</h2>
            <p className="mt-2 text-sm leading-7 text-navy-600">
              Each detailed lesson connects assessment, positioning, contact, safe force, clinical
              choices and reassessment. The shorter general overviews remain accessible in small
              regional collections, so the main library loads without hundreds of extra cards.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-10" aria-label="Authored regional technique library">
        {manualRegions.map((region) => {
          const items = authored.filter((item) => item.region === region);
          const generalCount = completeRegionalManualApplications.filter(
            (item) => item.region === region && !isTechniqueSpecificRegionalApplication(item)
          ).length;
          if (!items.length && !generalCount) return null;
          return (
            <section key={region} aria-label={region}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Clinical region</p>
                  <h2 className="text-2xl font-bold text-navy-800">{region}</h2>
                </div>
              </div>

              {items.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <a key={item.slug} href={"/manual-therapy/regions/" + item.slug}
                      className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">
                      <Hand className="h-5 w-5 text-violet-600" aria-hidden="true" />
                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-teal-700">{item.techniqueName}</p>
                      <h3 className="mt-1 text-lg font-bold text-navy-800">{item.title}</h3>
                      <span className="mt-3 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                        Technique-specific
                      </span>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy-600">{item.clinicalUse[0]}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-700">
                        Read the clinical guide
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-navy-600">Detailed technique chapters for this region are still being authored.</p>
              )}

              {generalCount > 0 ? (
                <a href={"/manual-therapy/regions/by-region/" + regionSlug(region)}
                  className="mt-4 inline-flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:border-teal-300 hover:bg-cyan-100">
                  <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                  Browse {generalCount} general overviews for {region}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </section>
          );
        })}
      </section>
    </div>
  );
}
