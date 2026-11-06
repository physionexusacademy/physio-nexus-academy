"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ExternalLink,
  Layers,
  MessageCircle,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import type { BiText, TeacherBeat, TeacherLang, TeacherLesson } from "@/lib/teacher/types";
import {
  clearLessonSession,
  completeTeacherLesson,
  getTeacherLang,
  getTeacherProfile,
  lessonXp,
  loadLessonSession,
  saveLessonSession,
  setTeacherLang,
} from "@/lib/teacher/progress";
import { whatsappLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { TeacherWidget } from "./widgets";
import { SortActivity } from "./SortActivity";
import { useSpeech } from "./useSpeech";
import {
  Chip,
  LangToggle,
  RichText,
  StudentBubble,
  TeacherBubble,
  TypingBubble,
  pick,
  plainText,
  t,
  type BubbleTone,
} from "./ui";

type Entry =
  | { k: "intro" }
  | { k: "beat"; i: number }
  | { k: "simpler"; i: number }
  | { k: "hint"; i: number }
  | { k: "student"; text: BiText }
  | { k: "feedback"; i: number; o: number }
  | { k: "sortDone"; i: number; correct: number; total: number }
  | { k: "end" };

type Session = { v: 1; log: Entry[]; attempts: Record<string, number[]> };

const VOICE_KEY = "pna-teacher-voice-v1";

const acknowledgements: BiText[] = [
  { en: "Got it 👍", ur: "Samajh gaya 👍" },
  { en: "Makes sense — next", ur: "Theek hai — aage" },
  { en: "Okay, keep going", ur: "Acha, jaari rakhein" },
  { en: "Clear! Next ➜", ur: "Wazeh hai! Aage ➜" },
];

const beatLabels: Partial<Record<TeacherBeat["type"], { tone: BubbleTone; label: BiText }>> = {
  analogy: { tone: "analogy", label: { en: "💡 Think of it like this", ur: "💡 Aise sochiye" } },
  memory: { tone: "memory", label: { en: "🧠 Memory trick", ur: "🧠 Yaad rakhne ka tareeqa" } },
  mistake: { tone: "mistake", label: { en: "⚠️ Common mistake", ur: "⚠️ Aam ghalti" } },
  clinic: { tone: "clinic", label: { en: "🩺 In the clinic", ur: "🩺 Clinic mein" } },
  check: { tone: "check", label: { en: "❓ Quick check", ur: "❓ Chhota sa sawal" } },
  try: { tone: "try", label: { en: "✋ Try it yourself", ur: "✋ Khud try karein" } },
  widget: { tone: "plain", label: { en: "🔬 See it for yourself", ur: "🔬 Khud dekhein" } },
  sort: { tone: "plain", label: { en: "🧩 Sorting game", ur: "🧩 Sorting game" } },
  compare: { tone: "plain", label: { en: "📊 Side by side", ur: "📊 Aamne saamne" } },
};

function freshSession(): Session {
  return { v: 1, log: [{ k: "intro" }], attempts: {} };
}

function isSession(value: unknown): value is Session {
  const session = value as Session | null;
  return Boolean(session && session.v === 1 && Array.isArray(session.log) && session.log.length > 0 && typeof session.attempts === "object");
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function LessonPlayer({
  lesson,
  nextLesson,
}: {
  lesson: TeacherLesson;
  nextLesson: { slug: string; title: string } | null;
}) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>(freshSession);
  const [lang, setLang] = useState<TeacherLang>("en");
  const [name, setName] = useState("");
  const [typing, setTyping] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [pathSlug, setPathSlug] = useState<string | null>(null);
  const [completion, setCompletion] = useState<ReturnType<typeof completeTeacherLesson> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userActed = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const speech = useSpeech();
  const { beats } = lesson;

  useEffect(() => {
    setLang(getTeacherLang());
    setName(getTeacherProfile()?.name ?? "");
    const saved = loadLessonSession<Session>(lesson.slug);
    if (isSession(saved)) setSession(saved);
    try {
      setVoiceOn(window.localStorage.getItem(VOICE_KEY) === "on");
      const path = new URLSearchParams(window.location.search).get("path");
      if (path && /^[a-z0-9-]+$/.test(path)) setPathSlug(path);
    } catch {
      /* ignore */
    }
    setReady(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lesson.slug]);

  useEffect(() => {
    if (ready) saveLessonSession(lesson.slug, session);
  }, [ready, lesson.slug, session]);

  useEffect(() => {
    if (!userActed.current) return;
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "end" });
  }, [session.log.length, typing]);

  const lastBeat = useMemo(
    () => session.log.reduce((max, entry) => (entry.k === "beat" ? Math.max(max, entry.i) : max), -1),
    [session.log],
  );
  const ended = session.log.some((entry) => entry.k === "end");
  const checkIndexes = useMemo(() => beats.flatMap((beat, index) => (beat.type === "check" ? [index] : [])), [beats]);
  const firstTryCorrect = checkIndexes.filter((index) => {
    const tries = session.attempts[String(index)];
    const beat = beats[index];
    return beat.type === "check" && tries?.length ? Boolean(beat.options[tries[0]]?.correct) : false;
  }).length;

  const entryText = useCallback(
    (entry: Entry): string => {
      const greeting = t(lang, `Hello${name ? " " + name : ""}!`, `Assalam-o-Alaikum${name ? " " + name : ""}!`);
      switch (entry.k) {
        case "intro":
          return `${greeting} ${lesson.title}. ${pick(lesson.goal, lang)}`;
        case "beat": {
          const beat = beats[entry.i];
          if (!beat) return "";
          if (beat.type === "widget") return pick(beat.intro, lang);
          if (beat.type === "check") return pick(beat.question, lang);
          if (beat.type === "try") return `${pick(beat.title, lang)}. ${beat.steps.map((step) => pick(step, lang)).join(". ")}. ${pick(beat.ask, lang)}`;
          if (beat.type === "sort") return pick(beat.prompt, lang);
          if (beat.type === "compare") return pick(beat.title, lang);
          return pick(beat.text, lang);
        }
        case "simpler": {
          const beat = beats[entry.i];
          return beat && (beat.type === "say" || beat.type === "analogy") && beat.simpler ? pick(beat.simpler, lang) : "";
        }
        case "hint": {
          const beat = beats[entry.i];
          return beat?.type === "check" && beat.hint ? pick(beat.hint, lang) : "";
        }
        case "feedback": {
          const beat = beats[entry.i];
          if (beat?.type === "check" || beat?.type === "try") return pick(beat.options[entry.o].feedback, lang);
          return "";
        }
        default:
          return "";
      }
    },
    [beats, lang, lesson.goal, lesson.title, name],
  );

  function respond(student: BiText | null, teacher: Entry[], update?: (session: Session) => Session) {
    if (typing) return;
    userActed.current = true;
    speech.stop();
    setSession((current) => {
      const withStudent = student ? { ...current, log: [...current.log, { k: "student", text: student } as Entry] } : current;
      return update ? update(withStudent) : withStudent;
    });
    const delay = prefersReducedMotion() ? 0 : 520 + Math.floor(Math.random() * 380);
    setTyping(true);
    timer.current = setTimeout(() => {
      setSession((current) => ({ ...current, log: [...current.log, ...teacher] }));
      setTyping(false);
      const last = teacher[teacher.length - 1];
      if (voiceOn && lang === "en" && speech.supported && last) {
        const text = plainText(entryText(last));
        if (text) speech.speak("auto-" + Date.now(), text);
      }
    }, delay);
  }

  function next() {
    if (lastBeat >= beats.length - 1) {
      const result = completeTeacherLesson({
        slug: lesson.slug,
        title: lesson.title,
        firstTryCorrect,
        checks: checkIndexes.length,
        flashcardIds: lesson.flashcards.map((card) => card.id),
      });
      setCompletion(result);
      respond({ en: "Finish the lesson 🎉", ur: "Lesson mukammal karein 🎉" }, [{ k: "end" }]);
      return;
    }
    const beat = beats[lastBeat];
    const ack =
      beat?.type === "widget"
        ? { en: "I've explored it — next", ur: "Dekh liya — aage chalein" }
        : acknowledgements[Math.max(0, lastBeat) % acknowledgements.length];
    respond(ack, [{ k: "beat", i: lastBeat + 1 }]);
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    speech.stop();
    clearLessonSession(lesson.slug);
    setTyping(false);
    setCompletion(null);
    setSession(freshSession());
    userActed.current = false;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function changeLang(value: TeacherLang) {
    setLang(value);
    setTeacherLang(value);
    if (value === "ur") speech.stop();
  }

  function toggleVoice() {
    const value = !voiceOn;
    setVoiceOn(value);
    try {
      window.localStorage.setItem(VOICE_KEY, value ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (!value) speech.stop();
  }

  const hasEntry = (kind: Entry["k"], index: number) =>
    session.log.some((entry) => entry.k === kind && "i" in entry && entry.i === index);

  function isResolved(index: number): boolean {
    const beat = beats[index];
    if (!beat) return true;
    if (beat.type === "check") {
      const correct = beat.options.findIndex((option) => option.correct);
      return (session.attempts[String(index)] ?? []).includes(correct);
    }
    if (beat.type === "try") return hasEntry("feedback", index);
    if (beat.type === "sort") return hasEntry("sortDone", index);
    return true;
  }

  function renderBeat(beat: TeacherBeat, index: number, key: string) {
    const meta = beatLabels[beat.type];
    const label = meta ? pick(meta.label, lang) : undefined;
    const tone = meta?.tone ?? "plain";
    const listen = lang === "en" && speech.supported ? () => speech.toggle(key, plainText(entryText({ k: "beat", i: index }))) : undefined;
    const common = { label, tone, onListen: listen, listening: speech.speakingId === key };

    switch (beat.type) {
      case "say":
      case "analogy":
      case "memory":
      case "mistake":
      case "clinic":
        return (
          <TeacherBubble key={key} {...common}>
            <RichText text={pick(beat.text, lang)} />
          </TeacherBubble>
        );
      case "check":
        return (
          <TeacherBubble key={key} {...common}>
            <p className="font-bold text-navy-800">
              <RichText text={pick(beat.question, lang)} />
            </p>
            {!isResolved(index) ? (
              <p className="mt-1 text-sm text-slate-500">{t(lang, "Pick your answer below 👇", "Neeche se jawab chunein 👇")}</p>
            ) : null}
          </TeacherBubble>
        );
      case "try":
        return (
          <TeacherBubble key={key} {...common}>
            <p className="font-bold text-navy-800">{pick(beat.title, lang)}</p>
            <ol className="mt-2 space-y-1.5">
              {beat.steps.map((step, stepIndex) => (
                <li key={step.en} className="flex gap-2.5">
                  <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-200 text-xs font-extrabold text-emerald-900">
                    {stepIndex + 1}
                  </span>
                  <span>{pick(step, lang)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 font-bold text-navy-800">{pick(beat.ask, lang)}</p>
          </TeacherBubble>
        );
      case "widget":
        return (
          <TeacherBubble key={key} {...common} wide>
            <RichText text={pick(beat.intro, lang)} />
            <div className="mt-3">
              <TeacherWidget widget={beat.widget} lang={lang} />
            </div>
          </TeacherBubble>
        );
      case "sort":
        return (
          <TeacherBubble key={key} {...common} wide>
            <RichText text={pick(beat.prompt, lang)} />
            <SortActivity
              categories={beat.categories}
              items={beat.items}
              lang={lang}
              revealAll={hasEntry("sortDone", index)}
              onDone={(correct, total) =>
                respond({ en: "Done sorting ✅", ur: "Sorting mukammal ✅" }, [{ k: "sortDone", i: index, correct, total }])
              }
            />
          </TeacherBubble>
        );
      case "compare":
        return (
          <TeacherBubble key={key} {...common} wide>
            <p className="font-bold text-navy-800">{pick(beat.title, lang)}</p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200" data-horizontal-scroll>
              <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {beat.headers.map((header, headerIndex) => (
                      <th
                        key={header.en}
                        scope="col"
                        className={cn(
                          "px-3 py-2 text-xs font-extrabold uppercase tracking-wider",
                          headerIndex === 1 ? "text-violet-800" : headerIndex === 2 ? "text-teal-800" : "text-slate-600",
                        )}
                      >
                        {pick(header, lang)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {beat.rows.map((row) => (
                    <tr key={row[0].en} className="border-t border-slate-100">
                      <th scope="row" className="px-3 py-2 font-bold text-navy-800">
                        {pick(row[0], lang)}
                      </th>
                      <td className="px-3 py-2 text-slate-700">{pick(row[1], lang)}</td>
                      <td className="px-3 py-2 text-slate-700">{pick(row[2], lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TeacherBubble>
        );
      default:
        return null;
    }
  }

  function renderEntry(entry: Entry, index: number) {
    const key = `${entry.k}-${index}`;
    const listen = (text: string) =>
      lang === "en" && speech.supported ? () => speech.toggle(key, plainText(text)) : undefined;

    switch (entry.k) {
      case "intro": {
        const greeting = t(lang, `Hello${name ? ", " + name : ""}! 👋`, `Assalam-o-Alaikum${name ? ", " + name : ""}! 👋`);
        const text = `${greeting}\n${t(lang, "Today's concept:", "Aaj ka concept:")} **${lesson.title}**\n${pick(lesson.goal, lang)}\n${t(
          lang,
          "I'll explain one small step at a time and check your understanding along the way. Stuck? Tap **Explain more simply**, or switch to Roman Urdu at the top.",
          "Main ek waqt mein ek chhota qadam samjhaunga aur saath saath aap ki samajh check karunga. Atak jayein to **Aur asaan karein** dabayein, ya upar se English par switch karein.",
        )}`;
        return (
          <TeacherBubble key={key} onListen={listen(text)} listening={speech.speakingId === key}>
            <RichText text={text} />
          </TeacherBubble>
        );
      }
      case "beat": {
        const beat = beats[entry.i];
        return beat ? renderBeat(beat, entry.i, key) : null;
      }
      case "simpler": {
        const beat = beats[entry.i];
        if (!beat || (beat.type !== "say" && beat.type !== "analogy") || !beat.simpler) return null;
        const text = pick(beat.simpler, lang);
        return (
          <TeacherBubble key={key} tone="simpler" label={t(lang, "🔁 Even simpler", "🔁 Aur bhi asaan")} onListen={listen(text)} listening={speech.speakingId === key}>
            <RichText text={text} />
          </TeacherBubble>
        );
      }
      case "hint": {
        const beat = beats[entry.i];
        if (beat?.type !== "check" || !beat.hint) return null;
        return (
          <TeacherBubble key={key} tone="check" label={t(lang, "💡 Hint", "💡 Ishara")}>
            <RichText text={pick(beat.hint, lang)} />
          </TeacherBubble>
        );
      }
      case "student":
        return <StudentBubble key={key}>{pick(entry.text, lang)}</StudentBubble>;
      case "feedback": {
        const beat = beats[entry.i];
        if (beat?.type === "check") {
          const option = beat.options[entry.o];
          const correct = Boolean(option?.correct);
          const text = pick(option.feedback, lang);
          return (
            <TeacherBubble
              key={key}
              tone={correct ? "correct" : "retry"}
              label={correct ? t(lang, "✅ Correct!", "✅ Sahi jawab!") : t(lang, "🤔 Not quite", "🤔 Abhi nahi")}
              onListen={listen(text)}
              listening={speech.speakingId === key}
            >
              <RichText text={text} />
              {!correct ? (
                <p className="mt-2 text-sm font-semibold text-amber-800">
                  {t(lang, "No problem — mistakes are how we learn. Try another option 👇", "Koi baat nahi — ghalti se hi seekhte hain. Doosra option try karein 👇")}
                </p>
              ) : null}
            </TeacherBubble>
          );
        }
        if (beat?.type === "try") {
          const text = pick(beat.options[entry.o].feedback, lang);
          return (
            <TeacherBubble key={key} tone="try" label={t(lang, "👀 Here's what happened", "👀 Yeh hua")} onListen={listen(text)} listening={speech.speakingId === key}>
              <RichText text={text} />
            </TeacherBubble>
          );
        }
        return null;
      }
      case "sortDone": {
        const perfect = entry.correct === entry.total;
        const text = perfect
          ? t(lang, `You sorted all ${entry.total} correctly! 🌟 You've clearly got it.`, `Aap ne saare ${entry.total} sahi sort kiye! 🌟 Aap ko samajh aa gaya.`)
          : t(
              lang,
              `You sorted ${entry.correct} of ${entry.total} correctly. Read the explanation under the ones you missed — that's exactly where the learning happens.`,
              `Aap ne ${entry.total} mein se ${entry.correct} sahi sort kiye. Jo ghalat hue un ke neeche wazahat parhein — asal seekhna wahin hai.`,
            );
        return (
          <TeacherBubble key={key} tone={perfect ? "correct" : "plain"}>
            {text}
          </TeacherBubble>
        );
      }
      case "end":
        return null;
      default:
        return null;
    }
  }

  function renderChips() {
    if (!ready || typing || ended) return null;
    if (lastBeat === -1) {
      return (
        <Chip onClick={() => respond({ en: "Let's start! 🚀", ur: "Chaliye shuru karein! 🚀" }, [{ k: "beat", i: 0 }])}>
          {t(lang, "Let's start!", "Chaliye shuru karein!")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Chip>
      );
    }
    const beat = beats[lastBeat];
    const resolved = isResolved(lastBeat);
    const isLast = lastBeat === beats.length - 1;
    const nextChip = (
      <Chip key="next" onClick={next}>
        {isLast ? t(lang, "Finish the lesson 🎉", "Lesson mukammal karein 🎉") : t(lang, "Next", "Aage")}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Chip>
    );

    if (beat.type === "check" && !resolved) {
      const tried = session.attempts[String(lastBeat)] ?? [];
      return (
        <>
          {beat.options.map((option, optionIndex) =>
            tried.includes(optionIndex) ? null : (
              <Chip
                key={option.text.en}
                variant="soft"
                onClick={() =>
                  respond(option.text, [{ k: "feedback", i: lastBeat, o: optionIndex }], (current) => ({
                    ...current,
                    attempts: { ...current.attempts, [String(lastBeat)]: [...(current.attempts[String(lastBeat)] ?? []), optionIndex] },
                  }))
                }
              >
                {pick(option.text, lang)}
              </Chip>
            ),
          )}
          {beat.hint && !hasEntry("hint", lastBeat) ? (
            <Chip variant="ghost" onClick={() => respond({ en: "Give me a hint 💡", ur: "Ishara dein 💡" }, [{ k: "hint", i: lastBeat }])}>
              💡 {t(lang, "Hint", "Ishara")}
            </Chip>
          ) : null}
        </>
      );
    }

    if (beat.type === "try" && !resolved) {
      return beat.options.map((option, optionIndex) => (
        <Chip key={option.text.en} variant="soft" onClick={() => respond(option.text, [{ k: "feedback", i: lastBeat, o: optionIndex }])}>
          {pick(option.text, lang)}
        </Chip>
      ));
    }

    if (beat.type === "sort" && !resolved) {
      return (
        <>
          <p className="w-full text-sm font-semibold text-slate-500">{t(lang, "Sort every item above to continue.", "Aage barhne ke liye upar har item sort karein.")}</p>
          <Chip variant="ghost" onClick={() => respond({ en: "Skip this activity", ur: "Yeh activity skip karein" }, [{ k: "beat", i: lastBeat + 1 }])}>
            {t(lang, "Skip", "Skip")}
          </Chip>
        </>
      );
    }

    const canSimplify = (beat.type === "say" || beat.type === "analogy") && beat.simpler && !hasEntry("simpler", lastBeat);
    return (
      <>
        {nextChip}
        {canSimplify ? (
          <Chip variant="soft" onClick={() => respond({ en: "Can you explain that more simply? 🤔", ur: "Thora aur asaan kar ke samjhayein? 🤔" }, [{ k: "simpler", i: lastBeat }])}>
            🤔 {t(lang, "Explain more simply", "Aur asaan karein")}
          </Chip>
        ) : null}
      </>
    );
  }

  const progressPercent = ended ? 100 : Math.round(((lastBeat + 1) / beats.length) * 100);
  const doubtMessage = `Assalam-o-Alaikum PNA! I'm learning "${lesson.title}" on PNA Teacher and I have a question: `;

  return (
    <div className="mx-auto w-full max-w-3xl" data-pna-teacher-lesson={lesson.slug}>
      <div className="sticky top-20 z-30 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-sm sm:mx-0 sm:rounded-b-2xl sm:border-x">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={t(lang, "Lesson progress", "Lesson progress")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="flex-none text-xs font-bold tabular-nums text-slate-500">{progressPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LangToggle lang={lang} onChange={changeLang} />
            {speech.supported ? (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={lang === "ur"}
                aria-pressed={voiceOn && lang === "en"}
                title={lang === "ur" ? "Voice is available in English" : voiceOn ? "Stop reading new messages aloud" : "Read new messages aloud"}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-40",
                  voiceOn && lang === "en" ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:text-teal-700",
                )}
              >
                {voiceOn && lang === "en" ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="sr-only">{t(lang, "Teacher voice", "Teacher ki awaaz")}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={restart}
              title={t(lang, "Start the lesson again", "Lesson dobara shuru karein")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-teal-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">{t(lang, "Restart lesson", "Lesson restart")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4" role="log" aria-live="polite" aria-label={t(lang, "Lesson conversation", "Lesson ki guftagu")}>
        {session.log.map(renderEntry)}
        {typing ? <TypingBubble /> : null}
      </div>

      {ended ? (
        <CompletionCard
          lesson={lesson}
          lang={lang}
          firstTryCorrect={firstTryCorrect}
          checks={checkIndexes.length}
          completion={completion}
          nextLesson={nextLesson}
          pathSlug={pathSlug}
          onRestart={restart}
          doubtHref={whatsappLink(doubtMessage)}
        />
      ) : (
        <div className="mt-5 pl-10 sm:pl-[3.25rem]">
          <div className="flex min-h-11 flex-wrap items-center gap-2">{renderChips()}</div>
          <a
            href={whatsappLink(doubtMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {t(lang, "Still stuck? Ask a PNA teacher on WhatsApp", "Phir bhi atke hain? PNA teacher se WhatsApp par poochein")}
          </a>
        </div>
      )}
      <div ref={bottomRef} className="h-4 scroll-mb-36 lg:scroll-mb-10" />
    </div>
  );
}

function CompletionCard({
  lesson,
  lang,
  firstTryCorrect,
  checks,
  completion,
  nextLesson,
  pathSlug,
  onRestart,
  doubtHref,
}: {
  lesson: TeacherLesson;
  lang: TeacherLang;
  firstTryCorrect: number;
  checks: number;
  completion: ReturnType<typeof completeTeacherLesson> | null;
  nextLesson: { slug: string; title: string } | null;
  pathSlug: string | null;
  onRestart: () => void;
  doubtHref: string;
}) {
  const xp = completion ? completion.xpAwarded : 0;
  const ratio = checks ? firstTryCorrect / checks : 1;
  const praise =
    ratio >= 0.85
      ? t(lang, "Outstanding — you could teach this to your batch now.", "Zabardast — ab aap yeh apni class ko parha sakte hain.")
      : ratio >= 0.5
        ? t(lang, "Great work. Your flashcards will lock it in over the next few days.", "Bohat khoob. Agle kuch din aap ke flashcards isay pakka kar denge.")
        : t(lang, "You finished — that's what matters. Mistakes today mean fewer mistakes in the clinic.", "Aap ne mukammal kiya — yehi asal baat hai. Aaj ki ghaltiyan clinic mein kam ghaltiyan hain.");

  return (
    <section className="mt-6 animate-fadeUp overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-white via-teal-50/60 to-cyan-50 shadow-sm" aria-labelledby="pna-lesson-complete">
      <div className="p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-teal-700 text-white">
            <PartyPopper className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="pna-lesson-complete" className="text-2xl font-bold text-navy-800">
              {t(lang, "Lesson complete!", "Shabash! Lesson mukammal!")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{praise}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sparkles className="h-4 w-4 text-teal-600" aria-hidden="true" /> {t(lang, "First-try score", "Pehli koshish")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-800">
              {firstTryCorrect}/{checks}
            </p>
          </div>
          <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" /> XP
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-800">
              {xp > 0 ? `+${xp}` : completion && !completion.firstCompletion ? t(lang, "Revised", "Revision") : `✓ ${lessonXp(firstTryCorrect)}`}
            </p>
          </div>
          <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Layers className="h-4 w-4 text-violet-600" aria-hidden="true" /> {t(lang, "Flashcards", "Flashcards")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-800">{lesson.flashcards.length}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-navy-800">{t(lang, "Remember these three things", "Yeh teen baatein yaad rakhein")}</h3>
          <ol className="mt-3 space-y-2">
            {lesson.summary.map((point, index) => (
              <li key={point.en} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-100 text-xs font-extrabold text-teal-800">
                  {index + 1}
                </span>
                <span>{pick(point, lang)}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-900">
          <Layers className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          {t(
            lang,
            `I've added ${lesson.flashcards.length} flashcards to your review deck. Come back tomorrow for a 2-minute review — spacing your practice is what moves knowledge into long-term memory.`,
            `Main ne ${lesson.flashcards.length} flashcards aap ke review deck mein daal diye hain. Kal 2 minute ke review ke liye wapas aayein — waqfay se practice hi ilm ko lambi yaadasht mein le jati hai.`,
          )}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {pathSlug ? (
            <Link href={`/learn/paths/${pathSlug}`} className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">
              {t(lang, "Continue my path", "Apna path jaari rakhein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : nextLesson ? (
            <Link href={`/learn/${nextLesson.slug}`} className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">
              {t(lang, "Next lesson:", "Agla lesson:")} {nextLesson.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
          <Link href="/learn/review" className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-50">
            <Layers className="h-4 w-4" aria-hidden="true" /> {t(lang, "My flashcards", "Mere flashcards")}
          </Link>
          <Link href="/learn" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 transition hover:bg-slate-50">
            {t(lang, "PNA Teacher home", "PNA Teacher home")}
          </Link>
          <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t(lang, "Learn it again", "Dobara parhein")}
          </button>
        </div>
      </div>

      <div className="border-t border-teal-100 bg-white/70 p-5 sm:p-7">
        <h3 className="flex items-center gap-2 font-bold text-navy-800">
          <BookOpenCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
          {t(lang, "Go deeper on PNA", "PNA par mazeed gehrai")}
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {lesson.goDeeper.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm">
              <p className="text-sm font-bold text-navy-800 group-hover:text-teal-800">{link.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{pick(link.note, lang)}</p>
            </Link>
          ))}
        </div>

        <a
          href={doubtHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {t(lang, "Still have a doubt? Ask PNA on WhatsApp", "Abhi bhi koi sawal? PNA se WhatsApp par poochein")}
        </a>

        <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-navy-800">{t(lang, "Evidence & sources for this lesson", "Is lesson ke sources")}</summary>
          <ul className="mt-3 space-y-2">
            {lesson.sources.map((source) => (
              <li key={source.citation} className="text-xs leading-5 text-slate-600">
                {source.citation}
                {source.pubmedQuery ? (
                  <>
                    {" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(source.pubmedQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-semibold text-teal-700 hover:underline"
                    >
                      PubMed <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t(
              lang,
              "Educational content. It does not replace individual clinical assessment, supervision or your local guidelines.",
              "Yeh taleemi content hai. Yeh individual clinical assessment, supervision ya local guidelines ka badal nahi.",
            )}
          </p>
        </details>
      </div>
    </section>
  );
}
