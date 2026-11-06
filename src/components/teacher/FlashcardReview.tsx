"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Check, Eye, Layers, RotateCcw, X } from "lucide-react";
import type { BiText, TeacherLang } from "@/lib/teacher/types";
import {
  completeReviewSession,
  getDeck,
  getDueCardIds,
  getTeacherLang,
  reviewCard,
  setTeacherLang,
  teacherToday,
  type TeacherDeck,
} from "@/lib/teacher/progress";
import { cn } from "@/lib/utils";
import { LangToggle, TeacherBubble, pick, t } from "./ui";

export type ReviewCardData = { id: string; lesson: string; lessonTitle: string; front: BiText; back: BiText };

type Mode = "due" | "practice";

export function FlashcardReview({ cards }: { cards: ReviewCardData[] }) {
  const cardMap = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<TeacherLang>("en");
  const [deck, setDeck] = useState<TeacherDeck>({});
  const [mode, setMode] = useState<Mode>("due");
  const [queue, setQueue] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const [knewCount, setKnewCount] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const current = getDeck();
    setLang(getTeacherLang());
    setDeck(current);
    setQueue(getDueCardIds(current).filter((id) => cardMap.has(id)));
    setReady(true);
  }, [cardMap]);

  const deckIds = Object.keys(deck).filter((id) => cardMap.has(id));
  const finished = started && position >= queue.length;
  const currentId = queue[position];
  const card = currentId ? cardMap.get(currentId) : undefined;

  useEffect(() => {
    if (finished && mode === "due") completeReviewSession(reviewed);
  }, [finished, mode, reviewed]);

  function begin(nextMode: Mode) {
    const ids = nextMode === "due" ? getDueCardIds(getDeck()).filter((id) => cardMap.has(id)) : [...deckIds].sort(() => Math.random() - 0.5);
    setMode(nextMode);
    setQueue(ids);
    setPosition(0);
    setFlipped(false);
    setRequeued(new Set());
    setKnewCount(0);
    setReviewed(0);
    setStarted(true);
  }

  function answer(knew: boolean) {
    if (!currentId) return;
    const firstPass = !requeued.has(currentId);
    if (mode === "due" && firstPass) {
      reviewCard(currentId, knew);
      setReviewed((value) => value + 1);
    }
    if (knew && firstPass) setKnewCount((value) => value + 1);
    if (!knew && firstPass) {
      // See it once more at the end of this session — the "again" loop.
      setQueue((current) => [...current, currentId]);
      setRequeued((current) => new Set(current).add(currentId));
    }
    setFlipped(false);
    setPosition((value) => value + 1);
  }

  function changeLang(value: TeacherLang) {
    setLang(value);
    setTeacherLang(value);
  }

  if (!ready) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading your flashcards…</div>;
  }

  const uniqueTotal = new Set(queue).size;
  const nextDue = Object.values(deck)
    .map((state) => state.due)
    .filter((due) => due > teacherToday())
    .sort()[0];

  return (
    <div className="space-y-5" data-pna-teacher-review="v1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LangToggle lang={lang} onChange={changeLang} />
        {started && !finished ? (
          <span className="text-xs font-bold tabular-nums text-slate-500">
            {t(lang, "Card", "Card")} {Math.min(position + 1, queue.length)} / {queue.length}
          </span>
        ) : null}
      </div>

      {!started ? (
        deckIds.length === 0 ? (
          <TeacherBubble>
            {t(
              lang,
              "Your deck is empty for now. Finish any lesson and I'll add its key facts here as flashcards — then I'll bring each card back just before you'd forget it.",
              "Aap ka deck abhi khaali hai. Koi bhi lesson mukammal karein, main us ke ahem nukaat flashcards bana kar yahan daal dunga — phir har card bhoolne se theek pehle wapas laaunga.",
            )}
            <div className="mt-3">
              <Link href="/learn" className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">
                {t(lang, "Choose a lesson", "Lesson chunein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </TeacherBubble>
        ) : queue.length > 0 ? (
          <TeacherBubble>
            {t(
              lang,
              `You have ${queue.length} card${queue.length > 1 ? "s" : ""} due today. Read the question, answer it in your head (or out loud!), then reveal. Be honest — "Not yet" just means I'll show it again sooner.`,
              `Aaj aap ke ${queue.length} cards due hain. Sawal parhein, dil mein (ya zor se!) jawab dein, phir answer dekhein. Imaandari se — "Abhi nahi" ka matlab bas yeh hai ke main isay jaldi dobara dikhaunga.`,
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => begin("due")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-700 px-5 py-2 text-sm font-bold text-white hover:bg-teal-800">
                <Brain className="h-4 w-4" aria-hidden="true" /> {t(lang, "Start today's review", "Aaj ka review shuru karein")}
              </button>
            </div>
          </TeacherBubble>
        ) : (
          <TeacherBubble tone="correct">
            {t(
              lang,
              `All caught up — nothing is due today. 🎉${nextDue ? ` Your next review is on ${nextDue}.` : ""} Want to practise anyway? Practice doesn't change your schedule.`,
              `Sab mukammal — aaj kuch due nahi. 🎉${nextDue ? ` Agla review ${nextDue} ko hai.` : ""} Phir bhi practice karni hai? Practice se schedule nahi badalta.`,
            )}
            <div className="mt-3">
              <button type="button" onClick={() => begin("practice")} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50">
                <Layers className="h-4 w-4" aria-hidden="true" /> {t(lang, `Practise all ${deckIds.length} cards`, `Saare ${deckIds.length} cards practice karein`)}
              </button>
            </div>
          </TeacherBubble>
        )
      ) : null}

      {started && !finished && card ? (
        <div className="mx-auto max-w-xl">
          <div
            className={cn(
              "flex min-h-64 flex-col rounded-3xl border p-6 shadow-sm transition sm:p-8",
              flipped ? "border-teal-300 bg-gradient-to-br from-teal-50 to-white" : "border-slate-200 bg-white",
            )}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
              {card.lessonTitle}
              {requeued.has(card.id) ? <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">{t(lang, "Again", "Dobara")}</span> : null}
            </p>
            <p className="mt-4 text-xl font-bold leading-snug text-navy-800">{pick(card.front, lang)}</p>
            {flipped ? (
              <p className="mt-5 animate-fadeUp border-t border-teal-200 pt-5 text-[17px] leading-8 text-slate-700" aria-live="polite">
                {pick(card.back, lang)}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {!flipped ? (
              <button type="button" onClick={() => setFlipped(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-sm font-bold text-white hover:bg-navy-700">
                <Eye className="h-4 w-4" aria-hidden="true" /> {t(lang, "Show answer", "Jawab dikhayein")}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => answer(false)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-800 hover:bg-amber-100">
                  <X className="h-4 w-4" aria-hidden="true" /> {t(lang, "Not yet", "Abhi nahi")}
                </button>
                <button type="button" onClick={() => answer(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                  <Check className="h-4 w-4" aria-hidden="true" /> {t(lang, "I knew it", "Mujhe aata tha")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {finished ? (
        <TeacherBubble tone="correct" label={t(lang, "🎉 Review complete", "🎉 Review mukammal")}>
          {t(
            lang,
            `You remembered ${knewCount} of ${uniqueTotal} on the first try. ${mode === "due" ? "I've scheduled each card for the right moment — the ones you knew come back later, the tricky ones sooner." : "That was practice, so your schedule hasn't changed."}`,
            `Aap ko ${uniqueTotal} mein se ${knewCount} pehli baar mein yaad thay. ${mode === "due" ? "Main ne har card sahi waqt ke liye schedule kar diya — jo aate thay woh baad mein, mushkil wale jaldi wapas aayenge." : "Yeh practice thi, is liye schedule nahi badla."}`,
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/learn" className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">
              {t(lang, "Back to PNA Teacher", "PNA Teacher par wapas")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setStarted(false);
                const current = getDeck();
                setDeck(current);
                setQueue(getDueCardIds(current).filter((id) => cardMap.has(id)));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t(lang, "Done", "Theek hai")}
            </button>
          </div>
        </TeacherBubble>
      ) : null}
    </div>
  );
}
