import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ClipboardList, SearchCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { mskSpecialTests, mskTestCounts } from "@/lib/msk-special-tests";
import { TestExplorer } from "@/components/msk-special-tests/TestExplorer";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "MSK Special Tests | Applying Method, Purpose & Positive Signs",
  description: "Explore upper-limb, lower-limb, cervical and lumbar physiotherapy special tests. Learn patient positions, therapist hand placement, applying methods, positive findings and interpretation.",
  alternates: { canonical: "https://physionexusacademy.com/msk-special-tests" },
  openGraph: {
    title: "MSK Special Tests Library | Physio Nexus Academy",
    description: "Step-by-step clinical tests for physiotherapy students and clinicians, organized by region with purpose, technique, findings and safety.",
    url: "https://physionexusacademy.com/msk-special-tests",
    type: "website",
  },
};

export default function MSKSpecialTestsPage() {
  const total = mskSpecialTests.length;
  return (
    <div className="min-h-screen bg-[#f8fbfc] text-slate-900">
      <div className="container-content py-9 sm:py-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/knowledge-hub" className="inline-flex items-center gap-1.5 text-teal-800 hover:underline"><ArrowLeft className="h-3.5 w-3.5"/> Knowledge Hub</Link>
          <span aria-hidden="true">/</span><span>MSK Special Tests</span>
        </nav>

        <header className="relative mt-7 overflow-hidden rounded-[28px] border border-[#dce9e8] bg-gradient-to-br from-white via-white to-[#eaf8f5] p-6 shadow-[0_20px_55px_-42px_rgba(9,75,83,0.36)] sm:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-teal-200/40 bg-teal-50/60" aria-hidden="true"/>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/85 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-800">
              <Stethoscope className="h-4 w-4"/> PNA Clinical Skills Library
            </div>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight text-[#102e40] sm:text-5xl">
              MSK Special Tests
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">
              Learn what each test is for, exactly how to apply it, what makes it positive, and what the finding actually means. Clear, practical English for clinical learning, OSCE preparation and supervised practice.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-800">{total} clinical tests</span>
              <span className="rounded-full border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-800">{mskTestCounts.length} body regions</span>
              <span className="rounded-full border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-800">Step-by-step procedures</span>
              <span className="rounded-full border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-800">Positive signs & interpretation</span>
            </div>
          </div>
        </header>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <ClipboardList className="h-5 w-5 text-teal-700"/>
            <h2 className="mt-3 text-sm font-bold text-slate-900">Applying method</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Patient setup, stabilization and three practical performance steps.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SearchCheck className="h-5 w-5 text-teal-700"/>
            <h2 className="mt-3 text-sm font-bold text-slate-900">Purpose & positive sign</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Know what you are testing and what to watch or feel for.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <ShieldCheck className="h-5 w-5 text-teal-700"/>
            <h2 className="mt-3 text-sm font-bold text-slate-900">Clinical reasoning & safety</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Interpret findings carefully and avoid testing when unsafe.</p>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="test-library-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Explore by body region</p><h2 id="test-library-title" className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">Find the test. Learn the technique.</h2></div>
            <Link href="/clinical-arena" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:underline">Practise clinical reasoning <ArrowRight className="h-4 w-4"/></Link>
          </div>
          <TestExplorer tests={mskSpecialTests}/>
        </section>

        <footer className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
          <strong>Clinical education notice:</strong> This is a skills reference for students and qualified clinicians, not a substitute for in-person instruction, validated clinical decision rules or specialist examination. A positive test is not the same as a confirmed diagnosis. Stop when symptoms worsen, assess relevant red flags, and refer promptly where indicated.
        </footer>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
          <Link className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:border-teal-300 hover:text-teal-800" href="/msk-injuries"><BookOpen className="h-4 w-4"/>Explore MSK conditions</Link>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-white hover:bg-teal-800" href="/clinical-arena">Go to Clinical Challenge <ArrowRight className="h-4 w-4"/></Link>
        </div>
      </div>
    </div>
  );
}
