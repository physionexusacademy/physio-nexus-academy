import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Clinical Case Library | Physio Nexus Academy",
  description: "Reviewed, de-identified clinical case summaries for physiotherapy learning.",
  robots: { index: true, follow: true },
};

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

export default async function PublicClinicalCaseLibraryPage() {
  const url = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-bold text-[#173653]">Public Clinical Case Library</h1><p className="mt-3 text-sm leading-6 text-slate-600">The dedicated Registry service is not configured. This page does not connect to the PNA website database.</p></section></main>;
  }

  const registry = createClient(url, anonKey).schema("clinical_api");
  const { data, error } = await registry.rpc("list_public_cases", { p_search: null, p_limit: 50 });
  const cases = (data ?? []) as PublicCase[];

  return <main className="min-h-screen bg-[#f5f8fb] px-4 py-8 text-slate-800 sm:px-6">
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-700">Physio Nexus Academy</p>
        <h1 className="mt-2 text-3xl font-bold text-[#173653]">Public Clinical Case Library</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Educational case summaries that have been de-identified, separately consented for publication and independently reviewed. No patient identifiers or therapist account details are displayed.</p>
        <Link href="/clinical-registry" className="mt-4 inline-block text-xs font-bold text-teal-700 underline">Therapist Registry sign in</Link>
      </header>
      {error ? <section className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700">The public case library is temporarily unavailable. Please try again later.</section> : <div className="space-y-4">
        {cases.map((item) => {
          const safeEvidence = item.evidence_reference && (item.evidence_reference.startsWith("https://") || item.evidence_reference.startsWith("http://")) ? item.evidence_reference : null;
          return <article key={item.case_id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-bold text-[#173653]">{item.case_title}</h2><p className="mt-1 text-xs text-teal-700">{item.condition_label} · {item.age_band ?? "Age not reported"}</p></div><time className="text-[10px] text-slate-400" dateTime={item.published_at}>Published {new Date(item.published_at).toLocaleDateString()}</time></div>
            <section className="mt-4"><h3 className="text-xs font-bold text-[#173653]">Clinical context</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.clinical_context}</p></section>
            <section className="mt-4"><h3 className="text-xs font-bold text-[#173653]">Intervention</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.intervention_summary}</p></section>
            <section className="mt-4"><h3 className="text-xs font-bold text-[#173653]">Outcome</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.outcome_summary}</p></section>
            {safeEvidence && <a href={safeEvidence} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-semibold text-teal-700 underline">Open evidence reference</a>}
          </article>;
        })}
        {cases.length === 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No cases have been approved and published yet.</section>}
      </div>}
      <footer className="mt-8 border-t border-slate-200 pt-4 text-[10px] leading-5 text-slate-400">For education only. Published cases are reviewed de-identified summaries and are not a substitute for individual clinical assessment.</footer>
    </div>
  </main>;
}
