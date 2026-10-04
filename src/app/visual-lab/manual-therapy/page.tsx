import Link from "next/link";
import { ArrowLeft, ArrowRight, Images } from "lucide-react";
import {
  completeRegionalManualApplications,
  type ManualRegion,
} from "@/lib/manual-therapy-regional";

export const metadata = {
  title: "Manual Therapy Visual Lab | PNA",
  description:
    "Browse PNA manual-therapy technique visuals by region and clinical application.",
};

const regionOrder: ManualRegion[] = [
  "Cervical",
  "Thoracic",
  "Lumbar",
  "Shoulder",
  "Elbow",
  "Wrist & Hand",
  "Hip & Pelvis",
  "Knee",
  "Ankle & Foot",
  "Upper Limb Neural",
  "Lower Limb Neural",
];

export default function ManualTherapyVisualLabPage() {
  const items = completeRegionalManualApplications.filter(
    (item) => !item.slug.endsWith("-") && item.slug !== "guide-"
  );

  return (
    <div className="container-content section-padding pb-28">
      <Link
        href="/visual-lab"
        className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Visual Lab
      </Link>

      <section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-800 via-indigo-900 to-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
          PNA Clinical Visual Lab
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Manual Therapy Visuals</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-indigo-100">
          Real textbook-style visuals live here rather than inside the theory pages.
          Open any technique to see its approved anatomy, target-area and force-direction visuals.
        </p>
      </section>

      <div className="mt-8 space-y-8">
        {regionOrder.map((region) => {
          const regional = items.filter((item) => item.region === region);
          if (!regional.length) return null;

          return (
            <section key={region}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                    Region
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy-900">{region}</h2>
                </div>
                <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                  {regional.length} techniques
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {regional.map((item) => (
                  <Link
                    key={item.slug}
                    href={"/visual-lab/manual-therapy/" + item.slug}
                    className="group rounded-3xl border border-grey-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                      <Images className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                      {item.techniqueName}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-6 text-navy-900">
                      {item.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
                      See Technique Visuals
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
