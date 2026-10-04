import Link from "next/link";
import { ArrowRight, BookOpen, Images, Sparkles } from "lucide-react";

export const metadata = {
  title: "Visual Lab | Physio Nexus Academy",
  description:
    "PNA Visual Lab: clinically organized anatomy, pathology and technique visuals for physiotherapy learning.",
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
          A focused visual library for anatomy, pathology and clinical technique learning.
          Manual-therapy images are kept here so the main theory pages remain clean and fast.
        </p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <Link
          href="/clinical-visual-atlas"
          className="group rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Images className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-navy-900">Anatomy & Pathology Atlas</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Explore regional anatomy and condition-focused pathology visuals.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700">
            Open atlas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/visual-lab/manual-therapy"
          className="group rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <BookOpen className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-navy-900">Manual Therapy Visuals</h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Technique-specific textbook-style clinical visuals organized by region and application.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
            Browse techniques <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-navy-700">
        <Sparkles className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
        Real clinical visuals are published only after anatomy, target area and force direction have passed technique-specific review.
      </div>
    </div>
  );
}
