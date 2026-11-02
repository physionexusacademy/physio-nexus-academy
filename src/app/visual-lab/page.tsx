import { ArrowRight, BookOpen, Images, Sparkles } from "lucide-react";

export const metadata = {
  title: "Clinical Visual Lab for Physiotherapy",
  description:
    "Explore organized clinical anatomy, pathology and manual therapy visuals designed to support physiotherapy learning, examination skills and clinical reasoning.",
  keywords: ["physiotherapy clinical visuals", "clinical anatomy physiotherapy", "manual therapy visuals", "physiotherapy learning resources"],
  alternates: { canonical: "https://physionexusacademy.com/visual-lab" },
  openGraph: {
    title: "Clinical Visual Lab | Physio Nexus Academy",
    description: "Clinical anatomy, pathology and manual therapy visuals for physiotherapy students and professionals.",
    url: "https://physionexusacademy.com/visual-lab",
    siteName: "Physio Nexus Academy",
    type: "website",
  },
};

export default function VisualLabPage() {
  return (
    <div className="container-content section-padding pb-28">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
          Physio Nexus Academy
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Clinical Visual Lab</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-indigo-100 sm:text-base">
          Manual-therapy technique visuals are kept separate from the existing anatomy atlas
          so the clinical application pages stay clear and easy to navigate.
        </p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <a
          href="/visual-lab/manual-therapy"
          className="group rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-white via-violet-50/40 to-cyan-50/40 p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-black text-violet-700">
              44 techniques
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-navy-900">Manual Therapy Visuals</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Technique-specific real-anatomy plates with the exact target area and force or movement direction for each manual-therapy application.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
            See Technique Visuals
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </a>

        <a
          href="/clinical-visual-atlas"
          className="group rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Images className="h-6 w-6" />
            </span>
            <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
              Existing 21 visuals
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-navy-900">Anatomy & Pathology Atlas</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            The original regional anatomy and pathology library. This is separate from the new manual-therapy technique visuals.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700">
            Open existing atlas
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </a>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-navy-700">
        <Sparkles className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
        Manual-therapy visuals use real PNA anatomy sources with technique-specific target markers and movement vectors; the old 21 atlas images are not shown as raw manual-therapy entries.
      </div>
    </div>
  );
}
