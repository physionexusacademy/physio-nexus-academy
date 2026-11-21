"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { t } from "../ui";
import { Pill, Seg, WidgetFrame, bi, type Bi } from "./kit";

type TerrId = "mca" | "aca" | "pca" | "med" | "lac";
type Side = "R" | "L";
type Sev = 0 | 1 | 2 | 3;
type Region = { face: Sev; arm: Sev; leg: Sev };
type Finding = { text: Bi; tone: "red" | "violet" | "sky" | "amber" | "teal"; only?: Side };

type Territory = {
  id: TerrId;
  short: Bi;
  name: Bi;
  vessel: Bi;
  motor: Region;
  sens: Region;
  findings: Finding[];
  physio: Bi[];
};

const NO: Region = { face: 0, arm: 0, leg: 0 };

const TERRITORIES: Territory[] = [
  {
    id: "mca",
    short: { en: "MCA", ur: "MCA" },
    name: { en: "Middle cerebral artery (lateral cortex)", ur: "Middle cerebral artery (lateral cortex)" },
    vessel: { en: "Largest territory: the side of the brain, internal capsule and basal ganglia.", ur: "Sab se bara territory: dimagh ki side, internal capsule aur basal ganglia." },
    motor: { face: 2, arm: 3, leg: 1 },
    sens: { face: 2, arm: 3, leg: 1 },
    findings: [
      { text: { en: "Opposite-side weakness: face and ARM worse than leg", ur: "Ulti side ki kamzori: chehra aur BAZOO, taang se zyada" }, tone: "red" },
      { text: { en: "Opposite-side sensory loss, same pattern", ur: "Ulti side sensation ki kami, wahi pattern" }, tone: "sky" },
      { text: { en: "Opposite-side visual field loss (homonymous hemianopia) and eyes drawn toward the lesion", ur: "Ulti side nazar ke field ki kami (homonymous hemianopia) aur aankhein lesion ki taraf" }, tone: "amber" },
      { text: { en: "Aphasia (speaking or understanding) and apraxia: the language hemisphere", ur: "Aphasia (bolna ya samajhna) aur apraxia: language wala hemisphere" }, tone: "violet", only: "L" },
      { text: { en: "Neglect of the opposite (left) side, poor insight, spatial problems", ur: "Ulti (left) side ko nazar-andaz karna, apni kami ka ehsaas na hona, spatial masail" }, tone: "violet", only: "R" },
    ],
    physio: [
      { en: "Protect the weak shoulder: support it, never pull on the arm.", ur: "Kamzor kandhe ko sahara dein, bazoo kabhi na kheenchein." },
      { en: "Arm and hand need early, task-specific practice.", ur: "Bazoo aur haath ko jaldi, task-specific mashq chahiye." },
      { en: "Neglect: cue from the affected side, scanning drills, place things on the neglected side step by step.", ur: "Neglect: mutasir side se cue dein, scanning drills, cheezein dheere dheere neglected side par rakhein." },
      { en: "Aphasia: short sentences, gestures, demonstrate, never assume they do not understand.", ur: "Aphasia: chhote jumlay, ishaare, demonstration; yeh na samjhein ke woh samajhte nahi." },
    ],
  },
  {
    id: "aca",
    short: { en: "ACA", ur: "ACA" },
    name: { en: "Anterior cerebral artery (medial cortex)", ur: "Anterior cerebral artery (medial cortex)" },
    vessel: { en: "The inner (medial) surface, where the leg lives on the motor map.", ur: "Andar wali (medial) surface, jahan motor map par taang rehti hai." },
    motor: { face: 0, arm: 1, leg: 3 },
    sens: { face: 0, arm: 1, leg: 3 },
    findings: [
      { text: { en: "Opposite-side weakness: LEG (and foot) worse than arm", ur: "Ulti side ki kamzori: TAANG (aur paaon) bazoo se zyada" }, tone: "red" },
      { text: { en: "Opposite-side leg sensory loss", ur: "Ulti side taang mein sensation ki kami" }, tone: "sky" },
      { text: { en: "Apathy or slowness to start (abulia), personality change", ur: "Bedili ya shuru karne mein susti (abulia), shakhsiyat mein tabdeeli" }, tone: "violet" },
      { text: { en: "Urinary incontinence; grasp reflex", ur: "Peshab ka na rukna; grasp reflex" }, tone: "amber" },
      { text: { en: "Both ACAs: severe apathy, even akinetic mutism", ur: "Dono ACA: shadeed bedili, yahan tak ke akinetic mutism" }, tone: "red" },
    ],
    physio: [
      { en: "Lower-limb work first: foot clearance, stance, gait re-education.", ur: "Pehle taang par kaam: foot clearance, stance, gait re-education." },
      { en: "The problem can be starting, not moving: use clear cues, routines, rhythm.", ur: "Masla shuru karne ka ho sakta hai, harkat ka nahi: saaf cue, routine, rhythm istemal karein." },
      { en: "Ask about bladder and pass it on; do not label it as laziness.", ur: "Bladder ke bare mein poochein aur aagay batayein; ise susti na samjhein." },
    ],
  },
  {
    id: "pca",
    short: { en: "PCA", ur: "PCA" },
    name: { en: "Posterior cerebral artery (occipital lobe and thalamus)", ur: "Posterior cerebral artery (occipital lobe aur thalamus)" },
    vessel: { en: "The back of the brain: vision, and the thalamus (the sensory relay).", ur: "Dimagh ka pichla hissa: nazar, aur thalamus (sensory relay)." },
    motor: NO,
    sens: { face: 2, arm: 2, leg: 2 },
    findings: [
      { text: { en: "Opposite-side field loss (homonymous hemianopia), often sparing the centre", ur: "Ulti side field ki kami (homonymous hemianopia), aksar markaz bach jata hai" }, tone: "amber" },
      { text: { en: "Strength is usually normal", ur: "Taqat aksar normal hoti hai" }, tone: "teal" },
      { text: { en: "If the thalamus is hit: opposite-side sensory loss and later burning (central post-stroke) pain", ur: "Thalamus mutasir ho to: ulti side sensation ki kami aur baad mein jalan wala (central post-stroke) dard" }, tone: "sky" },
      { text: { en: "Reading problems without writing problems; trouble recognising objects or faces", ur: "Parhne mein masla magar likhne mein nahi; cheezein ya chehre pehchanne mein mushkil" }, tone: "violet", only: "L" },
    ],
    physio: [
      { en: "Visual field loss is a falls risk: teach head-turning scanning to the blind side.", ur: "Field ki kami girne ka khatra hai: andhi side ki taraf sar ghuma kar scan karna sikhayein." },
      { en: "Clear the path on the blind side; do not stand where they cannot see you.", ur: "Andhi side ka raasta saaf rakhein; wahan na khaday hon jahan woh dekh na sakein." },
      { en: "Thalamic pain: explain it, graded sensory input, tell the doctor.", ur: "Thalamic dard: samjhayein, graded sensory input, doctor ko batayein." },
    ],
  },
  {
    id: "med",
    short: { en: "Lateral medulla", ur: "Lateral medulla" },
    name: { en: "Lateral medullary (Wallenberg) syndrome: PICA / vertebral artery", ur: "Lateral medullary (Wallenberg) syndrome: PICA / vertebral artery" },
    vessel: { en: "The brainstem. It crosses the rules: FACE on the lesion side, BODY on the opposite side.", ur: "Brainstem. Yahan usool badal jate hain: chehra lesion ki SAME side, jism ULTI side." },
    motor: NO,
    sens: { face: 2, arm: 2, leg: 2 },
    findings: [
      { text: { en: "Loss of pain and temperature: face on the SAME side, body on the OPPOSITE side", ur: "Dard aur temperature ki kami: chehra SAME side, jism ULTI side" }, tone: "sky" },
      { text: { en: "Horner's syndrome on the same side (small pupil, drooping lid, less sweat)", ur: "Usi side Horner's syndrome (chhoti pupil, jhukti palak, paseena kam)" }, tone: "amber" },
      { text: { en: "Vertigo, nystagmus, nausea, leaning toward the lesion side", ur: "Chakkar, nystagmus, matli, lesion ki taraf jhukna" }, tone: "violet" },
      { text: { en: "Hoarse voice and trouble swallowing; same-side limb ataxia", ur: "Awaaz bhari hona aur nigalne mein mushkil; usi side limb ataxia" }, tone: "red" },
      { text: { en: "Strength is usually NOT much weakened", ur: "Taqat aksar zyada kamzor NAHI hoti" }, tone: "teal" },
    ],
    physio: [
      { en: "Do not call it 'just vertigo': new vertigo with face or swallowing signs needs urgent medical review.", ur: "Ise 'sirf chakkar' na kahein: naye chakkar ke saath chehre ya nigalne ki alamat ho to foran doctor ko dikhayein." },
      { en: "Swallowing is the early danger: no food or drink until screened.", ur: "Nigalna pehla khatra hai: screening tak khana ya paani nahi." },
      { en: "Balance and falls work comes first; guard on the lesion side.", ur: "Balance aur falls par kaam pehle; lesion ki side se guard karein." },
      { en: "Temperature safety: the body cannot feel hot or cold on the opposite side.", ur: "Temperature safety: ulti side ka jism garmi sardi mehsoos nahi karta." },
    ],
  },
  {
    id: "lac",
    short: { en: "Lacunar", ur: "Lacunar" },
    name: { en: "Lacunar stroke (internal capsule or pons)", ur: "Lacunar stroke (internal capsule ya pons)" },
    vessel: { en: "A tiny deep vessel: one small pocket where all the fibres run close together.", ur: "Ek chhoti gehri nali: ek chhoti jagah jahan sab fibres qareeb guzarte hain." },
    motor: { face: 3, arm: 3, leg: 3 },
    sens: NO,
    findings: [
      { text: { en: "'Pure motor': face, arm AND leg equally weak on the opposite side", ur: "'Pure motor': ulti side chehra, bazoo AUR taang barabar kamzor" }, tone: "red" },
      { text: { en: "NO cortical signs: no aphasia, no neglect, no field loss", ur: "Cortical alamaat NAHI: na aphasia, na neglect, na field ki kami" }, tone: "teal" },
      { text: { en: "Other lacunar patterns: pure sensory (thalamus), ataxic hemiparesis, clumsy hand with slurred speech", ur: "Doosre lacunar patterns: pure sensory (thalamus), ataxic hemiparesis, clumsy hand ke saath lukhnat" }, tone: "violet" },
    ],
    physio: [
      { en: "Equal face-arm-leg weakness with a clear mind points deep, not cortical.", ur: "Chehra-bazoo-taang barabar kamzor aur zehn saaf ho to maamla gehra hai, cortical nahi." },
      { en: "Often responds well to intensive, repeated task practice.", ur: "Aksar shadeed, baar baar task practice se behtar hota hai." },
      { en: "Blood pressure and vascular risk work sits behind every one of these strokes.", ur: "Har stroke ke peechay blood pressure aur vascular risk ka kaam hota hai." },
    ],
  },
];

const SEV_FILL = ["#f1f5f9", "#fecdd3", "#fb7185", "#e11d48"];
const SEV_STROKE = ["#94a3b8", "#38bdf8", "#0ea5e9", "#0369a1"];

const opp = (side: Side): Side => (side === "R" ? "L" : "R");

function Body({ motor, sens, lang, lesion, medulla }: { motor: Record<Side, Region>; sens: Record<Side, Region>; lang: TeacherLang; lesion: Side; medulla: boolean }) {
  const part = (side: Side, region: keyof Region) => ({
    fill: SEV_FILL[motor[side][region]],
    stroke: SEV_STROKE[sens[side][region]],
    strokeWidth: sens[side][region] ? 3.5 : 1.2,
    strokeDasharray: sens[side][region] ? "5 3" : undefined,
  });
  // The patient's RIGHT is drawn on the viewer's LEFT.
  return (
    <svg viewBox="0 0 140 232" className="mx-auto h-auto w-full max-w-[180px]" role="img" aria-label={t(lang, "Body map: red fill is weakness, dashed blue outline is lost sensation", "Body map: laal rang kamzori, neeli dashed lakeer sensation ki kami")}>
      <path d="M70 8 A18 18 0 0 0 70 44 Z" {...part("R", "face")} />
      <path d="M70 8 A18 18 0 0 1 70 44 Z" {...part("L", "face")} />
      <rect x="48" y="48" width="44" height="70" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="22" y="52" width="20" height="80" rx="10" {...part("R", "arm")} />
      <rect x="98" y="52" width="20" height="80" rx="10" {...part("L", "arm")} />
      <rect x="48" y="122" width="20" height="98" rx="10" {...part("R", "leg")} />
      <rect x="72" y="122" width="20" height="98" rx="10" {...part("L", "leg")} />
      <text x="6" y="232" fontSize="11" fontWeight="800" fill="#334155">R</text>
      <text x="126" y="232" fontSize="11" fontWeight="800" fill="#334155">L</text>
      {medulla ? (
        <text x={lesion === "R" ? 6 : 104} y="20" fontSize="11" fontWeight="800" fill="#b45309">{t(lang, "lesion side", "lesion side")}</text>
      ) : null}
    </svg>
  );
}

function Brain({ id, side, lang }: { id: TerrId; side: Side; lang: TeacherLang }) {
  const aca = "M106 24 C90 26 80 60 84 124 L106 124 Z";
  const pca = "M106 158 C80 158 62 188 80 212 C94 226 106 226 106 226 Z";
  const mca = "M84 40 C40 50 28 110 36 160 C44 196 70 206 82 198 C74 160 80 100 84 40 Z";
  const draw = (hemi: Side) => {
    const active = hemi === side;
    const on = (terr: TerrId, color: string) => ({ fill: color, fillOpacity: active && id === terr ? 0.85 : 0.18, stroke: color, strokeWidth: active && id === terr ? 2 : 0.8 });
    return (
      <g transform={hemi === "L" ? "translate(220 0) scale(-1 1)" : undefined}>
        <path d={mca} {...on("mca", "#2563eb")} />
        <path d={aca} {...on("aca", "#16a34a")} />
        <path d={pca} {...on("pca", "#d97706")} />
        {active && id === "lac" ? <ellipse cx="90" cy="118" rx="7" ry="12" fill="#e11d48" stroke="#9f1239" strokeWidth="2" /> : null}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 220 252" className="mx-auto h-auto w-full max-w-[210px]" role="img" aria-label={t(lang, "Brain seen from above with the three cortical territories", "Upar se dekha dimagh, teen cortical territories ke saath")}>
      <ellipse cx="110" cy="124" rx="86" ry="106" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="110" y1="20" x2="110" y2="228" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
      {draw("R")}
      {draw("L")}
      <text x="10" y="132" fontSize="13" fontWeight="800" fill="#334155">R</text>
      <text x="198" y="132" fontSize="13" fontWeight="800" fill="#334155">L</text>
      <text x="110" y="12" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "Front", "Aage")}</text>
      <text x="110" y="248" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">{t(lang, "Back", "Peeche")}</text>
      {id === "med" ? (
        <g transform="translate(110 124)">
          <ellipse cx="0" cy="0" rx="38" ry="30" fill="#fff" stroke="#475569" strokeWidth="1.5" />
          <path d={side === "R" ? "M-34 -6 C-30 -22 -14 -26 -10 -20 L-10 14 C-20 22 -34 14 -34 -6 Z" : "M34 -6 C30 -22 14 -26 10 -20 L10 14 C20 22 34 14 34 -6 Z"} fill="#e11d48" fillOpacity="0.8" stroke="#9f1239" strokeWidth="2" />
          <text x="0" y="46" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155">{t(lang, "Medulla (cross-section)", "Medulla (cross-section)")}</text>
        </g>
      ) : null}
    </svg>
  );
}

export function StrokeTerritories({ lang }: { lang: TeacherLang }) {
  const [id, setId] = useState<TerrId>("mca");
  const [side, setSide] = useState<Side>("L");
  const terr = TERRITORIES.find((x) => x.id === id) ?? TERRITORIES[0];
  const contra = opp(side);

  // Cortical and deep strokes show on the opposite body. The medullary stroke is the exception: face on the same side as the lesion.
  const motor: Record<Side, Region> = { R: NO, L: NO };
  const sens: Record<Side, Region> = { R: NO, L: NO };
  motor[contra] = terr.motor;
  if (id === "med") {
    sens[contra] = { face: 0, arm: terr.sens.arm, leg: terr.sens.leg };
    sens[side] = { face: terr.sens.face, arm: 0, leg: 0 };
  } else {
    sens[contra] = terr.sens;
  }

  const findings = terr.findings.filter((finding) => !finding.only || finding.only === side);

  return (
    <WidgetFrame id="stroke-territories">
      <p className="text-sm font-bold text-navy-800">{t(lang, "Pick the blocked artery and the side of the lesion:", "Band nali aur lesion ki side chunein:")}</p>
      <div className="mt-2 grid gap-2">
        <Seg value={id} onChange={setId} label={t(lang, "Stroke territory", "Stroke territory")} options={TERRITORIES.map((x) => ({ id: x.id, label: bi(lang, x.short) }))} />
        <Seg
          value={side}
          onChange={setSide}
          label={t(lang, "Side of the lesion", "Lesion ki side")}
          options={[
            { id: "L", label: id === "med" ? t(lang, "Lesion on the LEFT", "Lesion LEFT par") : t(lang, "LEFT hemisphere", "LEFT hemisphere") },
            { id: "R", label: id === "med" ? t(lang, "Lesion on the RIGHT", "Lesion RIGHT par") : t(lang, "RIGHT hemisphere", "RIGHT hemisphere") },
          ]}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,210px)_minmax(0,180px)_1fr] sm:items-start" aria-live="polite">
        <div>
          <Brain id={id} side={side} lang={lang} />
          <p className="mt-1 text-center text-xs text-slate-500">{t(lang, "Seen from above: the patient's right is on the left of the picture.", "Upar se dekha: patient ka right tasveer ke left par.")}</p>
        </div>
        <div>
          <Body motor={motor} sens={sens} lang={lang} lesion={side} medulla={id === "med"} />
          <p className="mt-1 text-center text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-sm bg-rose-500 align-middle" /> {t(lang, "weak", "kamzor")} · <span className="inline-block h-2 w-2 rounded-sm border-2 border-dashed border-sky-500 align-middle" /> {t(lang, "numb", "sunn")}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-extrabold text-navy-800">{bi(lang, terr.name)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{bi(lang, terr.vessel)}</p>
          <p className="mt-2 text-xs font-bold text-slate-700">
            {id === "med"
              ? t(lang, `Lesion on the ${side === "R" ? "RIGHT" : "LEFT"}: face signs on the ${side === "R" ? "RIGHT" : "LEFT"}, body signs on the ${contra === "R" ? "RIGHT" : "LEFT"}.`, `Lesion ${side === "R" ? "RIGHT" : "LEFT"} par: chehre ki alamat ${side === "R" ? "RIGHT" : "LEFT"}, jism ki alamat ${contra === "R" ? "RIGHT" : "LEFT"} par.`)
              : t(lang, `${side === "R" ? "Right" : "Left"} hemisphere lesion: the ${contra === "R" ? "RIGHT" : "LEFT"} side of the body is affected.`, `${side === "R" ? "Right" : "Left"} hemisphere lesion: jism ki ${contra === "R" ? "RIGHT" : "LEFT"} side mutasir.`)}
          </p>
          <ul className="mt-2 grid gap-1.5">
            {findings.map((finding) => (
              <li key={finding.text.en} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <Pill tone={finding.tone}>●</Pill>
                <span>{bi(lang, finding.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
        <p className="text-xs font-extrabold uppercase tracking-wider text-teal-800">{t(lang, "What this means for physiotherapy", "Physiotherapy ke liye iska matlab")}</p>
        <ul className="mt-1.5 grid gap-1 text-sm leading-6 text-slate-700">
          {terr.physio.map((line) => (
            <li key={line.en}>• {bi(lang, line)}</li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs leading-5 text-rose-700">
        {t(lang, "Sudden face droop, arm weakness, speech change, loss of balance or vision = emergency, call for help at once (time is brain).", "Achanak chehra latakna, bazoo ki kamzori, bolne mein tabdeeli, balance ya nazar jana = emergency, foran madad bulayein (waqt dimagh hai).")}
      </p>
    </WidgetFrame>
  );
}
