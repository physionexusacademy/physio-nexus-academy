"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Bot, ExternalLink, LoaderCircle, Mic, MicOff, Phone, Send, ShieldAlert, Sparkles, Volume2, VolumeX, X } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  href: string;
  category: string;
  summary: string;
  level?: string;
  kind?: string;
  why?: string;
};

type Suggestion = { label: string; query?: string; href?: string };
type Safety = { level: "emergency" | "urgent" | "crisis"; kind: string; title: string; text: string };

type ExplanationStep = { label: string; text: string; list?: string[] };
type Explanation = {
  kind: "lesson" | "condition";
  title: string;
  intro: string;
  steps: ExplanationStep[];
  check?: string;
  href: string;
  openLabel: string;
  mixedLanguage?: boolean;
  urSummary?: string;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  explanation?: Explanation | null;
  explanationOpen?: boolean;
  resources?: Resource[];
  suggestions?: Suggestion[];
  safety?: Safety | null;
  topic?: string;
};

const starterTopics = [
  "Explain the convex–concave rule",
  "Back pain ka treatment kaise hota hai?",
  "Help me prepare for my viva",
  "Book a home visit",
];

const kindTone: Record<string, string> = {
  lesson: "bg-teal-100 text-teal-800",
  path: "bg-teal-100 text-teal-800",
  condition: "bg-sky-100 text-sky-800",
  plan: "bg-emerald-100 text-emerald-800",
  technique: "bg-violet-100 text-violet-800",
  regional: "bg-violet-100 text-violet-800",
  tests: "bg-amber-100 text-amber-800",
  practice: "bg-amber-100 text-amber-800",
  service: "bg-rose-100 text-rose-800",
};

/** Renders **bold**, line breaks and "• " bullets from the navigator. No HTML is injected. */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => {
        const bullet = line.startsWith("• ");
        const content = bullet ? line.slice(2) : line;
        const parts = content.split("**").map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className="font-semibold text-[#041E3F]">
              {part}
            </strong>
          ) : (
            <Fragment key={partIndex}>{part}</Fragment>
          ),
        );
        return (
          <p key={lineIndex} className={bullet ? "mt-1 flex gap-1.5 pl-1" : lineIndex ? "mt-1.5" : undefined}>
            {bullet ? <span className="text-teal-700" aria-hidden="true">•</span> : null}
            <span>{parts}</span>
          </p>
        );
      })}
    </>
  );
}

/** "Explain this to me": a short, friendly explanation built from the lesson or guide itself. */
function ExplanationCard({ explanation, defaultOpen }: { explanation: Explanation; defaultOpen: boolean }) {
  const ur = /[a-z]/i.test(explanation.openLabel) && explanation.openLabel.startsWith("Poor");
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => {
    setCanSpeak(!ur && typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [ur]);
  function toggleSpeech() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(spokenText(explanation));
    utterance.lang = "en-US";
    utterance.rate = 0.97;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }
  return (
    <details open={defaultOpen} className="group mt-3 rounded-xl border border-teal-200 bg-teal-50/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-teal-900 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {ur ? "Mujhe samjhao" : "Explain this to me"}</span>
        <span className="text-[11px] font-semibold text-teal-700 group-open:hidden">{ur ? "kholein" : "open"}</span>
      </summary>
      <div className="space-y-2.5 border-t border-teal-100 px-3 pb-3 pt-2.5 text-[13px] leading-relaxed text-slate-700">
        <div className="text-slate-800"><AnswerText text={explanation.intro} /></div>
        {explanation.urSummary ? (
          <p className="rounded-lg border border-teal-200 bg-white p-2.5 text-slate-800">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-teal-700">Aasan lafzon mein (AI, PNA guide se)</span>
            {explanation.urSummary}
          </p>
        ) : null}
        <ol className="space-y-2">
          {explanation.steps.map((step, index) => (
            <li key={step.label + index} className="rounded-lg bg-white/80 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">{step.label}</p>
              {step.text ? <div className="mt-0.5"><AnswerText text={step.text} /></div> : null}
              {step.list?.length ? (
                <ul className="mt-1 space-y-1">
                  {step.list.map((item) => (
                    <li key={item} className="flex gap-1.5"><span className="text-teal-600" aria-hidden="true">•</span><span><AnswerText text={item} /></span></li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        {explanation.check ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-950">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-amber-800">{ur ? "Khud ko parkhein" : "Try it yourself"}</span>
            {explanation.check}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <a href={explanation.href} className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">
            {explanation.openLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          {canSpeak ? (
            <button type="button" onClick={toggleSpeech} aria-pressed={speaking} className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-50">
              {speaking ? <VolumeX className="h-3.5 w-3.5" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />} {speaking ? "Stop" : "Listen"}
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}

/* ---------- voice (browser speech recognition and read-aloud; nothing is sent anywhere except the question itself) ---------- */
type RecognitionResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};
function recognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Plain text of an explanation, for reading aloud. */
function spokenText(explanation: Explanation): string {
  const clean = (text: string) => text.replace(/\*\*/g, "");
  return [clean(explanation.intro), ...explanation.steps.flatMap((step) => [step.label + ".", clean(step.text), ...(step.list ?? []).map(clean)])].filter(Boolean).join(" ");
}

function readProfile(): { stage?: string; goal?: string } | undefined {
  try {
    const raw = window.localStorage.getItem("pna-teacher-profile-v1");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { stage?: unknown; goal?: unknown };
    return {
      stage: typeof parsed.stage === "string" ? parsed.stage : undefined,
      goal: typeof parsed.goal === "string" ? parsed.goal : undefined,
    };
  } catch {
    return undefined;
  }
}

/** The full chat widget. Loaded on first use by PhysioNexusAILauncher (it opens straight away). */
export function PhysioNexusAI({ initialOpen = false, initialQuestion }: { initialOpen?: boolean; initialQuestion?: string } = {}) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en-US" | "ur-PK">("en-US");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextId, setNextId] = useState(2);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I'm **Physio Nexus AI**. Ask me anything about physiotherapy — in English or Roman Urdu. I'll give you a short answer from PNA's own reviewed content, then take you to the best lesson, guide or service.",
    },
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setVoiceSupported(Boolean(recognitionCtor()));
    try {
      const saved = window.localStorage.getItem("pna-ai-voice-lang");
      if (saved === "ur-PK" || saved === "en-US") setVoiceLang(saved);
    } catch {
      /* default is fine */
    }
    return () => recognitionRef.current?.stop();
  }, []);

  function toggleVoiceLanguage() {
    const next = voiceLang === "en-US" ? "ur-PK" : "en-US";
    setVoiceLang(next);
    try {
      window.localStorage.setItem("pna-ai-voice-lang", next);
    } catch {
      /* ignore */
    }
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    setVoiceNote("");
    const recognition = new Ctor();
    recognition.lang = voiceLang;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    let finalText = "";
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      finalText = text.trim();
      setQuery(finalText.slice(0, 240));
    };
    recognition.onerror = (event) => {
      setVoiceNote(event.error === "not-allowed" || event.error === "service-not-allowed" ? "Microphone is blocked — allow it in your browser, or type your question." : "Could not hear that. Try again or type your question.");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (finalText.length >= 2) void sendQueryRef.current(finalText.slice(0, 240));
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setVoiceNote("Could not start the microphone.");
    }
  }

  // The command palette (Ctrl/⌘+K) can hand a question straight to the AI.
  const sendQueryRef = useRef<(value: string) => Promise<void>>(async () => {});
  useEffect(() => {
    const onAsk = (event: Event) => {
      const question = (event as CustomEvent<unknown>).detail;
      setOpen(true);
      if (typeof question === "string" && question.trim()) void sendQueryRef.current(question);
    };
    window.addEventListener("pna-ai:ask", onAsk);
    return () => window.removeEventListener("pna-ai:ask", onAsk);
  }, []);

  // A question asked before the widget had loaded (from search or the command palette).
  useEffect(() => {
    if (initialQuestion?.trim()) void sendQueryRef.current(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendQuery(value: string) {
    const clean = value.trim();
    if (!clean || loading) return;

    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant" && message.topic);
    const lastUser = [...messages].reverse().find((message) => message.role === "user");

    setQuery("");
    setLoading(true);
    const userMessageId = nextId;
    const assistantMessageId = nextId + 1;
    setNextId((current) => current + 2);
    setMessages((current) => [...current, { id: userMessageId, role: "user", text: clean }]);

    try {
      const response = await fetch("/api/physio-nexus-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: clean,
          context: { lastTopic: lastAssistant?.topic, lastQuery: lastUser?.text },
          profile: readProfile(),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        resources?: Resource[];
        suggestions?: Suggestion[];
        safety?: Safety | null;
        topic?: string;
        explanation?: Explanation | null;
        explanationOpen?: boolean;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error || "I couldn't complete that search. Please try again.");
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: result.message ?? "",
          resources: Array.isArray(result.resources) ? result.resources : [],
          suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
          safety: result.safety ?? null,
          topic: result.topic,
          explanation: result.explanation ?? null,
          explanationOpen: Boolean(result.explanationOpen),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
  sendQueryRef.current = sendQuery;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuery(query);
  }

  const lastMessageId = messages[messages.length - 1]?.id;

  return (
    <>
      {open && (
        <section
          aria-label="Physio Nexus AI learning navigator"
          className="fixed bottom-40 right-3 z-[90] flex w-[min(25rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-40 sm:right-5 lg:bottom-40"
          style={{ height: "min(72dvh, 44rem)" }}
          data-pna-ai="v2"
        >
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#041E3F] to-[#01828B] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">Physio Nexus AI</p>
                <p className="mt-1 text-xs text-white/80">Your PNA guide · English & Roman Urdu</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close Physio Nexus AI"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-3" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[88%] rounded-2xl rounded-br-md bg-[#041E3F] px-3 py-2.5 text-sm leading-relaxed text-white"
                      : "w-full max-w-[96%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm"
                  }
                >
                  {message.safety ? (
                    <div className="mb-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-900" role="alert">
                      <p className="flex items-center gap-1.5 text-sm font-bold">
                        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {message.safety.title}
                      </p>
                      <div className="mt-1.5 text-[13px] leading-relaxed">
                        <AnswerText text={message.safety.text} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <a href="tel:1122" className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call 1122
                        </a>
                        <a href="tel:115" className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call Edhi 115
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {message.role === "user" ? <p>{message.text}</p> : message.text ? <AnswerText text={message.text} /> : null}

                  {message.explanation ? <ExplanationCard explanation={message.explanation} defaultOpen={Boolean(message.explanationOpen)} /> : null}

                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.resources.map((resource, index) => (
                        <a
                          key={resource.id + index}
                          href={resource.href}
                          className="group block rounded-xl border border-slate-200 bg-white p-3 text-slate-800 transition hover:border-teal-400 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        >
                          <span className="flex items-start gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-snug">{resource.title}</span>
                              {resource.why ? (
                                <span className={"mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold " + (kindTone[resource.kind ?? ""] ?? "bg-slate-100 text-slate-700")}>
                                  {resource.why}
                                </span>
                              ) : (
                                <span className="mt-1 block text-xs text-teal-800">
                                  {resource.category}
                                  {resource.level ? ` · ${resource.level}` : ""}
                                </span>
                              )}
                              <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-slate-600">{resource.summary}</span>
                            </span>
                            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-teal-700" aria-hidden="true" />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  {message.id === lastMessageId && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Suggested next questions">
                      {message.suggestions.map((suggestion) =>
                        suggestion.href ? (
                          <a
                            key={suggestion.label}
                            href={suggestion.href}
                            className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
                          >
                            {suggestion.label} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <button
                            key={suggestion.label}
                            type="button"
                            onClick={() => void sendQuery(suggestion.query ?? suggestion.label)}
                            disabled={loading}
                            className="rounded-full border border-teal-200 bg-white px-2.5 py-1 text-left text-xs font-semibold text-teal-800 transition hover:bg-teal-50 disabled:opacity-50"
                          >
                            {suggestion.label}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-3 pt-3">
              {starterTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => void sendQuery(topic)}
                  disabled={loading}
                  className="rounded-full border border-teal-200 px-3 py-1.5 text-left text-xs font-medium text-teal-800 transition hover:bg-teal-50 disabled:opacity-50"
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <label htmlFor="pna-ai-query" className="sr-only">
              Ask Physio Nexus AI
            </label>
            <input
              id="pna-ai-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={240}
              placeholder="Ask in English, Roman Urdu or اردو"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
            {voiceSupported ? (
              <>
                <button
                  type="button"
                  onClick={toggleVoiceLanguage}
                  aria-label={`Voice language: ${voiceLang === "en-US" ? "English" : "Urdu"}. Tap to switch.`}
                  title="Voice language"
                  className="h-10 shrink-0 rounded-xl border border-slate-300 bg-white px-2 text-[11px] font-bold text-slate-700 hover:border-teal-500"
                >
                  {voiceLang === "en-US" ? "EN" : "اردو"}
                </button>
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-pressed={listening}
                  aria-label={listening ? "Stop listening" : "Ask by voice"}
                  title={listening ? "Stop listening" : "Ask by voice"}
                  className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition " + (listening ? "animate-pulse border-rose-500 bg-rose-50 text-rose-700" : "border-slate-300 bg-white text-slate-700 hover:border-teal-500")}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </>
            ) : null}
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              aria-label="Ask Physio Nexus AI"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01828B] text-white transition hover:bg-[#006c73] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          {voiceNote ? <p role="status" className="bg-white px-3 pb-2 text-[11px] text-rose-700">{voiceNote}</p> : null}
          <p className="bg-white px-3 pb-3 text-[10px] leading-relaxed text-slate-500">
            Answers come from PNA&apos;s educational content and do not replace a clinical assessment. Don&apos;t enter names or other identifying details. Messages are not saved.
          </p>
        </section>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Physio Nexus AI"
          aria-expanded={false}
          className="group fixed bottom-40 right-3 z-[91] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#041E3F] to-[#01828B] text-white shadow-[0_10px_30px_rgba(4,30,63,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(4,30,63,0.38)] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 sm:bottom-40 sm:right-5 lg:bottom-24"
        >
          <Sparkles className="h-6 w-6" aria-hidden="true" />
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-[#041E3F] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
            Ask Physio Nexus AI
          </span>
        </button>
      )}
    </>
  );
}
