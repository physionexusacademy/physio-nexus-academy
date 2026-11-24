"use client";

import { Check, Compass, Crosshair, Eye, Ruler, Sun, Timer } from "lucide-react";
import type { AlignmentId, SessionState } from "@/lib/formcheck";
import type { Tilt } from "@/lib/formcheck/browser/level";
import { T, useRvLang } from "../useLang";
import "./formcheck-hud.css";

/**
 * The alignment screen over the live view: one score, six checks (each turns teal as it is met, the first one still to fix breathes softly), the state of the set-up in one
 * word, the phone-level dial when the phone has the sensor, and the one thing to do next. It shows what the engine judged and decides nothing itself.
 */
const CHECKS: Record<AlignmentId, { icon: typeof Eye; en: string; ru: string }> = {
  view: { icon: Eye, en: "In view", ru: "Nazar" },
  distance: { icon: Ruler, en: "Distance", ru: "Faasla" },
  centre: { icon: Crosshair, en: "Centred", ru: "Darmiyan" },
  light: { icon: Sun, en: "Light", ru: "Roshni" },
  angle: { icon: Compass, en: "Angle", ru: "Rukh" },
  steady: { icon: Timer, en: "Steady", ru: "Saakin" },
};
const RADIUS = 24;
const CIRC = 2 * Math.PI * RADIUS;

export function AlignmentOverlay({ state, tilt }: { state: SessionState; tilt: Tilt | null }) {
  const [lang] = useRvLang();
  const a = state.alignment;
  if (!a || (state.phase !== "setup" && state.phase !== "calibrating")) return null;
  const allOk = a.checks.every((c) => c.ok || c.id === "steady");
  const first = a.checks.find((c) => !c.ok && c.id !== "steady")?.id;
  const score = a.score;
  const colour = score >= 90 ? "#2dd4bf" : score >= 60 ? "#fbbf24" : "#fb923c";
  const label = state.phase === "calibrating"
    ? <T en="Locking in" ru="Lock ho raha hai" />
    : allOk ? <T en="Hold steady" ru="Saakin rahein" /> : <T en="Aligning" ru="Align ho raha hai" />;
  return (
    <div className="fc-hud" data-pna-formcheck-alignment data-score={score}>
      <div className="fc-top">
        <div className="fc-score">
          <div className="fc-ring" role="img" aria-label={`Alignment ${score} percent`}>
            <svg viewBox="0 0 58 58" aria-hidden="true">
              <circle className="fc-ring-track" cx="29" cy="29" r={RADIUS} />
              <circle className="fc-ring-bar" cx="29" cy="29" r={RADIUS} stroke={colour} strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)} />
            </svg>
            <div className="fc-ring-num" aria-hidden="true"><span>{score}<small>%</small></span></div>
          </div>
          <p className="fc-state" data-on={score >= 90}>{label}</p>
        </div>
        <div className="fc-chips" role="list" aria-label={lang === "ru" ? "Alignment ki checks" : "Alignment checks"}>
          {a.checks.map((c) => {
            const meta = CHECKS[c.id];
            const Icon = c.ok ? Check : meta.icon;
            // a check that is met shrinks to a tick; one still to do keeps its name and how close it is, so the person sees what to change
            return (
              <span key={c.id} role="listitem" className="fc-chip" data-ok={c.ok} data-first={first === c.id} data-check={c.id} aria-label={`${meta[lang]}: ${c.ok ? (lang === "ru" ? "theek" : "ok") : (lang === "ru" ? "baqi" : "to do")}`}>
                <Icon aria-hidden="true" />
                {!c.ok ? <>{meta[lang]}<i aria-hidden="true"><b style={{ width: `${Math.round(c.level * 100)}%` }} /></i></> : null}
              </span>
            );
          })}
        </div>
      </div>
      {tilt ? (
        <div className="fc-level" data-ok={tilt.level} data-pna-formcheck-level aria-label={lang === "ru" ? "Phone level" : "Phone level"}>
          <span className="fc-level-dial" aria-hidden="true"><b style={{ boxShadow: tilt.level ? "none" : `0 0 0 ${Math.min(9, Math.round(Math.max(tilt.pitch, tilt.roll) * 1.1))}px rgba(251, 191, 36, 0.28)` }} /></span>
          <span>{tilt.level ? <T en="Level" ru="Seedha" /> : <>{Math.round(Math.max(tilt.pitch, tilt.roll))}° <T en="off" ru="tirchha" /></>}</span>
        </div>
      ) : null}
      <span />
    </div>
  );
}
