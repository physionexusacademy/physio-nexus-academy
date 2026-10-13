"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const welcome: ChatMessage = {
  role: "assistant",
  content:
    "Assalam-o-alaikum! I’m PNA AI, the Physio Nexus Academy assistant. Ask me about physiotherapy learning, clinical concepts, workshops, or academy resources. I can support learning, but I can’t replace an in-person clinical assessment.",
};

export function PhysioNexusAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, open]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || text.length > 1200) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/physio-nexus-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message !== welcome)
            .slice(-8)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "I couldn’t get a reply just now. Please try again.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.reply! }]);
    } catch {
      setError("Sorry, I couldn’t connect just now. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <section
          aria-label="Physio Nexus Academy AI chat"
          className="fixed bottom-36 right-3 z-[90] flex h-[min(70dvh,590px)] w-[calc(100vw-24px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-2xl sm:right-5 lg:bottom-24 lg:right-6"
        >
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#102A43] to-[#087E83] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Physio Nexus AI</p>
              <p className="text-xs text-teal-50">Learning and academy assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI chat"
              className="rounded-full px-3 py-1 text-xl leading-none hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto rounded-br-md bg-[#087E83] text-white"
                    : "mr-auto rounded-bl-md border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {message.content}
              </div>
            ))}
            {busy && (
              <p className="mr-auto rounded-2xl bg-white px-3 py-2 text-sm text-slate-500">
                PNA AI is thinking…
              </p>
            )}
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                maxLength={1200}
                aria-label="Your message"
                placeholder="Ask PNA AI…"
                className="min-h-11 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-xl bg-[#087E83] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#06686c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Educational support only. Avoid sharing patient-identifying information.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close Physio Nexus AI chat" : "Chat with Physio Nexus AI"}
        aria-expanded={open}
        className="fixed bottom-40 right-3 z-[91] inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#102A43] to-[#087E83] text-white shadow-[0_10px_30px_rgba(8,45,67,0.3)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300/60 sm:right-5 sm:h-14 sm:w-14 lg:bottom-24 lg:right-6"
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.4-.75L4 20l1.2-4A7.4 7.4 0 0 1 5 12a7.5 7.5 0 0 1 15-0.5Z" />
            <path d="M8.5 11.5h7M8.5 14.5h4" />
          </svg>
        )}
      </button>
    </>
  );
}
