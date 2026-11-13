"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, RotateCcw, XCircle } from "lucide-react";
import { Chip, RichText, TeacherAvatar, TeacherBubble, StudentBubble, type BubbleTone } from "@/components/teacher/ui";
import { useLang } from "@/lib/lang";
import { buildItemTeach, type TeachTone } from "@/lib/skills/teach";
import { LESSONS_FOR_SKILL } from "@/lib/skills/ur/lesson-links";
import type { SkillAtlasItem, SkillData, SkillLevelId, SkillQuestion } from "@/lib/skills/types";

const TONE: Record<TeachTone, BubbleTone> = { plain: "plain", memory: "memory", mistake: "mistake", clinic: "clinic", safety: "safety", evidence: "evidence" };

/** The PNA Teacher walking a learner through one atlas item, in English or Roman Urdu. */
export function SkillTeacher({ data, item, level }: { data: SkillData; item: SkillAtlasItem; level: SkillLevelId }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const bottom = useRef<HTMLDivElement>(null);
  const plan = useMemo(() => buildItemTeach(data, item, level), [data, item, level]);
  const lessons = LESSONS_FOR_SKILL[data.slug] ?? [];
  // 0 = intro, 1..n = fields, n+1 = demo nudge + quick check
  const last = plan.steps.length + 1;

  useEffect(() => {
    if (open && index > 0) bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [index, open, answers]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group nx-holo flex w-full items-center gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white px-3.5 py-3 text-left"
      >
        <TeacherAvatar size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-extrabold text-navy-800"><i className="nx-ping" aria-hidden="true" />{ur ? "PNA Teacher se samjhein" : "Learn this with PNA Teacher"}</span>
          <span className="block text-xs text-slate-600">{ur ? "Step by step, asaan zubaan mein — aur end par chhota sa check" : "Step by step, in plain words, with a quick check at the end"}</span>
        </span>
        <ArrowRight className="h-4 w-4 flex-none text-teal-700 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    );
  }

  const shown = Math.min(index, last);
  return (
    <section className="rounded-3xl border border-teal-200 bg-gradient-to-b from-teal-50/70 to-white p-3 sm:p-4" aria-label="PNA Teacher">
      <header className="mb-3 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-teal-800">
          <GraduationCap className="h-4 w-4" aria-hidden="true" /> PNA Teacher · {shown} / {last}
        </p>
        <button type="button" onClick={() => { setOpen(false); setIndex(0); setAnswers({}); }} className="text-xs font-bold text-slate-500 hover:text-navy-800">
          {ur ? "Band karein" : "Close"}
        </button>
      </header>
      <div className="h-1 overflow-hidden rounded-full bg-teal-100" aria-hidden="true">
        <div className="nx-glow-bar h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${(shown / last) * 100}%` }} />
      </div>

      <div className="mt-4 space-y-3">
        <TeacherBubble label={ur ? "Chalein shuru karein" : "Let's begin"}>
          <RichText text={ur ? plan.intro.ur : plan.intro.en} />
        </TeacherBubble>
        {plan.steps.slice(0, Math.max(0, shown - 0)).map((step, i) => {
          if (i + 1 > index) return null;
          return (
            <div key={i} className="space-y-2">
              <TeacherBubble label={ur ? step.label.ur : step.label.en} tone={TONE[step.tone]}>
                <span className="block text-[13px] font-semibold text-slate-500">{ur ? step.lead.ur : step.lead.en}</span>
                <RichText text={step.value} />
              </TeacherBubble>
            </div>
          );
        })}
        {index >= last ? (
          <>
            <TeacherBubble label={ur ? "Ab practice" : "Now practise"} tone="try">
              <RichText text={ur ? plan.outro.ur : plan.outro.en} />
            </TeacherBubble>
            {plan.questions.length ? (
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-800">{ur ? "Jaldi se check karein" : "Quick check"}</p>
                {plan.questions.map((q) => (
                  <MiniQuestion key={q.id} question={q} chosen={answers[q.id]} onChoose={(i) => setAnswers((prev) => (prev[q.id] === undefined ? { ...prev, [q.id]: i } : prev))} ur={ur} />
                ))}
              </div>
            ) : null}
            {Object.keys(answers).length >= plan.questions.length ? (
              <TeacherBubble label={ur ? "Shabash" : "Well done"} tone="correct">
                <RichText
                  text={
                    ur
                      ? `Yeh raha **${item.title}** ka poora flow. Ab ise kisi dost par practise karein, phir "Practise" tab mein drills try karein.`
                      : `That is the full flow for **${item.title}**. Practise it on a friend, then try the drills in the Practise tab.`
                  }
                />
              </TeacherBubble>
            ) : null}
            {lessons.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">{ur ? "Mazeed gehra seekhein" : "Go deeper with PNA Teacher"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lessons.map((lesson) => (
                    <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:border-teal-400">
                      {lesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
        <div ref={bottom} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {index > 0 ? (
          <Chip variant="ghost" onClick={() => setIndex((v) => Math.max(0, v - 1))}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {ur ? "Peechay" : "Back"}
          </Chip>
        ) : null}
        {index < last ? (
          <Chip onClick={() => setIndex((v) => Math.min(last, v + 1))}>
            {index === 0 ? (ur ? "Shuru karein" : "Start") : ur ? "Agla" : "Next"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Chip>
        ) : (
          <Chip variant="soft" onClick={() => { setIndex(0); setAnswers({}); }}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {ur ? "Dobara shuru" : "Start again"}
          </Chip>
        )}
      </div>
    </section>
  );
}

function MiniQuestion({ question, chosen, onChoose, ur }: { question: SkillQuestion; chosen: number | undefined; onChoose: (index: number) => void; ur: boolean }) {
  const done = chosen !== undefined;
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3">
      <p className="text-[15px] font-bold leading-6 text-navy-800">{question.prompt}</p>
      <div className="mt-2 grid gap-1.5">
        {question.options.map((option, i) => {
          const right = done && i === question.answer;
          const wrong = done && i === chosen && i !== question.answer;
          return (
            <button
              key={option + i}
              type="button"
              disabled={done}
              onClick={() => onChoose(i)}
              className={
                "rounded-xl border px-3 py-2 text-left text-sm font-semibold transition " +
                (right ? "border-emerald-400 bg-emerald-50 text-emerald-900" : wrong ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 disabled:opacity-60")
              }
            >
              <span className="flex items-start gap-2">
                {right ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden="true" /> : wrong ? <XCircle className="mt-0.5 h-4 w-4 flex-none text-rose-600" aria-hidden="true" /> : null}
                <span>{option}</span>
              </span>
            </button>
          );
        })}
      </div>
      {done ? (
        <div className="mt-2 space-y-2">
          <StudentBubble>{question.options[chosen]}</StudentBubble>
          <TeacherBubble tone={chosen === question.answer ? "correct" : "retry"} label={chosen === question.answer ? (ur ? "Bilkul sahi" : "Correct") : ur ? "Qareeb, lekin…" : "Close, but…"}>
            <RichText text={chosen === question.answer ? question.explain : (ur ? "Sahi jawab yeh hai: " : "The right answer is: ") + question.options[question.answer] + ". " + question.explain} />
          </TeacherBubble>
        </div>
      ) : null}
    </div>
  );
}
