import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Images, MoveRight, ShieldCheck, Target } from "lucide-react";
import {
  completeRegionalManualApplications,
  getRegionalManualApplication,
} from "@/lib/manual-therapy-regional";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import CloudinaryClinicalImage from "@/components/clinical/CloudinaryClinicalImage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return completeRegionalManualApplications
    .filter((item) => !item.slug.endsWith("-") && item.slug !== "guide-")
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) return {};

  return {
    title: item.title + " Visuals | PNA Visual Lab",
    description:
      "Technique-specific clinical visuals for " + item.title + " in the PNA Visual Lab.",
  };
}

export default async function ManualTherapyVisualDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getRegionalManualApplication(slug);
  if (!item) notFound();

  const visuals = getManualTherapyVisuals(item.slug);

  return (
    <div className="container-content section-padding pb-28">
      <Link
        href="/visual-lab/manual-therapy"
        className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Manual Therapy Visual Lab
      </Link>

      <section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-800 via-indigo-900 to-slate-950 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {item.region}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
            {item.techniqueName}
          </span>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
          PNA Technique Visuals
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-indigo-100">
          This page is reserved for the technique’s real textbook-style clinical visuals.
          The original technique theory remains on the clinical guide page.
        </p>
      </section>

      {visuals.length ? (
        <section className="mt-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Clinically reviewed
              </p>
              <h2 className="text-2xl font-bold text-navy-900">Approved visual set</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {visuals.map((visual, index) => (
              <div
                key={visual.id}
                className={index === 0 && visuals.length > 2 ? "lg:col-span-2" : ""}
              >
                <div className="relative">
                  <CloudinaryClinicalImage
                    publicId={visual.path}
                    alt={visual.alt}
                    caption={visual.caption}
                    label={visual.title}
                    eager={index === 0}
                  />
                  <div className="pointer-events-none absolute right-5 top-16 z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-md">
                    <img
                      src="/images/pna-logo.png"
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                    <div className="flex items-center gap-2 text-rose-700">
                      <Target className="h-4 w-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                        Anatomy / target area
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
                      {visual.target}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <div className="flex items-center gap-2 text-cyan-700">
                      <MoveRight className="h-4 w-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                        Force / movement direction
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-navy-800">
                      {visual.force}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Images className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-navy-900">Visual set is in clinical QC</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-navy-600">
            No placeholder or generic graphic is shown here. Real visuals will appear only after
            the anatomy, target/pain area and force direction have been checked for this exact technique.
          </p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={"/manual-therapy/regions/" + item.slug}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-sm"
        >
          Back to technique theory
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/visual-lab/manual-therapy"
          className="rounded-xl border border-grey-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 shadow-sm"
        >
          Browse all technique visuals
        </Link>
      </div>
    </div>
  );
}
