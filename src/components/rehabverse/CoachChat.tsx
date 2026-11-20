"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Send, Sparkles } from "lucide-react";
import { coachChatTurnAction, startCoachChatAction, type ChatMessageOut } from "@/app/rehabverse/ai-actions";
import { MAX_COACH_MESSAGE, QUICK_QUESTIONS } from "@/lib/rehabverse/ai/coach-spec";
import type { Bi } from "@/lib/rehabverse/types";
import { AI_NOTICES } from "@/lib/rehabverse/ai/notices";
import { AiNoticeList } from "./AiNoticeList";
import { T, useRvLang } from "./useLang";

type Phase = "closed" | "notice" | "starting" | "chat" | "gone";

/**
 * The exercise coach on an open exercise day: explains today's prescribed exercises from the plan and the reviewed library, with a quick
 * question for each exercise and a box for free questions. It never changes the plan (that is the physiotherapist's), anything about symptoms
 * or medicines is routed to the physiotherapist, and a safety problem stops the coach and alerts them. Only shown when the admin switched
 * AI on for this patient (checked again on the server for every message).
 */
export function CoachChat({ sessionId, names, selected }: { sessionId: string; names: Bi[]; selected: number }) {
  const [lang] = useRvLang();
  const [phase, setPhase] = useState<Phase>("closed");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessageOut[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);
  const [held, setHeld] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = list.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const start = async () => {
    setError(null);
    setPhase("starting");
    const r = await startCoachChatAction({ sessionId, lang, accepted: true });
    if (!r.ok) {
      if (r.error === "ai_off") return setPhase("gone");
      if (r.error === "held") { setHeld(true); return setPhase("chat"); }
      setError(r.error === "rate_limited" ? "limit" : "failed");
      return setPhase("notice");
    }
    setConversationId(r.conversationId);
    setMessages(r.messages);
    setPhase("chat");
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending || stopped || held) return;
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "patient", text: message }]);
    setInput("");
    const r = await coachChatTurnAction({ conversationId, sessionId, text: message, exerciseIndex: selected });
    setSending(false);
    if (!r.ok) {
      if (r.error === "ai_off") return setPhase("gone");
      setMessages((m) => m.slice(0, -1));
      setInput(message);
      return setError(r.error === "rate_limited" ? "slow" : "failed");
    }
    setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    if (r.status === "safety_stop") setStopped(true);
  };

  if (phase === "gone") return null;
  const name = names[selected] ?? { en: "this exercise", ru: "is exercise" };

  if (phase === "closed") {
    return (
      <button type="button" onClick={() => setPhase("notice")} className="rv-glass flex w-full items-center gap-3 p-4 text-left" data-rv-coach="closed">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className="block font-heading text-base font-bold text-navy-800"><T en="Your exercise coach" ru="Aap ka exercise coach" /> <span className="rv-chip ml-1 align-middle text-[11px]">AI</span></span><span className="block text-[13px] leading-5 text-slate-600"><T en="Ask how to do today's exercises, how many, breathing and common mistakes." ru="Aaj ki exercises kaise karni hain, kitni baar, saans aur aam ghaltiyan poochein." /></span></span>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    );
  }

  if (phase === "notice" || phase === "starting") {
    return (
      <section className="rv-glass space-y-3 p-4 sm:p-5" aria-label="Exercise coach" data-rv-coach="notice">
        <h2 className="font-heading text-lg font-bold text-navy-800"><T en="Before we start" ru="Shuru karne se pehle" /></h2>
        <AiNoticeList items={AI_NOTICES.coach.items} className="space-y-2 text-[14px] leading-6 text-slate-700" />
        {error ? <p className="rv-error" role="alert">{error === "limit" ? <T en="You have started several conversations today. Please try again tomorrow." ru="Aaj aap ne kai baat-cheet shuru kar li hain. Kal koshish karein." /> : <T en="That did not work. Please try again." ru="Ye nahi hua. Dobara koshish karein." />}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary" disabled={phase === "starting"} onClick={start}>{phase === "starting" ? <T en="Starting…" ru="Shuru ho raha hai…" /> : <T en="I understand, start" ru="Main samajh gaya/gayi, shuru karein" />}</button>
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setPhase("closed")}><T en="Not now" ru="Abhi nahi" /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="rv-glass flex flex-col p-3 sm:p-4" aria-label="Exercise coach" data-rv-coach="chat">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-1 pb-2">
        <p className="flex items-center gap-2 text-[14px] font-extrabold text-navy-800"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span> <T en="Exercise coach" ru="Exercise coach" /> <span className="rv-chip text-[11px]">AI</span></p>
        <button type="button" className="text-[12.5px] font-bold text-teal-800 underline-offset-2 hover:underline" onClick={() => setPhase("closed")}><T en="Hide" ru="Chhupayein" /></button>
      </div>

      {held ? (
        <p className="m-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[13.5px] font-semibold leading-5 text-[#a1121f]" role="alert"><T en="The coach is paused for today because of what you reported. Your physiotherapist has been told. Please wait for their message, and use the feedback form if you need to add anything." ru="Jo aap ne bataya uski wajah se coach aaj ke liye ruka hua hai. Aap ke physiotherapist ko bata diya gaya hai. Un ke paigham ka intezar karein, aur kuch aur batana ho to feedback form istemal karein." /></p>
      ) : (
        <>
          <div ref={list} className="max-h-[22rem] min-h-[8rem] space-y-3 overflow-y-auto px-1 py-3" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "patient" ? "justify-end" : "justify-start")}>
                <p className={"max-w-[92%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14px] leading-6 " + (m.role === "patient" ? "rounded-br-md bg-[#0a1f3d] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm")}>{m.text}</p>
              </div>
            ))}
            {sending ? <div className="flex justify-start"><p className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-slate-400 shadow-sm" aria-label="The coach is typing"><span className="inline-flex gap-1"><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" /></span></p></div> : null}
          </div>
          {error ? <p className="rv-error mx-1 mb-2" role="alert">{error === "slow" ? <T en="Please wait a moment before sending again." ru="Dobara bhejne se pehle zara intezar karein." /> : <T en="I could not reply just now. Please send it again." ru="Main abhi jawab nahi de saka/saki. Dobara bhejein." />}</p> : null}
          {stopped ? (
            <p className="mx-1 mb-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[13.5px] font-semibold leading-5 text-[#a1121f]" role="alert"><T en="Your physiotherapist has been told. Please use the feedback form after you have rested, and wait for their message." ru="Aap ke physiotherapist ko bata diya gaya hai. Aaram ke baad feedback form istemal karein aur un ke paigham ka intezar karein." /></p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5 px-1 pb-2" aria-label={lang === "ru" ? `${name.ru} ke liye sawal` : `Questions about ${name.en}`}>
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q.intent} type="button" disabled={sending} onClick={() => void send(q.ask(name)[lang])} className="rv-pill" data-coach-quick={q.intent}>{q.label[lang]}</button>
                ))}
              </div>
              <p className="px-1 pb-1.5 text-[12px] text-slate-500"><T en="Questions apply to the exercise you have open:" ru="Sawal usi exercise ke liye hain jo khuli hai:" /> <b className="text-slate-700">{name[lang]}</b></p>
              <form className="flex items-end gap-2 border-t border-slate-100 pt-2" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
                <textarea
                  value={input} onChange={(e) => setInput(e.target.value)} rows={2} maxLength={MAX_COACH_MESSAGE} disabled={sending}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
                  placeholder={lang === "ru" ? "Apna sawal likhein (English ya Roman Urdu)…" : "Type your question, in English or Roman Urdu…"}
                  aria-label={lang === "ru" ? "Aap ka sawal" : "Your question"} className="rv-input min-h-[3.25rem] flex-1 resize-none"
                />
                <button type="submit" className="rv-btn rv-btn-primary" disabled={!input.trim() || sending} aria-label={lang === "ru" ? "Bhejein" : "Send"}><Send className="h-4 w-4" aria-hidden="true" /></button>
              </form>
            </>
          )}
        </>
      )}
    </section>
  );
}
