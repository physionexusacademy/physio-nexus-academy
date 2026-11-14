"use client";

/**
 * "Ask Dr. Sajjad": a text box that asks the site's own Physio Nexus AI (/api/physio-nexus-ai — the same search and authored answers as the
 * AI chat; it answers only from PNA's lessons, guides and feature descriptions). The answer is shown here and the avatar says it.
 * Text only: no microphone, no camera.
 */
import { useState, type ReactNode } from "react";
import { Send } from "lucide-react";
import { plain } from "@/lib/avatar/text";

type Answer = {
  message: string;
  lang: "en" | "ur";
  safety: { level: string; kind: string; title: string; text: string } | null;
  resources: { id: string; title: string; href: string; why: string }[];
  suggestions: { label: string; query?: string; href?: string }[];
};

/** At most this many characters are spoken (cut at a sentence end); the whole answer stays on screen. */
const SPEAK_MAX = 650;
function speakPart(text: string) {
  if (text.length <= SPEAK_MAX) return text;
  const cut = text.slice(0, SPEAK_MAX);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return end > 200 ? cut.slice(0, end + 1) : cut;
}

function rich(text: string): ReactNode[] {
  return text.split("\n").map((line, i) => (
    <p key={i} className={line.startsWith("• ") ? "pl-3" : undefined}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, k) => (part.startsWith("**") ? <strong key={k}>{part.slice(2, -2)}</strong> : part))}
    </p>
  ));
}

const EXAMPLES = ["What is the Skills Lab?", "Daily challenge kya hai?", "Explain the convex concave rule"];

export default function AskPanel({ ur, onAnswer }: { ur: boolean; onAnswer: (text: string, lang: "en" | "ur", tag: string) => void }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 2 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/physio-nexus-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Please try again.");
      const result = data as Answer;
      setAnswer(result);
      const spoken = result.safety ? `${result.safety.title}. ${result.safety.text}` : result.message;
      onAnswer(speakPart(plain(spoken)), result.lang === "ur" ? "ur" : "en", result.safety ? "Safety" : "Answer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="av-ask" aria-label="Ask Dr. Sajjad">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(query);
        }}
      >
        <label htmlFor="av-ask-input">{ur ? "Dr. Sajjad se poochhein" : "Ask Dr. Sajjad about the academy"}</label>
        <div className="av-ask-row">
          <input id="av-ask-input" type="text" value={query} maxLength={240} onChange={(event) => setQuery(event.target.value)} placeholder={ur ? "Masalan: Skills Lab kya hai?" : "e.g. What is the Skills Lab?"} autoComplete="off" />
          <button type="submit" disabled={busy || query.trim().length < 2} aria-label="Ask">
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{busy ? (ur ? "Soch raha hoon…" : "Thinking…") : ur ? "Poochhein" : "Ask"}</span>
          </button>
        </div>
        {!answer ? (
          <ul className="av-ask-examples" aria-label="Examples">
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button type="button" onClick={() => { setQuery(example); void ask(example); }}>{example}</button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>
      {error ? <p role="alert" className="av-ask-error">{error}</p> : null}
      {answer ? (
        <div className="av-ask-answer" aria-live="polite">
          {answer.safety ? (
            <div className="av-ask-safety" role="alert">
              <strong>{answer.safety.title}</strong>
              <div className="av-ask-text">{rich(answer.safety.text)}</div>
            </div>
          ) : (
            <div className="av-ask-text">{rich(answer.message)}</div>
          )}
          {answer.resources.length ? (
            <ul className="av-ask-links">
              {answer.resources.slice(0, 3).map((resource) => (
                <li key={resource.id}>
                  <a href={resource.href}>{resource.title}</a>
                  {resource.why ? <span>{resource.why}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {answer.suggestions.length ? (
            <ul className="av-ask-examples" aria-label="Related questions">
              {answer.suggestions.filter((s) => s.query).slice(0, 3).map((s) => (
                <li key={s.label}>
                  <button type="button" onClick={() => { setQuery(s.query as string); void ask(s.query as string); }}>{s.label}</button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <p className="av-ask-note">{ur ? "Jawab sirf PNA ke apne content se aate hain. Camera ya microphone istemal nahi hota." : "Answers come only from PNA's own content. Your question goes to PNA's search — no camera or microphone is used."}</p>
    </section>
  );
}
