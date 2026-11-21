"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Hand, PencilLine, Send, Sparkles } from "lucide-react";
import type { ChatMessageOut } from "@/app/rehabverse/ai-actions";
import type { Quick } from "@/lib/rehabverse/ai/chat-quick";
import type { Lang } from "./ExercisePlayer";
import { T, useRvLang } from "./useLang";
import "./chat-kit.css";

/**
 * The pieces every RehabVerse AI chat (intake, exercise coach, check-in) is built from, so all three look and behave the same and stay easy:
 * who is talking, how it works (3 steps), the conversation with the open question highlighted, "Your turn" with answers to tap or a big box to
 * write in, and one big Send button. The chats keep their own logic; only the look and the helping hands live here.
 */
export type Chip = { key: string; label: string; send: string; tone?: Quick["tone"]; coach?: string };

/** The tappable answers of a prompt, in the language the person is using. */
export const toChips = (quick: Quick[], lang: Lang): Chip[] => quick.map((q, i) => ({ key: `${i}-${q.label.en}`, label: q.label[lang], send: q.send[lang], tone: q.tone }));

export function ChatTop({ title, onAction, actionLabel }: { title: ReactNode; onAction: () => void; actionLabel: ReactNode }) {
  return (
    <div className="ck-top">
      <p className="ck-who">
        <i><Sparkles className="h-5 w-5" aria-hidden="true" /></i>
        <span>{title} <span className="rv-chip ml-1 align-middle text-[11px]">AI</span></span>
      </p>
      <button type="button" className="ck-quit" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}

/** Three small steps, so nobody has to guess what to do. */
export function HowItWorks() {
  return (
    <ol className="ck-how" aria-label="How it works">
      <li><b aria-hidden="true">1</b><span><T en="Read the question" ru="Sawal parhein" /></span></li>
      <li><b aria-hidden="true">2</b><span><T en="Tap an answer or write" ru="Jawab dabayein ya likhein" /></span></li>
      <li><b aria-hidden="true">3</b><span><T en="Press Send" ru="Send dabayein" /></span></li>
    </ol>
  );
}

export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="ck-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <span><T en={`${done} of ${total} questions answered`} ru={`${total} mein se ${done} sawal ho gaye`} /></span>
      <span className="ck-bar" aria-hidden="true"><span style={{ width: `${Math.round((done / Math.max(1, total)) * 100)}%` }} /></span>
    </div>
  );
}

/** The conversation. Only messages are paragraphs inside the log (the tests and screen readers count on that). */
export function ChatLog({ messages, sending, typingLabel, highlightLast }: { messages: ChatMessageOut[]; sending: boolean; typingLabel: string; highlightLast: boolean }) {
  const [lang] = useRvLang();
  const ref = useRef<HTMLDivElement>(null);
  // a new question from the assistant is shown from its first line (a long one is never cut off at the top); anything else scrolls to the end
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const last = node.lastElementChild as HTMLElement | null;
    const fromTop = !sending && messages.length > 0 && messages[messages.length - 1].role !== "patient" && last;
    node.scrollTo({ top: fromTop ? Math.max(0, last.offsetTop - 8) : node.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);
  const now = highlightLast && !sending ? messages.length - 1 : -1;
  return (
    <div ref={ref} className="ck-log" role="log" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={"ck-row" + (m.role === "patient" ? " ck-row--me" : "")}>
          <p className={"ck-bubble " + (m.role === "patient" ? "ck-bubble--me" : "ck-bubble--bot")} {...(i === now && m.role !== "patient" ? { "data-now": "1", "data-tag": lang === "ru" ? "Abhi ka sawal" : "Question now" } : {})}>{m.text}</p>
        </div>
      ))}
      {sending ? <div className="ck-row"><p className="ck-typing" aria-label={typingLabel}><i /><i /><i /></p></div> : null}
    </div>
  );
}

const numeric = (chips: Chip[]) => chips.length > 4 && chips.every((c) => /^\d{1,2}$/.test(c.label));

/**
 * "Your turn": one line that says what to do now, answers to tap (one tap sends), an example, and a big box with a big Send button.
 * The box keeps the label the tests and screen readers know ("Your message" / "Your question" / "Your answer").
 */
export function YourTurn({ title, example, chips, value, onChange, onSend, sending, max, inputLabel, tip }: {
  title: ReactNode; example?: string; chips: Chip[]; value: string; onChange: (v: string) => void; onSend: (text: string) => void;
  sending: boolean; max: number; inputLabel: string; tip?: ReactNode;
}) {
  const [lang] = useRvLang();
  const box = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // when the question changes on a small screen, keep the answers in view
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const node = box.current;
    if (node && node.getBoundingClientRect().bottom > window.innerHeight) node.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chips]);
  const isNums = numeric(chips);
  const placeholder = example ? example.replace(/^(for example|misal):\s*/i, "") : lang === "ru" ? "Yahan likhein…" : "Write here…";
  return (
    <div className="ck-turn" ref={box}>
      <p className="ck-turn-title">{chips.length ? <Hand aria-hidden="true" /> : <PencilLine aria-hidden="true" />}<span>{title}</span></p>
      {example ? <p className="ck-turn-eg">{example}</p> : null}
      {chips.length ? (
        <div className={"ck-chips" + (isNums ? " ck-chips--nums" : "")} role="group" aria-label={lang === "ru" ? "Jawab dabayein" : "Tap an answer"}>
          {chips.map((c) => (
            <button key={c.key} type="button" className="ck-chip" data-tone={c.tone} data-coach-quick={c.coach} disabled={sending} onClick={() => onSend(c.send)}>{c.label}</button>
          ))}
        </div>
      ) : null}
      <form className="ck-compose" onSubmit={(e) => { e.preventDefault(); onSend(value); }}>
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} rows={2} maxLength={max} disabled={sending}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(value); } }}
          placeholder={chips.length ? (lang === "ru" ? "Ya yahan apne alfaaz mein likhein…" : "Or write in your own words here…") : placeholder}
          aria-label={inputLabel} autoComplete="off" enterKeyHint="send"
        />
        <button type="submit" className="rv-btn rv-btn-primary ck-send" disabled={!value.trim() || sending}>
          <Send className="h-5 w-5" aria-hidden="true" /> {sending ? <T en="Sending…" ru="Bhej raha hai…" /> : <T en="Send" ru="Bhejein" />}
        </button>
      </form>
      {tip ? <p className="ck-tip">{tip}</p> : null}
    </div>
  );
}

/** The end of a conversation: what happens now, and the one big button for it. */
export function DoneBar({ text, children }: { text: ReactNode; children: ReactNode }) {
  return (
    <div className="ck-done" role="status">
      <p>{text}</p>
      {children}
    </div>
  );
}
