import Link from "next/link";
import { AlertTriangle, Bell, ClipboardList, Users } from "lucide-react";
import { getInbox } from "@/lib/rehabverse/api";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { MarkRead } from "./MarkRead";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — clinician inbox" };

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const LEVEL = { emergency: "rv-chip-rose", urgent: "rv-chip-amber", none: "" } as const;

function Card({ title, count, children, tone }: { title: string; count: number; children: React.ReactNode; tone?: "alert" }) {
  return (
    <section className={"rounded-2xl border bg-white p-4 shadow-sm " + (tone === "alert" && count ? "border-rose-300" : "border-slate-200")}>
      <h2 className="flex items-center justify-between gap-2 font-heading text-base font-bold text-navy-800">{title}<span className={"rv-chip " + (count ? (tone === "alert" ? "rv-chip-rose" : "rv-chip-teal") : "")}>{count}</span></h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function RehabVerseInbox() {
  await requireAdmin();
  const inbox = await getInbox();
  const flagged = inbox.assessments.filter((a) => a.red_flag_level !== "none");
  const toReview = inbox.assessments.filter((a) => a.red_flag_level === "none");
  const empty = <p className="text-[13.5px] text-slate-500">Nothing here.</p>;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rv-h">PNA RehabVerse</p>
          <h1 className="font-heading text-2xl font-bold text-navy-800">Clinician inbox</h1>
          <p className="text-[13.5px] text-slate-600">Assessments, feedback awaiting your decision, programmes and safety events.</p>
        </div>
        <Link href="/admin/rehabverse/patients" className="rv-btn rv-btn-ghost !min-h-[40px]"><Users className="h-4 w-4" aria-hidden="true" /> All patients</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Safety: red flags & adverse events" count={flagged.length + inbox.adverse_events.length} tone="alert">
          <ul className="space-y-1.5">
            {flagged.map((a) => (
              <li key={a.id}><Link href={`/admin/rehabverse/patients/${a.patient_id}#assessment`} className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[13.5px] hover:border-rose-400"><span><b>{a.full_name}</b> <span className="text-slate-500">{a.reference_code}</span> — red-flag assessment</span><span className={"rv-chip " + LEVEL[a.red_flag_level]}>{a.red_flag_level}</span></Link></li>
            ))}
            {inbox.adverse_events.map((e) => (
              <li key={e.id}><Link href={`/admin/rehabverse/patients/${e.patient_id}#events`} className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[13.5px] hover:border-rose-400"><span><AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-rose-600" aria-hidden="true" /><b>{e.full_name}</b> <span className="text-slate-500">{e.reference_code}</span> — adverse event ({e.severity})</span><span className="text-[12px] text-slate-500">{dt(e.created_at)}</span></Link></li>
            ))}
            {flagged.length + inbox.adverse_events.length === 0 ? empty : null}
          </ul>
        </Card>

        <Card title="Assessments to review" count={toReview.length}>
          <ul className="space-y-1.5">
            {toReview.map((a) => (
              <li key={a.id}><Link href={`/admin/rehabverse/patients/${a.patient_id}#assessment`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13.5px] hover:border-teal-400"><span><b>{a.full_name}</b> <span className="text-slate-500">{a.reference_code}</span> · NPRS {a.pain_now}</span><span className="text-[12px] text-slate-500">{dt(a.submitted_at)}</span></Link></li>
            ))}
            {toReview.length === 0 ? empty : null}
          </ul>
        </Card>

        <Card title="Feedback awaiting your decision" count={inbox.awaiting_review.length}>
          <ul className="space-y-1.5">
            {inbox.awaiting_review.map((r) => (
              <li key={r.session_id}><Link href={`/admin/rehabverse/patients/${r.patient_id}#days`} className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2 text-[13.5px] hover:border-amber-400"><span><b>{r.full_name}</b> <span className="text-slate-500">{r.reference_code}</span> · Day {r.day_number} · pain after {r.pain_after ?? "–"}/10{r.programme_status !== "active" ? ` · ${r.programme_status}` : ""}</span><span className="text-[12px] text-slate-500">{dt(r.submitted_at)}</span></Link></li>
            ))}
            {inbox.awaiting_review.length === 0 ? empty : null}
          </ul>
        </Card>

        <Card title="Programmes" count={inbox.programmes.length}>
          <ul className="space-y-1.5">
            {inbox.programmes.map((p) => (
              <li key={p.id}><Link href={`/admin/rehabverse/patients/${p.patient_id}#programme`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13.5px] hover:border-teal-400"><span><b>{p.full_name}</b> <span className="text-slate-500">{p.reference_code}</span> · {p.days_done}/{p.days_total} days</span><span className={"rv-chip " + (p.status === "active" ? "rv-chip-teal" : p.status === "paused" ? "rv-chip-amber" : "")}>{p.status}</span></Link></li>
            ))}
            {inbox.programmes.length === 0 ? empty : null}
          </ul>
        </Card>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center justify-between gap-2 font-heading text-base font-bold text-navy-800"><span className="flex items-center gap-2"><Bell className="h-4 w-4 text-teal-600" aria-hidden="true" /> Notifications {inbox.unread_notifications ? <span className="rv-chip rv-chip-rose">{inbox.unread_notifications}</span> : null}</span>{inbox.unread_notifications ? <MarkRead /> : null}</h2>
        <ul className="mt-2 divide-y divide-slate-100">
          {inbox.notifications.map((n) => (
            <li key={n.id} className="py-2 text-[13.5px]">
              <p className="flex items-center gap-2 font-bold text-navy-800">{!n.read_at ? <span className="h-2 w-2 rounded-full bg-teal-500" aria-label="unread" /> : null}{n.link ? <Link href={n.link} className="hover:underline">{n.title}</Link> : n.title}{n.severity === "urgent" ? <span className="rv-chip rv-chip-rose">urgent</span> : null}</p>
              {n.body ? <p className="text-slate-600">{n.body}</p> : null}
              <p className="text-[11px] text-slate-400">{dt(n.created_at)}</p>
            </li>
          ))}
          {inbox.notifications.length === 0 ? <li className="py-2 text-[13.5px] text-slate-500">No notifications.</li> : null}
        </ul>
      </section>
      <p className="flex items-center gap-1.5 text-[12px] text-slate-500"><ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> Patient details are shown only to signed-in clinicians. Alert emails never contain patient information.</p>
    </div>
  );
}
