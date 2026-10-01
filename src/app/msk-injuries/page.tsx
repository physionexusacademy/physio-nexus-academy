import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bone,
  Brain,
  Dumbbell,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { mskCategories, mskConditions, mskRegions } from "@/lib/msk-injury-hub";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "MSK Clinical Injury & Rehabilitation Hub",
  description:
    "Whole-body musculoskeletal injury and condition library with diagnostic tests, exact test performance, positive signs, differential diagnosis and phased physiotherapy rehabilitation.",
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
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-orange-600 to-navy-900 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-100">
          PNA MSK Clinical Library
        </p>
        <h1 className="mt-3 max-w-5xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          MSK Clinical Injury & Rehabilitation Hub
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-orange-50 sm:text-lg">
          Whole-body sprains, strains, ruptures, impingement syndromes, arthritis,
          tendon disorders, instability and nerve-compression conditions — with
          test performance, positive signs, differential diagnosis and complete
          phased rehabilitation.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-white/10 px-4 py-2">{mskConditions.length} complete master conditions</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{mskRegions.length} body regions</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{mskCategories.length} pathology groups</span>
          <span className="rounded-full bg-white/10 px-4 py-2">Evidence-informed rehabilitation</span>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          { icon: Stethoscope, title: "Diagnose", text: "Mechanism, symptoms, signs, differential screening and investigations." },
          { icon: Search, title: "Perform Tests", text: "Patient position, therapist position, hand placement, procedure and positive sign." },
          { icon: Activity, title: "Treat Properly", text: "Phased exercise, manual therapy, modalities and exact progression criteria." },
          { icon: HeartPulse, title: "Return Safely", text: "Functional criteria, red flags, escalation and return-to-sport/work decisions." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
              <Icon className="h-6 w-6 text-orange-700" />
              <h2 className="mt-3 font-bold text-navy-800">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-navy-600">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-700">Browse by Region</p>
          <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">Whole-body clinical library</h2>
        </div>
        <div className="mt-7 space-y-9">
          {mskRegions.map((region) => {
            const items = mskConditions.filter((item) => item.region === region);
            return (
              <div key={region}>
                <h3 className="text-xl font-bold text-navy-800">{region}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const Icon = categoryIcons[item.category] ?? Activity;
                    return (
                      <Link
                        key={item.slug}
                        href={"/msk-injuries/" + item.slug}
                        prefetch={false}
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
                      </Link>
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
