"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, FileText, Send, ShieldCheck, Sparkles } from "lucide-react";
import { closeIntakeChatAction, intakeChatTurnAction, startIntakeChatAction, type ChatMessageOut } from "@/app/rehabverse/ai-actions";
import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_SYMPTOMS, PAIN_WORDS } from "@/lib/rehabverse/intake";
import { EMPTY_DRAFT, MAX_PATIENT_MESSAGE, progress, type IntakeDraft } from "@/lib/rehabverse/ai/intake-spec";
import { IntakeWizard, type IntakeStep } from "./IntakeWizard";
import { T, useRvLang } from "./useLang";

type Phase = "notice" | "starting" | "chat" | "summary" | "form";
const ONSET: Record<string, { en: string; ru: string }> = {
  sudden: { en: "Suddenly", ru: "Achanak" }, gradual: { en: "Slowly, over time", ru: "Aahista aahista" },
  after_surgery: { en: "After surgery or a procedure", ru: "Operation ya procedure ke baad" }, unknown: { en: "Not sure", ru: "Pata nahi" },
};

/**
 * Talking to the RehabVerse assistant instead of filling in the form. It fills in the same assessment form as the conversation goes on; at the
 * end the patient reviews what was noted and the normal questionnaire (with its safety questions) takes over, so nothing is submitted
 * without the patient checking it. "Use the normal form" is always one tap away.
 */
export function IntakeChat() {
  const [lang] = useRvLang();
  const [phase, setPhase] = useState<Phase>("notice");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessageOut[]>([]);
  const [draft, setDraft] = useState<IntakeDraft>(EMPTY_DRAFT);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [safety, setSafety] = useState<{ kind: string; flags: string[] } | null>(null);
  const [formStep, setFormStep] = useState<IntakeStep>("area");
  const list = useRef<HTMLDivElement>(null);
  const prog = progress(draft);

  useEffect(() => {
    const node = list.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const toForm = (step: IntakeStep, close?: "completed" | "abandoned") => {
    if (close && conversationId) void closeIntakeChatAction(conversationId, close);
    setFormStep(step);
    setPhase("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const accept = async () => {
    setError(null);
    setPhase("starting");
    const r = await startIntakeChatAction({ lang, accepted: true });
    if (!r.ok) {
      if (r.error === "ai_off") return toForm("area");
      setError(r.error === "rate_limited" ? "limit" : "failed");
      return setPhase("notice");
    }
    setConversationId(r.conversationId);
    setMessages(r.messages);
    setDraft(r.draft);
    setPhase("chat");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || ready || safety) return;
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "patient", text }]);
    setInput("");
    const r = await intakeChatTurnAction({ conversationId, text });
    setSending(false);
    if (!r.ok) {
      if (r.error === "ai_off") return toForm("area");
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      return setError(r.error === "rate_limited" ? "slow" : "failed");
    }
    setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    setDraft(r.draft);
    if (r.status === "safety_stop") setSafety(r.safety ?? { kind: "safety", flags: [] });
    if (r.status === "completed") setReady(true);
  };

  /* ───────────── the hand-over to the normal questionnaire ───────────── */
  if (phase === "form") {
    const reviewing = formStep === "safety";
    const notice = (
      <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-3 text-[13.5px] leading-6 text-slate-700" role="note">
        <b className="text-navy-800"><Sparkles className="mr-1 inline h-4 w-4 text-teal-700" aria-hidden="true" />
          {safety ? <T en="Please answer the safety questions" ru="Barah-e-karam safety sawalaat ke jawab dein" /> : <T en="Filled in from our conversation" ru="Hamari baat-cheet se bhara gaya" />}</b>
        <p className="mt-1">
          {safety ? (
            <T en="Because of what you described, I have pre-selected the matching safety question. Please confirm it, then continue." ru="Jo aap ne bataya uski wajah se maine mutaliq safety sawal pehle se chun diya hai. Use confirm karein, phir aage barhein." />
          ) : reviewing ? (
            <T en="This is the last important step. Use Back at any time to check or change what I noted." ru="Ye aakhri zaroori qadam hai. Jo maine note kiya use dekhne ya badalne ke liye kabhi bhi Back dabayein." />
          ) : (
            <T en="I filled in what you told me. Please check each step and change anything that is not right." ru="Jo aap ne bataya maine bhar diya hai. Har qadam dekh lein aur jo theek na ho use badal dein." />
          )}
        </p>
      </div>
    );
    return <IntakeWizard initial={{ ...draft, red_flags: safety?.flags ?? [] }} startStep={formStep} aiConversationId={conversationId || undefined} notice={notice} />;
  }

  /* ───────────── the AI notice ───────────── */
  if (phase === "notice" || phase === "starting") {
    return (
      <div className="mx-auto max-w-2xl rv-glass space-y-4 p-5 sm:p-7 rv-fade-up">
        <span className="rv-chip rv-chip-teal inline-flex items-center gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> <T en="Your physiotherapist has made this available to you" ru="Aap ke physiotherapist ne ye aap ke liye faraham kiya hai" /></span>
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Before we start" ru="Shuru karne se pehle" /></h1>
        <ul className="space-y-2.5 text-[14.5px] leading-6 text-slate-700">
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="I am an AI assistant, not a doctor or a physiotherapist. I cannot diagnose or give treatment advice." ru="Main AI assistant hoon, doctor ya physiotherapist nahi. Main diagnose ya ilaaj ka mashwara nahi de sakta." /></span></li>
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="I will ask about your problem so your physiotherapist has a clear picture. They read everything and make every decision about your care." ru="Main aap ki takleef ke baare mein poochunga taake aap ke physiotherapist ko saaf tasveer mile. Woh sab kuch parhte hain aur aap ke ilaaj ka har faisla wohi karte hain." /></span></li>
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="Please do not type your name, phone number or address. I do not need them." ru="Barah-e-karam apna naam, phone number ya pata na likhein. Mujhe in ki zaroorat nahi." /></span></li>
          <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="Our conversation is saved in your RehabVerse record. Your physiotherapist can read it, and it may also be used, without your name, to study how AI can help in physiotherapy." ru="Hamari baat-cheet aap ke RehabVerse record mein mehfooz hoti hai. Aap ka physiotherapist ise parh sakta hai, aur aap ka naam hataye baghair ye is tehqeeq mein bhi istemal ho sakti hai ke AI physiotherapy mein kaise madad kar sakta hai." /></span></li>
          <li className="flex gap-2.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" /><span><T en="In an emergency, such as chest pain, trouble breathing, loss of bladder or bowel control or sudden weakness, call 1122 straight away." ru="Emergency mein, jaise seene mein dard, saans mein mushkil, peshab/pakhane par control khona ya achanak kamzori, foran 1122 par call karein." /></span></li>
        </ul>
        {error ? <p className="rv-error" role="alert">{error === "limit" ? <T en="You have started several conversations today. Please use the form or try again tomorrow." ru="Aaj aap ne kai baat-cheet shuru kar li hain. Form istemal karein ya kal koshish karein." /> : <T en="That did not work. Please try again, or use the form." ru="Ye nahi hua. Dobara koshish karein, ya form istemal karein." />}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary" disabled={phase === "starting"} onClick={accept}>
            {phase === "starting" ? <T en="Starting…" ru="Shuru ho raha hai…" /> : <><T en="I understand, let's talk" ru="Main samajh gaya/gayi, baat karte hain" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
          </button>
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => toForm("area")}><FileText className="h-4 w-4" aria-hidden="true" /> <T en="Use the normal form instead" ru="Normal form istemal karein" /></button>
        </div>
      </div>
    );
  }

  /* ───────────── the summary the patient checks ───────────── */
  if (phase === "summary") {
    const label = (options: { id: string; label: { en: string; ru: string } }[], ids: string[]) => ids.map((id) => options.find((o) => o.id === id)?.label[lang] ?? id).join(", ");
    const rows: [React.ReactNode, string][] = [
      [<T key="a" en="Where" ru="Kahan" />, label(INTAKE_REGIONS, draft.regions)],
      [<T key="b" en="Pain now" ru="Abhi dard" />, draft.pain_now === null ? "" : `${draft.pain_now}/10 (${PAIN_WORDS[draft.pain_now][lang]})`],
      [<T key="c" en="For how long" ru="Kitne arse se" />, label(INTAKE_DURATION, draft.duration ? [draft.duration] : [])],
      [<T key="d" en="How it started" ru="Kaise shuru hui" />, [draft.onset ? ONSET[draft.onset]?.[lang] ?? "" : "", draft.possible_cause].filter(Boolean).join(". ")],
      [<T key="e" en="Makes it worse" ru="Kis se barhti hai" />, draft.aggravating],
      [<T key="f" en="Helps" ru="Kis se aaram" />, draft.relieving],
      [<T key="g" en="Other symptoms" ru="Dusri alamaat" />, [label(INTAKE_SYMPTOMS, draft.symptoms), draft.other_symptoms].filter(Boolean).join(". ")],
      [<T key="h" en="Daily life" ru="Rozmarra zindagi" />, draft.functional_limitations],
      [<T key="i" en="Earlier treatment" ru="Pehle ka ilaaj" />, draft.previous_treatment],
      [<T key="j" en="Health conditions" ru="Dusri bimariyan" />, draft.medical_conditions],
      [<T key="k" en="Medicines" ru="Dawaiyan" />, draft.medications],
      [<T key="l" en="What matters to you" ru="Aap ke liye kya zaroori" />, draft.own_words],
    ];
    return (
      <div className="mx-auto max-w-2xl rv-glass space-y-4 p-5 sm:p-7 rv-fade-up">
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Here is what I noted" ru="Maine ye note kiya hai" /></h1>
        <p className="text-[14.5px] leading-6 text-slate-600"><T en="Please check it. Nothing is sent until you submit the assessment at the end." ru="Barah-e-karam dekh lein. Aakhir mein assessment submit karne tak kuch nahi bheja jata." /></p>
        <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {rows.filter(([, value]) => value).map(([name, value], i) => (
            <div key={i} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[10rem_1fr]"><dt className="text-[12.5px] font-extrabold uppercase tracking-wide text-teal-800">{name}</dt><dd className="text-[14.5px] leading-6 text-slate-800">{value}</dd></div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary" onClick={() => toForm("safety", "completed")}><T en="Looks right, continue" ru="Theek hai, aage barhein" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => toForm("area", "completed")}><T en="I want to change something" ru="Mujhe kuch badalna hai" /></button>
        </div>
      </div>
    );
  }

  /* ───────────── the conversation ───────────── */
  const finished = ready || !!safety;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <section className="rv-glass flex h-[min(78vh,40rem)] flex-col p-3 sm:p-4" aria-label="Conversation with the RehabVerse assistant">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-1 pb-2">
          <p className="flex items-center gap-2 text-[14px] font-extrabold text-navy-800"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span> <T en="RehabVerse assistant" ru="RehabVerse assistant" /> <span className="rv-chip text-[11px]">AI</span></p>
          <button type="button" className="text-[12.5px] font-bold text-teal-800 underline-offset-2 hover:underline" onClick={() => toForm("area", "abandoned")}><T en="Use the normal form" ru="Normal form istemal karein" /></button>
        </div>
        <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-1 py-3" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={"flex " + (m.role === "patient" ? "justify-end" : "justify-start")}>
              <p className={"max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-6 " + (m.role === "patient" ? "rounded-br-md bg-[#0a1f3d] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm")}>{m.text}</p>
            </div>
          ))}
          {sending ? <div className="flex justify-start"><p className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-slate-400 shadow-sm" aria-label="The assistant is typing"><span className="inline-flex gap-1"><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" /><i className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" /></span></p></div> : null}
        </div>
        {error ? <p className="rv-error mx-1 mb-2" role="alert">{error === "slow" ? <T en="Please wait a moment before sending again." ru="Dobara bhejne se pehle zara intezar karein." /> : <T en="I could not reply just now. Please send it again, or use the normal form." ru="Main abhi jawab nahi de saka/saki. Dobara bhejein, ya normal form istemal karein." />}</p> : null}
        {safety ? (
          <div className="mx-1 mb-1 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="flex-1 text-[13.5px] font-semibold leading-5 text-[#a1121f]"><T en="Please get help first. When you are able, continue with the safety questions so your physiotherapist is told." ru="Pehle madad hasil karein. Jab aap kar sakein to safety sawalaat jari rakhein taake aap ke physiotherapist ko khabar ho." /></p>
            <button type="button" className="rv-btn rv-btn-primary" onClick={() => toForm("safety")}><T en="Continue" ru="Aage barhein" /></button>
          </div>
        ) : ready ? (
          <div className="mx-1 mb-1 flex justify-end"><button type="button" className="rv-btn rv-btn-primary" onClick={() => setPhase("summary")}><FileText className="h-4 w-4" aria-hidden="true" /> <T en="Check what I noted" ru="Jo note hua use dekhein" /></button></div>
        ) : (
          <form className="flex items-end gap-2 border-t border-slate-100 pt-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)} rows={2} maxLength={MAX_PATIENT_MESSAGE} disabled={sending || finished}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder={lang === "ru" ? "Yahan likhein (English ya Roman Urdu mein)…" : "Type here, in English or Roman Urdu…"}
              aria-label={lang === "ru" ? "Aap ka paigham" : "Your message"} className="rv-input min-h-[3.25rem] flex-1 resize-none"
            />
            <button type="submit" className="rv-btn rv-btn-primary" disabled={!input.trim() || sending || finished} aria-label={lang === "ru" ? "Bhejein" : "Send"}><Send className="h-4 w-4" aria-hidden="true" /></button>
          </form>
        )}
      </section>

      <aside className="rv-glass space-y-3 p-4" aria-label="What has been noted so far">
        <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-teal-800"><T en="What I have noted so far" ru="Ab tak maine kya note kiya" /></p>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#0a1f3d] to-[#0db3aa] transition-[width] duration-300" style={{ width: `${(prog.done / prog.total) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-500">{prog.done}/{prog.total}</span>
        </div>
        <ul className="flex flex-wrap gap-1.5 text-[12.5px]">
          {draft.regions.length ? <li className="rv-chip rv-chip-teal">{draft.regions.map((id) => INTAKE_REGIONS.find((o) => o.id === id)?.label[lang] ?? id).join(", ")}</li> : null}
          {draft.pain_now !== null ? <li className="rv-chip">{draft.pain_now}/10</li> : null}
          {draft.duration ? <li className="rv-chip">{INTAKE_DURATION.find((o) => o.id === draft.duration)?.label[lang]}</li> : null}
          {draft.aggravating ? <li className="rv-chip"><T en="what makes it worse" ru="kis se barhti hai" /></li> : null}
          {draft.relieving ? <li className="rv-chip"><T en="what helps" ru="kis se aaram" /></li> : null}
          {draft.functional_limitations ? <li className="rv-chip"><T en="daily life" ru="rozmarra zindagi" /></li> : null}
          {draft.medical_conditions ? <li className="rv-chip"><T en="health conditions" ru="bimariyan" /></li> : null}
          {draft.medications ? <li className="rv-chip"><T en="medicines" ru="dawaiyan" /></li> : null}
        </ul>
        <p className="text-[12.5px] leading-5 text-slate-500"><T en="You will check all of this before anything is submitted. Your physiotherapist reads everything." ru="Kuch bhi submit hone se pehle aap ye sab dekh lenge. Aap ka physiotherapist sab kuch parhta hai." /></p>
      </aside>
    </div>
  );
}
