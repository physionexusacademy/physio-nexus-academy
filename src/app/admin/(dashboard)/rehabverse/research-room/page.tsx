import Link from "next/link";
import { FlaskConical, ShieldAlert } from "lucide-react";
import { getStudyLog, getStudyOverview, getStudyQueue } from "@/lib/rehabverse/api";
import { AssessorPanel } from "@/components/rehabverse/research-room/AssessorPanel";
import { EnrolPanel } from "@/components/rehabverse/research-room/EnrolPanel";
import { FlowPanel } from "@/components/rehabverse/research-room/FlowPanel";
import { SequencePanel } from "@/components/rehabverse/research-room/SequencePanel";
import { StudySetup } from "@/components/rehabverse/research-room/StudySetup";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — Research Room" };

export default async function ResearchRoom() {
  await requireAdmin();
  const [overview, queue, log] = await Promise.all([
    getStudyOverview().catch(() => null), // null until the Research Room migration has been applied
    getStudyQueue().catch(() => null),
    getStudyLog().catch(() => null),
  ]);
  if (!overview) {
    return (
      <div className="space-y-3">
        <Link href="/admin/rehabverse" className="text-[13px] font-bold text-teal-700 hover:underline">← Inbox</Link>
        <h1 className="font-heading text-2xl font-bold text-navy-800">Research Room</h1>
        <p className="rv-error">The Research Room database tables are not set up yet. They are added by a database migration that you approve first.</p>
      </div>
    );
  }
  const study = overview.study;
  const recruiting = study?.status === "recruiting";
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/rehabverse" className="text-[13px] font-bold text-teal-700 hover:underline">← Inbox</Link>
        <p className="rv-h mt-2">PNA RehabVerse</p>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-navy-800"><FlaskConical className="h-6 w-6 text-teal-600" aria-hidden="true" /> Research Room</h1>
        <p className="text-[13.5px] text-slate-600">Run the randomised trial here: set up the study, keep the allocation list hidden, screen and enrol people, and follow recruitment. The <Link href="/admin/rehabverse/research" className="font-bold text-teal-700 underline">research record</Link> holds the de-identified data.</p>
      </div>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13.5px] leading-6 text-amber-950" role="note">
        <p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" /> Recruiting cannot start until the ethics approval number and date, the consent version and the allocation list are recorded.</p>
        <p className="mt-1">Nothing here is approved by an ethics committee. Existing patients are never randomised or changed. While a study is recruiting, new accounts are approved by enrolment, and a participant&apos;s AI setting follows the allocation and cannot be changed by hand.</p>
      </section>

      <StudySetup key={study ? `${study.id}-${study.status}-${study.sequence_source}` : "new"} overview={overview} />
      {study ? <SequencePanel key={`l-${study.sequence_source}-${overview.list?.length}`} overview={overview} /> : null}
      {recruiting && queue && study?.consent_version ? <EnrolPanel waiting={queue.waiting} config={study.config} consentVersion={study.consent_version} /> : null}
      {study ? <FlowPanel overview={overview} log={log} /> : null}
      {study ? <AssessorPanel /> : null}
    </div>
  );
}
