"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import type { BiText, TeacherGoal, TeacherLang, TeacherLessonCard, TeacherProfile, TeacherStage } from "@/lib/teacher/types";
import { getTeacherPath, recommendPathSlug, stepsPerDay } from "@/lib/teacher/paths";
import { saveTeacherProfile, teacherToday } from "@/lib/teacher/progress";
import { withPath } from "@/lib/teacher/href";
import { Chip, RichText, StudentBubble, TeacherBubble, TypingBubble, pick, t } from "./ui";

const stageOptions: { value: TeacherStage; label: BiText }[] = [
  { value: "year1-2", label: { en: "1st–2nd year DPT", ur: "DPT 1st–2nd year" } },
  { value: "year3-4", label: { en: "3rd–4th year DPT", ur: "DPT 3rd–4th year" } },
  { value: "final-intern", label: { en: "Final year / Internship", ur: "Final year / Internship (house job)" } },
  { value: "graduate", label: { en: "Graduate / Practising physio", ur: "Graduate / Practice kar raha physio" } },
];

const goalOptions: { value: TeacherGoal; label: BiText }[] = [
  { value: "understand", label: { en: "Finally understand hard concepts", ur: "Mushkil concepts aakhir samajhna" } },
  { value: "exams", label: { en: "Pass exams & viva with confidence", ur: "Exams aur viva confidence se pass karna" } },
  { value: "clinic", label: { en: "Feel confident with real patients", ur: "Asli patients ke saath confidence" } },
  { value: "manual", label: { en: "Learn manual therapy properly", ur: "Manual therapy theek se seekhna" } },
];

const minuteOptions: { value: TeacherProfile["minutes"]; label: BiText }[] = [
  { value: 5, label: { en: "5 minutes", ur: "5 minute" } },
  { value: 15, label: { en: "15 minutes", ur: "15 minute" } },
  { value: 30, label: { en: "30 minutes", ur: "30 minute" } },
];

type Answers = { lang?: TeacherLang; name?: string; stage?: TeacherStage; goal?: TeacherGoal; minutes?: TeacherProfile["minutes"] };

export function WelcomeChat({ lessons, onComplete }: { lessons: TeacherLessonCard[]; onComplete: (profile: TeacherProfile) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const lang: TeacherLang = answers.lang ?? "en";

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (step === 0) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    if (step === 1 && !typing) nameInputRef.current?.focus({ preventScroll: true });
  }, [step, typing]);

  function advance(update: Answers) {
    const merged = { ...answers, ...update };
    setAnswers(merged);
    setTyping(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(
      () => {
        setTyping(false);
        setStep((current) => current + 1);
        if (merged.minutes && merged.stage && merged.goal) {
          const created: TeacherProfile = {
            v: 1,
            name: merged.name ?? "",
            stage: merged.stage,
            goal: merged.goal,
            minutes: merged.minutes,
            lang: merged.lang ?? "en",
            createdAt: teacherToday(),
          };
          saveTeacherProfile(created);
          setProfile(created);
        }
      },
      reduce ? 0 : 650,
    );
  }

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    advance({ name: nameDraft.trim().slice(0, 40) });
  }

  const displayName = answers.name ? `, ${answers.name}` : "";
  const path = profile ? getTeacherPath(recommendPathSlug(profile)) : undefined;
  const firstStep = path?.steps.find((item) => item.kind === "lesson");
  const firstLesson = firstStep && firstStep.kind === "lesson" ? lessons.find((lesson) => lesson.slug === firstStep.lesson) : undefined;

  return (
    <div className="space-y-4" data-pna-teacher-welcome="v1">
      <TeacherBubble label="PNA Teacher">
        <RichText
          text={
            "Assalam-o-Alaikum! 👋 I'm **PNA Teacher**. I explain hard physiotherapy concepts in simple words — step by step, with quick checks so you know you've really understood.\n**Which language should I teach you in?**\nMain kis zabaan mein samjhaun?"
          }
        />
      </TeacherBubble>

      {answers.lang ? <StudentBubble>{answers.lang === "ur" ? "Roman Urdu" : "English"}</StudentBubble> : null}

      {step >= 1 ? (
        <TeacherBubble>
          <RichText
            text={t(
              lang,
              "Great choice! You can switch language any time during a lesson. **What should I call you?**",
              "Behtareen! Lesson ke dauraan kabhi bhi zabaan badal sakte hain. **Main aap ko kya kahun?**",
            )}
          />
        </TeacherBubble>
      ) : null}
      {step >= 2 ? <StudentBubble>{answers.name || t(lang, "I'd rather not say", "Naam rehne dein")}</StudentBubble> : null}

      {step >= 2 ? (
        <TeacherBubble>
          <RichText
            text={t(
              lang,
              `Nice to meet you${displayName}! 😊 **Which stage are you at right now?** I'll start from exactly where you are.`,
              `Aap se mil kar khushi hui${displayName}! 😊 **Aap abhi kis stage par hain?** Main bilkul wahin se shuru karunga jahan aap hain.`,
            )}
          />
        </TeacherBubble>
      ) : null}
      {step >= 3 && answers.stage ? <StudentBubble>{pick(stageOptions.find((option) => option.value === answers.stage)!.label, lang)}</StudentBubble> : null}

      {step >= 3 ? (
        <TeacherBubble>
          <RichText text={t(lang, "Got it. **What's your main goal at the moment?**", "Samajh gaya. **Is waqt aap ka asal maqsad kya hai?**")} />
        </TeacherBubble>
      ) : null}
      {step >= 4 && answers.goal ? <StudentBubble>{pick(goalOptions.find((option) => option.value === answers.goal)!.label, lang)}</StudentBubble> : null}

      {step >= 4 ? (
        <TeacherBubble>
          <RichText
            text={t(
              lang,
              "Last question: **how much time can you give me each day?** Honest tip — 5 focused minutes every day beats 3 hours the night before the exam.",
              "Aakhri sawal: **aap rozana mujhe kitna waqt de sakte hain?** Sachi baat — rozana 5 minute ki tawajjuh, exam se pehli raat ke 3 ghanton se behtar hai.",
            )}
          />
        </TeacherBubble>
      ) : null}
      {step >= 5 && answers.minutes ? <StudentBubble>{pick(minuteOptions.find((option) => option.value === answers.minutes)!.label, lang)}</StudentBubble> : null}

      {step >= 5 && profile && path ? (
        <TeacherBubble tone="clinic" label={t(lang, "🎯 Your personal plan", "🎯 Aap ka zaati plan")}>
          <RichText
            text={t(
              lang,
              `Perfect${displayName}. I recommend the **${path.title}** path — ${path.tagline.en.charAt(0).toLowerCase() + path.tagline.en.slice(1)}\nWe'll do **${stepsPerDay(profile.minutes)} step${stepsPerDay(profile.minutes) > 1 ? "s" : ""} a day**. Each lesson ends with flashcards, and I'll bring them back at the right time so you don't forget.${firstLesson ? `\nYour first lesson: **${firstLesson.title}**.` : ""}`,
              `Zabardast${displayName}. Main aap ko **${path.title}** path recommend karta hoon — ${path.tagline.ur}\nHum rozana **${stepsPerDay(profile.minutes)} qadam** karenge. Har lesson flashcards par khatam hota hai, aur main unhein sahi waqt par wapas laaunga taake aap bhoolein nahi.${firstLesson ? `\nAap ka pehla lesson: **${firstLesson.title}**.` : ""}`,
            )}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {firstLesson ? (
              <Link
                href={withPath(firstLesson.href, path.slug)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                {t(lang, "Start my first lesson", "Pehla lesson shuru karein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => onComplete(profile)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" /> {t(lang, "Show my dashboard", "Mera dashboard dikhayein")}
            </button>
          </div>
        </TeacherBubble>
      ) : null}

      {typing ? <TypingBubble /> : null}

      {!typing ? (
        <div className="flex flex-wrap gap-2 pl-10 sm:pl-[3.25rem]">
          {step === 0 ? (
            <>
              <Chip onClick={() => advance({ lang: "en" })}>English</Chip>
              <Chip variant="soft" onClick={() => advance({ lang: "ur" })}>
                Roman Urdu (English terms ke saath)
              </Chip>
            </>
          ) : null}
          {step === 1 ? (
            <form onSubmit={submitName} className="flex w-full max-w-md flex-wrap gap-2">
              <label htmlFor="pna-teacher-name" className="sr-only">
                {t(lang, "Your name", "Aap ka naam")}
              </label>
              <input
                id="pna-teacher-name"
                ref={nameInputRef}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                maxLength={40}
                autoComplete="given-name"
                placeholder={t(lang, "Type your first name…", "Apna naam likhein…")}
                className="min-h-11 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button type="submit" className="min-h-11 rounded-full bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800">
                {t(lang, "Continue", "Aage")}
              </button>
              <button
                type="button"
                onClick={() => advance({ name: "" })}
                className="min-h-11 rounded-full px-3 text-sm font-semibold text-slate-500 hover:text-navy-800"
              >
                {t(lang, "Skip", "Skip")}
              </button>
            </form>
          ) : null}
          {step === 2
            ? stageOptions.map((option) => (
                <Chip key={option.value} variant="soft" onClick={() => advance({ stage: option.value })}>
                  {pick(option.label, lang)}
                </Chip>
              ))
            : null}
          {step === 3
            ? goalOptions.map((option) => (
                <Chip key={option.value} variant="soft" onClick={() => advance({ goal: option.value })}>
                  {pick(option.label, lang)}
                </Chip>
              ))
            : null}
          {step === 4
            ? minuteOptions.map((option) => (
                <Chip key={option.value} variant="soft" onClick={() => advance({ minutes: option.value })}>
                  {pick(option.label, lang)}
                </Chip>
              ))
            : null}
        </div>
      ) : null}
      <div ref={bottomRef} className="scroll-mb-36 lg:scroll-mb-10" />
    </div>
  );
}
