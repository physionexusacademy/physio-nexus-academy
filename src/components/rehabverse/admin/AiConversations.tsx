import { Sparkles } from "lucide-react";
import type { AdminAiConversation } from "@/lib/rehabverse/api-types";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const STATUS: Record<AdminAiConversation["status"], { text: string; chip: string }> = {
  open: { text: "open", chip: "rv-chip rv-chip-amber" },
  completed: { text: "completed", chip: "rv-chip rv-chip-teal" },
  abandoned: { text: "patient chose the form", chip: "rv-chip" },
  safety_stop: { text: "safety stop", chip: "rv-chip rv-chip-rose" },
};

/** The patient's AI conversations, for the treating physiotherapist and the research record: transcript, models used and any safety stop. */
export function AiConversations({ conversations }: { conversations: AdminAiConversation[] }) {
  return (
    <div className="space-y-2.5">
      {conversations.map((c) => (
        <details key={c.id} className="rounded-xl border border-slate-200 bg-white" open={conversations.length === 1}>
          <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3.5 py-2.5 text-[13.5px]">
            <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <b className="text-navy-800">{c.kind} conversation</b>
            <span className="text-slate-500">{dt(c.created_at)}</span>
            <span className={STATUS[c.status].chip}>{STATUS[c.status].text}</span>
            <span className="rv-chip">{c.turns} turn{c.turns === 1 ? "" : "s"}</span>
            {c.fallback_turns ? <span className="rv-chip rv-chip-amber">{c.fallback_turns} scripted repl{c.fallback_turns === 1 ? "y" : "ies"}</span> : null}
            {c.safety_alert ? <span className="rv-chip rv-chip-rose">alert: {c.safety_alert}</span> : null}
          </summary>
          <div className="space-y-2 border-t border-slate-100 px-3.5 py-3">
            {c.messages.map((m, i) => (
              <p key={i} className={"max-w-[92%] whitespace-pre-line rounded-xl px-3 py-2 text-[13.5px] leading-6 " + (m.role === "patient" ? "ml-auto bg-slate-100 text-slate-800" : "border border-teal-100 bg-teal-50/60 text-slate-800")}>
                <b className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{m.role === "patient" ? "Patient" : `Assistant${m.fallback ? " (scripted)" : ""}`}</b>
                {m.text}
              </p>
            ))}
            <p className="text-[12px] leading-5 text-slate-500">
              Language: {c.language === "ru" ? "Roman Urdu" : "English"} · models: {c.models.length ? c.models.join(", ") : "scripted only"} · notice accepted ({c.consent_version}) {dt(c.consented_at)}
              {c.assessment_id ? " · produced the assessment above" : ""}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
