import type { Metadata } from "next";
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
  Eye,
  Clapperboard,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { mskCategories, mskConditionIndex, mskRegions } from "@/lib/msk-injury-index";
import { atlasPublished } from "@/lib/clinical-visual-atlas";

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
          <span className="rounded-full bg-white/10 px-4 py-2">{mskConditionIndex.length} complete master conditions</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{mskRegions.length} body regions</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{mskCategories.length} pathology groups</span>
          <span className="rounded-full bg-white/10 px-4 py-2">Evidence-informed rehabilitation</span>
        </div>
        {atlasPublished ? (
          <a
            href="/clinical-visual-atlas"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 shadow-sm transition hover:-translate-y-0.5"
          >
            <Eye className="h-4 w-4 text-cyan-700" />
            Explore 3D Clinical Visual Atlas
          </a>
        ) : null}
      </section>

      <section data-pna-msk-story-library="v1" className="mt-8 overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/70 to-indigo-50/70 p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
          <Clapperboard className="h-5 w-5" aria-hidden="true" />
          New · MSK stories you can almost see happening
        </div>
        <h2 className="mt-3 max-w-3xl font-serif text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          Real clinical reasoning. Fictional patients. Zero boring textbook openings.
        </h2>
        <p className="mt-4 max-w-4xl text-[15px] leading-7 text-navy-700">
          Every condition now begins inside the clinic, where a patient arrives with clues and a
          perfectly human misconception. Read the scene, discover the diagnostic twist, meet the Aha Moment,
          then make your own call in a three-choice clinical challenge. Humor helps the lesson stick;
          clinical safety and the full original examination and rehabilitation protocols stay front and center.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clapperboard, title: "Enter the scene", text: "A distinct patient story for each condition." },
            { icon: Lightbulb, title: "Catch the twist", text: "Memorable clinical insights, never one-test diagnoses." },
            { icon: Sparkles, title: "Pick your lens", text: "Simple patient language or deeper clinician reasoning, plus a mini challenge." },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-white bg-white/80 p-4">
                <Icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-bold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/msk-injuries/cervical-radiculopathy#msk-clinical-story" className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900">
            Start a neck-and-arm mystery
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/msk-injuries/acl-injury#msk-clinical-story" className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-900 transition hover:bg-teal-50">
            Meet the ACL plot twist
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
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
