"use client";

import { useState, useTransition } from "react";
import { BellRing, CalendarClock, CheckCircle2, CircleDashed, Clock, HeartPulse, Radar, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { setFollowupRemindersAction } from "@/app/rehabverse/actions";
import type { History, PatientFollowup } from "@/lib/rehabverse/api-types";
import { checkinStates, painTrend, TREND_COPY, type CheckinState } from "@/lib/rehabverse/followup";
import { TIMEPOINT_LABEL } from "@/lib/rehabverse/intake";
import { T, useRvLang } from "./useLang";

export type NextStep = { icon: "checkin" | "open" | "scheduled" | "review" | "soon" | "done"; en: string; ru: string };

const fmt = (ms: number, lang: string) => new Date(ms).toLocaleString(lang === "ru" ? "en-PK" : "en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export function AdherenceRing({ percent }: { percent: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="rv-ring" role="img" aria-label={`${percent}% of released days completed`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="rv-ring-bg" />
        <circle cx="32" cy="32" r={r} className="rv-ring-fg" strokeDasharray={`${(percent / 100) * c} ${c}`} transform="rotate(-90 32 32)" />
      </svg>
      <b>{percent}<small>%</small></b>
    </div>
  );
}

function StateChip({ item, lang }: { item: CheckinState; lang: string }) {
  const label = TIMEPOINT_LABEL[item.point][lang === "ru" ? "ru" : "en"];
  if (item.state === "done") return <li className="rv-step-chip" data-state="done"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /><span>{label}</span><b>{item.pain !== null ? `${item.pain}/10` : "✓"}</b></li>;
  if (item.state === "open") return <li className="rv-step-chip" data-state="open"><HeartPulse className="h-4 w-4" aria-hidden="true" /><span>{label}</span><b><T en="Open now" ru="Abhi khula" /></b></li>;
  if (item.state === "soon") return <li className="rv-step-chip" data-state="soon"><Clock className="h-4 w-4" aria-hidden="true" /><span>{label}</span><b>{fmt(item.opensAt, lang)}</b></li>;
  return <li className="rv-step-chip" data-state="missed"><CircleDashed className="h-4 w-4" aria-hidden="true" /><span>{label}</span><b><T en="Missed" ru="Reh gaya" /></b></li>;
}

const ICON = { checkin: HeartPulse, open: Sparkles, scheduled: CalendarClock, review: CheckCircle2, soon: Clock, done: Radar } as const;

/** What happens next, the state of the recovery check-ins and the reminder e-mail switch. */
export function FollowUpCard({ next, history, schedule, followup }: { next: NextStep; history: History | null; schedule: readonly ("later_same_day" | "24h" | "48h")[]; followup: PatientFollowup | null }) {
  const [lang] = useRvLang();
  const [pending, start] = useTransition();
  const [on, setOn] = useState(followup?.remind_email ?? true);
  const [note, setNote] = useState("");
  const Icon = ICON[next.icon];
  const now = Date.now();
  const logged = (history?.days ?? []).filter((d) => d.submitted_at && d.completion !== "none").slice(-2).reverse();

  return (
    <section className="rv-glass rv-follow" aria-labelledby="rv-follow-h">
      <h2 id="rv-follow-h" className="rv-follow-h"><Radar className="h-4 w-4" aria-hidden="true" /> <T en="Your follow-up" ru="Aap ka follow-up" /></h2>
      <p className="rv-next" data-kind={next.icon}><span aria-hidden="true"><Icon className="h-5 w-5" /></span><b>{lang === "ru" ? next.ru : next.en}</b></p>

      {logged.length ? (
        <div className="rv-checks">
          {logged.map((d) => (
            <div key={d.session_id}>
              <p className="rv-checks-title"><T en="Day" ru="Din" /> {d.day_number} · <T en="recovery check-ins" ru="recovery check-ins" /></p>
              <ul className="rv-step-row">{checkinStates(d, schedule, now).map((item) => <StateChip key={item.point} item={item} lang={lang} />)}</ul>
            </div>
          ))}
        </div>
      ) : null}

      {followup ? (
        <div className="rv-remind">
          <label className="rv-remind-row">
            <input
              type="checkbox"
              checked={on}
              disabled={pending || !followup.has_email}
              onChange={(e) => {
                const value = e.target.checked;
                setOn(value);
                setNote("");
                start(async () => {
                  const r = await setFollowupRemindersAction(value);
                  if (!r.ok) { setOn(!value); setNote(lang === "ru" ? "Save nahi ho saka. Dobara koshish karein." : "Could not save. Please try again."); }
                  else setNote(r.remindEmail ? (lang === "ru" ? "Reminder email on hai." : "Reminder e-mails are on.") : (lang === "ru" ? "Reminder email band hai." : "Reminder e-mails are off."));
                });
              }}
            />
            <span><BellRing className="inline h-4 w-4" aria-hidden="true" /> <T en="E-mail me when a check-in opens or a day is waiting" ru="Check-in khulne ya din intezar karne par mujhe email karein" /></span>
          </label>
          <p className="rv-remind-note">
            {followup.has_email
              ? <T en="At most one short e-mail a day, daytime only. It never contains your symptoms or scores." ru="Din mein ek chhoti email se zyada nahi, sirf din ke waqt. Is mein aap ke symptoms ya scores nahi hote." />
              : <T en="Add an e-mail address to your account to get reminders." ru="Reminders ke liye apne account mein email address shamil karein." />}
            {note ? <> <b role="status">{note}</b></> : null}
          </p>
        </div>
      ) : null}
    </section>
  );
}

/** A plain picture of what the patient reported: start → now, with a one-line reading. Not a clinical judgement. */
export function PainTrendCard({ history }: { history: History | null }) {
  const [lang] = useRvLang();
  const trend = painTrend(history?.days ?? [], history?.baseline_pain ?? null);
  const copy = TREND_COPY[trend.verdict];
  const W = 320, H = 110, pad = { l: 12, r: 12, t: 12, b: 20 };
  const pts = trend.points;
  const x = (i: number) => pad.l + (pts.length <= 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (pts.length - 1));
  const y = (v: number) => pad.t + (1 - v / 10) * (H - pad.t - pad.b);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = pts.length > 1 ? `${line} L${x(pts.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z` : "";
  const Icon = trend.verdict === "improving" ? TrendingDown : trend.verdict === "higher" ? TrendingUp : Minus;
  const label = { building: ["Building your trend", "Trend ban raha hai"], improving: ["Coming down", "Kam ho raha hai"], steady: ["Steady", "Barqarar"], higher: ["Higher than start", "Shuru se zyada"] }[trend.verdict];
  return (
    <section className="rv-glass rv-trend" data-verdict={trend.verdict} aria-labelledby="rv-trend-h">
      <div className="rv-trend-top">
        <h2 id="rv-trend-h"><T en="Pain trend" ru="Dard ka trend" /></h2>
        <span className="rv-trend-chip" data-verdict={trend.verdict}><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {lang === "ru" ? label[1] : label[0]}</span>
      </div>
      {pts.length >= 2 ? (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="rv-trend-svg" role="img" aria-label={pts.map((p) => `${p.label} ${p.value} out of 10`).join(", ")}>
            <defs>
              <linearGradient id="rv-trend-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0db3aa" stopOpacity=".35" /><stop offset="1" stopColor="#0db3aa" stopOpacity="0" /></linearGradient>
            </defs>
            {[0, 5, 10].map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="rv-trend-grid" />)}
            {area ? <path d={area} fill="url(#rv-trend-g)" /> : null}
            <path d={line} className="rv-trend-line" />
            {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r={i === pts.length - 1 ? 5 : 3.2} className="rv-trend-dot" data-last={i === pts.length - 1} />)}
            {pts.map((p, i) => (i === 0 || i === pts.length - 1 || pts.length <= 6 ? <text key={`t${i}`} x={x(i)} y={H - 5} textAnchor="middle" className="rv-trend-lab">{p.label}</text> : null))}
          </svg>
          {trend.start !== null && trend.now !== null ? (
            <p className="rv-trend-nums"><b>{trend.start}</b><span aria-hidden="true"> → </span><b>{trend.now}</b><small> /10 · <T en="start → latest" ru="shuru → ab" /></small></p>
          ) : null}
        </>
      ) : null}
      <p className="rv-trend-copy">{lang === "ru" ? copy.ru : copy.en}</p>
      <p className="rv-trend-fine"><T en="This describes what you reported. Your physiotherapist decides what it means for your programme." ru="Ye wohi dikhata hai jo aap ne bataya. Iska matlab aap ka physiotherapist tay karta hai." /></p>
    </section>
  );
}
