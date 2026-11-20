"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Send, ShieldCheck, Sparkles } from "lucide-react";
import { checkinChatTurnAction, closeCheckinChatAction, startCheckinChatAction, type ChatMessageOut } from "@/app/rehabverse/ai-actions";
import { checkinProgress, EMPTY_CHECKIN, MAX_CHECKIN_MESSAGE, type CheckinDraft } from "@/lib/rehabverse/ai/checkin-shared";
import { T, useRvLang } from "./useLang";

type Phase = "closed" | "notice" | "starting" | "chat" | "gone";

/** What the chat puts into the check-in form below it. Only fields the chat just learned or changed are sent, so what the patient edits by hand is not overwritten. */
export type FormPatch = { pain?: number; fn?: number; response?: "better" | "same" | "worse"; newSymptoms?: boolean; flags?: string[]; note?: string };

const patchFrom = (now: CheckinDraft, before: CheckinDraft): FormPatch => {
  const patch: FormPatch = {};
  if (now.pain !== null && now.pain !== before.pain) patch.pain = now.pain;
  if (now.function_score !== null && now.function_score !== before.function_score) patch.fn = now.function_score;
  if (now.symptom_response && now.symptom_response !== before.symptom_response) patch.response = now.symptom_response;
  if (now.new_symptoms !== null && now.new_symptoms !== before.new_symptoms) patch.newSymptoms = now.new_symptoms;
  if (now.flags.length && now.flags.join() !== before.flags.join()) patch.flags = now.flags;
  if (now.note && now.note !== before.note) patch.note = now.note;
  return patch;
};

/**
 * The recovery check-in as a short chat: the assistant asks the check-in questions one at a time and fills in the check-in form below as the
 * patient answers. It never saves anything: the patient reads the form, ticks the safety list themselves (the chat never ticks "None of these"),
 * and presses Save. A warning sign stops the chat, pre-ticks that sign on the form and tells the physiotherapist. Only shown when the admin
 * switched AI on for this patient (checked again on the server for every message).
 */
export function CheckinChat({ sessionId, point, onFill, onConversation }: { sessionId: string; point: string; onFill: (patch: FormPatch) => void; onConversation: (id: string) => void }) {
  const [lang] = useRvLang();
  const [phase, setPhase] = useState<Phase>("closed");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessageOut[]>([]);
  const [answers, setAnswers] = useState<CheckinDraft>(EMPTY_CHECKIN);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const applied = useRef<CheckinDraft>(EMPTY_CHECKIN);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = list.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const take = (next: CheckinDraft) => {
    const patch = patchFrom(next, applied.current);
    applied.current = next;
    setAnswers(next);
    if (Object.keys(patch).length) onFill(patch);
  };

  const start = async () => {
    setError(null);
    setPhase("starting");
    const r = await startCheckinChatAction({ sessionId, timepoint: point, lang, accepted: true });
    if (!r.ok) {
      if (r.error === "ai_off") return setPhase("gone");
      setError(r.error === "rate_limited" ? "limit" : "failed");
      return setPhase("notice");
    }
    setConversationId(r.conversationId);
    onConversation(r.conversationId);
    setMessages(r.messages);
    setStopped(r.held || r.status === "safety_stop");
    take(r.answers);
    setPhase("chat");
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending || stopped || answers.done) return;
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "patient", text: message }]);
    setInput("");
    const r = await checkinChatTurnAction({ conversationId, sessionId, timepoint: point, text: message });
    setSending(false);
    if (!r.ok) {
      if (r.error === "ai_off") return setPhase("gone");
      setMessages((m) => m.slice(0, -1));
      setInput(message);
      return setError(r.error === "rate_limited" ? "slow" : "failed");
    }
    setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    take(r.answers);
    if (r.status === "safety_stop") setStopped(true);
  };

  const again = async () => {
    setRestarting(true);
    await closeCheckinChatAction(conversationId, "abandoned");
    applied.current = EMPTY_CHECKIN;
    setAnswers(EMPTY_CHECKIN);
    setStopped(false);
    setRestarting(false);
    await start();
  };

  if (phase === "gone") return null;

  if (phase === "closed") {
    return (
      <button type="button" onClick={() => setPhase("notice")} className="rv-glass flex w-full items-center gap-3 p-3.5 text-left" data-rv-checkin="closed">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className="block font-heading text-[15px] font-bold text-navy-800"><T en="Answer by chat instead" ru="Chat ke zariye jawab dein" /> <span className="rv-chip ml-1 align-middle text-[11px]">AI</span></span><span className="block text-[13px] leading-5 text-slate-600"><T en="An AI assistant asks the questions one at a time and fills in this form for you to check." ru="Ek AI assistant sawal ek ek karke poochta hai aur ye form bhar deta hai taake aap check kar lein." /></span></span>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    );
  }

  if (phase === "notice" || phase === "starting") {
    return (
      <section className="rv-glass space-y-3 p-4" aria-label="Check-in assistant" data-rv-checkin="notice">
        <h4 className="font-heading text-base font-bold text-navy-800"><T en="Before we start" ru="Shuru karne se pehle" /></h4>
        <ul className="space-y-2 text-[14px] leading-6 text-slate-700">
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="I am an AI assistant, not a doctor or a physiotherapist. I only ask the check-in questions and fill in the form below; you check it and save it yourself. I cannot diagnose or change your plan." ru="Main AI assistant hoon, doctor ya physiotherapist nahi. Main sirf check-in ke sawal poochta hoon aur neeche ka form bharta hoon; aap use check karke khud save karte hain. Main diagnose nahi kar sakta aur na plan badal sakta hoon." /></span></li>
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="Your physiotherapist can read this chat, and it may be used, without your name, to study how AI can help in physiotherapy. Please do not type your name or phone number." ru="Aap ka physiotherapist ye baat-cheet parh sakta hai, aur aap ka naam hataye baghair ye tehqeeq mein istemal ho sakti hai ke AI physiotherapy mein kaise madad kar sakta hai. Apna naam ya phone number na likhein." /></span></li>
          <li className="flex gap-2.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" /><span><T en="If you have chest pain, trouble breathing, fainting or sudden weakness, call 1122 now." ru="Agar seene mein dard, saans mein mushkil, behoshi ya achanak kamzori ho to abhi 1122 par call karein." /></span></li>
        </ul>
        {error ? <p className="rv-error" role="alert">{error === "limit" ? <T en="You have started several conversations today. Please use the form below, or try again tomorrow." ru="Aaj aap ne kai baat-cheet shuru kar li hain. Neeche form istemal karein, ya kal koshish karein." /> : <T en="That did not work. Please try again, or use the form below." ru="Ye nahi hua. Dobara koshish karein, ya neeche form istemal karein." />}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary" disabled={phase === "starting"} onClick={start}>{phase === "starting" ? <T en="Starting…" ru="Shuru ho raha hai…" /> : <T en="I understand, start" ru="Main samajh gaya/gayi, shuru karein" />}</button>
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setPhase("closed")}><T en="Use the form instead" ru="Form hi istemal karein" /></button>
        </div>
      </section>
    );
  }

  const { done, total } = checkinProgress(answers);
  const finished = answers.done && !stopped;
  return (
    <section className="rv-glass flex flex-col p-3 sm:p-4" aria-label="Check-in assistant" data-rv-checkin="chat" data-rv-checkin-state={stopped ? "stopped" : finished ? "done" : "open"}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-1 pb-2">
        <p className="flex items-center gap-2 text-[14px] font-extrabold text-navy-800"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span> <T en="Check-in assistant" ru="Check-in assistant" /> <span className="rv-chip text-[11px]">AI</span></p>
        <button type="button" className="text-[12.5px] font-bold text-teal-800 underline-offset-2 hover:underline" onClick={() => setPhase("closed")}><T en="Hide" ru="Chhupayein" /></button>
      </div>
      {!stopped ? (
        <div className="flex items-center gap-2 px-1 pt-2" aria-label={lang === "ru" ? `${done} / ${total} sawal` : `${done} of ${total} questions`}>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.round((done / total) * 100)}%` }} /></span>
          <span className="text-[11.5px] font-bold text-slate-500">{done}/{total}</span>
        </div>
      ) : null}

      <div ref={list} className="max-h-[22rem] min-h-[8rem] space-y-3 overflow-y-auto px-1 py-3" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.role === "patient" ? "justify-end" : "justify-start")}>
            <p className={"max-w-[92%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14px] leading-6 " + (m.role === "patient" ? "rounded-br-md bg-[#0a1f3d] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm")}>{m.text}</p>
          </div>
        ))}
        {sending ? <div className="flex justify-start"><p className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-slate-400 shadow-sm" aria-label="The assistant is typing"><span className="inline-flex gap-1"><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" /></span></p></div> : null}
      </div>
      {error ? <p className="rv-error mx-1 mb-2" role="alert">{error === "slow" ? <T en="Please wait a moment before sending again." ru="Dobara bhejne se pehle zara intezar karein." /> : <T en="I could not reply just now. Please send it again, or use the form below." ru="Main abhi jawab nahi de saka/saki. Dobara bhejein, ya neeche form istemal karein." />}</p> : null}

      {stopped ? (
        <p className="mx-1 mb-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[13.5px] font-semibold leading-5 text-[#a1121f]" role="alert"><T en="Your physiotherapist has been told. The warning sign is ticked on the form below: please check it and save the check-in, then wait for their message." ru="Aap ke physiotherapist ko bata diya gaya hai. Warning sign neeche form mein tick hai: use check karke check-in save karein, phir un ke paigham ka intezar karein." /></p>
      ) : finished ? (
        <div className="mx-1 mb-1 space-y-2 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-[13.5px] leading-5 text-teal-950" role="status">
          <p className="flex items-start gap-2 font-bold"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span><T en="The form below is filled in. Check every answer, tick the safety list yourself, and press Save." ru="Neeche ka form bhar diya gaya hai. Har jawab check karein, safety list khud tick karein, aur Save dabayein." /></span></p>
          <button type="button" className="rv-btn rv-btn-ghost" disabled={restarting} onClick={again}><T en="Answer again" ru="Dobara jawab dein" /></button>
        </div>
      ) : (
        <form className="flex items-end gap-2 border-t border-slate-100 pt-2" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)} rows={2} maxLength={MAX_CHECKIN_MESSAGE} disabled={sending}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder={lang === "ru" ? "Apna jawab likhein (English ya Roman Urdu)…" : "Type your answer, in English or Roman Urdu…"}
            aria-label={lang === "ru" ? "Aap ka jawab" : "Your answer"} className="rv-input min-h-[3.25rem] flex-1 resize-none"
          />
          <button type="submit" className="rv-btn rv-btn-primary" disabled={!input.trim() || sending} aria-label={lang === "ru" ? "Bhejein" : "Send"}><Send className="h-4 w-4" aria-hidden="true" /></button>
        </form>
      )}
    </section>
  );
}
