import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildReviewPack, type PackMessage } from "@/lib/rehabverse/ai/review-pack";
import { getAiPilot } from "@/lib/rehabverse/api";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { SignoffForm } from "@/components/rehabverse/admin/SignoffForm";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const DECISION: Record<string, string> = { approved: "Approved", approved_with_changes: "Approved with changes", not_approved: "Not approved" };

function Part({ id, title, children, open }: { id: string; title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details id={id} open={open} className="rounded-2xl border border-slate-200 bg-white shadow-sm print:open" data-review-part={id}>
      <summary className="cursor-pointer px-4 py-3 font-heading text-base font-bold text-navy-800">{title}</summary>
      <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-[13.5px] leading-6 text-slate-700">{children}</div>
    </details>
  );
}

const Conversation = ({ messages }: { messages: PackMessage[] }) => (
  <div className="space-y-1.5">
    {messages.map((m, i) => (
      <p key={i} className={"max-w-[95%] whitespace-pre-line rounded-xl px-3 py-2 text-[13px] leading-6 " + (m.role === "patient" ? "ml-auto bg-slate-100 text-slate-800" : "border border-teal-100 bg-teal-50/60 text-slate-800")}>
        <b className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{m.role === "patient" ? "Patient (written for this sample)" : "Assistant"}</b>{m.text}
      </p>
    ))}
  </div>
);

/** The review pack and sign-off form (/admin/rehabverse/ai-pilot?view=review). */
export async function ReviewView() {
  await requireAdmin();
  const [pack, pilot] = await Promise.all([buildReviewPack(), getAiPilot()]);
  const last = pilot.signoffs[0];
  const stopCount = (column: "intake" | "coach" | "checkin") => pack.probes.filter((p) => p[column].startsWith("STOPS")).length;

  return (
    <div className="space-y-4" data-ai-review-page data-pack-version={pack.version}>
      <div>
        <Link href="/admin/rehabverse/ai-pilot" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> AI pilot</Link>
        <p className="rv-h mt-2">PNA RehabVerse</p>
        <h1 className="font-heading text-2xl font-bold text-navy-800">AI review pack</h1>
        <p className="max-w-3xl text-[13.5px] text-slate-600">
          Everything the three AI assistants say and are told, built from the code that is live right now, so it cannot drift from what patients see. Version <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{pack.version}</code>: any change to a prompt, a sentence, a rule or a sample changes this number, and a sign-off always names the version it covers.
          Sample conversations are run <b>without</b> the AI model, so they show the prepared wording that carries a conversation when the model is unavailable; to hear the real models, use the self-tests on the AI pilot page.
        </p>
        {last ? <p className="mt-1 text-[13px] text-slate-600">Latest sign-off: <b>{DECISION[last.decision]}</b> by {last.reviewer_name} on {dt(last.created_at)} for version <code>{last.pack_version}</code> {last.pack_version === pack.version ? "(this version)" : "(an earlier version: please review again)"}.</p> : <p className="mt-1 text-[13px] text-amber-800">No sign-off recorded yet.</p>}
      </div>

      <SignoffForm version={pack.version} />

      <Part id="notices" title="1. What the patient is told before talking to an assistant" open>
        {pack.notices.map((n) => (
          <div key={n.assistant} className="rounded-xl border border-slate-200 p-3">
            <p className="font-bold text-navy-800">{n.assistant}</p>
            {n.badge ? <p className="text-[12.5px] italic text-slate-600">Badge: {n.badge.en} / {n.badge.ru}</p> : null}
            <ul className="mt-1 space-y-2">
              {n.items.map((item, i) => (
                <li key={i}><span className="rv-chip mr-1 text-[11px]">{item.icon === "alert" ? "emergency line" : "statement"}</span>{item.en}<br /><span className="text-slate-500">{item.ru}</span></li>
              ))}
            </ul>
          </div>
        ))}
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-950">Please check in particular the sentence about research use (&ldquo;may be used, without your name, to study how AI can help in physiotherapy&rdquo;) against your ethics approval, and that patients can always choose the normal form.</p>
      </Part>

      <Part id="safety" title={`2. Safety: what stops each assistant (${pack.probes.length} sample sentences)`}>
        <p>Each sentence is put through the three safety screens exactly as a patient&apos;s message would be, before any AI model is consulted. &ldquo;STOPS&rdquo; means the assistant stops, tells the patient what to do, and tells you. Please read the table and note any sentence that should stop an assistant and does not, or the other way round.</p>
        <p className="text-[12.5px] text-slate-500">Sentences that stop: intake {stopCount("intake")}, coach {stopCount("coach")}, check-in {stopCount("checkin")}. The intake assistant stops only for emergencies (it is collecting a history); the coach and check-in assistants also stop for problems during or after exercise.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-[12.5px]" data-review-probes>
            <thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="py-1 pr-3">Patient writes</th><th className="pr-3">Intake</th><th className="pr-3">Coach</th><th>Check-in</th></tr></thead>
            <tbody>
              {pack.probes.map((p) => (
                <tr key={p.phrase} className="border-t border-slate-100 align-top">
                  <td className="py-1.5 pr-3 font-medium text-navy-800">{p.phrase}</td>
                  {[p.intake, p.coach, p.checkin].map((v, i) => <td key={i} className={"pr-3 " + (v.startsWith("STOPS") ? "font-bold text-rose-800" : "text-slate-500")}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-bold text-navy-800">What the patient is told when an assistant stops</p>
        {pack.alerts.filter((a, i, all) => all.findIndex((x) => x.en === a.en) === i).map((a) => (
          <div key={a.kind} className="rounded-xl border border-slate-200 p-3">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">{a.kind} ({a.level})</p>
            <p>{a.en}</p><p className="text-slate-500">{a.ru}</p>
          </div>
        ))}
      </Part>

      <Part id="conversations" title="3. Sample conversations (prepared wording, no AI model)">
        {pack.conversations.map((c) => (
          <div key={`${c.assistant}-${c.title}`} className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 font-bold text-navy-800">{c.assistant}: {c.title}</p>
            <Conversation messages={c.messages} />
          </div>
        ))}
      </Part>

      <Part id="wording" title="4. All fixed wording, English and Roman Urdu">
        {pack.wording.map((group) => (
          <div key={group.assistant}>
            <p className="font-bold text-navy-800">{group.assistant}</p>
            <ul className="mt-1 space-y-2">
              {group.items.map((item) => (
                <li key={item.label} className="rounded-xl border border-slate-100 p-2.5"><span className="text-[11.5px] font-extrabold uppercase tracking-wide text-slate-500">{item.label}</span><br />{item.en}<br /><span className="text-slate-500">{item.ru}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </Part>

      <Part id="prompts" title="5. The instructions sent to the AI model">
        <p>These are the exact instructions the model receives (with an example of the patient-specific part). The patient&apos;s name, phone, e-mail and any identifier are never sent to the model.</p>
        {pack.prompts.map((p) => (
          <div key={`${p.assistant}-${p.lang}`} className="rounded-xl border border-slate-200 p-3">
            <p className="font-bold text-navy-800">{p.assistant} ({p.lang === "ru" ? "Roman Urdu patient" : "English patient"})</p>
            <p className="text-[12.5px] text-slate-500">{p.note}</p>
            <pre className="mt-2 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[12px] leading-5 text-slate-800">{p.text}</pre>
          </div>
        ))}
      </Part>

      <Part id="guards" title="6. What a model reply must pass before the patient sees it">
        {pack.guardRules.map((g) => (
          <div key={g.assistant} className="rounded-xl border border-slate-200 p-3">
            <p className="font-bold text-navy-800">{g.assistant}</p>
            <p className="text-[12.5px] text-slate-500">{g.what}</p>
            <ul className="mt-1 list-disc pl-5">{g.reasons.map((r) => <li key={r}>No: {r}</li>)}</ul>
          </div>
        ))}
      </Part>
    </div>
  );
}
