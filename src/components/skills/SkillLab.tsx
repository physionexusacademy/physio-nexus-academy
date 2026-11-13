"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Layers,
  Lock,
  RotateCcw,
  Search,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { LangToggle, RichText } from "@/components/teacher/ui";
import { useLang } from "@/lib/lang";
import { LESSONS_FOR_SKILL } from "@/lib/skills/ur/lesson-links";
import { SkillTeacher } from "./SkillTeacher";
import { SKILL_LEVELS, levelRank, type SkillData, type SkillIndexEntry, type SkillLevelId, type SkillQuestion } from "@/lib/skills/types";
import {
  PASS_MARK,
  SKILLS_EVENT,
  dueSkillCards,
  getSkillsDeck,
  getSkillsProgress,
  isLevelPassed,
  isLevelUnlocked,
  markStudied,
  recordDrillAnswer,
  recordLevelTest,
  reviewSkillCard,
  type SkillsProgress,
} from "@/lib/skills/progress";
import { BodyChart } from "./BodyChart";
import { Demo3D } from "./Demo3D";
import { JointDemo } from "./JointDemo";
import { BodyMapSim, GoniometerSim, GradeSim, VitalsTool } from "./Simulators";

type Tab = "learn" | "atlas" | "practise" | "flashcards" | "test" | "osce";
const TAB_UR: Record<Tab, string> = { learn: "Seekhein", atlas: "Atlas", practise: "Practice", flashcards: "Flashcards", test: "Level test", osce: "OSCE" };

const tabs: { id: Tab; label: string; icon: typeof BookOpenCheck }[] = [
  { id: "learn", label: "Learn", icon: BookOpenCheck },
  { id: "atlas", label: "Atlas", icon: Search },
  { id: "practise", label: "Practise", icon: Dumbbell },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "test", label: "Level test", icon: Trophy },
  { id: "osce", label: "OSCE", icon: ClipboardCheck },
];

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function useSkillsProgress() {
  const [progress, setProgress] = useState<SkillsProgress | null>(null);
  const refresh = useCallback(() => setProgress(getSkillsProgress()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(SKILLS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SKILLS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return progress;
}

export function SkillLab({ entry }: { entry: SkillIndexEntry }) {
  const [data, setData] = useState<SkillData | null>(null);
  const [failed, setFailed] = useState(false);
  const [level, setLevel] = useState<SkillLevelId>("beginner");
  const [tab, setTab] = useState<Tab>("learn");
  const progress = useSkillsProgress();
  const [lang, setLang] = useLang();
  const ur = lang === "ur";

  const load = useCallback(() => {
    setFailed(false);
    fetch(`/skills-data/${entry.slug}.json?v=${entry.version}`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SkillData>;
      })
      .then(setData)
      .catch(() => setFailed(true));
  }, [entry.slug, entry.version]);

  useEffect(() => load(), [load]);

  // Open at the first level not yet passed (or the level in the URL).
  useEffect(() => {
    if (!progress) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("level");
    const tabFromUrl = params.get("tab");
    if (fromUrl && SKILL_LEVELS.some((item) => item.id === fromUrl)) setLevel(fromUrl as SkillLevelId);
    else setLevel(SKILL_LEVELS.find((item) => !isLevelPassed(progress, entry.slug, item.id))?.id ?? "expert");
    if (tabFromUrl && tabs.some((item) => item.id === tabFromUrl)) setTab(tabFromUrl as Tab);
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress === null]);

  const choose = (next: { level?: SkillLevelId; tab?: Tab }) => {
    if (next.level) setLevel(next.level);
    if (next.tab) setTab(next.tab);
    const params = new URLSearchParams(window.location.search);
    params.set("level", next.level ?? level);
    params.set("tab", next.tab ?? tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="container-content pb-16 pt-8" data-pna-skill={entry.slug}>
      <LangStrip slug={entry.slug} lang={lang} onLang={setLang} />
      <LevelBar entry={entry} progress={progress} level={level} onChoose={(value) => choose({ level: value })} />

      <div role="tablist" aria-label="Skill sections" className="mt-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5" data-horizontal-scroll>
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => choose({ tab: item.id })}
              className={"inline-flex flex-none items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition " + (active ? "bg-[#0a1f3d] text-white shadow" : "text-slate-600 hover:bg-slate-100")}
            >
              <Icon className={"h-4 w-4 " + (active ? "text-[#2ee6d6]" : "")} aria-hidden="true" />
              {ur ? TAB_UR[item.id] : item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5" role="tabpanel">
        {failed ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
            This skill could not be loaded. Check your connection and{" "}
            <button type="button" onClick={load} className="font-bold underline">
              try again
            </button>
            .
          </div>
        ) : !data || !progress ? (
          <div className="nx-loader-card" role="status">
            <span className="nx-loader-orb" aria-hidden="true" />
            <p className="text-sm font-bold text-teal-800">Opening {entry.title}…</p>
          </div>
        ) : tab === "learn" ? (
          <LearnTab data={data} level={level} progress={progress} onNext={() => choose({ tab: "practise" })} />
        ) : tab === "atlas" ? (
          <AtlasTab data={data} level={level} />
        ) : tab === "practise" ? (
          <PractiseTab data={data} level={level} />
        ) : tab === "flashcards" ? (
          <FlashcardsTab data={data} level={level} />
        ) : tab === "test" ? (
          <TestTab data={data} level={level} progress={progress} onLevel={(value) => choose({ level: value, tab: "learn" })} />
        ) : (
          <OsceTab data={data} />
        )}
      </div>
    </div>
  );
}

function LangStrip({ slug, lang, onLang }: { slug: string; lang: "en" | "ur"; onLang: (lang: "en" | "ur") => void }) {
  const lessons = LESSONS_FOR_SKILL[slug] ?? [];
  const ur = lang === "ur";
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/70 to-white px-3.5 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <LangToggle lang={lang} onChange={onLang} />
        <p className="text-xs font-semibold text-slate-600">{ur ? "Demos, captions aur PNA Teacher ab Roman Urdu mix mein hain." : "Switch to a natural English + Roman Urdu mix: demos, captions and the PNA Teacher follow."}</p>
      </div>
      {lessons.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-teal-800">{ur ? "PNA Teacher lessons" : "PNA Teacher lessons"}</span>
          {lessons.map((lesson) => (
            <a key={lesson.slug} href={`/learn/${lesson.slug}`} className="rounded-full border border-teal-200 bg-white px-2.5 py-1 text-xs font-bold text-teal-900 hover:border-teal-400">
              {lesson.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LevelBar({ entry, progress, level, onChoose }: { entry: SkillIndexEntry; progress: SkillsProgress | null; level: SkillLevelId; onChoose: (level: SkillLevelId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" role="group" aria-label="Levels">
      {SKILL_LEVELS.map((item, index) => {
        const passed = progress ? isLevelPassed(progress, entry.slug, item.id) : false;
        const unlocked = progress ? isLevelUnlocked(progress, entry.slug, item.id) : index === 0;
        const active = item.id === level;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChoose(item.id)}
            className={
              "nx-holo relative rounded-2xl border p-3 text-left " +
              (active ? "border-transparent bg-[#0a1f3d] text-white shadow-[0_18px_40px_-24px_rgba(10,31,61,0.9)]" : "border-slate-200 bg-white hover:border-teal-300")
            }
          >
            <span className="flex items-center justify-between gap-2">
              <span className={"text-[11px] font-extrabold uppercase tracking-[0.16em] " + (active ? "text-[#2ee6d6]" : "text-teal-700")}>
                Level {index + 1}
              </span>
              {passed ? (
                <CheckCircle2 className={"h-4 w-4 " + (active ? "text-[#2ee6d6]" : "text-emerald-600")} aria-label="Passed" />
              ) : !unlocked ? (
                <Lock className="h-3.5 w-3.5 opacity-60" aria-label="Test locked" />
              ) : null}
            </span>
            <span className="mt-1 block text-base font-bold">{item.label}</span>
            <span className={"mt-0.5 block text-xs leading-5 " + (active ? "text-[#a9bfd6]" : "text-slate-500")}>{entry.goals[item.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Learn ---------------- */

function LearnTab({ data, level, progress, onNext }: { data: SkillData; level: SkillLevelId; progress: SkillsProgress; onNext: () => void }) {
  const concepts = data.concepts.filter((concept) => concept.level === level);
  const studied = new Set(progress.studied[data.slug] ?? []);
  const done = concepts.filter((concept) => studied.has(concept.id)).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3">
        <p className="text-sm text-teal-900">
          <strong>{SKILL_LEVELS.find((item) => item.id === level)?.label}:</strong> {data.goals[level]}
        </p>
        <span className="text-xs font-bold text-teal-800">
          {done}/{concepts.length} studied
        </span>
      </div>
      {concepts.map((concept, index) => (
        <article key={concept.id} id={concept.id} data-nx-reveal className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(10,60,90,0.6)] sm:p-6">
          <div className={concept.demo ? "grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""}>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">
                Step {index + 1} of {concepts.length}
              </p>
              <h3 className="mt-1.5 text-xl font-bold text-navy-800 sm:text-2xl">{concept.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-slate-700">
                <RichText text={concept.body} />
              </p>
              {concept.bullets?.length ? (
                <ul className="mt-3 space-y-2">
                  {concept.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5 text-[15px] leading-7 text-slate-700">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" aria-hidden="true" />
                      <span>
                        <RichText text={bullet} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {concept.ur ? <UrduNote text={concept.ur} /> : null}
            </div>
            {concept.demo3d ? (
              <Demo3D demoKey={`${data.slug}/concept:${concept.id}`} title={concept.title} fallback={concept.demo ? <JointDemo spec={concept.demo} /> : undefined} />
            ) : concept.demo ? (
              <JointDemo spec={concept.demo} />
            ) : null}
          </div>
          {concept.table ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200" data-horizontal-scroll>
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {concept.table.head.map((cell) => (
                      <th key={cell} className="px-3 py-2 font-bold">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {concept.table.rows.map((row) => (
                    <tr key={row.join("|")} className="border-t border-slate-100">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={"px-3 py-2 align-top " + (cellIndex === 0 ? "font-bold text-navy-800" : "text-slate-700")}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => markStudied(data.slug, concept.id)}
              disabled={studied.has(concept.id)}
              className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold " + (studied.has(concept.id) ? "bg-emerald-50 text-emerald-800" : "border border-slate-300 text-navy-800 hover:border-teal-500")}
            >
              <Check className="h-4 w-4" aria-hidden="true" /> {studied.has(concept.id) ? "Studied" : "I understand this"}
            </button>
          </div>
        </article>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[#0a1f3d] p-5 text-white">
        <p className="text-sm text-[#a9bfd6]">Next: practise with the simulators and quick drills, then take the level test.</p>
        <button type="button" onClick={onNext} className="nx-btn nx-btn-primary">
          Start practising <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function UrduNote({ text }: { text: string }) {
  const [lang] = useLang();
  const [forced, setForced] = useState(false);
  const show = lang === "ur" || forced;
  if (!show) {
    return (
      <button type="button" onClick={() => setForced(true)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-950 hover:border-amber-500">
        Roman Urdu mein samjhein
      </button>
    );
  }
  return (
    <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] leading-7 text-amber-950">
      <strong>PNA Teacher (Roman Urdu mein):</strong> {text}
    </p>
  );
}

/* ---------------- Atlas ---------------- */

function AtlasTab({ data, level }: { data: SkillData; level: SkillLevelId }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const groups = ["All", ...new Set(data.atlas.map((item) => item.group))];
  const rank = levelRank(level);
  const items = data.atlas.filter(
    (item) =>
      (group === "All" || item.group === group) &&
      (!query.trim() || `${item.title} ${item.subtitle ?? ""} ${item.group} ${item.fields.map((field) => field.value).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),
  );
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search the ${data.atlasLabel.toLowerCase()}…`} aria-label={`Search the ${data.atlasLabel}`} className="h-11 w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex gap-1.5 overflow-x-auto" data-horizontal-scroll>
          {groups.map((name) => (
            <button key={name} type="button" onClick={() => setGroup(name)} className={"flex-none rounded-full border px-3 py-1.5 text-xs font-bold " + (group === name ? "border-transparent bg-[#0a1f3d] text-white" : "border-slate-300 bg-white text-slate-600")}>
              {name}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Showing details up to <strong>{SKILL_LEVELS[rank].label}</strong> level. Choose a higher level above to unlock advanced details.
      </p>
      <div className="mt-4 grid items-start gap-3 lg:grid-cols-2">
        {items.map((item) => {
          const visible = item.fields.filter((field) => levelRank(field.level) <= rank);
          const hidden = item.fields.length - visible.length;
          return (
            <details key={item.id} id={item.id} className="group nx-cv scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-4 open:shadow-[0_24px_60px_-48px_rgba(10,60,90,0.6)] sm:p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <span>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">{item.group}</span>
                  <span className="mt-0.5 block text-lg font-bold text-navy-800">{item.title}</span>
                  {item.subtitle ? <span className="block text-sm text-slate-500">{item.subtitle}</span> : null}
                </span>
                <ArrowRight className="mt-2 h-4 w-4 flex-none text-slate-400 transition group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div className="mt-4 space-y-4">
                {item.demo3d ? (
                  <Demo3D demoKey={`${data.slug}/${item.id}`} title={item.title} say={item.fields.find((field) => field.label === "Instruction")?.value} fallback={item.demo ? <JointDemo spec={item.demo} /> : undefined} />
                ) : item.demo ? (
                  <JointDemo spec={item.demo} />
                ) : null}
                {item.point ? (
                  <div className="mx-auto w-40">
                    <BodyChart view={item.point.view} markers={[{ id: item.id, ...item.point, tone: "active", label: item.title }]} />
                  </div>
                ) : null}
                <SkillTeacher data={data} item={item} level={level} />
                <dl className="grid gap-2">
                  {visible.map((field) => (
                    <div key={field.label} className="rounded-2xl bg-slate-50 px-3 py-2">
                      <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{field.label}</dt>
                      <dd className="mt-0.5 text-sm leading-6 text-navy-800">
                        <RichText text={field.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
                {item.tip && rank >= 1 ? <p className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm leading-6 text-teal-900"><strong>Clinical tip:</strong> {item.tip}</p> : null}
                {hidden > 0 ? <p className="text-xs text-slate-500">{hidden} more detail{hidden === 1 ? "" : "s"} unlock at higher levels.</p> : null}
              </div>
            </details>
          );
        })}
      </div>
      {!items.length ? <p className="mt-6 text-center text-sm text-slate-500">Nothing matches “{query}”.</p> : null}
    </div>
  );
}

/* ---------------- Practise ---------------- */

function questionPool(data: SkillData, level: SkillLevelId) {
  const rank = levelRank(level);
  return data.questions.filter((question) => levelRank(question.level) <= rank);
}

function QuestionCard({
  question,
  onAnswer,
  answered,
  reveal = true,
}: {
  question: SkillQuestion;
  onAnswer: (index: number) => void;
  answered: number | null;
  /** In a test, choices stay changeable and unmarked until submission. */
  reveal?: boolean;
}) {
  const [lang] = useLang();
  const ur = lang === "ur";
  return (
    <div>
      {question.case ? <p className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-[15px] leading-7 text-indigo-950">{question.case}</p> : null}
      <p className="text-[16px] font-bold leading-7 text-navy-800">{question.prompt}</p>
      <div className="mt-3 grid gap-2">
        {question.options.map((option, index) => {
          const state = !reveal
            ? index === answered
              ? "chosen"
              : "idle"
            : answered === null
              ? "idle"
              : index === question.answer
                ? "right"
                : index === answered
                  ? "wrong"
                  : "dim";
          return (
            <button
              key={option + index}
              type="button"
              aria-pressed={!reveal ? index === answered : undefined}
              disabled={reveal && answered !== null}
              onClick={() => onAnswer(index)}
              className={
                "rounded-2xl border px-4 py-3 text-left text-sm leading-6 transition " +
                (state === "idle"
                  ? "border-slate-300 text-navy-800 hover:border-teal-500 hover:bg-teal-50/50"
                  : state === "chosen"
                    ? "border-[#0a1f3d] bg-[#0a1f3d] text-white"
                  : state === "right"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-950"
                    : state === "wrong"
                      ? "border-rose-300 bg-rose-50 text-rose-950"
                      : "border-slate-200 text-slate-400")
              }
            >
              {option}
            </button>
          );
        })}
      </div>
      {reveal && answered !== null ? (
        <p className={"mt-3 rounded-2xl p-3 text-sm leading-6 " + (answered === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
          <strong>{answered === question.answer ? (ur ? "Bilkul sahi. " : "Correct. ") : ur ? "Qareeb, lekin sahi nahi. " : "Not quite. "}</strong>
          {answered !== question.answer && ur ? <>Sahi jawab yeh hai: <strong>{question.options[question.answer]}</strong>. </> : null}
          {ur ? <span className="font-semibold">Yaad rakhein: </span> : null}
          {question.explain}
        </p>
      ) : null}
    </div>
  );
}

function QuickDrill({ data, level }: { data: SkillData; level: SkillLevelId }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const pool = useMemo(() => questionPool(data, level), [data, level]);
  const preferred = useMemo(() => pool.filter((question) => question.level === level), [pool, level]);
  const draw = useCallback(() => {
    const source = preferred.length && Math.random() < 0.7 ? preferred : pool;
    return source[Math.floor(Math.random() * source.length)];
  }, [pool, preferred]);
  const [question, setQuestion] = useState<SkillQuestion | undefined>(() => draw());
  const [answered, setAnswered] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    setQuestion(draw());
    setAnswered(null);
  }, [draw]);
  if (!question) return null;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-navy-800">{ur ? "Jaldi practice" : "Quick drill"}</h3>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Streak {streak}</span>
      </div>
      <div className="mt-3">
        <QuestionCard
          question={question}
          answered={answered}
          onAnswer={(index) => {
            setAnswered(index);
            const correct = index === question.answer;
            setStreak((value) => (correct ? value + 1 : 0));
            recordDrillAnswer(correct);
          }}
        />
      </div>
      {answered !== null ? (
        <button
          type="button"
          className="nx-btn nx-btn-primary mt-4"
          onClick={() => {
            setQuestion(draw());
            setAnswered(null);
          }}
        >
          {ur ? "Agla sawal" : "Next question"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}

function PractiseTab({ data, level }: { data: SkillData; level: SkillLevelId }) {
  return (
    <div className="space-y-4">
      {data.simulators.includes("goniometer") ? <GoniometerSim data={data} /> : null}
      {data.simulators.includes("mmt-grade") ? <GradeSim data={data} mode="mmt" level={level} /> : null}
      {data.simulators.includes("reflex-grade") ? <GradeSim data={data} mode="reflex" level={level} /> : null}
      {data.simulators.includes("mas-grade") ? <GradeSim data={data} mode="mas" level={level} /> : null}
      {data.simulators.includes("body-map") ? <BodyMapSim data={data} /> : null}
      {data.simulators.includes("vitals") ? <VitalsTool /> : null}
      <QuickDrill data={data} level={level} />
    </div>
  );
}

/* ---------------- Flashcards ---------------- */

type CardMode = "review" | "level" | "mix";

function FlashcardsTab({ data, level }: { data: SkillData; level: SkillLevelId }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  // review = spaced repetition (due + new cards); level/mix = free practice that never runs dry.
  const [mode, setMode] = useState<CardMode>("review");
  const build = useCallback(() => {
    if (mode === "level") return shuffled(data.cards.filter((card) => card.level === level)).slice(0, 12);
    if (mode === "mix") return shuffled(data.cards).slice(0, 12);
    const deck = getSkillsDeck();
    const due = dueSkillCards(deck, data.slug);
    const byId = new Map(data.cards.map((card) => [card.id, card]));
    const dueCards = due.map((id) => byId.get(id)).filter((card): card is NonNullable<typeof card> => Boolean(card)).slice(0, 20);
    const fresh = shuffled(data.cards.filter((card) => card.level === level && !deck[card.id])).slice(0, 10);
    return [...dueCards, ...fresh];
  }, [data, level, mode]);
  const [session, setSession] = useState(build);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  useEffect(() => {
    setSession(build());
    setIndex(0);
    setFlipped(false);
    setKnown(0);
  }, [build]);

  const levelTotal = data.cards.filter((card) => card.level === level).length;
  const card = session[index];
  const restart = (next: CardMode) => {
    if (next === mode) {
      setSession(build());
      setIndex(0);
      setFlipped(false);
      setKnown(0);
    } else setMode(next); // the build/useEffect pair starts the new session
  };

  if (!card) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <Layers className="mx-auto h-8 w-8 text-teal-600" aria-hidden="true" />
        <h3 className="mt-3 text-xl font-bold text-navy-800">{session.length ? "Session complete" : "Spaced review is up to date"}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {session.length
            ? `You knew ${known} of ${session.length}. Cards you missed come back tomorrow; the ones you knew return later.`
            : `All ${levelTotal} cards at this level are scheduled for later. Keep practising below — it never runs out.`}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="nx-btn nx-btn-primary" onClick={() => restart("level")}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Practise this level ({levelTotal} cards)
          </button>
          <button type="button" className="nx-btn nx-btn-light" onClick={() => restart("mix")}>
            <Layers className="h-4 w-4" aria-hidden="true" /> Mix all levels ({data.cards.length})
          </button>
          {mode !== "review" ? (
            <button type="button" className="nx-btn nx-btn-light" onClick={() => restart("review")}>
              Back to spaced review
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const answer = (knew: boolean) => {
    reviewSkillCard(card.id, data.slug, knew);
    if (knew) setKnown((value) => value + 1);
    setFlipped(false);
    setIndex((value) => value + 1);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>
          Card {index + 1} of {session.length}
        </span>
        <span>{mode === "review" ? `${levelTotal} cards at this level · spaced repetition` : mode === "level" ? "Free practice · this level" : "Free practice · all levels"}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500" style={{ width: `${(index / session.length) * 100}%` }} />
      </div>
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="mt-4 block min-h-[220px] w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-[0_30px_70px_-50px_rgba(10,60,90,0.7)]"
        aria-label={flipped ? (ur ? "Sawal dikhayein" : "Show question") : ur ? "Jawab dikhayein" : "Show answer"}
      >
        <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">{flipped ? (ur ? "Jawab" : "Answer") : ur ? "Sawal" : "Question"}</span>
        <span className="mt-3 block text-lg font-bold leading-8 text-navy-800">
          <RichText text={flipped ? card.back : card.front} />
        </span>
        {!flipped ? <span className="mt-6 block text-sm text-slate-500">{ur ? "Pehle apna jawab zor se bolein, phir tap kar ke check karein." : "Say your answer out loud, then tap to check."}</span> : null}
      </button>
      {flipped ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => answer(false)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900">
            <X className="mr-1 inline h-4 w-4" aria-hidden="true" /> {ur ? "Dobara" : "Again"}
          </button>
          <button type="button" onClick={() => answer(true)} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
            <Check className="mr-1 inline h-4 w-4" aria-hidden="true" /> {ur ? "Aata tha" : "Knew it"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Level test ---------------- */

function buildTest(data: SkillData, level: SkillLevelId): SkillQuestion[] {
  const current = shuffled(data.questions.filter((question) => question.level === level));
  const earlier = shuffled(data.questions.filter((question) => levelRank(question.level) < levelRank(level)));
  // 9 from this level + 3 revision questions; top up from either pool so a test is always 12 long.
  const fromCurrent = current.slice(0, 9);
  const fromEarlier = earlier.slice(0, 12 - fromCurrent.length);
  const test = [...fromCurrent, ...fromEarlier];
  if (test.length < 12) test.push(...current.slice(fromCurrent.length, fromCurrent.length + 12 - test.length));
  return shuffled(test).slice(0, 12);
}

function TestTab({ data, level, progress, onLevel }: { data: SkillData; level: SkillLevelId; progress: SkillsProgress; onLevel: (level: SkillLevelId) => void }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const unlocked = isLevelUnlocked(progress, data.slug, level);
  const [questions, setQuestions] = useState<SkillQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<null | { score: number; passed: boolean; firstPass: boolean }>(null);
  const start = () => {
    setQuestions(buildTest(data, level));
    setAnswers({});
    setResult(null);
  };
  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setResult(null);
  }, [level]);
  const rank = levelRank(level);
  const record = progress.levels[data.slug]?.[level];
  const next = SKILL_LEVELS[rank + 1];

  if (!unlocked) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <Lock className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
        <h3 className="mt-3 text-xl font-bold text-navy-800">Pass the {SKILL_LEVELS[rank - 1].label} test first</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">You can still study and practise this level. The test unlocks when the previous level is passed.</p>
        <button type="button" className="nx-btn nx-btn-primary mt-4" onClick={() => onLevel(SKILL_LEVELS[rank - 1].id)}>
          Go to {SKILL_LEVELS[rank - 1].label}
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="rounded-3xl bg-[#0a1f3d] p-6 text-white sm:p-8">
        <p className="nx-kicker">
          <Trophy className="h-4 w-4" aria-hidden="true" /> {SKILL_LEVELS[rank].label} level test
        </p>
        <h3 className="nx-title mt-3 text-2xl text-white sm:text-3xl">12 questions · pass mark {Math.round(PASS_MARK * 100)}%</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#a9bfd6]">
          Mostly {SKILL_LEVELS[rank].label.toLowerCase()} questions, plus a few from earlier levels. Passing earns XP, a badge on your student pass and unlocks the next level&apos;s test.
        </p>
        {record ? (
          <p className="mt-3 text-sm text-[#2ee6d6]">
            Best score {Math.round(record.best * 100)}% · {record.attempts} attempt{record.attempts === 1 ? "" : "s"}
            {record.passedAt ? ` · passed ${record.passedAt}` : ""}
          </p>
        ) : null}
        <button type="button" className="nx-btn nx-btn-primary mt-5" onClick={start}>
          {ur ? "Test shuru karein" : "Start the test"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const done = questions.every((question) => answers[question.id] !== undefined);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {questions.map((question, index) => (
        <section key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="mb-2 text-xs font-bold text-slate-500">
            Question {index + 1} of {questions.length}
          </p>
          <QuestionCard
            question={question}
            reveal={Boolean(result)}
            answered={result ? answers[question.id] ?? -1 : answers[question.id] ?? null}
            onAnswer={(choice) => !result && setAnswers((value) => ({ ...value, [question.id]: choice }))}
          />
        </section>
      ))}
      {!result ? (
        <button
          type="button"
          disabled={!done}
          className="nx-btn nx-btn-primary w-full disabled:opacity-50"
          onClick={() => {
            const correct = questions.filter((question) => answers[question.id] === question.answer).length;
            const score = correct / questions.length;
            const outcome = recordLevelTest(data.slug, data.title, level, score);
            setResult({ score, ...outcome });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {done ? (ur ? "Test jama karwayein" : "Submit the test") : ur ? `Jama karwane ke liye saare ${questions.length} sawal hal karein` : `Answer all ${questions.length} questions to submit`}
        </button>
      ) : (
        <div className={"sticky bottom-24 rounded-3xl p-5 text-white shadow-2xl lg:bottom-6 " + (result.passed ? "bg-[#06402f]" : "bg-[#0a1f3d]")} role="status">
          <p className="text-2xl font-extrabold">{Math.round(result.score * 100)}%</p>
          <p className="mt-1 text-sm text-white/80">
            {result.passed
              ? result.firstPass
                ? ur
                  ? `Mubarak ho, pass! ${SKILL_LEVELS[rank].label} badge aap ke student pass mein add ho gaya.`
                  : `Passed! ${SKILL_LEVELS[rank].label} badge added to your student pass.`
                : ur
                  ? "Phir se pass — shabash, revision acha raha."
                  : "Passed again — great revision."
              : ur
                ? `Pass mark ${Math.round(PASS_MARK * 100)} % hai. Upar ki explanations parhein, practice karein aur dobara koshish karein.`
                : `Pass mark is ${Math.round(PASS_MARK * 100)}%. Review the explanations above, practise, and try again.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="nx-btn nx-btn-ghost !min-h-[40px]" onClick={start}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {ur ? "Naya test" : "New test"}
            </button>
            {result.passed && next ? (
              <button type="button" className="nx-btn nx-btn-primary !min-h-[40px]" onClick={() => onLevel(next.id)}>
                {ur ? "Agla level" : "Continue to"} {next.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- OSCE ---------------- */

function Station({ station }: { station: SkillData["stations"][number] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);
  const score = Object.values(checked).filter(Boolean).length;
  const minutes = remaining !== null ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : `${station.minutes}:00`;
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-700">OSCE station · {station.minutes} min</p>
          <h3 className="mt-1 text-lg font-bold text-navy-800">{station.title}</h3>
        </div>
        <button type="button" onClick={() => setRemaining(remaining === null ? station.minutes * 60 : null)} className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold " + (remaining !== null ? (remaining === 0 ? "bg-rose-100 text-rose-900" : "bg-[#0a1f3d] text-white") : "border border-slate-300 text-navy-800")}>
          <Timer className="h-4 w-4" aria-hidden="true" /> {remaining === 0 ? "Time!" : minutes}
        </button>
      </div>
      <p className="mt-3 rounded-2xl bg-indigo-50/70 p-4 text-[15px] leading-7 text-indigo-950">{station.scenario}</p>
      <p className="mt-4 text-sm font-bold text-navy-800">Your tasks</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {station.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ol>
      <p className="mt-4 text-sm font-bold text-navy-800">Examiner checklist (tick what you did)</p>
      <ul className="mt-2 space-y-1.5">
        {station.checklist.map((item, index) => (
          <li key={item}>
            <label className="flex cursor-pointer gap-3 rounded-xl px-2 py-1.5 text-sm leading-6 text-slate-700 hover:bg-slate-50">
              <input type="checkbox" checked={Boolean(checked[index])} onChange={(event) => setChecked((value) => ({ ...value, [index]: event.target.checked }))} className="mt-1 h-4 w-4 accent-teal-600" />
              {item}
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-bold text-teal-800">
        Score: {score}/{station.checklist.length}
        {score === station.checklist.length ? " — excellent, OSCE ready." : ""}
      </p>
    </article>
  );
}

function OsceTab({ data }: { data: SkillData }) {
  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm leading-6 text-indigo-950">
        Practise with a partner: one student is the examiner (reads the checklist), the other performs the station against the timer. Swap roles.
      </p>
      {data.stations.map((station) => (
        <Station key={station.id} station={station} />
      ))}
    </div>
  );
}
