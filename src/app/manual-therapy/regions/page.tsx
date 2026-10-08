import type { Metadata } from "next";
import { ArrowRight, Map, Hand, Activity } from "lucide-react";
import {
  completeRegionalManualApplications,
  manualRegions,
  isTechniqueSpecificRegionalApplication,
} from "@/lib/manual-therapy-regional";

export const metadata: Metadata = {
  title: "Regional Manual Therapy Encyclopedia",
  description:
    "Region-wise manual therapy applications for cervical, thoracic, lumbar, shoulder, elbow, wrist, hip, knee, ankle and neural mobilization.",
  alternates: {
    canonical: "https://physionexusacademy.com/manual-therapy/regions",
  },
};

export default function RegionalManualTherapyPage() {
  return (
    <div className="container-content section-padding">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
          PNA Manual Therapy Encyclopedia
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          Region-Wise Manual Therapy Applications
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-violet-50 sm:text-lg">
          The same technique can tell a very different clinical story at the neck, shoulder,
          knee or ankle. Start with a patient's familiar movement, discover which manual input
          might help, and follow each decision from the first contact to the final re-test.
          Technique-specific guides contain authored procedures; general regional overviews
          introduce concepts and safety considerations but do not substitute for detailed technique training.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/10 px-4 py-2">
            {manualRegions.length} clinical regions
          </span>
          <span className="rounded-full bg-white/10 px-4 py-2">
            {completeRegionalManualApplications.filter(isTechniqueSpecificRegionalApplication).length} technique-specific guides · {completeRegionalManualApplications.filter((item) => !isTechniqueSpecificRegionalApplication(item)).length} general overviews
          </span>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-cyan-100 bg-cyan-50/60 p-6">
        <div className="flex items-start gap-3">
          <Map className="mt-1 h-6 w-6 flex-none text-cyan-700" />
          <div>
            <h2 className="text-xl font-bold text-navy-800">Start with the question, not the technique</h2>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              Imagine the patient and choose one movement that matters. Explore the parent
              technique's clinical story, then open its regional application to see why contact,
              direction and dose might change. The last chapter of every treatment trial is the
              same: re-test that original movement and decide what to do next.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-10">
        {manualRegions.map((region) => {
          const items = completeRegionalManualApplications.filter((item) => item.region === region).sort((a, b) => Number(isTechniqueSpecificRegionalApplication(b)) - Number(isTechniqueSpecificRegionalApplication(a)));
          if (!items.length) return null;

          return (
            <div key={region}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                    Clinical Region
                  </p>
                  <h2 className="text-2xl font-bold text-navy-800">{region}</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <a
                    key={item.slug}
                    href={"/manual-therapy/regions/" + item.slug}
                    className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                  >
                    <Hand className="h-5 w-5 text-violet-600" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-teal-700">
                      {item.techniqueName}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-navy-800">{item.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                        {isTechniqueSpecificRegionalApplication(item) ? "Technique-specific" : "General overview"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy-600">
                      {item.clinicalUse[0]}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-700">
                      {isTechniqueSpecificRegionalApplication(item) ? "Read the detailed clinical guide" : "Explore the regional principles"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
