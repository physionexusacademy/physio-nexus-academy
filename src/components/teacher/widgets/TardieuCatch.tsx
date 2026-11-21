"use client";

import { useEffect, useRef, useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { motionReduced } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Seg, WidgetFrame, bi, type Bi } from "./kit";

type Kind = "normal" | "spastic" | "rigid" | "contracture" | "mixed";
type Speed = 1 | 2 | 3;

type Profile = {
  name: Bi;
  idea: Bi;
  /** where the stretch ends (R2 at the slow speed), as a % of the normal range */
  r2: number;
  /** where the catch happens at each speed (% of range), or null when there is no catch */
  catchAt: Record<Speed, number | null>;
  base: number;
  slope: number;
  ripple?: boolean;
};

const PROFILES: Record<Kind, Profile> = {
  normal: {
    name: { en: "Normal muscle", ur: "Normal muscle" },
    idea: { en: "Light, smooth resistance at every speed. No catch.", ur: "Har raftaar par halki, hamwar muzahimat. Koi catch nahi." },
    r2: 100,
    catchAt: { 1: null, 2: null, 3: null },
    base: 6,
    slope: 0.25,
  },
  spastic: {
    name: { en: "Spasticity", ur: "Spasticity" },
    idea: { en: "Slow: free and full range. Fast: a catch, then a release. The faster you go, the EARLIER it catches.", ur: "Aahista: azad aur poori range. Tez: catch, phir release. Jitna tez, catch utna JALDI." },
    r2: 100,
    catchAt: { 1: null, 2: 68, 3: 34 },
    base: 6,
    slope: 0.25,
  },
  rigid: {
    name: { en: "Rigidity (e.g. Parkinson's)", ur: "Rigidity (maslan Parkinson's)" },
    idea: { en: "The same stiff resistance through the whole range, at ANY speed. No catch.", ur: "Poori range mein, KISI BHI raftaar par, ek jaisi sakht muzahimat. Catch nahi." },
    r2: 100,
    catchAt: { 1: null, 2: null, 3: null },
    base: 52,
    slope: 0.12,
    ripple: true,
  },
  contracture: {
    name: { en: "Fixed contracture", ur: "Fixed contracture" },
    idea: { en: "The range is short even when slow, and the end is hard. Speed changes nothing.", ur: "Aahista karne par bhi range chhoti, aur anjaam sakht. Raftaar se kuch nahi badalta." },
    r2: 52,
    catchAt: { 1: null, 2: null, 3: null },
    base: 14,
    slope: 0.3,
  },
  mixed: {
    name: { en: "Spasticity + contracture", ur: "Spasticity + contracture" },
    idea: { en: "A short slow range (R2) AND an early catch when fast. Common in long-standing cerebral palsy and stroke.", ur: "Chhoti aahista range (R2) AUR tez karne par jaldi catch. Purani cerebral palsy aur stroke mein aam." },
    r2: 64,
    catchAt: { 1: null, 2: 44, 3: 22 },
    base: 10,
    slope: 0.28,
  },
};

const SPEEDS: { id: Speed; label: Bi; note: Bi; ms: number }[] = [
  { id: 1, label: { en: "V1: slowest", ur: "V1: sab se aahista" }, note: { en: "As slow as you can go", ur: "Jitna aahista ho sake" }, ms: 3200 },
  { id: 2, label: { en: "V2: gravity speed", ur: "V2: gravity ki raftaar" }, note: { en: "The speed the limb would fall under its own weight", ur: "Jis raftaar se limb apne wazan se girta" }, ms: 1300 },
  { id: 3, label: { en: "V3: fastest", ur: "V3: sab se tez" }, note: { en: "Faster than the limb would fall", ur: "Limb ke girne se bhi tez" }, ms: 450 },
];

// the resistance curve (0..100) over the stretch (0..100% of the normal range) for one profile and speed
function resistance(profile: Profile, speed: Speed, x: number) {
  if (x > profile.r2) return 100;
  const c = profile.catchAt[speed];
  let r = profile.base + profile.slope * x;
  if (profile.ripple) r += 5 * Math.sin(x / 3.2);
  if (c !== null) {
    if (x >= c && x < c + 9) r = 92;
    else if (x >= c + 9 && x < c + 20) r = profile.base + profile.slope * x + 4;
    else if (x >= c + 20) r += 6;
  }
  if (x > profile.r2 - 6) r = Math.max(r, 40 + ((x - (profile.r2 - 6)) / 6) * (profile.r2 < 100 ? 60 : 12));
  return Math.min(100, r);
}

function quality(profile: Profile, kind: Kind, speed: Speed) {
  if (kind === "normal") return 0;
  if (kind === "rigid") return 1;
  if (kind === "contracture") return 1;
  return profile.catchAt[speed] !== null ? 2 : 1;
}

const QUALITY_TEXT: Bi[] = [
  { en: "0: no resistance through the whole movement", ur: "0: poori harkat mein koi muzahimat nahi" },
  { en: "1: slight resistance throughout, no clear catch", ur: "1: poori range mein halki muzahimat, saaf catch nahi" },
  { en: "2: a clear catch at one angle, then release", ur: "2: ek angle par saaf catch, phir release" },
  { en: "3: fatigable clonus (under 10 s) at one angle", ur: "3: thakne wala clonus (10 s se kam) ek angle par" },
  { en: "4: unfatigable clonus (over 10 s)", ur: "4: na thakne wala clonus (10 s se zyada)" },
  { en: "5: the joint will not move", ur: "5: joint hilta hi nahi" },
];

const W = 240;
const H = 150;
const gx = (x: number) => 30 + (x / 100) * (W - 44);
const gy = (r: number) => H - 22 - (r / 100) * (H - 40);

export function TardieuCatch({ lang }: { lang: TeacherLang }) {
  const [kind, setKind] = useState<Kind>("spastic");
  const [speed, setSpeed] = useState<Speed>(3);
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(false);
  const frame = useRef<number | null>(null);

  const profile = PROFILES[kind];
  const cut = profile.catchAt[speed];
  const sp = SPEEDS.find((s) => s.id === speed) ?? SPEEDS[0];

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
    setRunning(false);
  };
  const choose = (apply: () => void) => {
    stop();
    apply();
    setPos(0);
  };

  const stretch = () => {
    stop();
    if (motionReduced()) {
      setPos(cut ?? profile.r2);
      return;
    }
    const stopAt = cut !== null ? cut + 2 : profile.r2;
    const started = performance.now();
    setRunning(true);
    setPos(0);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / sp.ms);
      const x = progress * stopAt;
      setPos(x);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = null;
        setRunning(false);
      }
    };
    frame.current = requestAnimationFrame(tick);
  };

  const curve = (s: Speed, upTo = profile.r2) => {
    const pts: string[] = [];
    for (let x = 0; x < Math.min(upTo, 100); x += 2) pts.push(`${gx(x).toFixed(1)},${gy(resistance(profile, s, x)).toFixed(1)}`);
    pts.push(`${gx(upTo).toFixed(1)},${gy(resistance(profile, s, upTo)).toFixed(1)}`);
    return pts.join(" ");
  };
  const dotX = Math.min(pos, profile.r2);
  const dot = { x: gx(dotX), y: gy(resistance(profile, speed, dotX)) };
  const x = quality(profile, kind, speed);
  const r1 = profile.catchAt[3];
  const dynamic = r1 !== null ? profile.r2 - r1 : 0;

  return (
    <WidgetFrame id="tardieu-catch">
      <p className="text-sm font-bold text-navy-800">{t(lang, "Choose the muscle, then stretch it at three speeds:", "Muscle chunein, phir teen raftaar par stretch karein:")}</p>
      <div className="mt-2 grid gap-2">
        <Seg value={kind} onChange={(next) => choose(() => setKind(next))} label={t(lang, "Muscle type", "Muscle ki qisam")} options={(Object.keys(PROFILES) as Kind[]).map((id) => ({ id, label: bi(lang, PROFILES[id].name) }))} />
        <Seg value={String(speed) as "1" | "2" | "3"} onChange={(next) => choose(() => setSpeed(Number(next) as Speed))} label={t(lang, "Stretch speed", "Stretch ki raftaar")} options={SPEEDS.map((s) => ({ id: String(s.id) as "1" | "2" | "3", label: bi(lang, s.label) }))} />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{bi(lang, sp.note)}. {bi(lang, profile.idea)}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,330px)_1fr] sm:items-start">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-xl bg-slate-50" role="img" aria-label={t(lang, "Graph of resistance against joint angle", "Muzahimat bamuqabla joint angle ka graph")}>
            <line x1="30" y1={gy(0)} x2={W - 14} y2={gy(0)} stroke="#94a3b8" />
            <line x1="30" y1={gy(0)} x2="30" y2={gy(100)} stroke="#94a3b8" />
            <text x={W - 14} y={H - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "stretch (% of normal range) →", "stretch (normal range ka %) →")}</text>
            <text x="4" y="12" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "resistance ↑", "muzahimat ↑")}</text>
            <polyline points={curve(1)} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
            {([2, 3] as Speed[]).map((s) => (
              <polyline key={s} points={curve(s)} fill="none" stroke={s === 2 ? "#bfdbfe" : "#fecdd3"} strokeWidth="1.5" />
            ))}
            <polyline points={curve(speed)} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {cut !== null ? (
              <>
                <line x1={gx(cut)} y1={gy(0)} x2={gx(cut)} y2={gy(100)} stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x={gx(cut) + 4} y={gy(100) + 10} fontSize="11" fontWeight="800" fill="#e11d48">R1</text>
              </>
            ) : null}
            <line x1={gx(profile.r2)} y1={gy(0)} x2={gx(profile.r2)} y2={gy(100)} stroke="#0f766e" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={gx(profile.r2) - 18} y={gy(100) + 10} fontSize="11" fontWeight="800" fill="#0f766e">R2</text>
            <circle cx={dot.x} cy={dot.y} r="6" fill={running ? "#f59e0b" : "#0f766e"} stroke="#fff" strokeWidth="2" />
          </svg>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={stretch} className="min-h-10 flex-1 rounded-xl bg-navy-800 px-3 text-sm font-bold text-white">
              {running ? t(lang, "Stretching…", "Stretch ho raha hai…") : t(lang, "Stretch the muscle", "Muscle stretch karein")}
            </button>
            <button type="button" onClick={() => choose(() => {})} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              {t(lang, "Reset", "Reset")}
            </button>
          </div>
          {cut !== null && !running && pos >= cut ? (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800" role="status">
              {t(lang, "Catch! The muscle fights back at this angle (R1).", "Catch! Muscle is angle par muqabla karta hai (R1).")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2" aria-live="polite">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-xs font-bold uppercase text-slate-500">R1 ({t(lang, "catch", "catch")})</p>
              <p className="text-lg font-extrabold text-rose-700">{cut !== null ? `${cut}%` : "—"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-xs font-bold uppercase text-slate-500">R2 ({t(lang, "slow range", "aahista range")})</p>
              <p className="text-lg font-extrabold text-teal-700">{profile.r2}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-xs font-bold uppercase text-slate-500">R2 − R1</p>
              <p className="text-lg font-extrabold text-navy-800">{r1 !== null ? `${dynamic}%` : "—"}</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-extrabold text-navy-800">{t(lang, `Quality of the reaction (X) at this speed: ${x}`, `Is raftaar par reaction ki quality (X): ${x}`)}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{bi(lang, QUALITY_TEXT[x])}</p>
            <details className="mt-1 text-xs text-slate-500">
              <summary className="cursor-pointer font-bold text-teal-700">{t(lang, "The full 0 to 5 scale", "Poora 0 se 5 ka scale")}</summary>
              <ul className="mt-1 grid gap-0.5 leading-5">
                {QUALITY_TEXT.map((line) => (
                  <li key={line.en} className={cn(line.en.startsWith(`${x}:`) && "font-bold text-navy-800")}>{bi(lang, line)}</li>
                ))}
              </ul>
            </details>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm leading-6 text-slate-700">
            {kind === "normal" ? t(lang, "Nothing to treat: no catch, full range.", "Ilaaj ki zaroorat nahi: catch nahi, poori range.") : null}
            {kind === "spastic" ? t(lang, "A big R2 − R1 is the NEURAL part (spasticity). The muscle is not short, it is overactive when stretched fast. Tone management, positioning and active strengthening apply.", "Bara R2 − R1 NEURAL hissa (spasticity) hai. Muscle chhota nahi, tez stretch par zyada active hai. Tone management, positioning aur active strengthening laagu hotay hain.") : null}
            {kind === "rigid" ? t(lang, "No catch and no speed effect: this is rigidity, not spasticity. Think basal ganglia, not corticospinal tract.", "Catch nahi aur raftaar ka asar nahi: yeh rigidity hai, spasticity nahi. Basal ganglia sochein, corticospinal tract nahi.") : null}
            {kind === "contracture" ? t(lang, "A short R2 with no speed effect is NON-neural: the muscle or joint tissue is short. Stretching, serial casting or surgery are the options, not tone drugs.", "Chhota R2 aur raftaar ka asar nahi: yeh NON-neural hai, muscle ya joint tissue chhota hai. Stretching, serial casting ya surgery options hain, tone ki dawaiyan nahi.") : null}
            {kind === "mixed" ? t(lang, "Both problems at once: R2 is short (contracture) and R2 − R1 is large (spasticity). Treating only one leaves the other.", "Dono masail ek saath: R2 chhota (contracture) aur R2 − R1 bara (spasticity). Sirf ek ka ilaaj doosre ko chhor deta hai.") : null}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
