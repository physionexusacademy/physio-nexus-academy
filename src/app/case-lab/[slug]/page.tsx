import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Route,
  Stethoscope,
} from "lucide-react";
import { clinicalCases, getClinicalCase } from "@/lib/clinical-cases";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return clinicalCases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getClinicalCase(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: siteUrl + "/case-lab/" + item.slug },
  };
}

export default async function ClinicalCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getClinicalCase(slug);
  if (!item) notFound();

  return (
    <article className="container-content section-padding">
      <Link
        href="/case-lab"
        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clinical Case Lab
      </Link>

      <header className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-navy-800 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {item.specialty}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {item.difficulty}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {item.estimatedTime}
          </span>
        </div>
        <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">
          {item.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-indigo-50">
          {item.summary}
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-violet-100">
          {item.caseType}
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-4xl space-y-8">
        <section className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-sky-700" />
            <h2 className="text-2xl font-bold text-navy-800">Case Presentation</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {item.presentation.map((line) => (
              <li key={line} className="flex gap-3 text-navy-700">
                <span className="mt-2 h-2 w-2 flex-none rounded-full bg-sky-500" />
                <span className="leading-7">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <h2 className="text-2xl font-bold text-navy-800">Key Findings</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {item.keyFindings.map((finding) => (
              <div key={finding} className="rounded-2xl border border-grey-200 bg-white p-4 text-sm leading-6 text-navy-600 shadow-sm">
                {finding}
              </div>
            ))}
          </div>
        </section>

        {item.redFlags?.length ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-700" />
              <h2 className="text-2xl font-bold text-rose-900">Red Flags</h2>
            </div>
            <ul className="mt-4 space-y-2 text-rose-900">
              {item.redFlags.map((flag) => (
                <li key={flag} className="flex gap-2 leading-7">
                  <span>•</span><span>{flag}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-violet-700" />
            <h2 className="text-2xl font-bold text-navy-800">Differential Diagnosis</h2>
          </div>
          <div className="mt-5 space-y-4">
            {item.differentials.map((diff, index) => (
              <div key={diff.diagnosis} className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
                  Differential {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-bold text-navy-800">{diff.diagnosis}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-600">{diff.reasoning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-navy-800 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Working / Final Diagnosis</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{item.finalDiagnosis}</h2>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-indigo-700" />
            <h2 className="text-2xl font-bold text-navy-800">Why This Diagnosis?</h2>
          </div>
          <div className="mt-5 space-y-3">
            {item.reasoning.map((point, index) => (
              <div key={point} className="flex gap-4 rounded-2xl border border-grey-200 bg-white p-5 shadow-sm">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {index + 1}
                </span>
                <p className="leading-7 text-navy-600">{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-emerald-700" />
            <h2 className="text-2xl font-bold text-navy-800">Management / Treatment Plan</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {item.management.map((step) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                <p className="text-sm leading-6 text-navy-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {item.progression?.length ? (
          <section>
            <h2 className="text-2xl font-bold text-navy-800">Progression</h2>
            <ul className="mt-4 space-y-3">
              {item.progression.map((step) => (
                <li key={step} className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-navy-700">
                  {step}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
          <h2 className="text-2xl font-bold text-navy-800">Clinical Takeaways</h2>
          <ul className="mt-4 space-y-3">
            {item.learningPoints.map((point) => (
              <li key={point} className="flex gap-3 text-navy-700">
                <BookOpenCheck className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <span className="leading-7">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-grey-200 bg-grey-50 p-6">
          <h2 className="text-xl font-bold text-navy-800">Evidence Sources</h2>
          <div className="mt-4 space-y-3">
            {item.references.map((reference) => (
              <a
                key={reference.url}
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-navy-800">{reference.title}</p>
                  <p className="mt-1 text-navy-500">
                    {reference.organization}{reference.year ? " · " + reference.year : ""}
                  </p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 flex-none text-teal-600" />
              </a>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-grey-200 bg-white p-5 text-sm leading-6 text-navy-500">
          Educational case only. It does not replace patient-specific examination, local referral pathways,
          professional scope-of-practice requirements or emergency medical assessment.
        </aside>
      </div>
    </article>
  );
}
