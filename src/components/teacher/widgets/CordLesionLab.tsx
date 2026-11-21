"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Pill, WidgetFrame } from "./kit";

type Side = "R" | "L";
type Lesion = { dcR: boolean; dcL: boolean; cstR: boolean; cstL: boolean; stR: boolean; stL: boolean };
type Tract = "dc" | "cst" | "st";

const NONE: Lesion = { dcR: false, dcL: false, cstR: false, cstL: false, stR: false, stL: false };

const PRESETS: { id: string; lesion: Lesion; central?: boolean; name: { en: string; ur: string }; hallmark: { en: string; ur: string } }[] = [
  {
    id: "bs",
    lesion: { ...NONE, dcR: true, cstR: true, stR: true },
    name: { en: "Brown-Séquard (right hemisection)", ur: "Brown-Séquard (right hemisection)" },
    hallmark: {
      en: "Same side: weak + no position sense. Opposite side: no pain or temperature.",
      ur: "Usi side: kamzori + position sense ghayab. Ulti side: dard aur temperature ka ehsaas ghayab.",
    },
  },
  {
    id: "ant",
    lesion: { ...NONE, cstR: true, cstL: true, stR: true, stL: true },
    name: { en: "Anterior cord syndrome", ur: "Anterior cord syndrome" },
    hallmark: {
      en: "Both sides weak and no pain/temperature below the lesion, but position and vibration sense are kept (dorsal columns spared).",
      ur: "Lesion ke neeche dono taraf kamzori aur dard/temperature ghayab, magar position aur vibration sense bacha rehta hai (dorsal columns bachay).",
    },
  },
  {
    id: "post",
    lesion: { ...NONE, dcR: true, dcL: true },
    name: { en: "Posterior cord (dorsal column) syndrome", ur: "Posterior cord (dorsal column) syndrome" },
    hallmark: {
      en: "Strength and pain/temperature are normal, but position and vibration sense are lost on both sides: a sensory ataxia (wide-based, stamping gait, worse with eyes closed).",
      ur: "Taqat aur dard/temperature theek, magar dono taraf position aur vibration sense ghayab: sensory ataxia (chauri, patakhti chaal, aankhein band karne par bigarti hai).",
    },
  },
  {
    id: "central",
    central: true,
    lesion: { ...NONE, cstR: true, cstL: true, stR: true, stL: true },
    name: { en: "Central cord syndrome", ur: "Central cord syndrome" },
    hallmark: {
      en: "Cervical injury (often a fall with neck extension in an older person with spondylosis): ARMS weaker than LEGS, a cape-like loss of pain/temperature over the shoulders and arms, bladder problems in some.",
      ur: "Cervical injury (aksar buzurg, spondylosis wale shakhs ka gardan extend hokar girna): BAZOON mein TAANGON se zyada kamzori, kandhon aur bazoon par cape jaisa dard/temperature ka ehsaas ghayab, kuch mein bladder ka masla.",
    },
  },
  {
    id: "complete",
    lesion: { dcR: true, dcL: true, cstR: true, cstL: true, stR: true, stL: true },
    name: { en: "Complete cord lesion", ur: "Complete cord lesion" },
    hallmark: {
      en: "Everything lost below the level on both sides (no motor, no sensation, no sacral function).",
      ur: "Level ke neeche dono taraf sab kuch ghayab (na motor, na sensation, na sacral function).",
    },
  },
];

const TRACT_INFO: Record<Tract, { label: { en: string; ur: string }; carries: { en: string; ur: string }; side: { en: string; ur: string }; color: string }> = {
  dc: {
    label: { en: "Dorsal column", ur: "Dorsal column" },
    carries: { en: "position, vibration, fine touch", ur: "position, vibration, fine touch" },
    side: { en: "stays on the SAME side up to the medulla", ur: "medulla tak USI side par rehta hai" },
    color: "#a78bfa",
  },
  cst: {
    label: { en: "Lateral corticospinal tract", ur: "Lateral corticospinal tract" },
    carries: { en: "voluntary strength", ur: "iradi taqat" },
    side: { en: "crossed already in the medulla, so a cord lesion weakens the SAME side", ur: "medulla mein pehle hi cross ho chuka, is liye cord lesion USI side ko kamzor karta hai" },
    color: "#f87171",
  },
  st: {
    label: { en: "Spinothalamic tract", ur: "Spinothalamic tract" },
    carries: { en: "pain and temperature", ur: "dard aur temperature" },
    side: { en: "crosses within 1–2 segments of entering, so a lesion affects the OPPOSITE side", ur: "dakhil hone ke 1–2 segments ke andar cross karta hai, is liye lesion ULTI side ko mutasir karta hai" },
    color: "#38bdf8",
  },
};

const sameLesion = (a: Lesion, b: Lesion) => (Object.keys(a) as (keyof Lesion)[]).every((key) => a[key] === b[key]);

function TractShape({ tract, side, damaged, onToggle, lang }: { tract: Tract; side: Side; damaged: boolean; onToggle: () => void; lang: TeacherLang }) {
  // Drawn for the patient's RIGHT (viewer's left); the left side is the mirror image.
  const paths: Record<Tract, string> = {
    dc: "M118 34 Q133 22 147 34 L147 98 Q132 106 120 94 Z",
    cst: "M46 92 Q62 76 86 88 L92 132 Q66 140 48 128 Z",
    st: "M44 146 Q66 142 92 152 L94 186 Q66 198 48 180 Z",
  };
  const info = TRACT_INFO[tract];
  const name = `${lang === "ur" ? info.label.ur : info.label.en}, ${side === "R" ? t(lang, "right", "right") : t(lang, "left", "left")}`;
  return (
    <g transform={side === "L" ? "translate(300 0) scale(-1 1)" : undefined}>
      <path
        d={paths[tract]}
        fill={info.color}
        fillOpacity={damaged ? 0.25 : 0.85}
        stroke={damaged ? "#dc2626" : "#475569"}
        strokeWidth={damaged ? 2.5 : 1.2}
        strokeDasharray={damaged ? "4 3" : undefined}
        role="button"
        tabIndex={0}
        aria-pressed={damaged}
        aria-label={`${name}. ${damaged ? t(lang, "Damaged. Press to repair.", "Kharab. Theek karne ke liye dabayein.") : t(lang, "Press to damage.", "Kharab karne ke liye dabayein.")}`}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="cursor-pointer outline-none focus-visible:stroke-[#0f766e] focus-visible:[stroke-width:3]"
      />
      {damaged ? (
        <path d={tract === "dc" ? "M124 50 L142 84 M142 50 L124 84" : tract === "cst" ? "M56 100 L82 122 M82 100 L56 122" : "M56 156 L84 180 M84 156 L56 180"} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" pointerEvents="none" />
      ) : null}
    </g>
  );
}

export function CordLesionLab({ lang }: { lang: TeacherLang }) {
  const [lesion, setLesion] = useState<Lesion>(PRESETS[0].lesion);
  const [central, setCentral] = useState(false);

  const toggle = (key: keyof Lesion) => {
    setCentral(false);
    setLesion((current) => ({ ...current, [key]: !current[key] }));
  };
  const matched = PRESETS.find((preset) => sameLesion(preset.lesion, lesion) && Boolean(preset.central) === central);
  const none = sameLesion(lesion, NONE);

  const deficits = (side: Side) => {
    const opposite: Side = side === "R" ? "L" : "R";
    return {
      motor: lesion[`cst${side}` as keyof Lesion],
      position: lesion[`dc${side}` as keyof Lesion],
      pain: lesion[`st${opposite}` as keyof Lesion],
    };
  };

  const sideCard = (side: Side) => {
    const d = deficits(side);
    const any = d.motor || d.position || d.pain;
    return (
      <div className={cn("rounded-xl border p-3", any ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50")}>
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
          {side === "R" ? t(lang, "Patient's RIGHT body", "Patient ki RIGHT body") : t(lang, "Patient's LEFT body", "Patient ki LEFT body")}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {!any ? <Pill tone="green">{t(lang, "Normal", "Normal")}</Pill> : null}
          {d.motor ? <Pill tone="red">{central ? t(lang, "Weak: arms > legs", "Kamzor: bazoo > taangein") : t(lang, "Weak below the lesion (UMN signs)", "Lesion ke neeche kamzor (UMN signs)")}</Pill> : null}
          {d.position ? <Pill tone="violet">{t(lang, "No position / vibration sense", "Position / vibration sense ghayab")}</Pill> : null}
          {d.pain ? <Pill tone="sky">{central ? t(lang, "No pain/temperature: cape over arms", "Dard/temperature ghayab: bazoo par cape") : t(lang, "No pain / temperature", "Dard / temperature ghayab")}</Pill> : null}
        </div>
      </div>
    );
  };

  return (
    <WidgetFrame id="cord-lesion-lab">
      <p className="text-sm font-bold text-navy-800">{t(lang, "Tap a tract to damage it (tap again to repair), or pick a syndrome:", "Kisi tract par tap kar ke kharab karein (dobara tap se theek), ya syndrome chunein:")}</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t(lang, "Spinal cord syndromes", "Spinal cord syndromes")}>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={matched?.id === preset.id}
            onClick={() => {
              setLesion(preset.lesion);
              setCentral(Boolean(preset.central));
            }}
            className={cn("min-h-10 rounded-xl border px-3 py-1.5 text-left text-xs font-bold transition sm:text-sm", matched?.id === preset.id ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300")}
          >
            {lang === "ur" ? preset.name.ur : preset.name.en}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setLesion(NONE);
            setCentral(false);
          }}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-teal-300 sm:text-sm"
        >
          {t(lang, "Reset", "Reset")}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-start">
        <div>
          <svg viewBox="0 0 300 240" className="h-auto w-full rounded-xl bg-slate-50" role="group" aria-label={t(lang, "Cross-section of the spinal cord. Posterior is at the top.", "Spinal cord ka cross-section. Posterior upar hai.")}>
            <ellipse cx="150" cy="118" rx="118" ry="100" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            <path
              d="M150 120 C130 112 118 100 112 78 C108 64 98 58 94 64 C90 78 100 100 120 116 C104 122 82 124 70 138 C64 148 76 158 94 150 C108 144 128 134 150 134 C172 134 192 144 206 150 C224 158 236 148 230 138 C218 124 196 122 180 116 C200 100 210 78 206 64 C202 58 192 64 188 78 C182 100 170 112 150 120 Z"
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="1"
              pointerEvents="none"
            />
            {(["dc", "cst", "st"] as Tract[]).map((tract) =>
              (["R", "L"] as Side[]).map((side) => (
                <TractShape key={tract + side} tract={tract} side={side} damaged={lesion[`${tract}${side}` as keyof Lesion]} onToggle={() => toggle(`${tract}${side}` as keyof Lesion)} lang={lang} />
              )),
            )}
            <text x="14" y="124" fontSize="13" fontWeight="800" fill="#334155">R</text>
            <text x="278" y="124" fontSize="13" fontWeight="800" fill="#334155">L</text>
            <text x="150" y="14" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "Back (posterior)", "Peeche (posterior)")}</text>
            <text x="150" y="232" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "Front (anterior)", "Aage (anterior)")}</text>
          </svg>
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-slate-600">
            {(["dc", "cst", "st"] as Tract[]).map((tract) => (
              <li key={tract} className="flex items-start gap-2">
                <span className="mt-1 h-3 w-3 flex-none rounded-sm" style={{ background: TRACT_INFO[tract].color }} aria-hidden="true" />
                <span>
                  <b className="text-navy-800">{lang === "ur" ? TRACT_INFO[tract].label.ur : TRACT_INFO[tract].label.en}</b> — {lang === "ur" ? TRACT_INFO[tract].carries.ur : TRACT_INFO[tract].carries.en}; {lang === "ur" ? TRACT_INFO[tract].side.ur : TRACT_INFO[tract].side.en}.
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-2" aria-live="polite">
          {sideCard("R")}
          {sideCard("L")}
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-extrabold text-navy-800">{none ? t(lang, "No tract damaged", "Koi tract kharab nahi") : matched ? (lang === "ur" ? matched.name.ur : matched.name.en) : t(lang, "Custom pattern", "Apna pattern")}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {matched
                ? lang === "ur"
                  ? matched.hallmark.ur
                  : matched.hallmark.en
                : none
                  ? t(lang, "Every tract is intact, so the exam is normal.", "Har tract theek hai, is liye exam normal hai.")
                  : t(lang, "Read each side: strength follows the SAME side, position sense the SAME side, pain/temperature the OPPOSITE side.", "Har side parhein: taqat USI side, position sense USI side, dard/temperature ULTI side.")}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t(
                lang,
                "These findings are BELOW the lesion. At the level itself you may also find a band of lost sensation and LMN signs. The pain/temperature loss starts 1–2 segments below the lesion.",
                "Yeh findings lesion ke NEECHE hain. Level par sensation ki patti aur LMN signs bhi ho sakte hain. Dard/temperature ki kami lesion se 1–2 segments neeche se shuru hoti hai.",
              )}
            </p>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
