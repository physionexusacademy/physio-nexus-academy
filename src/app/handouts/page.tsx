import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { handouts } from "@/lib/handouts";

const url = "https://physionexusacademy.com/handouts";

export const metadata: Metadata = {
  title: "Printable Patient Handouts | English and Roman Urdu",
  description:
    "Free printable patient handouts in English and Roman Urdu: back pain, knee arthritis, joint replacement, falls, pelvic floor, carpal tunnel, ankle and neck.",
  alternates: { canonical: url },
  openGraph: { title: "Printable Patient Handouts | Physio Nexus Academy", description: "Simple exercise and advice sheets in English and Roman Urdu, ready to print.", url, siteName: "Physio Nexus Academy", type: "website" },
  robots: { index: true, follow: true },
};

export default function HandoutsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">For patients and clinicians</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-800 sm:text-4xl">Printable patient handouts</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Simple exercise and advice sheets in English and Roman Urdu, with the warning signs on every page. Open one, choose the language, and print it or save it as a PDF.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {handouts.map((h) => (
          <li key={h.slug}>
            <Link href={`/handouts/${h.slug}`} className="group nx-holo flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white"><FileText className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-3 text-lg font-bold text-navy-800 group-hover:text-teal-800">{h.title.en}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{h.forWhom.en}</p>
              <p className="mt-1 text-sm text-slate-500" lang="ur-Latn">{h.title.ur}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-700">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-slate-500">These sheets are general advice. Your physiotherapist or doctor&apos;s advice for you always comes first.</p>
    </main>
  );
}
