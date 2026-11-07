"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircle, RotateCcw, Send, ShieldAlert, Stethoscope, Trophy, XCircle } from "lucide-react";
import { CASES, DEFAULT_ANSWER, PRACTICE_CASE, type VirtualCase } from "@/lib/virtual-patient/cases";
import { HISTORY, type HistoryId } from "@/lib/virtual-patient/exam";
import { getVpProgress, VP_EVENT, type SessionResult, type VpProgress } from "@/lib/virtual-patient/session";
import { useExam, type ExamMode, type Lang } from "./ExamContext";

/* ---------------- Case picker ---------------- */

const LEVEL_TONE: Record<VirtualCase["level"], string> = {
  Beginner: "bg-emerald-100 text-emerald-900",
  Intermediate: "bg-sky-100 text-sky-900",
  Advanced: "bg-amber-100 text-amber-900",
  Expert: "bg-rose-100 text-rose-900",
};

export function CasePicker({ onStart }: { onStart: (c: VirtualCase, mode: ExamMode) => void }) {
  const [mode, setMode] = useState<ExamMode>("guided");
  const [progress, setProgress] = useState<VpProgress>({ cases: {} });
  useEffect(() => {
    const read = () => setProgress(getVpProgress());
    read();
    window.addEventListener(VP_EVENT, read);
    return () => window.removeEventListener(VP_EVENT, read);
  }, []);
  const order: VirtualCase["level"][] = ["Beginner", "Intermediate", "Advanced", "Expert"];
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="nx-kicker"><Stethoscope className="h-3.5 w-3.5" aria-hidden="true" /> Waiting room</p>
          <h2 className="nx-title mt-2 text-2xl text-white">Choose your patient</h2>
        </div>
        <div className="inline-flex rounded-full border border-white/15 p-1" role="radiogroup" aria-label="Mode">
          {([["guided", "Guided"], ["osce", "OSCE (timed, no hints)"]] as const).map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)} className={"rounded-full px-3.5 py-1.5 text-xs font-bold " + (mode === id ? "bg-[#2ee6d6] text-[#04263a]" : "text-white/80")}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => onStart(PRACTICE_CASE, "guided")} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/25 p-4 text-left text-white hover:border-[#2ee6d6]">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white/10"><Stethoscope className="h-5 w-5 text-[#2ee6d6]" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm">Free practice — healthy volunteer</strong>
          <span className="text-xs text-[#a9bfd6]">Every finding is normal. Practise positioning, goniometry, MMT, reflexes and palpation.</span>
        </span>
        <ArrowRight className="h-4 w-4 text-[#2ee6d6]" aria-hidden="true" />
      </button>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...CASES].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level)).map((c) => {
          const record = progress.cases[c.id];
          return (
            <li key={c.id}>
              <button type="button" onClick={() => onStart(c, mode)} className="flex h-full w-full flex-col rounded-2xl bg-white p-4 text-left shadow-[0_20px_50px_-35px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5">
                <span className="flex items-center justify-between gap-2">
                  <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-extrabold " + LEVEL_TONE[c.level]}>{c.level}</span>
                  <span className="text-[11px] font-bold text-slate-500">{c.area}</span>
                </span>
                <strong className="mt-2 text-[15px] text-navy-800">{c.patient.name}, {c.patient.age}</strong>
                <span className="text-xs text-slate-500">{c.patient.job}</span>
                <span className="mt-2 flex-1 text-[13px] leading-5 text-slate-700">{c.referral}</span>
                <span className="mt-3 flex items-center justify-between text-xs font-bold">
                  <span className={record?.passedAt ? "text-emerald-700" : "text-slate-400"}>{record ? (record.passedAt ? `Passed · best ${record.best}%` : `Best ${record.best}%`) : "Not attempted"}</span>
                  <span className="inline-flex items-center gap-1 text-teal-700">See patient <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- History taking ---------------- */

export function HistoryPanel({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const { caseData, events, log, say } = useExam();
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const asked = new Set(events.filter((e) => e.kind === "history").map((e) => (e as { id: HistoryId }).id));
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [chat.length]);

  const ask = (id: HistoryId, question?: string) => {
    const item = HISTORY.find((h) => h.id === id)!;
    const answer = caseData.history[id] ?? DEFAULT_ANSWER;
    const a = lang === "ur" ? answer.ur : answer.en;
    setChat((c) => [...c, { q: question ?? (lang === "ur" ? item.ur : item.en), a }]);
    say(a);
    if (!asked.has(id)) log({ kind: "history", id });
  };
  const submit = () => {
    const q = text.trim();
    if (!q) return;
    const match = HISTORY.find((h) => h.keywords.test(q));
    if (match) ask(match.id, q);
    else {
      const a = lang === "ur" ? "Maaf kijiye, samajh nahi aaya — doosre tareeqe se poochain?" : "Sorry, I didn't understand — could you ask another way?";
      setChat((c) => [...c, { q, a }]);
      say(a);
    }
    setText("");
  };
  const groups = [...new Set(HISTORY.map((h) => h.group))];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] leading-5 text-slate-600"><strong className="text-navy-800">Referral:</strong> {caseData.referral}</p>
      </div>
      <div className="mt-2 inline-flex rounded-full border border-slate-200 p-0.5">
        {([["en", "English"], ["ur", "Roman Urdu"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setLang(id)} className={"rounded-full px-3 py-1 text-xs font-bold " + (lang === id ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>{label}</button>
        ))}
      </div>
      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3" aria-live="polite">
        {chat.length === 0 ? <p className="text-xs text-slate-500">Introduce yourself, gain consent, then take a history. Tap a question or type your own.</p> : null}
        {chat.map((m, i) => (
          <div key={i} className="space-y-1">
            <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-[#0a1f3d] px-3 py-1.5 text-xs text-white">{m.q}</p>
            <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm">{m.a}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={lang === "ur" ? "Apna sawal likhein…" : "Type a question…"} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" aria-label="Ask the patient" />
        <button type="submit" className="rounded-xl bg-[#0a1f3d] px-3 text-white" aria-label="Ask"><Send className="h-4 w-4" aria-hidden="true" /></button>
      </form>
      {groups.map((group) => (
        <div key={group} className="mt-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{group}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {HISTORY.filter((h) => h.group === group).map((h) => (
              <button key={h.id} type="button" onClick={() => ask(h.id)} className={"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold " + (asked.has(h.id) ? "border-teal-300 bg-teal-50 text-teal-900" : "border-slate-300 text-slate-700 hover:border-teal-500")}>
                <MessageCircle className="h-3 w-3" aria-hidden="true" /> {lang === "ur" ? h.ur : h.en}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Diagnosis and result ---------------- */

export function DiagnosePanel({ onSubmit }: { onSubmit: (answers: { diagnosis: number; plan: number }) => void }) {
  const { caseData } = useExam();
  const [diagnosis, setDiagnosis] = useState<number | null>(null);
  const [plan, setPlan] = useState<number | null>(null);
  const block = (label: string, options: string[], value: number | null, set: (n: number) => void) => (
    <fieldset className="mt-4">
      <legend className="text-sm font-bold text-navy-800">{label}</legend>
      <div className="mt-2 space-y-1.5">
        {options.map((option, i) => (
          <label key={option} className={"flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-[13px] " + (value === i ? "border-teal-500 bg-teal-50" : "border-slate-200")}>
            <input type="radio" name={label} checked={value === i} onChange={() => set(i)} className="mt-0.5 accent-teal-600" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div>
      <p className="text-sm text-slate-600">Commit to your clinical decision for {caseData.patient.name}.</p>
      {block("Most likely diagnosis", caseData.questions.diagnosis.options, diagnosis, setDiagnosis)}
      {block("Your plan", caseData.questions.plan.options, plan, setPlan)}
      <button type="button" disabled={diagnosis === null || plan === null} onClick={() => onSubmit({ diagnosis: diagnosis!, plan: plan! })} className="nx-btn nx-btn-primary mt-4 w-full disabled:opacity-40">
        Submit and see my score <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ResultPanel({ result, caseData, minutes, onRetry, onNext }: { result: SessionResult; caseData: VirtualCase; minutes: number; onRetry: () => void; onNext: () => void }) {
  return (
    <div>
      <div className={"rounded-3xl p-5 text-white " + (result.passed ? "bg-[#06402f]" : "bg-[#0a1f3d]")}>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70"><Trophy className="h-4 w-4" aria-hidden="true" /> OSCE score</p>
        <p className="mt-1 text-4xl font-extrabold">{result.total}%</p>
        <p className="mt-1 text-sm text-white/80">{result.passed ? "Passed — well examined." : "Not yet — review the feedback and try again."} · {minutes} min</p>
        <p className="mt-3 text-sm"><strong>Diagnosis:</strong> {caseData.diagnosis}</p>
      </div>
      {result.missedRedFlag ? (
        <p className="mt-3 flex gap-2 rounded-2xl bg-rose-50 p-3 text-[13px] leading-6 text-rose-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" /> Missed red flag — score capped at 40%. {caseData.key.redFlag}
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {result.parts.map((part) => (
          <details key={part.label} className="rounded-2xl border border-slate-200 p-3" open={part.score < part.max}>
            <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-navy-800">
              <span>{part.label}</span>
              <span className={part.score === part.max ? "text-emerald-700" : "text-amber-700"}>{part.score}/{part.max}</span>
            </summary>
            <ul className="mt-2 space-y-1 text-[13px] leading-5 text-slate-700">
              {part.detail.map((d) => (
                <li key={d} className="flex gap-1.5">
                  {d.startsWith("✓") ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-600" aria-hidden="true" /> : d.startsWith("✗") ? <XCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-rose-500" aria-hidden="true" /> : null}
                  <span>{d.replace(/^[✓✗] /, "")}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      {caseData.teaching.length ? (
        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-bold text-navy-800">Take-home points</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] leading-5 text-slate-700">{caseData.teaching.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="nx-btn nx-btn-light"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again</button>
        <button type="button" onClick={onNext} className="nx-btn nx-btn-primary">Next patient <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
