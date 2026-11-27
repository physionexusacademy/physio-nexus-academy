"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Eye, FlaskConical,
  GraduationCap, Hand, Info, Languages, Lightbulb, ListChecks, Printer, RotateCcw, ShieldAlert, Siren, Sparkles, Stethoscope, Target,
  TrendingDown, TrendingUp, UserRound,
} from "lucide-react";
import { useLang } from "@/lib/lang";
import type { BookBlock, BookChapter, BookHelp, BookSection } from "@/lib/conditions/book-types";
import { BOOK, VOLUMES } from "@/lib/conditions/book-types";
import "./book-guide.css";

/**
 * One chapter of the owner's book, shown word for word in a guided, easy layout. The book's text is never changed here: blocks are only laid out
 * (a test card, a red-flag panel, a yes/no pathway, exercise cards, a case to solve). The Roman Urdu help under a section is PNA's own help,
 * labelled as such, and follows the site's language switch.
 */

type Props = {
  chapter: BookChapter;
  help?: BookHelp | null;
  /** Shown in the header chips (area, type ...). */
  chips?: { label: string; href?: string }[];
  /** From the book, verbatim: a short "what it is", the first warning signs and where to start. */
  glance?: { summary: string; redFlags: string[]; firstSteps: string[] };
  backHref: string;
  backLabel: string;
  footer?: React.ReactNode;
};

const SECTION_ICON: Record<string, typeof BookOpen> = {
  A: BookOpen, B: Eye, C: UserRound, D: Stethoscope, E: FlaskConical, F: Brain, G: Siren, H: Target, I: Hand, J: TrendingUp, K: Sparkles, L: ListChecks,
  M: RotateCcw, N: GraduationCap,
};

/** "B to C. Presentation and family interview" → letter "B–C", name "Presentation and family interview". */
function sectionName(s: BookSection) {
  const m = s.title.match(/^([A-N])(?:\s+to\s+([A-N]))?\.\s+(.*)$/);
  if (m) return { letter: m[2] ? `${m[1]}–${m[2]}` : m[1], name: m[3] };
  return { letter: "", name: s.title };
}

const anchor = (s: BookSection) => s.key;
const LETTER_ORDER = "ABCDEFGHIJKLMN";
/** "F to G. ..." → ["F", "G"] */
function lettersOf(s: BookSection): string[] {
  const m = s.title.match(/^([A-N])(?:\s+to\s+([A-N]))?\./);
  if (!m) return [];
  return LETTER_ORDER.slice(LETTER_ORDER.indexOf(m[1]), LETTER_ORDER.indexOf(m[2] ?? m[1]) + 1).split("");
}

// ---------------------------------------------------------------- text

const TOKEN = /(\*\*[^*]+\*\*|\[Ref\s*[–-]\s*to verify[^\]]*\])/g;

function RefBadge({ text }: { text: string }) {
  const detail = text.replace(/^\[|\]$/g, "");
  return (
    <span
      className="bg-ref mx-0.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded-full border border-amber-300/80 bg-amber-50 px-1.5 py-px align-middle text-[10px] font-bold uppercase tracking-wide text-amber-800"
      title={`${detail}: the book marks this claim for a source check before it is treated as established.`}
      aria-label={`${detail}`}
    >
      <Info className="h-2.5 w-2.5" aria-hidden="true" />
      ref
    </span>
  );
}

function Rich({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-bold text-navy-900">{p.slice(2, -2)}</strong>
        ) : p.startsWith("[Ref") ? (
          <RefBadge key={i} text={p} />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

const plain = (s: string) => s.replace(/\*\*/g, "");

// ---------------------------------------------------------------- blocks

function Para({ b }: { b: Extract<BookBlock, { t: "p" }> }) {
  return <p className={"text-[15px] leading-7 text-slate-700 " + (b.italic ? "italic text-slate-600" : "")}><Rich text={b.text} /></p>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-700">
          <span className="mt-[11px] h-1.5 w-1.5 flex-none rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)]" aria-hidden="true" />
          <span><Rich text={t} /></span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items, start }: { items: string[]; start: number }) {
  return (
    <ol className="space-y-2.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-700">
          <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-navy-800 text-xs font-bold text-white ring-4 ring-teal-100">{start + i}</span>
          <span className="pt-0.5"><Rich text={t} /></span>
        </li>
      ))}
    </ol>
  );
}

/** A plain table: a real table on wide screens; each row turns into a labelled card on a phone (one copy of the text, CSS only). */
function Table({ b }: { b: Extract<BookBlock, { t: "table" }> }) {
  const head = b.head ? b.rows[0] : null;
  const body = b.head ? b.rows.slice(1) : b.rows;
  return (
    <div className="bg-table overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        {head ? (
          <thead className="bg-gradient-to-r from-navy-900 to-navy-700 text-white">
            <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
        ) : null}
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri} className="border-t border-slate-100 align-top odd:bg-white even:bg-slate-50/70">
              {r.map((c, ci) => (
                <td key={ci} data-label={head?.[ci] ?? ""} className={"px-4 py-3 leading-6 text-slate-700 " + (ci === 0 ? "font-semibold text-navy-900" : "")}>
                  <Rich text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TEST_TONE: Record<string, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-950",
  negative: "border-slate-200 bg-slate-50 text-slate-800",
  caution: "border-amber-300 bg-amber-50 text-amber-950",
  limit: "border-amber-200 bg-amber-50/70 text-amber-950",
  "common errors": "border-amber-200 bg-amber-50/70 text-amber-950",
  errors: "border-amber-200 bg-amber-50/70 text-amber-950",
  "next step": "border-teal-200 bg-teal-50 text-teal-950",
};

/** E1, E2 ... : the book's "Item | Detail" card for one special test, as a test card. */
function TestCard({ title, b }: { title: string; b: Extract<BookBlock, { t: "table" }> }) {
  const rows = b.head ? b.rows.slice(1) : b.rows;
  const [n, ...rest] = title.split(/\.\s+/);
  const name = rest.join(". ") || title;
  return (
    <article className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-br from-white via-white to-teal-50/60 p-5 shadow-[0_10px_30px_-18px_rgba(13,148,136,0.6)] sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-300/20 blur-2xl" aria-hidden="true" />
      <header className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-navy-900 font-mono text-sm font-bold text-teal-300 shadow-inner">{rest.length ? n : "E"}</span>
        <h4 className="pt-1.5 text-lg font-bold leading-snug text-navy-900">{name}</h4>
      </header>
      <dl className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {rows.map((r, i) => {
          const label = plain(r[0]);
          const tone = TEST_TONE[label.toLowerCase()] ?? "border-slate-200 bg-white text-slate-800";
          const wide = /action|instruction|accuracy|supports|purpose|next step|caution|errors/i.test(label) || (r[1]?.length ?? 0) > 110;
          return (
            <div key={i} className={`rounded-2xl border px-4 py-3 ${tone} ${wide ? "sm:col-span-2" : ""}`}>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">{label}</dt>
              <dd className="mt-1 text-[15px] leading-7"><Rich text={r[1] ?? ""} /></dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

function urgencyTone(u: string) {
  const s = u.toLowerCase();
  if (s.includes("emergency")) return { chip: "bg-red-600 text-white", ring: "border-red-300 bg-red-50/80", icon: Siren };
  if (s.includes("urgent") || s.includes("same-day") || s.includes("same day")) return { chip: "bg-amber-500 text-white", ring: "border-amber-300 bg-amber-50/70", icon: ShieldAlert };
  return { chip: "bg-slate-700 text-white", ring: "border-slate-200 bg-white", icon: AlertTriangle };
}

/** Section G: one glowing card per warning finding, with its urgency first. */
function RedFlags({ b }: { b: Extract<BookBlock, { t: "table" }> }) {
  const head = b.rows[0].map((h) => plain(h).toLowerCase());
  const col = (re: RegExp) => head.findIndex((h) => re.test(h));
  const iFind = 0;
  const iUrg = col(/urgency/);
  const iAct = col(/action/);
  const others = head.map((_, i) => i).filter((i) => i !== iFind && i !== iUrg && i !== iAct);
  return (
    <div className="grid gap-3">
      {b.rows.slice(1).map((r, ri) => {
        const t = urgencyTone(iUrg >= 0 ? r[iUrg] : "");
        const Icon = t.icon;
        return (
          <article key={ri} className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${t.ring}`}>
            {iUrg >= 0 && r[iUrg] ? <p className="mb-2"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${t.chip}`}><span className="sr-only">{b.rows[0][iUrg]}: </span><Rich text={r[iUrg]} /></span></p> : null}
            <h4 className="flex gap-2.5 text-[15px] font-bold leading-6 text-red-950">
              <Icon className="mt-0.5 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span><Rich text={r[iFind]} /></span>
            </h4>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {others.map((i) => (r[i] ? (
                <div key={i}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-900/60">{b.rows[0][i]}</dt>
                  <dd className="leading-6 text-slate-800"><Rich text={r[i]} /></dd>
                </div>
              ) : null))}
            </dl>
            {iAct >= 0 && r[iAct] ? (
              <p className="mt-3 flex gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold leading-6 text-navy-900 ring-1 ring-red-200">
                <ArrowRight className="mt-1 h-4 w-4 flex-none text-red-600" aria-hidden="true" />
                <span><span className="sr-only">{b.rows[0][iAct]}: </span><Rich text={r[iAct]} /></span>
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

/** Section J: one card per exercise, with the start dose and when to progress or regress. */
function ExerciseCards({ b }: { b: Extract<BookBlock, { t: "table" }> }) {
  const head = b.rows[0].map((h) => plain(h));
  const find = (re: RegExp) => head.findIndex((h) => re.test(h.toLowerCase()));
  const iDose = find(/dose/);
  const iUp = find(/progress/);
  const iDown = find(/regress/);
  const rest = head.map((_, i) => i).filter((i) => i !== 0 && i !== iDose && i !== iUp && i !== iDown);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {b.rows.slice(1).map((r, ri) => (
        <article key={ri} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-bold text-navy-900"><Rich text={r[0]} /></h4>
            {iDose >= 0 && r[iDose] ? <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-teal-200"><span className="sr-only">{head[iDose]}: </span><Rich text={r[iDose]} /></span> : null}
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {rest.map((i) => (r[i] ? (
              <div key={i}><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{head[i]}</dt><dd className="leading-6 text-slate-700"><Rich text={r[i]} /></dd></div>
            ) : null))}
          </dl>
          <div className="mt-auto grid gap-2 pt-3 sm:grid-cols-2">
            {iUp >= 0 && r[iUp] ? (
              <p className="flex gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-950 ring-1 ring-emerald-200">
                <TrendingUp className="mt-1 h-4 w-4 flex-none text-emerald-600" aria-hidden="true" /><span><span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">{head[iUp]}</span><Rich text={r[iUp]} /></span>
              </p>
            ) : null}
            {iDown >= 0 && r[iDown] ? (
              <p className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950 ring-1 ring-amber-200">
                <TrendingDown className="mt-1 h-4 w-4 flex-none text-amber-600" aria-hidden="true" /><span><span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">{head[iDown]}</span><Rich text={r[iDown]} /></span>
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function trendTone(meaning: string) {
  const s = meaning.toLowerCase();
  if (/red flag|deteriorat|worse|emergency/.test(s)) return "bg-red-500";
  if (/not respond|no change|plateau|slow/.test(s)) return "bg-amber-400";
  if (/respond|improv|better|on track/.test(s)) return "bg-emerald-500";
  return "bg-slate-400";
}

/** Section M: the "Trend | Meaning | Action" table as traffic lights. */
function TrendLights({ b }: { b: Extract<BookBlock, { t: "table" }> }) {
  const head = b.rows[0];
  return (
    <ul className="grid gap-2.5">
      {b.rows.slice(1).map((r, ri) => (
        <li key={ri} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1.2fr)] sm:items-center">
          <p className="flex items-start gap-3 text-[15px] font-semibold leading-6 text-navy-900">
            <span className={`mt-1.5 h-3 w-3 flex-none rounded-full ring-4 ring-white ${trendTone(r[1] ?? "")}`} style={{ boxShadow: "0 0 12px currentColor" }} aria-hidden="true" />
            <span><span className="sr-only">{head[0]}: </span><Rich text={r[0]} /></span>
          </p>
          <p className="text-sm font-bold text-slate-600"><span className="sr-only">{head[1]}: </span><Rich text={r[1] ?? ""} /></p>
          <p className="flex gap-2 text-sm leading-6 text-slate-700"><ArrowRight className="mt-1 h-4 w-4 flex-none text-teal-600" aria-hidden="true" /><span><span className="sr-only">{head[2]}: </span><Rich text={r[2] ?? ""} /></span></p>
        </li>
      ))}
    </ul>
  );
}

/** Section H: numbered questions with "Yes: ... No: ..." become a step-by-step pathway (all steps stay visible for printing and reading). */
function Pathway({ items, start }: { items: string[]; start: number }) {
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});
  const parse = (t: string) => {
    const m = t.match(/^(.*?)\s*\*\*Yes:?\*\*:?\s*(.*?)\s*\*\*No(?:\s*\(([^)]*)\))?:?\*\*:?\s*(.*)$/);
    if (!m) return null;
    return { q: m[1], yes: m[2], no: m[4], noNote: m[3] ?? "" };
  };
  const steps = items.map(parse);
  if (steps.some((s) => !s)) return <Steps items={items} start={start} />;
  return (
    <ol className="relative space-y-3">
      {items.map((raw, i) => {
        const s = steps[i]!;
        const chosen = answers[i];
        const active = i === at;
        return (
          <li key={i} className={`relative rounded-2xl border p-4 transition sm:p-5 ${active ? "border-teal-400 bg-gradient-to-br from-teal-50 to-white shadow-[0_0_0_4px_rgba(45,212,191,0.15)]" : "border-slate-200 bg-white"}`}>
            {i < items.length - 1 ? <span className="absolute -bottom-3 left-8 h-3 w-px bg-teal-300" aria-hidden="true" /> : null}
            <div className="flex gap-3">
              <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold ${active ? "bg-teal-600 text-white" : "bg-navy-800 text-white"}`}>{start + i}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-7 text-navy-900"><Rich text={s.q} /></p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => { setAnswers((a) => ({ ...a, [i]: "yes" })); setAt(i); }} aria-pressed={chosen === "yes"}
                    className={`rounded-xl border px-3 py-2 text-left text-sm leading-6 transition ${chosen === "yes" ? "border-red-300 bg-red-50 text-red-950 ring-2 ring-red-200" : "border-slate-200 bg-white text-slate-700 hover:border-red-200"}`}>
                    <span className="font-bold text-red-700">Yes:</span> <Rich text={s.yes} />
                  </button>
                  <button type="button" onClick={() => { setAnswers((a) => ({ ...a, [i]: "no" })); setAt(Math.min(i + 1, items.length - 1)); }} aria-pressed={chosen === "no"}
                    className={`rounded-xl border px-3 py-2 text-left text-sm leading-6 transition ${chosen === "no" ? "border-emerald-300 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
                    <span className="font-bold text-emerald-700">No{s.noNote ? ` (${s.noNote})` : ""}:</span> <Rich text={s.no} />
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
      {Object.keys(answers).length ? (
        <li className="list-none"><button type="button" onClick={() => { setAnswers({}); setAt(0); }} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:underline"><RotateCcw className="h-4 w-4" aria-hidden="true" />Start the pathway again</button></li>
      ) : null}
    </ol>
  );
}

/** A flowchart from the book (boxes joined by arrows). */
function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={i} className="flex flex-col items-center">
          <div className="w-full rounded-2xl border border-teal-300 bg-white px-4 py-3 text-[15px] leading-7 text-slate-800 shadow-[0_8px_24px_-16px_rgba(13,148,136,0.7)]">
            <span className="mr-2 font-mono text-xs font-bold text-teal-700">{String(i + 1).padStart(2, "0")}</span><Rich text={s} />
          </div>
          {i < steps.length - 1 ? <ArrowDown className="my-1 h-5 w-5 text-teal-500" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

const CALLOUT: Record<string, { icon: typeof Info; box: string; label: string }> = {
  teacher: { icon: GraduationCap, box: "border-teal-300 bg-gradient-to-br from-teal-50 to-white", label: "text-teal-800" },
  trap: { icon: AlertTriangle, box: "border-amber-300 bg-gradient-to-br from-amber-50 to-white", label: "text-amber-800" },
  memory: { icon: Lightbulb, box: "border-violet-300 bg-gradient-to-br from-violet-50 to-white", label: "text-violet-800" },
  stop: { icon: ShieldAlert, box: "border-red-300 bg-gradient-to-br from-red-50 to-white", label: "text-red-800" },
  case: { icon: UserRound, box: "border-navy-300 bg-gradient-to-br from-slate-50 to-white", label: "text-navy-800" },
  why: { icon: Info, box: "border-sky-300 bg-gradient-to-br from-sky-50 to-white", label: "text-sky-800" },
  note: { icon: Info, box: "border-slate-200 bg-white", label: "text-slate-700" },
};

function Callout({ b }: { b: Extract<BookBlock, { t: "callout" }> }) {
  const c = CALLOUT[b.kind] ?? CALLOUT.note;
  const Icon = c.icon;
  return (
    <aside className={`rounded-2xl border-l-4 border p-4 shadow-sm sm:p-5 ${c.box}`}>
      <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${c.label}`}><Icon className="h-4 w-4" aria-hidden="true" />{b.label}</p>
      <div className="mt-2 space-y-2">{b.body.map((t, i) => <p key={i} className="text-[15px] leading-7 text-slate-800"><Rich text={t} /></p>)}</div>
    </aside>
  );
}

/** Section N questions: "**Question?** Answer" or "Question? Answer". The answer stays in the page (and in print) but is folded until asked for. */
function splitQA(t: string): { q: string; a: string } | null {
  const bold = t.match(/^\*\*([^*]+\?)\*\*\s*(.+)$/);
  if (bold) return { q: bold[1], a: bold[2] };
  const i = t.indexOf("? ");
  if (i > 8 && i < t.length - 3) return { q: t.slice(0, i + 1), a: t.slice(i + 2) };
  return null;
}

function Questions({ items, start }: { items: string[]; start: number }) {
  const qa = items.map(splitQA);
  if (qa.some((x) => !x)) return <Steps items={items} start={start} />;
  return (
    <ol className="space-y-3">
      {qa.map((x, i) => (
        <li key={i}>
          <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-teal-300 open:shadow-[0_10px_30px_-20px_rgba(13,148,136,0.8)]">
            <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy-800 text-xs font-bold text-white">{start + i}</span>
              <span className="flex-1 text-[15px] font-semibold leading-7 text-navy-900"><Rich text={x!.q} /></span>
              <span className="mt-1 inline-flex flex-none items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200 group-open:hidden">Show answer <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></span>
              <span className="mt-1 hidden flex-none items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 group-open:inline-flex">Hide <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </summary>
            <p className="border-t border-slate-100 px-4 pb-4 pt-3 text-[15px] leading-7 text-slate-700 sm:px-5 sm:pl-[3.75rem]"><Rich text={x!.a} /></p>
          </details>
        </li>
      ))}
    </ol>
  );
}

/** "Now You Should Be Able To": a checklist the reader can tick (kept on this device). */
function Checklist({ items, storeKey }: { items: string[]; storeKey: string }) {
  const [done, setDone] = useState<boolean[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(storeKey) ?? "[]")); } catch { /* storage blocked */ }
  }, [storeKey]);
  const toggle = (i: number) => {
    const next = items.map((_, k) => (k === i ? !done[k] : !!done[k]));
    setDone(next);
    try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* storage blocked */ }
  };
  const count = items.filter((_, i) => done[i]).length;
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all" style={{ width: `${(count / Math.max(1, items.length)) * 100}%` }} /></div>
        <span className="text-xs font-bold text-slate-600">{count}/{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i}>
            <button type="button" onClick={() => toggle(i)} aria-pressed={!!done[i]}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] leading-7 transition ${done[i] ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"}`}>
              <span className={`mt-1 grid h-5 w-5 flex-none place-items-center rounded-md border ${done[i] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"}`}>{done[i] ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
              <span><Rich text={t} /></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Chapter summary: treatment decision": numbered cards with the bold lead as the card title. */
function DecisionGrid({ items, start }: { items: string[]; start: number }) {
  return (
    <ol className="grid gap-2.5 sm:grid-cols-2">
      {items.map((t, i) => {
        const m = t.match(/^\*\*([^*]+?)\*\*\s*(.*)$/);
        return (
          <li key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="font-mono text-sm font-bold text-teal-600">{String(start + i).padStart(2, "0")}</span>
            <p className="text-sm leading-6 text-slate-700">{m ? <><strong className="block text-[13px] font-bold uppercase tracking-wide text-navy-900">{m[1].replace(/:$/, "")}</strong><Rich text={m[2]} /></> : <Rich text={t} />}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Section N: "**Case:** ..." is the patient; the paragraphs after it ("**Working diagnosis:** ...", "**Plan:** ...") are the reasoning, folded so the
 *  reader can try first. All of it stays in the page (and opens for printing). */
function CaseCard({ items }: { items: string[] }) {
  const [story, ...reasoning] = items;
  return (
    <div className="overflow-hidden rounded-3xl border border-navy-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
      <div className="flex items-center gap-2 bg-navy-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-200"><UserRound className="h-4 w-4" aria-hidden="true" />Clinical case</div>
      <p className="px-5 pt-4 text-[15px] leading-7 text-slate-800"><Rich text={story} /></p>
      {reasoning.length ? (
        <details className="group mx-5 mb-5 mt-3 rounded-2xl border border-teal-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-teal-800">
            <span className="flex items-center gap-2"><Brain className="h-4 w-4" aria-hidden="true" />Think first, then show the reasoning</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-2 border-t border-teal-100 px-4 pb-4 pt-3">{reasoning.map((t, i) => <p key={i} className="text-[15px] leading-7 text-slate-700"><Rich text={t} /></p>)}</div>
        </details>
      ) : <div className="h-4" />}
    </div>
  );
}

function Blocks({ s, chapterKey }: { s: BookSection; chapterKey: string }) {
  const out: React.ReactNode[] = [];
  const isChecklist = /now-you-should-be-able-to/.test(s.key);
  const isSummary = s.key.startsWith("chapter-summary");
  for (let i = 0; i < s.blocks.length; i++) {
    const b = s.blocks[i];
    const prev = s.blocks[i - 1];
    const key = `${s.key}-${i}`;
    if (b.t === "h") {
      const next = s.blocks[i + 1];
      if (next && next.t === "table" && next.rows[0]?.length === 2 && /^E\d+\./.test(b.text)) continue; // drawn by its test card
      out.push(<h3 key={key} className="pt-2 text-lg font-bold text-navy-900"><Rich text={b.text} /></h3>);
    } else if (b.t === "p" && s.key === "N" && /^\*\*Case:?\*\*/.test(b.text)) {
      const group = [b.text];
      while (s.blocks[i + 1]?.t === "p" && /^\*\*(?!Questions)[^*]{2,40}:?\*\*/.test((s.blocks[i + 1] as { text: string }).text)) group.push((s.blocks[++i] as { text: string }).text);
      out.push(<CaseCard key={key} items={group} />);
    } else if (b.t === "p") out.push(<Para key={key} b={b} />);
    else if (b.t === "ul") out.push(isChecklist ? <Checklist key={key} items={b.items} storeKey={`pna-book-check-${chapterKey}`} /> : <Bullets key={key} items={b.items} />);
    else if (b.t === "ol") {
      if (s.key === "H" && b.items.some((t) => /\*\*Yes:?\*\*/.test(t))) out.push(<Pathway key={key} items={b.items} start={b.start} />);
      else if (s.key === "N") out.push(<Questions key={key} items={b.items} start={b.start} />);
      else if (isSummary) out.push(<DecisionGrid key={key} items={b.items} start={b.start} />);
      else out.push(<Steps key={key} items={b.items} start={b.start} />);
    } else if (b.t === "table") {
      const head = b.head ? b.rows[0].map((h) => plain(h).toLowerCase()) : [];
      if (prev?.t === "h" && /^E\d+\./.test(prev.text) && b.rows[0]?.length === 2) out.push(<TestCard key={key} title={prev.text} b={b} />);
      else if (head.some((h) => h.includes("urgency")) && b.rows[0].length >= 3) out.push(<RedFlags key={key} b={b} />);
      else if (head[0]?.startsWith("exercise") && head.some((h) => h.startsWith("progress"))) out.push(<ExerciseCards key={key} b={b} />);
      else if (head[0] === "trend" && b.rows[0].length === 3) out.push(<TrendLights key={key} b={b} />);
      else out.push(<Table key={key} b={b} />);
    } else if (b.t === "callout") out.push(<Callout key={key} b={b} />);
    else if (b.t === "flow") out.push(<Flow key={key} steps={b.steps} />);
  }
  return <div className="space-y-4">{out}</div>;
}

// ---------------------------------------------------------------- page

export function BookGuide({ chapter, help, chips = [], glance, backHref, backLabel, footer }: Props) {
  const [lang] = useLang();
  const [helpOn, setHelpOn] = useState<boolean | null>(null);
  const showHelp = helpOn ?? lang === "ur";
  const [active, setActive] = useState<string>(chapter.sections[0]?.key ?? "");
  const [progress, setProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const chapterKey = `v${chapter.vol}c${chapter.ch}`;

  const nav = useMemo(() => chapter.sections.map((s) => ({ key: s.key, ...sectionName(s) })), [chapter]);
  const testCount = chapter.sections.find((s) => s.key === "E")?.blocks.filter((b) => b.t === "h" && /^E\d+\./.test(b.text)).length ?? 0;
  const flagSection = chapter.sections.find((s) => s.key === "G") ?? chapter.sections.find((s) => lettersOf(s).includes("G"));
  const flagTables = (flagSection?.blocks ?? []).filter((b): b is Extract<BookBlock, { t: "table" }> => b.t === "table" && b.head && b.rows[0].some((h) => /urgency/i.test(h)));
  const flagCount = flagTables.reduce((n, t) => n + t.rows.length - 1, 0) || (flagSection?.key === "G" ? (flagSection.blocks.find((b) => b.t === "table") as Extract<BookBlock, { t: "table" }> | undefined)?.rows.length ?? 0 : 0);
  const lettered = new Set(chapter.sections.flatMap(lettersOf)).size;

  useEffect(() => {
    const els = chapter.sections.map((s) => document.getElementById(`sec-${anchor(s)}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace(/^sec-/, ""));
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [chapter]);

  // keep the active chip in view in the phone rail
  useEffect(() => {
    document.getElementById(`chip-${active}`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  // #E, #sec-E and the older guide's #quick / #clinical / #expert links all land on a section
  useEffect(() => {
    const raw = window.location.hash.replace("#", "");
    if (!raw) return;
    const legacy: Record<string, string> = { quick: "A", clinical: "D", expert: "I" };
    const id = legacy[raw] ?? raw.replace(/^sec-/, "");
    document.getElementById(`sec-${id}`)?.scrollIntoView();
  }, []);

  const print = () => {
    document.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));
    window.print();
  };

  return (
    <div ref={articleRef} className="book-guide">
      <div className="bg-noprint fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* HERO */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#0f766e_0%,#0b2545_45%,#06142b_100%)] p-6 text-white shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-teal-100 ring-1 ring-white/20"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />Vol {chapter.vol} · Ch {chapter.ch}</span>
            {chips.map((c) => (c.href ? <a key={c.label} href={c.href} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15 hover:bg-white/20">{c.label}</a> : <span key={c.label} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{c.label}</span>))}
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">{chapter.title}</h1>
          {chapter.lead ? <p className="mt-3 max-w-3xl text-base italic leading-7 text-teal-50/90 sm:text-lg">{chapter.lead}</p> : null}
          <p className="mt-4 text-sm text-teal-100/80">From <cite className="font-semibold not-italic text-white">{BOOK.title}</cite> by {BOOK.author} · {VOLUMES[chapter.vol]}</p>
          <dl className="mt-6 grid max-w-xl grid-cols-3 gap-2">
            {[
              { k: "Sections", v: lettered || nav.length },
              { k: "Special tests", v: testCount },
              { k: "Red flags", v: flagCount },
            ].map((x) => (
              <div key={x.k} className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200/90">{x.k}</dt>
                <dd className="font-mono text-2xl font-bold text-white">{x.v}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-noprint mt-6 flex flex-wrap gap-2">
            {help ? (
              <button type="button" onClick={() => setHelpOn(!showHelp)} aria-pressed={showHelp}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${showHelp ? "bg-teal-300 text-navy-950" : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"}`}>
                <Languages className="h-4 w-4" aria-hidden="true" />{showHelp ? "Roman Urdu help: on" : "Roman Urdu mein samjhein"}
              </button>
            ) : null}
            <button type="button" onClick={print} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 hover:bg-white/20"><Printer className="h-4 w-4" aria-hidden="true" />Print</button>
          </div>
        </div>
      </header>

      {/* AT A GLANCE */}
      {glance ? (
        <section aria-label="At a glance" className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700"><BookOpen className="h-4 w-4" aria-hidden="true" />What it is</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">{glance.summary}</p>
          </div>
          {glance.redFlags.length ? (
            <a href={`#sec-${flagSection?.key ?? "G"}`} className="group rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm transition hover:border-red-300">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-red-700"><Siren className="h-4 w-4" aria-hidden="true" />Must not miss</h2>
              <ul className="mt-2 space-y-1.5">{glance.redFlags.slice(0, 3).map((t) => <li key={t} className="flex gap-2 text-sm leading-6 text-red-950"><AlertTriangle className="mt-1 h-3.5 w-3.5 flex-none text-red-500" aria-hidden="true" />{t}</li>)}</ul>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 group-hover:underline">All red flags and what to do <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </a>
          ) : null}
          {glance.firstSteps.length ? (
            <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700"><Target className="h-4 w-4" aria-hidden="true" />Start with</h2>
              <ul className="mt-2 space-y-1.5">{glance.firstSteps.slice(0, 3).map((t) => <li key={t} className="flex gap-2 text-sm leading-6 text-slate-800"><CheckCircle2 className="mt-1 h-3.5 w-3.5 flex-none text-teal-600" aria-hidden="true" />{t}</li>)}</ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* PHONE RAIL */}
      <nav aria-label="Sections of this chapter" className="bg-noprint sticky top-[64px] z-30 -mx-4 mt-5 border-y border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <ul className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {nav.map((n) => (
            <li key={n.key}>
              <a id={`chip-${n.key}`} href={`#sec-${n.key}`} className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${active === n.key ? "bg-navy-900 text-teal-200 shadow" : "bg-slate-100 text-slate-700"}`}>
                {n.letter ? <span className="font-mono">{n.letter}</span> : null}
                <span className="max-w-[9rem] truncate">{n.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        {/* DESKTOP RAIL */}
        <nav aria-label="Sections of this chapter" className="bg-noprint hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">In this chapter</p>
            <ul className="space-y-0.5">
              {nav.map((n) => {
                const Icon = SECTION_ICON[n.key] ?? ClipboardCheck;
                const on = active === n.key;
                return (
                  <li key={n.key}>
                    <a href={`#sec-${n.key}`} aria-current={on ? "true" : undefined}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] leading-5 transition ${on ? "bg-navy-900 text-white shadow-[0_8px_20px_-12px_rgba(11,37,69,0.9)]" : "text-slate-700 hover:bg-slate-100"}`}>
                      <span className={`grid h-6 w-6 flex-none place-items-center rounded-lg font-mono text-[11px] font-bold ${on ? "bg-teal-400 text-navy-950" : "bg-slate-100 text-slate-600"}`}>{n.letter ? n.letter.split("–")[0] : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}</span>
                      <span className="line-clamp-2">{n.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* THE CHAPTER */}
        <div className="min-w-0 space-y-5">
          {chapter.sections.map((s) => {
            const { letter, name } = sectionName(s);
            const Icon = SECTION_ICON[s.key] ?? ClipboardCheck;
            const red = s === flagSection;
            const tip = help?.sections[s.key];
            return (
              <section key={s.key} id={`sec-${anchor(s)}`} aria-labelledby={`h-${s.key}`} className={`scroll-mt-36 rounded-[1.75rem] border p-5 shadow-sm sm:p-7 lg:scroll-mt-24 ${red ? "border-red-200 bg-gradient-to-b from-red-50/70 to-white" : "border-slate-200 bg-white"}`}>
                <header className="mb-4 flex items-center gap-3">
                  <span className={`grid h-11 w-11 flex-none place-items-center rounded-2xl font-mono text-sm font-bold shadow-inner ${red ? "bg-red-600 text-white" : "bg-navy-900 text-teal-300"}`}>{letter || <Icon className="h-5 w-5" aria-hidden="true" />}</span>
                  <div className="min-w-0">
                    {letter ? <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${red ? "text-red-600" : "text-teal-700"}`}>Section {letter}</p> : null}
                    <h2 id={`h-${s.key}`} className={`text-xl font-bold leading-tight sm:text-2xl ${red ? "text-red-900" : "text-navy-900"}`}>{name}</h2>
                  </div>
                </header>
                {tip ? (
                  showHelp ? (
                    <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-4" lang="ur-Latn">
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800"><Languages className="h-4 w-4" aria-hidden="true" />Roman Urdu mein · PNA ki madad (kitab ka text neeche hai)</p>
                      <p className="mt-1.5 text-[15px] leading-7 text-teal-950">{tip}</p>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setHelpOn(true)} className="bg-noprint mb-4 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100">
                      <Languages className="h-3.5 w-3.5" aria-hidden="true" />Roman Urdu mein samjhein
                    </button>
                  )
                ) : null}
                <Blocks s={s} chapterKey={chapterKey} />
              </section>
            );
          })}

          <aside className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
            <p className="font-bold">Clinical Education Disclaimer</p>
            <p>This book teaches clinical reasoning. It does not replace supervised clinical training, local protocols, or a medical diagnosis. A working diagnosis made by a physiotherapist is not a confirmed medical diagnosis. Always follow your local regulations, your institution&apos;s policies and the AHPC scope of practice. Medication, injection and surgical decisions belong to the medical team.</p>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-amber-900/80"><RefBadge text="[Ref – to verify]" /> marks a claim the book flags for a source check: no accuracy value, normative value or cut-off is presented as established until it has been checked.</p>
          </aside>

          <div className="bg-noprint flex flex-wrap gap-2">
            <a href={backHref} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-300">← {backLabel}</a>
            <button type="button" onClick={print} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-300"><Printer className="h-4 w-4" aria-hidden="true" />Print this chapter</button>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
