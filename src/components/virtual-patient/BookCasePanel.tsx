"use client";

/**
 * A patient from the book (Conditions & Treatment Guide): the case, the special tests and their results, the differential diagnosis and
 * the plan are the chapter's own words (public/virtual-patient/book/<slug>.json). The student reads the case, performs the chapter's
 * special tests on the 3D patient, commits to a diagnosis and a plan, then treats in the PNA clinic (TreatPanel, from the same chapter).
 */
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, FlaskConical, ShieldAlert, Stethoscope, XCircle } from "lucide-react";
import type { ExamRoom, PatientPosition } from "@/lib/virtual-patient/engine";
import type { BookChapter, BookTest } from "@/lib/virtual-patient/treat-setup";

const WRONG_PLANS = [
  "Strict rest and avoid all movement until the pain has completely gone",
  "Passive treatments only (machines and massage) with no exercise or advice",
  "Immediate referral for surgery without a trial of conservative care",
];

/** A stable shuffle (the same order for the same patient). */
function order<T>(items: T[], seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return items.map((item, i) => ({ item, k: Math.abs(Math.imul(h ^ (i * 2654435761), 1597334677)) })).sort((a, b) => a.k - b.k).map((x) => x.item);
}

/** Where a test is done, from the book's "Position" wording. */
function positionOf(test: BookTest): PatientPosition | null {
  const t = `${test.fields["Position"] ?? ""} ${test.fields["Position and action"] ?? ""} ${test.fields["How"] ?? ""} ${test.fields["Procedure"] ?? ""}`.toLowerCase();
  if (/side[- ]?lying/.test(t)) return "sidelying";
  if (/prone/.test(t)) return "prone";
  if (/supine|lying on (the|his|her) back|on the back/.test(t)) return "supine";
  if (/sitting|seated|sits/.test(t)) return "sitting";
  if (/standing|stands/.test(t)) return "standing";
  return null;
}

export type BookResult = { total: number; passed: boolean; detail: string[] };

export function BookCasePanel({ room, book, name, onTreat, onNext }: { room: ExamRoom; book: BookChapter; name: string; onTreat: () => void; onNext: () => void }) {
  const [tab, setTab] = useState<"case" | "tests" | "decide">("case");
  const [done, setDone] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<number | null>(null);
  const [plan, setPlan] = useState<number | null>(null);
  const [result, setResult] = useState<BookResult | null>(null);

  const story = book.case.filter((p) => !/^Working diagnosis/i.test(p));
  const reveal = book.case.filter((p) => /^Working diagnosis/i.test(p));
  const diagnoses = useMemo(() => order([book.working, ...book.differentials.map((d) => d.name).slice(0, 4)].filter(Boolean), `${book.slug}:d`), [book]);
  const plans = useMemo(() => order([book.plan, ...WRONG_PLANS], `${book.slug}:p`), [book]);
  const keyTests = book.tests.filter((t) => t.result !== "not-recorded");

  const perform = (t: BookTest) => {
    const pos = positionOf(t);
    if (pos && pos !== room.getPosition()) room.setPosition(pos);
    setOpen(t.name);
    setDone((d) => (d.includes(t.name) ? d : [...d, t.name]));
  };

  const submit = () => {
    if (diagnosis === null || plan === null) return;
    const detail: string[] = [];
    const testHit = keyTests.filter((t) => done.includes(t.name));
    for (const t of keyTests) detail.push(`${done.includes(t.name) ? "✓" : "✗"} ${t.name} (${t.result} in this case)`);
    const dxOk = diagnoses[diagnosis] === book.working;
    const planOk = plans[plan] === book.plan;
    detail.push(`${dxOk ? "✓" : "✗"} Diagnosis — the book: ${book.working}`);
    detail.push(`${planOk ? "✓" : "✗"} Plan — the book: ${book.plan}`);
    const testScore = keyTests.length ? (testHit.length / keyTests.length) * 40 : 40;
    const total = Math.round(testScore + (dxOk ? 35 : 0) + (planOk ? 25 : 0));
    setResult({ total, passed: total >= 70 && dxOk, detail });
  };

  if (result) {
    return (
      <div data-pna-vp-book-result={result.total}>
        <div className={"rounded-3xl p-5 text-white " + (result.passed ? "bg-[#06402f]" : "bg-[#0a1f3d]")}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Assessment score</p>
          <p className="mt-1 text-4xl font-extrabold">{result.total}%</p>
          <p className="mt-2 text-sm"><strong>Book diagnosis:</strong> {book.working}</p>
        </div>
        <ul className="mt-3 space-y-1 text-[13px] leading-5 text-slate-700">
          {result.detail.map((d) => (
            <li key={d} className="flex gap-1.5">{d.startsWith("✓") ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-600" aria-hidden="true" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-rose-500" aria-hidden="true" />}<span>{d.slice(2)}</span></li>
          ))}
        </ul>
        {reveal.length ? <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-[13px] leading-6 text-slate-700">{reveal.map((p) => <p key={p}>{p}</p>)}</div> : null}
        {book.qa.length ? (
          <details className="mt-3 rounded-2xl border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-bold text-navy-800">The book's questions and answers</summary>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-5 text-slate-700">{book.qa.map((q) => <li key={q}>{q}</li>)}</ol>
          </details>
        ) : null}
        <button type="button" onClick={onTreat} className="nx-btn nx-btn-primary mt-4 w-full" data-pna-vp-treat-start>
          <Stethoscope className="h-4 w-4" aria-hidden="true" /> Now treat {name.split(" ")[0]} in the PNA clinic <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onNext} className="nx-btn nx-btn-light mt-2 w-full">Next patient</button>
      </div>
    );
  }

  return (
    <div data-pna-vp-book={book.slug}>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
        {([["case", "Case", ClipboardList], ["tests", "Special tests", FlaskConical], ["decide", "Diagnose", Stethoscope]] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={"inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold " + (tab === id ? "bg-white text-navy-800 shadow" : "text-slate-500")}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {tab === "case" ? (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-teal-700"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> From the book · {book.title}</p>
          <div className="mt-2 space-y-2 rounded-2xl bg-slate-50 p-3 text-[13px] leading-6 text-slate-800">{story.map((p) => <p key={p}>{p.replace(/^Case:\s*/, "")}</p>)}</div>
          {book.redFlags.length ? (
            <details className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
              <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-rose-900"><ShieldAlert className="h-4 w-4" aria-hidden="true" /> Red flags to screen (Section G)</summary>
              <ul className="mt-2 space-y-1.5 text-[12px] leading-5 text-rose-950">{book.redFlags.slice(0, 8).map((r, i) => <li key={i}>• <strong>{r["Finding"]}</strong> — {r["Immediate action"] ?? r["Action"] ?? ""}</li>)}</ul>
            </details>
          ) : null}
          <button type="button" onClick={() => setTab("tests")} className="nx-btn nx-btn-primary mt-3 w-full">Examine: special tests <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ) : null}

      {tab === "tests" ? (
        <div className="mt-3">
          <p className="text-xs text-slate-600">The chapter's special tests (Section E). Choose the ones this patient needs; the patient is positioned for each.</p>
          <ul className="mt-2 space-y-1.5">
            {book.tests.map((t) => {
              const did = done.includes(t.name);
              const isOpen = open === t.name;
              return (
                <li key={t.name} className={"rounded-2xl border p-3 " + (isOpen ? "border-teal-500 bg-teal-50/50" : "border-slate-200")}>
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-[13px] font-bold text-navy-800">{t.name}</p>
                    <button type="button" onClick={() => perform(t)} className="flex-none rounded-xl bg-[#0a1f3d] px-2.5 py-1.5 text-xs font-bold text-white">{did ? "Again" : "Perform"}</button>
                  </div>
                  {isOpen ? (
                    <div className="mt-2 space-y-1 text-[12px] leading-5 text-slate-700">
                      {Object.entries(t.fields).filter(([k]) => !/^(supports|limits|next step)$/i.test(k)).map(([k, v]) => <p key={k}><strong>{k}:</strong> {v}</p>)}
                      <p className={"mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold " + (t.result === "positive" ? "bg-rose-100 text-rose-900" : t.result === "negative" ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700")}>
                        Result in this patient: {t.result === "positive" ? "Positive" : t.result === "negative" ? "Negative" : "Not recorded in the book's case"}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setTab("decide")} className="nx-btn nx-btn-primary mt-3 w-full">Diagnose <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ) : null}

      {tab === "decide" ? (
        <div className="mt-3">
          {([["Working diagnosis", diagnoses, diagnosis, setDiagnosis], ["Your plan", plans, plan, setPlan]] as const).map(([label, options, value, set]) => (
            <fieldset key={label} className="mt-3">
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
          ))}
          <button type="button" disabled={diagnosis === null || plan === null} onClick={submit} className="nx-btn nx-btn-primary mt-4 w-full disabled:opacity-40">Submit and see my score <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ) : null}
    </div>
  );
}
