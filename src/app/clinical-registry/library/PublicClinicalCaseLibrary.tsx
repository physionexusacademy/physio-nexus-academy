import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, BookOpen, FileText, ShieldCheck, Sparkles, UserRoundPlus } from "lucide-react";
import { PublicCasePdfButton } from "./PublicCasePdfButton";

type PublicCase = {
  case_id: string;
  case_title: string;
  condition_label: string;
  age_band: string | null;
  clinical_context: string;
  intervention_summary: string;
  outcome_summary: string;
  evidence_reference: string | null;
  published_at: string;
};

export async function PublicClinicalCaseLibrary() {
  const url = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY;
  const legacyAnonKey = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY;
  const apiKey = publishableKey || legacyAnonKey;

  if (!url || !apiKey) {
    return (
      <main className="min-h-screen bg-[#f5f9fb] px-5 py-16 text-slate-800">
        <section className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Physio Nexus Academy</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#173653]">Clinical Case Library</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">The dedicated Registry service is not configured. This page does not connect to the PNA website database.</p>
        </section>
      </main>
    );
  }

  const registry = createClient(url, apiKey).schema("clinical_api");
  const { data, error } = await registry.rpc("list_public_cases", { p_search: null, p_limit: 50 });
  const cases = (data ?? []) as PublicCase[];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fafc] text-slate-800">
      <div className="relative border-b border-slate-200/80 bg-[radial-gradient(ellipse_at_78%_0%,rgba(32,171,158,0.13),transparent_36%),linear-gradient(135deg,#f1f7fa_0%,#ffffff_54%,#edf7f6_100%)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full border border-teal-900/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-26 h-48 w-48 rounded-full border border-teal-900/[0.06]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-7 sm:px-8 sm:pb-14 sm:pt-9">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#153e5b] text-white shadow-md shadow-slate-900/10"><BookOpen size={19} /></span>
              <span><span className="block text-[10px] font-extrabold uppercase tracking-[.2em] text-teal-700">Physio Nexus Academy</span><span className="mt-0.5 block text-sm font-bold text-[#173653]">Clinical Case Library</span></span>
            </Link>
            <Link href="/clinical-registry/therapist" className="group inline-flex items-center gap-2 rounded-full bg-[#153e5b] px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-[#153e5b]/20 transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
              <UserRoundPlus size={15} /> Therapist Portal <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </header>

          <div className="mt-12 grid items-end gap-9 md:mt-16 md:grid-cols-[1.25fr_.75fr] md:gap-14">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-teal-700"><Sparkles size={13}/> Learn from real clinical practice</p>
              <h1 className="mt-4 text-[2.55rem] font-extrabold leading-[1.08] tracking-[-.045em] text-[#153b58] sm:text-5xl lg:text-[3.55rem]">Clinical thinking.<br/><span className="text-teal-700">Shared knowledge.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">Explore reviewed, de-identified physiotherapy case reports. See how clinical presentations are assessed, managed and followed up — with learning grounded in real-world practice.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/clinical-registry/therapist" className="group inline-flex items-center gap-2 rounded-full bg-[#087f79] px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#066963] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"><UserRoundPlus size={16}/> Join the Registry <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></Link>
                <a href="#published-cases" className="inline-flex items-center gap-2 rounded-full border border-[#153e5b]/15 bg-white/80 px-5 py-3.5 text-xs font-bold text-[#153e5b] transition hover:border-teal-600 hover:text-teal-800">Browse published cases <ArrowRight size={15}/></a>
              </div>
            </div>
            <aside className="relative max-w-sm border-l border-teal-800/15 pl-6 md:mb-2 md:justify-self-end">
              <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-teal-700">The PNA approach</p>
              <div className="mt-5 space-y-5">
                <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={18}/><div><p className="text-sm font-bold text-[#173653]">Reviewed before publication</p><p className="mt-1 text-xs leading-5 text-slate-500">Cases are checked through an independent review process.</p></div></div>
                <div className="flex gap-3"><FileText className="mt-0.5 shrink-0 text-teal-700" size={18}/><div><p className="text-sm font-bold text-[#173653]">Patient identity protected</p><p className="mt-1 text-xs leading-5 text-slate-500">Only de-identified information approved for sharing is displayed.</p></div></div>
                <div className="flex gap-3"><BookOpen className="mt-0.5 shrink-0 text-teal-700" size={18}/><div><p className="text-sm font-bold text-[#173653]">Built for clinical learning</p><p className="mt-1 text-xs leading-5 text-slate-500">Focus on presentation, management and reported outcomes.</p></div></div>
              </div>
            </aside>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-200/80 pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500 sm:mt-14">
            <span><span className="mr-2 text-teal-700">01</span> Open educational access</span>
            <span><span className="mr-2 text-teal-700">02</span> De-identified case summaries</span>
            <span><span className="mr-2 text-teal-700">03</span> Independent review</span>
          </div>
        </div>
      </div>

      <section aria-labelledby="therapist-invitation" className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-teal-900/10 bg-[linear-gradient(112deg,#123b58_0%,#15566a_58%,#087f79_100%)] px-6 py-7 text-white shadow-xl shadow-slate-900/[0.08] sm:px-9 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10"/>
          <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10"/>
          <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-teal-100"><UserRoundPlus size={13}/> For physiotherapists</p>
              <h2 id="therapist-invitation" className="mt-3 text-2xl font-extrabold leading-tight tracking-[-.025em] sm:text-3xl">Your clinical experience belongs in the conversation.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">Create your therapist account, submit a de-identified case for independent review, and contribute to a growing professional learning library.</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-white/85">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14}/> Reviewed submissions</span>
                <span className="inline-flex items-center gap-1.5"><BookOpen size={14}/> Professional learning</span>
                <span className="inline-flex items-center gap-1.5"><FileText size={14}/> Share clinical insights</span>
              </div>
            </div>
            <div className="relative flex flex-col items-start gap-2 md:items-end">
              <Link href="/clinical-registry/therapist" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#153e5b] shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-800">Enter Therapist Portal <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></Link>
              <span className="text-[10px] font-medium text-white/65">Sign in or create your free account</span>
            </div>
          </div>
        </div>
      </section>

      <section id="published-cases" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-teal-700">Explore the library</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#173653] sm:text-3xl">Published case reports</h2>
            <p className="mt-2 text-sm text-slate-500">Clinical experiences shared for education and professional development.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{error ? "Library status" : `${cases.length} ${cases.length === 1 ? "published case" : "published cases"}`}</span>
        </div>

        {error ? (
          <div className="border-y border-red-200 py-6 text-sm text-red-700">The public case library is temporarily unavailable. Please try again later.</div>
        ) : cases.length === 0 ? (
          <div className="relative overflow-hidden border-y border-slate-200 py-10 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 text-teal-900/[0.045] sm:block"><BookOpen size={170} strokeWidth={1}/></div>
            <div className="relative max-w-xl">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><BookOpen size={21}/></span>
              <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.18em] text-teal-700">A new learning space</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#173653] sm:text-2xl">The first case stories are on their way.</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">No cases have been approved for public release yet. Once a case completes review and publication checks, it will appear here for the physiotherapy community to explore.</p>
              <Link href="/clinical-registry/therapist" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-teal-800 underline decoration-teal-300 underline-offset-4 transition hover:text-[#153e5b]">Are you a physiotherapist? Submit a case for review <ArrowRight size={15}/></Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {cases.map((item, index) => {
              const safeEvidence = item.evidence_reference?.startsWith("https://") ? item.evidence_reference : null;
              return (
                <article key={item.case_id} className="py-7 sm:py-9">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-teal-700">Case {String(index + 1).padStart(2, "0")} <span className="mx-1.5 text-slate-300">/</span> Published case report</p>
                      <h3 className="mt-2 text-xl font-extrabold leading-snug text-[#173653] sm:text-2xl">{item.case_title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span className="font-semibold text-teal-800">{item.condition_label}</span><span aria-hidden="true">•</span><span>{item.age_band ?? "Age not reported"}</span><span aria-hidden="true">•</span><time dateTime={item.published_at}>Published {new Date(item.published_at).toLocaleDateString()}</time></div>
                    </div>
                    <PublicCasePdfButton item={item}/>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <section><h4 className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">01 · Presentation</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.clinical_context}</p></section>
                    <section><h4 className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">02 · Management</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.intervention_summary}</p></section>
                    <section><h4 className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">03 · Outcomes</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.outcome_summary}</p></section>
                  </div>
                  {safeEvidence && <a href={safeEvidence} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 underline underline-offset-4">Open evidence reference <ArrowUpRight size={13}/></a>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <p className="max-w-2xl text-[10px] leading-5 text-slate-400">For education only. Published cases are reviewed, de-identified summaries and are not a substitute for individual clinical assessment.</p>
          <Link href="/clinical-registry/therapist" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#173653] transition hover:text-teal-800">Therapist Portal <ArrowUpRight size={14}/></Link>
        </div>
      </footer>
    </main>
  );
}
