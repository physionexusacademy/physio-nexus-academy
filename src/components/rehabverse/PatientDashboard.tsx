"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, CheckCircle2, ClipboardList, Clock, HeartPulse, Lock, LogOut, PlayCircle, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { logoutAction, markNotificationsReadAction } from "@/app/rehabverse/actions";
import type { History, Notification, Overview, OverviewSession, PatientSummary } from "@/lib/rehabverse/api-types";
import { GUIDE, TOPIC_LOCKED, TOPIC_MISSED, type GuideBeat } from "@/lib/rehabverse/guide";
import { INTAKE_REGIONS, TIMEPOINT_LABEL } from "@/lib/rehabverse/intake";
import { cleanDayTitle } from "@/lib/rehabverse/format";
import { GuideStage } from "./GuideStage";
import { LineChart } from "./charts";
import { T, useRvLang } from "./useLang";

const OPEN_ASSESSMENT = ["submitted", "needs_clinical_assessment", "in_review", "cleared_for_programme", "programme_created"];

/** When each recovery check-in can be answered (hours after the day's feedback). Mirrors the database rule. */
const WINDOWS = { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] } as const;

const fmtDate = (iso: string, lang: string) =>
  new Date(iso).toLocaleString(lang === "ru" ? "en-PK" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function StatusChip({ session }: { session: OverviewSession }) {
  const scheduled = session.status === "unlocked" && session.available_from && new Date(session.available_from).getTime() > Date.now();
  if (session.status === "reviewed") return <span className="rv-chip rv-chip-navy"><T en="Completed" ru="Mukammal" /></span>;
  if (session.status === "awaiting_review") return <span className="rv-chip rv-chip-amber"><T en="Waiting for approval" ru="Approval ka intezar" /></span>;
  if (scheduled) return <span className="rv-chip rv-chip-amber"><T en="Opens soon" ru="Jald khulega" /></span>;
  if (session.status === "unlocked") return <span className="rv-chip rv-chip-teal"><T en="Open" ru="Khula hua" /></span>;
  return <span className="rv-chip"><T en="Locked" ru="Locked" /></span>;
}

export function PatientDashboard({ overview, history, notifications }: { overview: Overview & { patient: PatientSummary }; history: History | null; notifications: Notification[] }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [unread, setUnread] = useState(overview.unread_notifications ?? 0);
  const { patient, programme, sessions = [], assessments = [] } = overview;
  const firstName = patient.full_name.split(" ")[0];
  const now = Date.now();

  const open = sessions.find((s) => s.status === "unlocked" && (!s.available_from || new Date(s.available_from).getTime() <= now));
  const scheduled = sessions.find((s) => s.status === "unlocked" && s.available_from && new Date(s.available_from).getTime() > now);
  const awaiting = sessions.find((s) => s.status === "awaiting_review");
  const latest = assessments[0];
  const openAssessment = assessments.find((a) => OPEN_ASSESSMENT.includes(a.status) && !(a.status === "programme_created" && programme));
  const live = programme && ["active", "paused"].includes(programme.status);
  const flagged = latest && latest.red_flag_level !== "none" && latest.status === "needs_clinical_assessment";

  // Which recovery check-ins can be answered right now.
  const due = useMemo(() => {
    if (!programme || !history) return [];
    const out: { session_id: string; day: number; point: keyof typeof WINDOWS }[] = [];
    for (const d of history.days) {
      if (!d.submitted_at || d.completion === "none") continue;
      const hours = (now - new Date(d.submitted_at).getTime()) / 3_600_000;
      for (const point of programme.errp_schedule) {
        const [lo, hi] = WINDOWS[point];
        if (hours >= lo && hours <= hi && !d.observations.some((o) => o.timepoint === point)) out.push({ session_id: d.session_id, day: d.day_number, point });
      }
    }
    return out;
  }, [history, programme, now]);

  // Guide script follows the situation.
  const state = flagged ? "flagged" : !programme && openAssessment ? "review" : !programme ? "new" : programme.status === "completed" ? "done" : programme.status !== "active" ? "paused" : open ? `open-${open.day_number}` : awaiting ? "waiting" : "idle";
  const beats: GuideBeat[] =
    state === "flagged" ? GUIDE.flagged : state === "review" ? GUIDE.awaitingReview : state === "new" ? GUIDE.intake : state === "done" ? GUIDE.completed
    : state === "paused" ? GUIDE.paused : state.startsWith("open-") ? GUIDE.dayOpen(Number(state.slice(5))) : GUIDE.waitingReview;

  // Progress figures.
  const days = history?.days ?? [];
  const done = days.filter((d) => d.completion && d.completion !== "none");
  const released = sessions.filter((s) => s.status !== "locked").length;
  const adherence = released ? Math.round((done.length / released) * 100) : null;
  const point = (d: (typeof days)[number], t: string) => d.observations.find((o) => o.timepoint === t)?.pain ?? null;
  const labels = days.filter((d) => d.submitted_at).map((d) => `${lang === "ru" ? "Din" : "Day"} ${d.day_number}`);
  const logged = days.filter((d) => d.submitted_at);
  const lastAfter = [...logged].reverse().map((d) => point(d, "immediately_after")).find((v) => v !== null) ?? null;
  const change = history?.baseline_pain !== null && history?.baseline_pain !== undefined && lastAfter !== null ? lastAfter - history.baseline_pain : null;

  const markRead = () =>
    startTransition(async () => {
      await markNotificationsReadAction();
      setUnread(0);
      router.refresh();
    });

  return (
    <div className="container-content pb-20 pt-6 sm:pt-9">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rv-h">PNA RehabVerse · <span className="normal-case tracking-normal">{patient.reference_code}</span></p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-navy-800 sm:text-4xl"><T en={`Hello, ${firstName}`} ru={`Assalam-o-alaikum, ${firstName}`} /></h1>
          {programme ? <p className="mt-1 text-[15px] text-slate-600">{programme.title}{programme.goal ? ` — ${programme.goal}` : ""}</p> : null}
        </div>
        <button type="button" className="rv-btn rv-btn-ghost !min-h-[40px] !px-4 !text-[13px]" disabled={pending} onClick={() => startTransition(async () => { await logoutAction(); router.push("/rehabverse"); router.refresh(); })}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> <T en="Sign out" ru="Sign out" />
        </button>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="order-2 space-y-5 lg:order-1">
          {/* Where things stand */}
          {state === "flagged" ? (
            <section className="rv-glass border-l-4 !border-l-[#d6293a] p-5" role="alert">
              <p className="flex items-center gap-2 font-bold text-[#a1121f]"><ShieldAlert className="h-5 w-5" aria-hidden="true" /> <T en="Please get a clinical assessment first" ru="Pehle clinical assessment karwayein" /></p>
              <p className="mt-2 text-[14px] leading-6 text-slate-700"><T en="Some of your answers need a clinician before any exercise, so no programme has been started. Your physiotherapist has been alerted." ru="Aap ke kuch jawabat ke liye exercise se pehle clinician ka check zaroori hai, isliye koi programme shuru nahi hua. Aap ke physiotherapist ko alert kar diya gaya hai." /></p>
              <Link href="/appointment" className="rv-btn rv-btn-primary mt-3"><T en="Book an assessment" ru="Assessment book karein" /></Link>
            </section>
          ) : null}

          {state === "review" ? (
            <section className="rv-glass p-5">
              <p className="flex items-center gap-2 font-bold text-navy-800"><Clock className="h-5 w-5 text-teal-600" aria-hidden="true" /> <T en="Your assessment is being reviewed" ru="Aap ka assessment review ho raha hai" /></p>
              <p className="mt-2 text-[14px] leading-6 text-slate-700"><T en="Your physiotherapist is preparing your programme. You will get a notification as soon as it is approved." ru="Aap ke physiotherapist aap ka programme bana rahe hain. Approve hote hi notification aa jayegi." /></p>
              {latest ? <p className="mt-2 text-xs text-slate-500">{latest.regions.map((r) => INTAKE_REGIONS.find((o) => o.id === r)?.label[lang] ?? r).join(", ")} · {fmtDate(latest.submitted_at, lang)}</p> : null}
            </section>
          ) : null}

          {state === "new" ? (
            <section className="rv-glass p-5">
              <p className="font-bold text-navy-800"><T en="Let us begin with a short assessment" ru="Chhote se assessment se shuru karte hain" /></p>
              <p className="mt-1 text-[14px] leading-6 text-slate-700"><T en="It takes about 5 minutes. A physiotherapist reviews it and builds your programme." ru="Is mein lagbhag 5 minute lagte hain. Physiotherapist isay review kar ke aap ka programme banate hain." /></p>
              <Link href="/rehabverse/start" className="rv-btn rv-btn-primary mt-3"><ClipboardList className="h-4 w-4" aria-hidden="true" /> <T en="Start my assessment" ru="Mera assessment shuru karein" /></Link>
            </section>
          ) : null}

          {programme?.status === "paused" || programme?.status === "discontinued" ? (
            <section className="rv-glass border-l-4 !border-l-[#d99a00] p-5" role="status">
              <p className="font-bold text-navy-800">{programme.status === "paused" ? <T en="Your programme is paused" ru="Aap ka programme pause hai" /> : <T en="This programme has been stopped" ru="Ye programme rok diya gaya hai" />}</p>
              {programme.pause_reason ? <p className="mt-1 text-[14px] leading-6 text-slate-700">{programme.pause_reason}</p> : null}
              <p className="mt-2 text-[13px] text-slate-600"><T en="Please contact the clinic or book a reassessment. Do not continue exercises until your physiotherapist says so." ru="Clinic se rabta karein ya reassessment book karein. Jab tak physiotherapist na kahein exercises jaari na rakhein." /></p>
              <Link href="/appointment" className="rv-btn rv-btn-ghost mt-3"><T en="Book a reassessment" ru="Reassessment book karein" /></Link>
            </section>
          ) : null}

          {open ? (
            <section className="rv-glass relative overflow-hidden p-5 sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#0db3aa] to-[#0a1f3d]" aria-hidden="true" />
              <p className="rv-h"><T en="Today" ru="Aaj" /></p>
              <h2 className="mt-1 font-heading text-xl font-bold text-navy-800 sm:text-2xl"><T en="Day" ru="Din" /> {open.day_number}: {cleanDayTitle(open.title)}</h2>
              {open.patient_note ? <p className="mt-1 text-[14px] leading-6 text-slate-600">{open.patient_note}</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rv-chip rv-chip-teal">{open.exercise_count ?? 0} <T en="exercises" ru="exercises" /></span>
                <span className="rv-chip"><T en="3D demo for each" ru="Har ek ka 3D demo" /></span>
              </div>
              <Link href={`/rehabverse/me/day/${open.id}`} className="rv-btn rv-btn-primary mt-4"><PlayCircle className="h-5 w-5" aria-hidden="true" /> <T en="Start today's session" ru="Aaj ka session shuru karein" /></Link>
            </section>
          ) : null}

          {scheduled && !open ? (
            <section className="rv-glass p-5">
              <p className="flex items-center gap-2 font-bold text-navy-800"><CalendarClock className="h-5 w-5 text-teal-600" aria-hidden="true" /> <T en="Your next day opens soon" ru="Aap ka agla din jald khulega" /></p>
              <p className="mt-1 text-[14px] text-slate-600">{fmtDate(scheduled.available_from!, lang)}</p>
            </section>
          ) : null}

          {awaiting && !open ? (
            <section className="rv-glass p-5">
              <p className="flex items-center gap-2 font-bold text-navy-800"><CheckCircle2 className="h-5 w-5 text-teal-600" aria-hidden="true" /> <T en={`Day ${awaiting.day_number} feedback received`} ru={`Din ${awaiting.day_number} ka feedback mil gaya`} /></p>
              <p className="mt-1 text-[14px] leading-6 text-slate-700"><T en="Your physiotherapist will review it before the next day opens. You will be notified." ru="Agla din khulne se pehle aap ke physiotherapist ise review karenge. Aap ko notification milegi." /></p>
            </section>
          ) : null}

          {due.length ? (
            <section className="rv-glass p-5" aria-label="Recovery check-ins">
              <p className="flex items-center gap-2 font-bold text-navy-800"><HeartPulse className="h-5 w-5 text-teal-600" aria-hidden="true" /> <T en="A quick check-in is due" ru="Ek chhota check-in baaqi hai" /></p>
              <ul className="mt-2 space-y-2">
                {due.map((d) => (
                  <li key={`${d.session_id}-${d.point}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[13.5px]">
                    <span><b><T en="Day" ru="Din" /> {d.day}</b> · {TIMEPOINT_LABEL[d.point][lang]}</span>
                    <Link href={`/rehabverse/me/day/${d.session_id}#checkin`} className="rv-btn rv-btn-primary !min-h-[36px] !px-4 !text-[13px]"><T en="Answer (1 minute)" ru="Jawab dein (1 minute)" /></Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Timeline */}
          {sessions.length ? (
            <section className="rv-glass p-5" aria-labelledby="timeline">
              <div className="flex items-center justify-between gap-2">
                <h2 id="timeline" className="font-heading text-lg font-bold text-navy-800"><T en="Your programme timeline" ru="Aap ke programme ka timeline" /></h2>
                {adherence !== null ? <span className="rv-chip rv-chip-teal"><T en="Adherence" ru="Pabandi" /> {adherence}%</span> : null}
              </div>
              <ol className="mt-3 space-y-2">
                {sessions.map((s) => {
                  const clickable = s.status !== "locked";
                  const body = (
                    <>
                      <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold " + (s.status === "reviewed" ? "bg-[#0a1f3d] text-white" : s.status === "unlocked" ? "bg-teal-500 text-white" : s.status === "awaiting_review" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400")}>
                        {s.status === "locked" ? <Lock className="h-4 w-4" aria-hidden="true" /> : s.status === "reviewed" ? <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" /> : s.day_number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-navy-800"><T en="Day" ru="Din" /> {s.day_number} · {cleanDayTitle(s.title)}</span>
                        <span className="block text-[12px] text-slate-500">
                          {s.status === "locked" ? <T en="Opens after your feedback and your physiotherapist's approval" ru="Aap ke feedback aur physiotherapist ki approval ke baad khulega" /> : s.review_message ? s.review_message : s.exercise_count !== null ? `${s.exercise_count} ${lang === "ru" ? "exercises" : "exercises"}` : ""}
                        </span>
                      </span>
                      <StatusChip session={s} />
                    </>
                  );
                  return (
                    <li key={s.id}>
                      {clickable ? <Link href={`/rehabverse/me/day/${s.id}`} className="rv-card flex items-center gap-3">{body}</Link> : <div className="flex items-center gap-3 rounded-[1.1rem] border border-dashed border-slate-200 bg-slate-50/60 px-3.5 py-3 opacity-80">{body}</div>}
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {/* Progress */}
          {logged.length ? (
            <section className="rv-glass p-5" aria-labelledby="progress">
              <h2 id="progress" className="font-heading text-lg font-bold text-navy-800"><T en="Your progress" ru="Aap ki progress" /></h2>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-extrabold text-navy-800">{done.length}/{released || sessions.length}</p><p className="text-[11px] font-semibold text-slate-500"><T en="Days done" ru="Din mukammal" /></p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl font-extrabold text-navy-800">{adherence ?? "—"}{adherence !== null ? "%" : ""}</p><p className="text-[11px] font-semibold text-slate-500"><T en="Adherence" ru="Pabandi" /></p></div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="flex items-center justify-center gap-1 text-xl font-extrabold text-navy-800">{change === null ? "—" : change > 0 ? `+${change}` : change}{change !== null && change < 0 ? <TrendingDown className="h-4 w-4 text-teal-600" aria-hidden="true" /> : null}</p>
                  <p className="text-[11px] font-semibold text-slate-500"><T en="Pain vs start" ru="Dard shuru ke muqable" /></p>
                </div>
              </div>
              <div className="mt-4 grid gap-6">
                <div>
                  <h3 className="mb-1 text-[13px] font-bold text-slate-700"><T en="Pain around each session (0–10)" ru="Har session ke aas paas dard (0–10)" /></h3>
                  <LineChart
                    title={lang === "ru" ? "Har session ke aas paas dard" : "Pain around each session"}
                    labels={labels.map((l) => l.replace(/^(Day|Din) /, "D"))}
                    series={[
                      { name: lang === "ru" ? "Pehle" : "Before", colour: "#94a3b8", points: logged.map((d) => point(d, "before")) },
                      { name: lang === "ru" ? "Dauran" : "During", colour: "#d99a00", points: logged.map((d) => point(d, "during")) },
                      { name: lang === "ru" ? "Foran baad" : "After", colour: "#0db3aa", points: logged.map((d) => point(d, "immediately_after")) },
                      ...(history?.baseline_pain !== null && history?.baseline_pain !== undefined ? [{ name: lang === "ru" ? "Shuru ka dard" : "Starting pain", colour: "#0a1f3d", dashed: true, points: logged.map(() => history.baseline_pain) }] : []),
                    ]}
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-[13px] font-bold text-slate-700"><T en="How you recovered afterwards (0–10)" ru="Baad mein recovery kaisi rahi (0–10)" /></h3>
                  <LineChart
                    title={lang === "ru" ? "Recovery pattern" : "Recovery pattern"}
                    labels={labels.map((l) => l.replace(/^(Day|Din) /, "D"))}
                    series={[
                      { name: lang === "ru" ? "Usi din baad" : "Later that day", colour: "#7c8cf8", points: logged.map((d) => point(d, "later_same_day")) },
                      { name: lang === "ru" ? "Agle din" : "Next day", colour: "#0db3aa", points: logged.map((d) => point(d, "24h")) },
                      { name: lang === "ru" ? "48 ghante" : "48 hours", colour: "#0a1f3d", points: logged.map((d) => point(d, "48h")) },
                    ]}
                  />
                </div>
              </div>
              <p className="mt-3 text-[11.5px] leading-5 text-slate-500"><T en="These charts show what you reported. Your physiotherapist decides what they mean for your programme." ru="Ye charts wohi dikhate hain jo aap ne bataya. In ka matlab aur programme par asar aap ke physiotherapist tay karte hain." /></p>
            </section>
          ) : null}

          {/* Notifications */}
          <section className="rv-glass p-5" aria-labelledby="notes">
            <div className="flex items-center justify-between gap-2">
              <h2 id="notes" className="flex items-center gap-2 font-heading text-lg font-bold text-navy-800"><Bell className="h-4.5 w-4.5 text-teal-600" aria-hidden="true" /> <T en="Notifications" ru="Notifications" /> {unread ? <span className="rv-chip rv-chip-rose">{unread}</span> : null}</h2>
              {unread ? <button type="button" onClick={markRead} disabled={pending} className="text-[12.5px] font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Mark all read" ru="Sab parh liye" /></button> : null}
            </div>
            {notifications.length === 0 ? (
              <p className="mt-2 text-[13.5px] text-slate-500"><T en="Nothing yet." ru="Abhi kuch nahi." /></p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {notifications.slice(0, 8).map((n) => (
                  <li key={n.id} className="py-2.5">
                    <p className="flex items-center gap-2 text-[13.5px] font-bold text-navy-800">
                      {!n.read_at ? <span className="h-2 w-2 rounded-full bg-teal-500" aria-label="unread" /> : null}
                      {n.title}
                      {n.severity === "urgent" ? <span className="rv-chip rv-chip-rose">!</span> : null}
                    </p>
                    {n.body ? <p className="text-[13px] leading-5 text-slate-600">{n.body}</p> : null}
                    <p className="mt-0.5 text-[11px] text-slate-400">{fmtDate(n.created_at, lang)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!live && !openAssessment && state !== "new" ? (
            <section className="rv-glass p-5 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-teal-600" aria-hidden="true" />
              <p className="mt-2 text-[14px] text-slate-700"><T en="Need more help? You can send a new assessment." ru="Aur madad chahiye? Naya assessment bhej sakte hain." /></p>
              <Link href="/rehabverse/start" className="rv-btn rv-btn-primary mt-3"><T en="New assessment" ru="Naya assessment" /></Link>
            </section>
          ) : null}
        </div>

        <aside className="order-1 space-y-3 lg:sticky lg:top-24 lg:order-2">
          <GuideStage beats={beats} restartKey={state} extraTopics={[TOPIC_LOCKED, TOPIC_MISSED]} compact />
          <p className="rounded-2xl bg-rose-50 px-3.5 py-2.5 text-[12px] leading-5 text-rose-900">
            <b><T en="Not an emergency service." ru="Ye emergency service nahi." /></b>{" "}
            <T en="For chest pain, trouble breathing, sudden weakness or numbness, or loss of bladder/bowel control, call your local emergency number (for example 1122 in much of Pakistan) or go to the nearest emergency department." ru="Seene mein dard, saans mein mushkil, achanak kamzori/sunn-pan, ya peshab/pakhane par control khatam hone par apna local emergency number (jaise Pakistan mein aksar jagah 1122) milayein ya qareebi emergency department jayein." />
          </p>
        </aside>
      </div>
    </div>
  );
}
