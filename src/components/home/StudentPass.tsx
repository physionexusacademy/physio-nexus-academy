"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Flame, GraduationCap, Layers, PersonStanding, Ruler, Trophy, Zap } from "lucide-react";
import { getPakistanDate, getUnifiedProgress } from "@/lib/unified-progress";
import { getDeck, getDueCardIds, getTeacherProfile, getTeacherProgress, TEACHER_EVENT } from "@/lib/teacher/progress";
import { getDueReviews } from "@/lib/clinical-review-queue";
import { SKILLS_EVENT, dueSkillCards, getSkillsDeck, getSkillsProgress, passedLevelCount } from "@/lib/skills/progress";
import { getVpProgress, VP_EVENT } from "@/lib/virtual-patient/session";
import { VP_CASE_COUNT } from "@/lib/virtual-patient/links";

const levels = [
  { name: "New Student", min: 0 },
  { name: "Rising Clinician", min: 100 },
  { name: "Case Solver", min: 400 },
  { name: "Clinical Master", min: 1000 },
  { name: "Clinical Legend", min: 2500 },
];

type PassState = {
  name: string | null;
  xp: number;
  streak: number;
  week: boolean[];
  lessons: number;
  dueCards: number;
  dueCases: number;
  skillLevels: number;
  dueSkillCards: number;
  /** Skill whose flashcards are most overdue — the review step deep-links there. */
  dueSkill: string | null;
  /** Virtual Patient cases passed and attempted (this device). */
  vpPassed: number;
  vpTried: number;
  lessonToday: boolean;
  challengeToday: boolean;
  reviewToday: boolean;
};

function readPass(): PassState {
  const progress = getUnifiedProgress();
  const today = getPakistanDate();
  const teacher = getTeacherProgress();
  const profile = getTeacherProfile();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86400000);
    return getPakistanDate(date);
  });
  let dueCases = 0;
  try {
    dueCases = getDueReviews().length;
  } catch {
    dueCases = 0;
  }
  let skillLevels = 0;
  let skillDue: string[] = [];
  let dueSkill: string | null = null;
  try {
    const deck = getSkillsDeck();
    skillLevels = passedLevelCount(getSkillsProgress());
    skillDue = dueSkillCards(deck);
    dueSkill = skillDue.length ? deck[skillDue[0]]?.skill ?? null : null;
  } catch {
    skillLevels = 0;
  }
  let vpPassed = 0;
  let vpTried = 0;
  try {
    const records = Object.values(getVpProgress().cases);
    vpTried = records.length;
    vpPassed = records.filter((record) => record.passedAt).length;
  } catch {
    vpTried = 0;
  }
  return {
    name: profile?.name?.trim() || null,
    xp: progress.totalXP,
    streak: progress.currentStreak,
    week: days.map((day) => progress.activeDates.includes(day)),
    lessons: Object.keys(teacher.lessons).length,
    dueCards: getDueCardIds(getDeck()).length,
    dueCases,
    skillLevels,
    dueSkillCards: skillDue.length,
    dueSkill,
    vpPassed,
    vpTried,
    lessonToday: Object.values(teacher.lessons).some((lesson) => lesson.completedAt === today),
    challengeToday: progress.eventIds.includes("daily-challenge:daily:" + today),
    reviewToday: progress.eventIds.includes("pna-teacher:review:" + today),
  };
}

/** A personal console on the lobby: level, streak, and today's three-step mission. */
export function StudentPass() {
  const [pass, setPass] = useState<PassState | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(() => {
    try {
      setPass(readPass());
    } catch {
      setPass(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const events = ["pna-unified-progress-updated", "storage", TEACHER_EVENT, SKILLS_EVENT, VP_EVENT, "pna-review-queue-updated", "pna-daily-score-saved"];
    events.forEach((name) => window.addEventListener(name, refresh));
    return () => events.forEach((name) => window.removeEventListener(name, refresh));
  }, [refresh]);

  const xp = pass?.xp ?? 0;
  const current = [...levels].reverse().find((level) => xp >= level.min) ?? levels[0];
  const next = levels.find((level) => level.min > xp);
  const percent = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  const isNew = !pass || (pass.xp === 0 && pass.lessons === 0);
  const lessonDue = (pass?.dueCards ?? 0) + (pass?.dueCases ?? 0);
  const due = lessonDue + (pass?.dueSkillCards ?? 0);
  // Lesson cards first; if only Skills Lab cards are due, go straight to that skill's flashcards.
  const reviewHref = lessonDue === 0 && pass?.dueSkill ? `/skills/${pass.dueSkill}?tab=flashcards` : "/learn/review";
  const done = [pass?.lessonToday, pass?.challengeToday, pass?.reviewToday || (pass !== null && due === 0 && !isNew)].filter(Boolean).length;

  const mission = [
    {
      href: "/learn",
      icon: GraduationCap,
      title: isNew ? "Tell PNA Teacher your year" : "Learn one concept",
      detail: isNew ? "Get a plan made for you — 1 minute" : "Continue your path · ~10 min",
      done: Boolean(pass?.lessonToday),
    },
    {
      href: "/daily-challenge",
      icon: Trophy,
      title: "Take today's challenge",
      detail: "5 questions · climb the leaderboard",
      done: Boolean(pass?.challengeToday),
    },
    {
      href: reviewHref,
      icon: Layers,
      title: due > 0 ? `Review ${due} due item${due === 1 ? "" : "s"}` : "Review your flashcards",
      detail: due > 0 ? "Spaced repetition locks it in" : isNew ? "Cards appear after your first lesson" : "Nothing due — you're on top of it",
      done: Boolean(pass?.reviewToday) || (!isNew && pass !== null && due === 0),
    },
  ];

  return (
    <section id="student-pass" className="lobby-pass-bar" aria-labelledby="student-pass-toggle">
      <div className="container-content">
        <button
          type="button"
          className="lobby-pass-toggle"
          aria-expanded={open}
          aria-controls="student-pass-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="lobby-pass-toggle-icon" aria-hidden="true"><Zap className="h-5 w-5" /></span>
          <span className="lobby-pass-toggle-copy">
            <strong id="student-pass-toggle">Student Pass</strong>
            <small>
              {isNew
                ? "Free · no sign-up · XP, streak and flashcards"
                : `${current.name} · ${xp} XP · ${pass?.streak ?? 0}-day streak${due > 0 ? ` · ${due} to review` : ""}`}
            </small>
          </span>
          <span className="lobby-pass-toggle-state">{open ? "Close" : "Open"} <ChevronDown className="lobby-pass-chev h-4 w-4" aria-hidden="true" /></span>
        </button>
        {open ? (
        <div id="student-pass-panel" className="nx-sky lobby-pass-band lobby-pass-panel">
        <div className="nx-glass lobby-pass">
          <div className="lobby-pass-id">
            <p className="nx-kicker"><Zap className="h-3.5 w-3.5" aria-hidden="true" /> Student pass</p>
            <h2 id="student-pass-title" className="nx-title mt-3 text-2xl text-white sm:text-[1.75rem]">
              {isNew ? "Activate your free student pass" : pass?.name ? `Welcome back, ${pass.name}` : "Welcome back, clinician"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--nx-mute)]">
              {isNew
                ? "No sign-up needed. Your XP, streak and flashcards are saved privately on this device."
                : `${current.name}${next ? ` · ${Math.max(0, next.min - xp)} XP to ${next.name}` : " · top level reached"}`}
            </p>
            <div className="lobby-level" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={isNew ? 0 : percent}>
              <span style={{ width: `${isNew ? 4 : Math.max(4, percent)}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="lobby-pass-metric">
                <strong>{xp}</strong>
                <span>XP</span>
              </div>
              <div className="lobby-pass-metric">
                <strong className="inline-flex items-center gap-1">
                  <Flame className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" />
                  {pass?.streak ?? 0}
                </strong>
                <span>day streak</span>
              </div>
              <div className="lobby-pass-metric">
                <strong>{pass?.lessons ?? 0}</strong>
                <span>lessons done</span>
              </div>
            </div>
            <div className="lobby-week" aria-label="Active days this week">
              {(pass?.week ?? Array(7).fill(false)).map((active, index) => (
                <span key={index} data-on={active} title={active ? "Active" : "Not active"} />
              ))}
            </div>
            <a href="/skills" className="lobby-pass-skills">
              <Ruler className="h-4 w-4 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <strong>Clinical Skills Lab</strong>
                <small>
                  {pass?.skillLevels
                    ? `${pass.skillLevels} skill level${pass.skillLevels === 1 ? "" : "s"} passed${pass.dueSkillCards ? ` · ${pass.dueSkillCards} card${pass.dueSkillCards === 1 ? "" : "s"} due` : ""}`
                    : "MMT, goniometry, neuro exam & more — start at Beginner"}
                </small>
              </span>
              <ArrowRight className="h-4 w-4 flex-none text-[var(--nx-dim)]" aria-hidden="true" />
            </a>
            <a href="/virtual-patient" className="lobby-pass-skills lobby-pass-vp">
              <PersonStanding className="h-4 w-4 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <strong>Virtual Patient</strong>
                <small>
                  {pass?.vpTried
                    ? `${pass.vpPassed} of ${VP_CASE_COUNT} patients passed${pass.vpTried > pass.vpPassed ? ` · ${pass.vpTried - pass.vpPassed} to retry` : ""}`
                    : `${VP_CASE_COUNT} 3D patients — take a history, examine, diagnose`}
                </small>
              </span>
              <ArrowRight className="h-4 w-4 flex-none text-[var(--nx-dim)]" aria-hidden="true" />
            </a>
          </div>

          <div className="lobby-mission">
            <div className="flex items-center justify-between gap-3">
              <p className="nx-kicker">Today&apos;s mission</p>
              <span className="nx-chip !py-1">{done}/3 done</span>
            </div>
            <ol className="mt-3 space-y-2">
              {mission.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.href}>
                    <a href={step.href} className="lobby-mission-step" data-done={step.done}>
                      <span className="lobby-mission-num" aria-hidden="true">
                        {step.done ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <Icon className="h-5 w-5 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <strong>{step.title}</strong>
                        <small>{step.detail}</small>
                      </span>
                      {step.done ? <span className="sr-only">(done)</span> : <ArrowRight className="h-4 w-4 flex-none text-[var(--nx-dim)]" aria-hidden="true" />}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        </div>
        ) : null}
      </div>
    </section>
  );
}
