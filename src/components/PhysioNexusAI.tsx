"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Bot, ExternalLink, LoaderCircle, Phone, Send, ShieldAlert, Sparkles, X } from "lucide-react";

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

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
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
              placeholder="Ask anything — English or Roman Urdu"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              aria-label="Ask Physio Nexus AI"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01828B] text-white transition hover:bg-[#006c73] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
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
