import Link from "next/link";
import { Download, FlaskConical, ShieldAlert } from "lucide-react";
import { getBoard } from "@/lib/rehabverse/api";
import { RESEARCH_NOTE, RESEARCH_TABLES, columnsOf, dictionaryRows, tableTitle } from "@/lib/research/dictionary";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — research record" };

export default async function ResearchRecord() {
  await requireAdmin();
  const board = await getBoard().catch(() => []);
  const consenting = board.filter((r) => r.research_consent).length;
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/rehabverse" className="text-[13px] font-bold text-teal-700 hover:underline">← Inbox</Link>
        <p className="rv-h mt-2">PNA RehabVerse</p>
        <h1 className="font-heading text-2xl font-bold text-navy-800">Research record</h1>
        <p className="text-[13.5px] text-slate-600">De-identified data for the patients who consented to research: the screening they answered, their outcome measures, their daily feedback and safety events.</p>
      </div>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13.5px] leading-6 text-amber-950" role="note">
        <p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" aria-hidden="true" /> Ethics approval has not been recorded for this study.</p>
        <p className="mt-1">Do not use or publish this data as research until the study has ethics approval and the consent wording has been approved. Registration consent is for the service and is not research consent: a patient is included here only after you record, on their record, that research consent was obtained and how.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-navy-800"><FlaskConical className="h-4 w-4 text-teal-600" aria-hidden="true" /> Who is in the record</h2>
        <p className="mt-1 text-[14px] text-slate-700"><b data-testid="consent-count">{consenting}</b> of {board.length} active patients have research consent recorded.</p>
        <p className="mt-1 text-[12.5px] leading-5 text-slate-500">{RESEARCH_NOTE}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-heading text-base font-bold text-navy-800">Download (CSV)</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {RESEARCH_TABLES.map((t) => (
            <a key={t} href={`/admin/rehabverse/research/export/${t}`} className="rv-btn rv-btn-ghost !min-h-[40px]" data-testid={`export-${t}`}><Download className="h-4 w-4" aria-hidden="true" /> {tableTitle(t)}</a>
          ))}
          <a href="/admin/rehabverse/research/export/dictionary" className="rv-btn rv-btn-primary !min-h-[40px]" data-testid="export-dictionary"><Download className="h-4 w-4" aria-hidden="true" /> Data dictionary</a>
        </div>
        <p className="mt-2 text-[12.5px] text-slate-500">Each download is written to the audit log. A cell that starts with = + - or @ is saved with a leading apostrophe so a spreadsheet never runs it.</p>
      </section>

      {RESEARCH_TABLES.map((t) => (
        <section key={t} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-heading text-base font-bold text-navy-800">{tableTitle(t)} <span className="text-[12px] font-semibold text-slate-500">({columnsOf(t).length} columns)</span></h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead><tr className="text-[11px] uppercase tracking-wide text-slate-500"><th className="py-1 pr-3">Column</th><th className="py-1 pr-3">Type</th><th className="py-1">Meaning</th></tr></thead>
              <tbody>{dictionaryRows(t).map(([name, type, description]) => <tr key={name} className="border-t border-slate-100 align-top"><td className="py-1.5 pr-3 font-mono text-[12px] font-bold text-navy-800">{name}</td><td className="py-1.5 pr-3 text-slate-500">{type}</td><td className="py-1.5 text-slate-700">{description}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
