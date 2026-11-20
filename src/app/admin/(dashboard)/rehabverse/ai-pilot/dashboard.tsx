import Link from "next/link";
import { ArrowLeft, ClipboardCheck, FlaskConical, Sparkles } from "lucide-react";
import { buildReviewPack } from "@/lib/rehabverse/ai/review-pack";
import { getAiPilot } from "@/lib/rehabverse/api";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { PilotControls } from "@/components/rehabverse/admin/PilotControls";

const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const KIND: Record<string, string> = { intake: "Intake assistant", coach: "Exercise coach", feedback: "Check-in assistant" };
const DECISION: Record<string, { text: string; chip: string }> = {
  approved: { text: "Approved", chip: "rv-chip rv-chip-teal" },
  approved_with_changes: { text: "Approved with changes", chip: "rv-chip rv-chip-amber" },
  not_approved: { text: "Not approved", chip: "rv-chip rv-chip-rose" },
};
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function Card({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "warn" | "ok" }) {
  return (
    <section className={"rounded-2xl border bg-white p-4 shadow-sm " + (tone === "warn" ? "border-amber-300" : tone === "ok" ? "border-teal-300" : "border-slate-200")}>
      <h2 className="font-heading text-base font-bold text-navy-800">{title}</h2>
      <div className="mt-2 space-y-2 text-[13.5px] leading-6 text-slate-700">{children}</div>
    </section>
  );
}

/** The pilot dashboard (the default view of /admin/rehabverse/ai-pilot). */
export async function DashboardView() {
  await requireAdmin();
  const [pilot, pack] = await Promise.all([getAiPilot(), buildReviewPack()]);
  const last = pilot.signoffs[0];
  const current = last?.pack_version === pack.version;
  const canOpen = !!last && last.decision === "approved" && current;
  const totals = pilot.kinds.reduce((t, k) => ({ turns: t.turns + k.turns, scripted: t.scripted + k.fallback_turns, stops: t.stops + k.safety_stops }), { turns: 0, scripted: 0, stops: 0 });
  const routed = pilot.routed;

  return (
    <div className="space-y-5" data-ai-pilot-page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/rehabverse" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Clinician inbox</Link>
          <p className="rv-h mt-2">PNA RehabVerse</p>
          <h1 className="font-heading text-2xl font-bold text-navy-800">AI pilot and sign-off</h1>
          <p className="max-w-2xl text-[13.5px] text-slate-600">Review what the AI assistants say, run them with a few patients first, and open them to everyone only when you are satisfied. You decide patient by patient who gets AI.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/rehabverse/ai-pilot?view=review" className="rv-btn rv-btn-primary !min-h-[40px]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Review pack and sign-off</Link>
          <a href="/api/rehabverse/ai/selftest" target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost !min-h-[40px]"><FlaskConical className="h-4 w-4" aria-hidden="true" /> Self-test: intake</a>
          <a href="/api/rehabverse/ai/selftest?kind=checkin" target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost !min-h-[40px]"><FlaskConical className="h-4 w-4" aria-hidden="true" /> Self-test: check-in</a>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Where the pilot stands" tone={pilot.settings.open_to_all ? "ok" : undefined}>
          <p data-pilot-status>
            {pilot.settings.open_to_all
              ? <>AI is <b>open to all patients</b>. {pilot.enabled_patients} patient{pilot.enabled_patients === 1 ? " has" : "s have"} it switched on.</>
              : <>Pilot: <b>{pilot.enabled_patients} of {pilot.settings.max_patients}</b> patients have AI on.</>}
          </p>
          <p data-pilot-signoff>
            {last ? (
              <>Latest sign-off: <span className={DECISION[last.decision].chip}>{DECISION[last.decision].text}</span> by {last.reviewer_name} on {dt(last.created_at)}. {current ? <b className="text-teal-800">It covers the wording that is live now.</b> : <b className="text-amber-800">The wording changed after this review (reviewed {last.pack_version}, live {pack.version}). Please review the pack again.</b>}</>
            ) : (
              <>No sign-off yet. Read the review pack and record your decision before opening AI to more patients.</>
            )}
          </p>
          <PilotControls maxPatients={pilot.settings.max_patients} openToAll={pilot.settings.open_to_all} canOpen={canOpen} enabled={pilot.enabled_patients} />
        </Card>

        <Card title="Told to you, by the assistants">
          <ul className="grid grid-cols-2 gap-2 text-[13px]" data-pilot-routed>
            <li className="rounded-xl bg-rose-50 px-3 py-2"><b className="text-[18px] text-rose-900">{(routed.ai_coach_safety ?? 0) + (routed.ai_checkin_safety ?? 0)}</b><br />warning signs reported (urgent)</li>
            <li className="rounded-xl bg-amber-50 px-3 py-2"><b className="text-[18px] text-amber-900">{(routed.ai_coach_question ?? 0) + (routed.ai_checkin_question ?? 0)}</b><br />questions or notes for you</li>
          </ul>
          <p>Check-in chat: of <b>{pilot.checkin.saved}</b> saved check-in{pilot.checkin.saved === 1 ? "" : "s"} that used the chat, <b>{pilot.checkin.changed}</b> {pilot.checkin.changed === 1 ? "was" : "were"} changed by the patient on the form ({pct(pilot.checkin.changed, pilot.checkin.saved)}%).</p>
          <p className="text-[12.5px] text-slate-500">Models used: {pilot.models.length ? pilot.models.map((m) => `${m.model} (${m.conversations})`).join(", ") : "none yet (scripted only)"}.</p>
        </Card>

        <div className="lg:col-span-2">
        <Card title="How the assistants are doing">
          {pilot.kinds.length === 0 ? (
            <p className="text-slate-500">No AI conversation yet. Switch AI on for a test patient, sign in as that patient and try each assistant.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-[13px]" data-pilot-usage>
                <thead className="text-[11.5px] uppercase tracking-wide text-slate-500"><tr><th className="py-1 pr-3">Assistant</th><th className="pr-3">Chats</th><th className="pr-3">Patients</th><th className="pr-3">Turns</th><th className="pr-3">Scripted</th><th className="pr-3">Safety stops</th></tr></thead>
                <tbody>
                  {pilot.kinds.map((k) => (
                    <tr key={k.kind} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-bold text-navy-800">{KIND[k.kind] ?? k.kind}</td>
                      <td className="pr-3">{k.conversations}</td><td className="pr-3">{k.patients}</td><td className="pr-3">{k.turns}</td>
                      <td className="pr-3">{k.fallback_turns} ({pct(k.fallback_turns, k.turns)}%)</td>
                      <td className={"pr-3 " + (k.safety_stops ? "font-bold text-rose-800" : "")}>{k.safety_stops}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totals.turns > 0 && pct(totals.scripted, totals.turns) >= 50 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-950" role="status">Half or more of the replies were scripted. The AI model was often unavailable or its replies were refused by the safety guard: run the self-tests and read the transcripts.</p>
          ) : null}
          <p className="text-[12.5px] text-slate-500">&ldquo;Scripted&rdquo; means the model was unavailable or its reply was refused by the guard, so a prepared sentence was used. Patients are never left without an answer.</p>
        </Card>
        </div>
        <div className="lg:col-span-2">
        <Card title="Patients with AI on">
          {pilot.patients.length === 0 ? <p className="text-slate-500">None yet. Open a patient&apos;s record and turn AI on.</p> : (
            <ul className="space-y-1.5" data-pilot-patients>
              {pilot.patients.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/rehabverse/patients/${p.id}#ai`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 hover:border-teal-300">
                    <span className="font-bold text-navy-800"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-teal-700" aria-hidden="true" />{p.reference_code}</span>
                    <span className="text-[12.5px] text-slate-500">on since {dt(p.enabled_at)} · {p.conversations} chat{p.conversations === 1 ? "" : "s"} · last {dt(p.last_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        </div>
      </div>

      <Card title="Running the pilot">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Read the <Link href="/admin/rehabverse/ai-pilot?view=review" className="font-bold text-teal-800 underline">review pack</Link> and record your decision. Run both self-tests to hear the real models.</li>
          <li>Switch AI on for one test patient (yourself or a colleague) and try each assistant in English and Roman Urdu.</li>
          <li>Then switch it on for a few real patients, up to the pilot limit. Read their conversations on the patient&apos;s record (AI conversations) every day at first.</li>
          <li>Watch the numbers above: scripted replies, safety stops, notes routed to you, and check-in answers changed after the chat.</li>
          <li>If anything worries you: turn AI off for that patient (immediate), or ask the developer to set <code>REHAB_AI_ENABLED=0</code> to stop every assistant at once. Patients can always use the normal forms.</li>
          <li>When you are satisfied, sign off the pack as &ldquo;approved&rdquo; and open AI to all patients. Any later change to the wording needs a new sign-off.</li>
        </ol>
      </Card>
    </div>
  );
}
