"use client";

import { useState } from "react";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { closeIntakeChatAction, intakeChatTurnAction, startIntakeChatAction, type ChatMessageOut } from "@/app/rehabverse/ai-actions";
import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_SYMPTOMS, PAIN_WORDS } from "@/lib/rehabverse/intake";
import { EMPTY_DRAFT, MAX_PATIENT_MESSAGE, progress, type IntakeDraft } from "@/lib/rehabverse/ai/intake-spec";
import { IntakeWizard, type IntakeStep } from "./IntakeWizard";
import { AI_NOTICES } from "@/lib/rehabverse/ai/notices";
import { AiNoticeList } from "./AiNoticeList";
import { intakePrompt } from "@/lib/rehabverse/ai/chat-quick";
import { ChatLog, ChatTop, DoneBar, HowItWorks, Progress, toChips, YourTurn } from "./ChatKit";
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
  const prog = progress(draft);

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

  const send = async (value: string) => {
    const text = value.trim();
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
        <p className="ck-lead"><T en="Answer a few simple questions, one at a time. You can tap an answer, so you do not have to write. It takes about 3 minutes." ru="Chand aasaan sawalon ke jawab dein, ek ek karke. Jawab dabane se bhi ho jata hai, likhna zaroori nahi. Taqreeban 3 minute lagte hain." /></p>
        <HowItWorks />
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Before we start" ru="Shuru karne se pehle" /></h1>
        <AiNoticeList items={AI_NOTICES.intake.items} className="ck-notice space-y-2.5 text-slate-700" />
        {error ? <p className="rv-error" role="alert">{error === "limit" ? <T en="You have started several conversations today. Please use the form or try again tomorrow." ru="Aaj aap ne kai baat-cheet shuru kar li hain. Form istemal karein ya kal koshish karein." /> : <T en="That did not work. Please try again, or use the form." ru="Ye nahi hua. Dobara koshish karein, ya form istemal karein." />}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rv-btn rv-btn-primary ck-big" disabled={phase === "starting"} onClick={accept}>
            {phase === "starting" ? <T en="Starting…" ru="Shuru ho raha hai…" /> : <><T en="I understand, let's talk" ru="Main samajh gaya/gayi, baat karte hain" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
          </button>
          <button type="button" className="rv-btn rv-btn-ghost ck-big" onClick={() => toForm("area")}><FileText className="h-4 w-4" aria-hidden="true" /> <T en="Use the normal form instead" ru="Normal form istemal karein" /></button>
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
  const prompt = intakePrompt(draft);
  const answered = messages.some((m) => m.role === "patient");
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <section className="rv-glass ck-card ck-card--fixed" aria-label="Conversation with the RehabVerse assistant">
        <ChatTop title={<T en="RehabVerse assistant" ru="RehabVerse assistant" />} onAction={() => toForm("area", "abandoned")} actionLabel={<T en="Use the normal form" ru="Normal form istemal karein" />} />
        {!answered ? <HowItWorks /> : null}
        <Progress done={prog.done} total={prog.total} />
        <ChatLog messages={messages} sending={sending} typingLabel="The assistant is typing" highlightLast={!finished} />
        {error ? <p className="rv-error mx-1 mb-2 text-[14px]" role="alert">{error === "slow" ? <T en="Please wait a moment before sending again." ru="Dobara bhejne se pehle zara intezar karein." /> : <T en="I could not reply just now. Please send it again, or use the normal form." ru="Main abhi jawab nahi de saka/saki. Dobara bhejein, ya normal form istemal karein." />}</p> : null}
        {safety ? (
          <div className="mx-1 mb-1 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="flex-1 text-[14.5px] font-semibold leading-5 text-[#a1121f]"><T en="Please get help first. When you are able, continue with the safety questions so your physiotherapist is told." ru="Pehle madad hasil karein. Jab aap kar sakein to safety sawalaat jari rakhein taake aap ke physiotherapist ko khabar ho." /></p>
            <button type="button" className="rv-btn rv-btn-primary ck-big" onClick={() => toForm("safety")}><T en="Continue" ru="Aage barhein" /></button>
          </div>
        ) : ready ? (
          <DoneBar text={<T en={prompt.title.en} ru={prompt.title.ru} />}>
            <button type="button" className="rv-btn rv-btn-primary" onClick={() => setPhase("summary")}><FileText className="h-4 w-4" aria-hidden="true" /> <T en="Check what I noted" ru="Jo note hua use dekhein" /></button>
          </DoneBar>
        ) : (
          <YourTurn
            title={<T en={prompt.title.en} ru={prompt.title.ru} />} example={prompt.example[lang] || undefined} chips={toChips(prompt.quick, lang)}
            value={input} onChange={setInput} onSend={(text) => void send(text)} sending={sending} max={MAX_PATIENT_MESSAGE}
            inputLabel={lang === "ru" ? "Aap ka paigham" : "Your message"}
            tip={<T en="You can write in English or Roman Urdu. Press Enter or the Send button." ru="English ya Roman Urdu mein likh sakte hain. Enter ya Bhejein dabayein." />}
          />
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
