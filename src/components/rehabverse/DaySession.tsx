"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, Clock, Lock, Send, ShieldAlert, Stethoscope } from "lucide-react";
import { submitFeedbackAction, submitFollowupAction } from "@/app/rehabverse/actions";
import type { FollowupPoint, SessionDetail, SessionExercise } from "@/lib/rehabverse/api-types";
import { GUIDE } from "@/lib/rehabverse/guide";
import { DIFFICULTY_WORDS, FEEDBACK_FLAGS, PAIN_WORDS, TIMEPOINT_LABEL } from "@/lib/rehabverse/intake";
import { loadExercises } from "@/lib/rehabverse/library";
import type { ExerciseDef } from "@/lib/rehabverse/types";
import { ExerciseDetails, dosageChips } from "./ExerciseDetails";
import { T, useRvLang } from "./useLang";
import type { Lang } from "./ExercisePlayer";

const ExercisePlayer = dynamic(() => import("./ExercisePlayer"), { ssr: false, loading: () => <div className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-100 sm:aspect-[16/10]" aria-hidden="true" /> });

const scaleColour = (n: number) => (n <= 3 ? "#0db3aa" : n <= 6 ? "#d99a00" : "#d6293a");
const WINDOWS: Record<FollowupPoint, [number, number]> = { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] };

function Scale({ label, value, onChange, words, required }: { label: React.ReactNode; value: number | null; onChange: (n: number) => void; words: { en: string; ru: string }[]; required?: boolean }) {
  const [lang] = useRvLang();
  return (
    <fieldset>
      <legend className="rv-label">{label}{required ? " *" : ""}</legend>
      <div className="rv-nprs">
        {Array.from({ length: 11 }, (_, n) => (
          <button key={n} type="button" aria-pressed={value === n} aria-label={`${n} — ${words[n][lang]}`} onClick={() => onChange(n)} style={value === n ? { background: scaleColour(n) } : undefined}>{n}</button>
        ))}
      </div>
      <p className="rv-hint" aria-live="polite">{value === null ? " " : `${value}/10 — ${words[value][lang]}`}</p>
    </fieldset>
  );
}

const FUNCTION_WORDS = [
  { en: "Cannot do daily tasks", ru: "Rozmarra ke kaam nahi kar sakta/sakti" }, ...Array.from({ length: 9 }, (_, i) => ({ en: i < 4 ? "Very limited" : i < 7 ? "Somewhat limited" : "Almost normal", ru: i < 4 ? "Bohat mehdood" : i < 7 ? "Thora mehdood" : "Lagbhag normal" })),
  { en: "Completely normal", ru: "Bilkul normal" },
];

function Flags({ value, none, onToggle, onNone }: { value: string[]; none: boolean; onToggle: (id: string) => void; onNone: () => void }) {
  const [lang] = useRvLang();
  return (
    <fieldset>
      <legend className="rv-label"><T en="Did you notice any of these?" ru="Kya inmein se kuch mehsoos hua?" /> *</legend>
      <div className="grid gap-2">
        {FEEDBACK_FLAGS.map((f) => {
          const on = value.includes(f.id);
          return (
            <button key={f.id} type="button" role="checkbox" aria-checked={on} onClick={() => onToggle(f.id)} className={"rv-card flex items-center gap-3 text-left " + (on ? "rv-card-on" : "")}>
              <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 " + (on ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300")}>{on ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
              <span className="text-[14px] font-semibold leading-5 text-navy-800">{f.label[lang]}</span>
            </button>
          );
        })}
        <button type="button" role="checkbox" aria-checked={none} onClick={onNone} className={"rv-card flex items-center gap-3 text-left " + (none ? "rv-card-on" : "")}>
          <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 " + (none ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300")}>{none ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
          <span className="text-[14px] font-semibold leading-5 text-navy-800"><T en="None of these" ru="Inmein se kuch nahi" /></span>
        </button>
      </div>
    </fieldset>
  );
}

function Urgent({ level }: { level: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[14px] leading-6 text-rose-900" role="alert">
      <p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" aria-hidden="true" /> <T en="Thank you for telling us. Please stop exercising." ru="Bataane ka shukriya. Meherbani karke exercise rok dein." /></p>
      <p className="mt-1"><T en="Your programme is paused and your physiotherapist has been alerted." ru="Aap ka programme pause kar diya gaya hai aur physiotherapist ko alert bhej diya gaya hai." /></p>
      {level === "emergency" ? <p className="mt-1 font-bold"><T en="Because of what you reported, please get urgent medical care now — your local emergency number (for example 1122 in much of Pakistan) or the nearest emergency department." ru="Jo aap ne bataya uski wajah se abhi foran medical madad lein — apna local emergency number (jaise Pakistan mein aksar jagah 1122) ya qareebi emergency department." /></p> : <p className="mt-1"><T en="Please contact the clinic today. If it gets worse, seek urgent care." ru="Aaj hi clinic se rabta karein. Agar barhe to foran medical madad lein." /></p>}
    </div>
  );
}

/* ───────────────────────── feedback form ───────────────────────── */

function FeedbackForm({ data, exercises }: { data: SessionDetail; exercises: SessionExercise[] }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [completion, setCompletion] = useState<"all" | "partial" | "none" | "">("");
  const [pain, setPain] = useState<{ before: number | null; during: number | null; after: number | null }>({ before: null, during: null, after: null });
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [noFlags, setNoFlags] = useState(false);
  const [unusual, setUnusual] = useState(false);
  const [unusualText, setUnusualText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; flagLevel: string; autoReleased: boolean } | null>(null);

  // "All done" ticks everything; picking exercises one by one switches to "partial".
  useEffect(() => {
    if (completion === "all") setDone(Object.fromEntries(exercises.map((e) => [e.id, true])));
    if (completion === "none") setDone({});
  }, [completion, exercises]);

  const active = completion !== "none";
  const ready = completion !== "" && (!active || (pain.before !== null && pain.during !== null && pain.after !== null && difficulty !== null && (noFlags || flags.length > 0)));

  const submit = () => {
    if (!ready) return;
    setError(null);
    start(async () => {
      const r = await submitFeedbackAction(data.session.id, {
        completion,
        pain_before: active ? pain.before ?? undefined : undefined, pain_during: active ? pain.during ?? undefined : undefined, pain_after: active ? pain.after ?? undefined : undefined,
        difficulty: active ? difficulty ?? undefined : undefined,
        unusual_symptoms: unusual, unusual_text: unusual ? unusualText || undefined : undefined,
        safety_flags: flags, notes: notes || undefined,
        exercises: exercises.map((e) => ({ session_exercise_id: e.id, done: !!done[e.id], sets_done: done[e.id] ? e.sets ?? undefined : undefined, reps_done: done[e.id] ? e.reps ?? undefined : undefined })),
      });
      if (!r.ok) return setError(r.code ?? "failed");
      setResult({ status: r.status, flagLevel: r.flagLevel, autoReleased: r.autoReleased });
      router.refresh();
    });
  };

  if (result) {
    return (
      <div className="space-y-3 rv-fade-up" role="status">
        {result.flagLevel !== "none" ? <Urgent level={result.flagLevel} /> : (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-[14px] leading-6 text-teal-950">
            <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <T en="Feedback sent — well done!" ru="Feedback bhej diya — shabash!" /></p>
            <p className="mt-1">{result.autoReleased ? <T en="Your next day is ready." ru="Aap ka agla din tayyar hai." /> : <T en="Your physiotherapist will review it. The next day opens once they approve." ru="Aap ke physiotherapist ise review karenge. Approve karne par agla din khulega." />}</p>
          </div>
        )}
        <Link href="/rehabverse/me" className="rv-btn rv-btn-primary"><T en="Back to my dashboard" ru="Dashboard par wapis" /></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="rv-label"><T en="Did you do today's exercises?" ru="Kya aap ne aaj ki exercises ki?" /> *</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([["all", { en: "Yes, all of them", ru: "Haan, sab" }], ["partial", { en: "Some of them", ru: "Kuch" }], ["none", { en: "No, not today", ru: "Nahi, aaj nahi" }]] as const).map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={completion === id} onClick={() => setCompletion(id)} className={"rv-card text-center text-[14px] font-bold text-navy-800 " + (completion === id ? "rv-card-on" : "")}>{label[lang]}</button>
          ))}
        </div>
      </fieldset>

      {completion === "partial" ? (
        <fieldset>
          <legend className="rv-label"><T en="Which did you do?" ru="Kaun si ki?" /></legend>
          <div className="grid gap-2">
            {exercises.map((e) => (
              <button key={e.id} type="button" role="checkbox" aria-checked={!!done[e.id]} onClick={() => setDone((d) => ({ ...d, [e.id]: !d[e.id] }))} className={"rv-card flex items-center gap-3 text-left " + (done[e.id] ? "rv-card-on" : "")}>
                <span className={"grid h-5 w-5 place-items-center rounded-md border-2 " + (done[e.id] ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300")}>{done[e.id] ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
                <span className="text-[14px] font-semibold text-navy-800">{e.exercise_title}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {completion && active ? (
        <>
          <Scale required label={<T en="Pain BEFORE you started (0–10)" ru="Shuru karne se PEHLE dard (0–10)" />} value={pain.before} onChange={(n) => setPain((p) => ({ ...p, before: n }))} words={PAIN_WORDS} />
          <Scale required label={<T en="Pain DURING the exercises (the worst moment)" ru="Exercises ke DAURAN dard (sab se zyada lamha)" />} value={pain.during} onChange={(n) => setPain((p) => ({ ...p, during: n }))} words={PAIN_WORDS} />
          <Scale required label={<T en="Pain RIGHT AFTER you finished" ru="Khatam karte hi FORAN BAAD dard" />} value={pain.after} onChange={(n) => setPain((p) => ({ ...p, after: n }))} words={PAIN_WORDS} />
          <Scale required label={<T en="How hard was it?" ru="Kitna mushkil laga?" />} value={difficulty} onChange={setDifficulty} words={DIFFICULTY_WORDS} />
          <Flags value={flags} none={noFlags} onToggle={(id) => { setNoFlags(false); setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])); }} onNone={() => { setNoFlags((n) => !n); setFlags([]); }} />
          <div>
            <button type="button" role="checkbox" aria-checked={unusual} onClick={() => setUnusual((u) => !u)} className={"rv-card flex items-center gap-3 text-left " + (unusual ? "rv-card-on" : "")}>
              <span className={"grid h-5 w-5 place-items-center rounded-md border-2 " + (unusual ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300")}>{unusual ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
              <span className="text-[14px] font-semibold text-navy-800"><T en="Something unusual or different happened" ru="Kuch ajeeb ya muktalif hua" /></span>
            </button>
            {unusual ? <textarea aria-label="Unusual symptoms" rows={2} maxLength={600} value={unusualText} onChange={(e) => setUnusualText(e.target.value)} className="rv-input mt-2" placeholder={lang === "ru" ? "Kya hua? Apne alfaaz mein likhein." : "What happened? Write it in your own words."} /> : null}
          </div>
        </>
      ) : null}

      {completion ? (
        <div>
          <label className="rv-label" htmlFor="notes"><T en="Anything else? (optional)" ru="Aur kuch? (zaroori nahi)" /></label>
          <textarea id="notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className="rv-input" />
        </div>
      ) : null}

      <p className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] leading-5 text-slate-600"><T en="Feedback is not an approval. Your physiotherapist reads it and decides about the next day." ru="Feedback approval nahi hota. Agle din ka faisla aap ke physiotherapist parh kar karte hain." /></p>
      {error ? <p className="rv-error" role="alert">{error === "session_not_open" || error === "programme_not_active" ? <T en="This day is no longer open." ru="Ye din ab khula nahi hai." /> : <T en="We could not send it. Please try again." ru="Bheja nahi ja saka. Dobara koshish karein." />}</p> : null}
      <button type="button" className="rv-btn rv-btn-primary w-full sm:w-auto" disabled={!ready || pending} onClick={submit}><Send className="h-4 w-4" aria-hidden="true" /> {pending ? <T en="Sending…" ru="Bhej rahe hain…" /> : <T en="Send my feedback" ru="Feedback bhejein" />}</button>
    </div>
  );
}

/* ───────────────────────── recovery check-in ───────────────────────── */

function Checkin({ sessionId, point }: { sessionId: string; point: FollowupPoint }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pain, setPain] = useState<number | null>(null);
  const [fn, setFn] = useState<number | null>(null);
  const [response, setResponse] = useState<"better" | "same" | "worse" | "">("");
  const [newSymptoms, setNewSymptoms] = useState(false);
  const [flags, setFlags] = useState<string[]>([]);
  const [noFlags, setNoFlags] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flagLevel, setFlagLevel] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const ready = pain !== null && response !== "" && (noFlags || flags.length > 0);
  if (sent) {
    return flagLevel && flagLevel !== "none" ? <Urgent level={flagLevel} /> : <p className="rounded-xl bg-teal-50 px-3 py-2 text-[14px] font-bold text-teal-900" role="status"><T en="Thank you — recorded." ru="Shukriya — record ho gaya." /></p>;
  }
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-bold text-navy-800">{TIMEPOINT_LABEL[point][lang]}</h3>
      <Scale required label={<T en="Pain right now (0–10)" ru="Abhi dard (0–10)" />} value={pain} onChange={setPain} words={PAIN_WORDS} />
      <Scale label={<T en="How well can you do daily activities? (10 = normal)" ru="Rozmarra ke kaam kitne aasani se hote hain? (10 = normal)" />} value={fn} onChange={setFn} words={FUNCTION_WORDS} />
      <fieldset>
        <legend className="rv-label"><T en="Compared with before exercising, my symptoms are…" ru="Exercise se pehle ke muqable mein meri alamaat…" /> *</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([["better", { en: "Better", ru: "Behtar" }], ["same", { en: "About the same", ru: "Lagbhag waisi hi" }], ["worse", { en: "Worse", ru: "Zyada kharab" }]] as const).map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={response === id} onClick={() => setResponse(id)} className={"rv-card text-center text-[14px] font-bold text-navy-800 " + (response === id ? "rv-card-on" : "")}>{label[lang]}</button>
          ))}
        </div>
      </fieldset>
      <Flags value={flags} none={noFlags} onToggle={(id) => { setNoFlags(false); setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])); }} onNone={() => { setNoFlags((n) => !n); setFlags([]); }} />
      <button type="button" role="checkbox" aria-checked={newSymptoms} onClick={() => setNewSymptoms((v) => !v)} className={"rv-card flex items-center gap-3 text-left " + (newSymptoms ? "rv-card-on" : "")}>
        <span className={"grid h-5 w-5 place-items-center rounded-md border-2 " + (newSymptoms ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300")}>{newSymptoms ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
        <span className="text-[14px] font-semibold text-navy-800"><T en="I have new symptoms" ru="Mujhe nayi alamaat hain" /></span>
      </button>
      <textarea aria-label="Note" rows={2} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} className="rv-input" placeholder={lang === "ru" ? "Kuch aur batana ho (zaroori nahi)" : "Anything else (optional)"} />
      {error ? <p className="rv-error" role="alert">{error === "too_early" ? <T en="It is a little early for this check-in. Please try again later." ru="Is check-in ke liye abhi thora jaldi hai. Baad mein koshish karein." /> : error === "window_closed" ? <T en="This check-in window has closed." ru="Is check-in ka waqt khatam ho gaya." /> : <T en="We could not save it. Please try again." ru="Save nahi ho saka. Dobara koshish karein." />}</p> : null}
      <button type="button" className="rv-btn rv-btn-primary" disabled={!ready || pending} onClick={() => start(async () => {
        const r = await submitFollowupAction(sessionId, point, { pain: pain ?? 0, function_score: fn ?? undefined, symptom_response: response as "better", new_symptoms: newSymptoms, safety_flags: flags, note: note || undefined });
        if (!r.ok) return setError(r.code ?? "failed");
        setFlagLevel(r.flagLevel);
        setSent(true);
        router.refresh();
      })}><Send className="h-4 w-4" aria-hidden="true" /> <T en="Save check-in" ru="Check-in save karein" /></button>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function DaySession({ data }: { data: SessionDetail }) {
  const [lang] = useRvLang();
  const [defs, setDefs] = useState<Map<string, ExerciseDef> | null>(null);
  const [selected, setSelected] = useState(0);
  const [playerFailed, setPlayerFailed] = useState(false);
  const { session, exercises, access, feedback } = data;
  const exercise = exercises[selected];
  const def = exercise ? defs?.get(exercise.exercise_id) : undefined;
  const side = exercise?.side === "left" ? "left" : exercise?.side === "right" ? "right" : undefined;

  useEffect(() => {
    let cancelled = false;
    loadExercises(exercises.map((e) => e.exercise_id)).then((m) => !cancelled && setDefs(m));
    return () => {
      cancelled = true;
    };
  }, [exercises]);

  // Check-ins that can be answered now.
  const pendingCheckins = useMemo(() => {
    if (!feedback || feedback.completion === "none") return [] as FollowupPoint[];
    const hours = (Date.now() - new Date(feedback.submitted_at).getTime()) / 3_600_000;
    return data.programme.errp_schedule.filter((p) => !data.followups.some((f) => f.timepoint === p) && hours >= WINDOWS[p][0] && hours <= WINDOWS[p][1]);
  }, [feedback, data]);
  const upcoming = data.programme.errp_schedule.filter((p) => feedback && !data.followups.some((f) => f.timepoint === p) && !pendingCheckins.includes(p));

  return (
    <div className="container-content pb-20 pt-6 sm:pt-9">
      <Link href="/rehabverse/me" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> <T en="My programme" ru="Mera programme" /></Link>
      <p className="rv-h mt-3">{data.programme.title}</p>
      <h1 className="mt-1 font-heading text-2xl font-extrabold text-navy-800 sm:text-4xl"><T en="Day" ru="Din" /> {session.day_number}: {session.title}</h1>
      {session.patient_note && (access === "open" || access === "done") ? <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">{session.patient_note}</p> : null}

      {access === "locked" || access === "scheduled" || access === "paused" ? (
        <div className="rv-glass mt-6 max-w-xl space-y-2 p-6">
          <p className="flex items-center gap-2 font-bold text-navy-800">{access === "locked" ? <Lock className="h-5 w-5 text-slate-500" aria-hidden="true" /> : <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />}
            {access === "locked" ? <T en="This day is locked" ru="Ye din locked hai" /> : access === "scheduled" ? <T en="This day opens soon" ru="Ye din jald khulega" /> : <T en="Your programme is paused" ru="Aap ka programme pause hai" />}
          </p>
          <p className="text-[14px] leading-6 text-slate-600">
            {access === "locked" ? <T en="It opens after you give feedback on the day before and your physiotherapist approves it." ru="Ye pichle din ka feedback dene aur physiotherapist ki approval ke baad khulta hai." />
              : access === "scheduled" ? (session.available_from ? new Date(session.available_from).toLocaleString() : "")
              : <T en="Your physiotherapist paused your programme. Please wait for their message." ru="Aap ke physiotherapist ne programme pause kiya hai. Unke paigham ka intezar karein." />}
          </p>
        </div>
      ) : (
        <>
          {access === "open" ? (
            <div className="mt-5 flex max-w-3xl items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-teal-700"><Stethoscope className="h-5 w-5" aria-hidden="true" /></span>
              <p className="text-[14px] leading-6 text-teal-950"><b>Guide:</b> {GUIDE.dayOpen(session.day_number)[1].say[lang]}</p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-4">
              {exercise ? (
                <>
                  {def && !playerFailed ? (
                    <ExercisePlayer exercise={def} lang={lang as Lang} side={side} reps={exercise.reps ?? undefined} onFail={() => setPlayerFailed(true)} />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-slate-100 text-sm font-semibold text-slate-500 sm:aspect-[16/10]">{def === undefined && defs ? <T en="3D demo not available — follow the steps below." ru="3D demo maujood nahi — neeche ke steps follow karein." /> : <T en="Loading your guide…" ru="Guide aa raha hai…" />}</div>
                  )}
                  <div className="rv-glass p-4">
                    <h2 className="font-heading text-lg font-bold text-navy-800">{exercise.exercise_title}</h2>
                    {def ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {dosageChips(def.dosage, lang as Lang, { sets: exercise.sets, reps: exercise.reps, hold: exercise.hold_seconds, rest: exercise.rest_seconds, duration: exercise.duration_seconds, frequency: exercise.frequency, side: exercise.side }).map((c) => (
                          <span key={c.label} className="rv-chip rv-chip-teal">{c.label}: {c.value}</span>
                        ))}
                      </div>
                    ) : null}
                    {exercise.precautions ? <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13.5px] leading-5 text-amber-950"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span><b><T en="Your physiotherapist says:" ru="Aap ke physiotherapist kehte hain:" /></b> {exercise.precautions}</span></p> : null}
                    {exercise.notes ? <p className="mt-2 text-[13.5px] leading-6 text-slate-700">{exercise.notes}</p> : null}
                    {def ? <div className="mt-3"><ExerciseDetails exercise={def} lang={lang as Lang} dose={{ sets: exercise.sets, reps: exercise.reps, hold: exercise.hold_seconds, rest: exercise.rest_seconds, duration: exercise.duration_seconds, frequency: exercise.frequency, side: exercise.side }} /></div> : null}
                  </div>
                </>
              ) : (
                <p className="rv-glass p-5 text-sm text-slate-600"><T en="No exercises in this day." ru="Is din mein koi exercise nahi." /></p>
              )}
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <section className="rv-glass p-4" aria-label="Exercises">
                <h2 className="font-heading text-base font-bold text-navy-800"><T en="Today's exercises" ru="Aaj ki exercises" /> ({exercises.length})</h2>
                <ol className="mt-2 space-y-1.5">
                  {exercises.map((e, i) => (
                    <li key={e.id}>
                      <button type="button" onClick={() => setSelected(i)} aria-current={i === selected} className={"rv-card flex w-full items-center gap-3 text-left " + (i === selected ? "rv-card-on" : "")}>
                        <span className={"grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold " + (i === selected ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600")}>{i + 1}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-bold text-navy-800">{e.exercise_title}</span><span className="block text-[11.5px] text-slate-500">{[e.sets ? `${e.sets} sets` : null, e.reps ? `${e.reps} reps` : null, e.hold_seconds ? `${e.hold_seconds}s hold` : null].filter(Boolean).join(" · ")}</span></span>
                        <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              </section>

              {access === "open" ? (
                <section className="rv-glass p-5" aria-labelledby="fb">
                  <h2 id="fb" className="font-heading text-lg font-bold text-navy-800"><T en="After your session: feedback" ru="Session ke baad: feedback" /></h2>
                  <p className="mb-4 mt-1 text-[13px] leading-5 text-slate-600">{GUIDE.feedback[0].say[lang]}</p>
                  <FeedbackForm data={data} exercises={exercises} />
                </section>
              ) : null}

              {access === "done" && feedback ? (
                <section className="rv-glass space-y-3 p-5">
                  <h2 className="font-heading text-lg font-bold text-navy-800"><T en="Your feedback" ru="Aap ka feedback" /></h2>
                  <p className="text-[13.5px] text-slate-700">
                    <T en="Done:" ru="Kiya:" /> <b>{feedback.completion === "all" ? (lang === "ru" ? "Sab" : "All") : feedback.completion === "partial" ? (lang === "ru" ? "Kuch" : "Some") : (lang === "ru" ? "Nahi" : "None")}</b>
                    {feedback.pain_before !== null ? <> · <T en="Pain before/during/after:" ru="Dard pehle/dauran/baad:" /> <b>{feedback.pain_before}/{feedback.pain_during}/{feedback.pain_after}</b></> : null}
                    {feedback.difficulty !== null ? <> · <T en="Difficulty:" ru="Mushkil:" /> <b>{feedback.difficulty}/10</b></> : null}
                  </p>
                  {data.review_message ? <p className="rounded-xl bg-teal-50 px-3 py-2 text-[13.5px] leading-6 text-teal-950"><b><T en="Message from your physiotherapist:" ru="Physiotherapist ka paigham:" /></b> {data.review_message}</p> : session.status === "awaiting_review" ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-[13.5px] text-amber-950"><T en="Waiting for your physiotherapist to review." ru="Physiotherapist ke review ka intezar hai." /></p> : null}
                </section>
              ) : null}

              {feedback && (pendingCheckins.length || upcoming.length) ? (
                <section id="checkin" className="rv-glass space-y-3 p-5" aria-labelledby="ci">
                  <h2 id="ci" className="font-heading text-lg font-bold text-navy-800"><T en="Recovery check-ins" ru="Recovery check-ins" /></h2>
                  {pendingCheckins.map((p) => <Checkin key={p} sessionId={session.id} point={p} />)}
                  {upcoming.length ? <p className="text-[12.5px] leading-5 text-slate-500"><T en="Coming up:" ru="Aage aane wale:" /> {upcoming.map((p) => TIMEPOINT_LABEL[p][lang]).join(", ")}</p> : null}
                </section>
              ) : null}
              {data.followups.length ? (
                <p className="text-[12.5px] text-slate-500"><T en="Recorded:" ru="Record ho chuke:" /> {data.followups.map((f) => `${TIMEPOINT_LABEL[f.timepoint][lang]} (${f.pain}/10)`).join(" · ")}</p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
