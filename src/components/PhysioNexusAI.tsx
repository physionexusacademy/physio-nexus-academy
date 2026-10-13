"use client";

import { FormEvent, useState } from "react";
import { Bot, ExternalLink, LoaderCircle, Send, Sparkles, X } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  href: string;
  category: string;
  summary: string;
  level?: string;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  resources?: Resource[];
};

const starterTopics = [
  "Learn myofascial release",
  "Find a neck pain treatment plan",
  "Practise clinical reasoning",
];

export function PhysioNexusAI() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextId, setNextId] = useState(2);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I’m Physio Nexus AI. Tell me what you want to learn, and I’ll guide you to the right PNA resources.",
    },
  ]);

  async function sendQuery(value: string) {
    const clean = value.trim();
    if (!clean || loading) return;

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
        body: JSON.stringify({ query: clean }),
      });
      const result = await response.json() as {
        message?: string;
        resources?: Resource[];
        error?: string;
      };

      if (!response.ok) throw new Error(result.error || "I couldn’t complete that search. Please try again.");
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: result.message || "Here are some useful PNA resources to explore.",
          resources: Array.isArray(result.resources) ? result.resources : [],
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuery(query);
  }

  return (
    <>
      {open && (
        <section
          aria-label="Physio Nexus AI learning navigator"
          className="fixed bottom-24 left-3 z-[90] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:left-5 lg:bottom-24"
          style={{ maxHeight: "min(70dvh, 42rem)" }}
        >
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#041E3F] to-[#01828B] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">Physio Nexus AI</p>
                <p className="mt-1 text-xs text-white/80">Your PNA learning navigator</p>
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

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={message.role === "user"
                  ? "max-w-[88%] rounded-2xl rounded-br-md bg-[#041E3F] px-3 py-2.5 text-sm leading-relaxed text-white"
                  : "max-w-[95%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm"}>
                  <p>{message.text}</p>
                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.resources.map((resource, index) => (
                        <a
                          key={resource.id}
                          href={resource.href}
                          className="group block rounded-xl border border-slate-200 bg-white p-3 text-slate-800 transition hover:border-teal-400 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        >
                          <span className="flex items-start gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-snug">{resource.title}</span>
                              <span className="mt-1 block text-xs text-teal-800">{resource.category}{resource.level ? ` · ${resource.level}` : ""}</span>
                              <span className="mt-1.5 block text-xs leading-relaxed text-slate-600">{resource.summary}</span>
                            </span>
                            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-teal-700" aria-hidden="true" />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Finding the right PNA resources…
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
            <label htmlFor="pna-ai-query" className="sr-only">What would you like to learn?</label>
            <input
              id="pna-ai-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={240}
              placeholder="What would you like to learn?"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              aria-label="Find learning resources"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01828B] text-white transition hover:bg-[#006c73] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <p className="bg-white px-3 pb-3 text-[10px] leading-relaxed text-slate-500">
            Resource finder, not a substitute for clinical assessment. Chats are not saved to your PNA account.
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close Physio Nexus AI" : "Open Physio Nexus AI"}
        aria-expanded={open}
        className="fixed bottom-24 left-3 z-[91] inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-[#041E3F] to-[#01828B] px-4 text-white shadow-[0_10px_30px_rgba(4,30,63,0.3)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/30 sm:bottom-24 sm:left-5 lg:bottom-6"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
        <span className="text-sm font-semibold">Ask Physio Nexus AI</span>
      </button>
    </>
  );
}
