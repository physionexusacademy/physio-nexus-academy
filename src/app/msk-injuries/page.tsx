import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Bone,
  Brain,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";
import { mskConditionIndex, mskRegions } from "@/lib/msk-injury-index";
import { mskSpecialTests } from "@/lib/msk-special-tests";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "MSK Clinical Injury & Rehabilitation Hub",
  description:
    "Whole-body musculoskeletal injury and condition library with diagnostic tests, exact test performance, positive signs, differential diagnosis and phased physiotherapy rehabilitation.",
  keywords: ["MSK physiotherapy", "musculoskeletal injuries", "physiotherapy rehabilitation", "orthopaedic special tests", "differential diagnosis physiotherapy", "sports injury rehabilitation"],
  openGraph: {
    title: "MSK Injury & Rehabilitation Hub | Physio Nexus Academy",
    description: "Explore musculoskeletal conditions, examination tests, differential screening and phased physiotherapy rehabilitation.",
    url: "https://physionexusacademy.com/msk-injuries",
    siteName: "Physio Nexus Academy",
    type: "website",
  },
  alternates: { canonical: "https://physionexusacademy.com/msk-injuries" },
};

const categoryIcons: Record<string, typeof Activity> = {
  "Sprain / Ligament": ShieldCheck,
  "Sprain / Tear": ShieldCheck,
  "Strain / Muscle": Dumbbell,
  "Rupture / Tendon": Activity,
  "Tendinopathy / Impingement": Activity,
  "Tear / Rupture": Activity,
  "Instability / Subluxation": Bone,
  "Impingement / Joint": Bone,
  "Arthritis / Degenerative": Bone,
  "Nerve / Compression": Brain,
  "Tendinopathy / Overuse": Dumbbell,
  "Meniscus / Cartilage": Bone,
};

export default function MSKInjuryHubPage() {
  return (
    <div className="container-content section-padding">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">PNA MSK Clinical Library</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          MSK Clinical Injury & Rehabilitation
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">
          Browse condition-specific assessment and evidence-informed rehabilitation guides by body region.
        </p>
      </header>

      <section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Explore MSK special tests">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Practical Examination Skills</p>
          <h2 className="mt-2 text-xl font-bold text-navy-900">MSK Special Tests Library</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">{mskSpecialTests.length} tests with exact patient setup, step-by-step applying method, positive signs and clinical purpose.</p>
        </div>
        <a href="/msk-special-tests" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">Explore Special Tests <ArrowRight className="h-4 w-4"/></a>
      </section>

      <section className="mt-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-700">Browse by Region</p>
          <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">Whole-body clinical library</h2>
        </div>
        <div className="mt-7 space-y-9">
          {mskRegions.map((region) => {
            const items = mskConditionIndex.filter((item) => item.region === region);
            return (
              <div key={region}>
                <h3 className="text-xl font-bold text-navy-800">{region}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const Icon = categoryIcons[item.category] ?? Activity;
                    return (
                      <a
                        key={item.slug}
                        href={"/msk-injuries/" + item.slug}
                        className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Icon className="h-5 w-5 text-orange-600" />
                          <span className="rounded-full bg-grey-100 px-2.5 py-1 text-[11px] font-bold text-navy-600">
                            {item.evidenceLevel} evidence
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-orange-700">{item.category}</p>
                        <h4 className="mt-1 text-lg font-bold text-navy-800">{item.name}</h4>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">{item.summary}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-700">
                          Open clinical guide
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-bold text-navy-800">Clinical safety note</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          These guides are educational. Special tests do not diagnose a condition in isolation.
          Mechanism, history, neurologic/vascular screening, red flags, examination findings and
          appropriate imaging or referral must be integrated before treatment.
        </p>
      </section>
    </div>
  );
}
