"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { checkinChatTurnAction, closeCheckinChatAction, startCheckinChatAction, type ChatMessageOut } from "@/app/rehabverse/ai-actions";
import { checkinProgress, EMPTY_CHECKIN, MAX_CHECKIN_MESSAGE, type CheckinDraft } from "@/lib/rehabverse/ai/checkin-shared";
import { AI_NOTICES } from "@/lib/rehabverse/ai/notices";
import { AiNoticeList } from "./AiNoticeList";
import { checkinPrompt } from "@/lib/rehabverse/ai/chat-quick";
import { ChatLog, ChatTop, HowItWorks, Progress, toChips, YourTurn } from "./ChatKit";
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
        <p className="ck-lead"><T en="Answer six short questions. Tap an answer, so you do not have to write. The form below is filled in for you." ru="Chhe chhote sawalon ke jawab dein. Jawab dabayein, likhna zaroori nahi. Neeche ka form aap ke liye bhar diya jata hai." /></p>
        <h4 className="font-heading text-base font-bold text-navy-800"><T en="Before we start" ru="Shuru karne se pehle" /></h4>
        <AiNoticeList items={AI_NOTICES.checkin.items} className="ck-notice space-y-2 text-slate-700" />
        {error ? <p className="rv-error" role="alert">{error === "limit" ? <T en="You have started several conversations today. Please use the form below, or try again tomorrow." ru="Aaj aap ne kai baat-cheet shuru kar li hain. Neeche form istemal karein, ya kal koshish karein." /> : <T en="That did not work. Please try again, or use the form below." ru="Ye nahi hua. Dobara koshish karein, ya neeche form istemal karein." />}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary ck-big" disabled={phase === "starting"} onClick={start}>{phase === "starting" ? <T en="Starting…" ru="Shuru ho raha hai…" /> : <T en="I understand, start" ru="Main samajh gaya/gayi, shuru karein" />}</button>
          <button type="button" className="rv-btn rv-btn-ghost ck-big" onClick={() => setPhase("closed")}><T en="Use the form instead" ru="Form hi istemal karein" /></button>
        </div>
      </section>
    );
  }

  const { done, total } = checkinProgress(answers);
  const finished = answers.done && !stopped;
  const prompt = checkinPrompt(answers);
  return (
    <section className="rv-glass ck-card" aria-label="Check-in assistant" data-rv-checkin="chat" data-rv-checkin-state={stopped ? "stopped" : finished ? "done" : "open"}>
      <ChatTop title={<T en="Check-in assistant" ru="Check-in assistant" />} onAction={() => setPhase("closed")} actionLabel={<T en="Hide" ru="Chhupayein" />} />
      {!messages.some((m) => m.role === "patient") && !stopped ? <HowItWorks /> : null}
      {!stopped ? <Progress done={done} total={total} /> : null}
      <ChatLog messages={messages} sending={sending} typingLabel="The assistant is typing" highlightLast={!stopped && !finished} />
      {error ? <p className="rv-error mx-1 mb-2 text-[14px]" role="alert">{error === "slow" ? <T en="Please wait a moment before sending again." ru="Dobara bhejne se pehle zara intezar karein." /> : <T en="I could not reply just now. Please send it again, or use the form below." ru="Main abhi jawab nahi de saka/saki. Dobara bhejein, ya neeche form istemal karein." />}</p> : null}

      {stopped ? (
        <p className="mx-1 mb-1 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[14.5px] font-semibold leading-5 text-[#a1121f]" role="alert"><T en="Your physiotherapist has been told. The warning sign is ticked on the form below: please check it and save the check-in, then wait for their message." ru="Aap ke physiotherapist ko bata diya gaya hai. Warning sign neeche form mein tick hai: use check karke check-in save karein, phir un ke paigham ka intezar karein." /></p>
      ) : finished ? (
        <div className="ck-done" role="status">
          <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="The form below is filled in. Check every answer, tick the safety list yourself, and press Save." ru="Neeche ka form bhar diya gaya hai. Har jawab check karein, safety list khud tick karein, aur Save dabayein." /></span></p>
          <button type="button" className="rv-btn rv-btn-ghost" disabled={restarting} onClick={again}><T en="Answer again" ru="Dobara jawab dein" /></button>
        </div>
      ) : (
        <YourTurn
          title={<T en={prompt.title.en} ru={prompt.title.ru} />} example={prompt.example[lang] || undefined} chips={toChips(prompt.quick, lang)}
          value={input} onChange={setInput} onSend={(text) => void send(text)} sending={sending} max={MAX_CHECKIN_MESSAGE}
          inputLabel={lang === "ru" ? "Aap ka jawab" : "Your answer"}
        />
      )}
    </section>
  );
}
