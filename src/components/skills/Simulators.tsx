"use client";

import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Minus, Plus, RefreshCw, X } from "lucide-react";
import type { JointDemoSpec, SkillAtlasItem, SkillData, SkillLevelId } from "@/lib/skills/types";
import { levelRank } from "@/lib/skills/types";
import { recordDrillAnswer } from "@/lib/skills/progress";
import { BodyChart, type ChartMarker } from "./BodyChart";
import { JointDemo, PoseGlyph } from "./JointDemo";

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const field = (item: SkillAtlasItem, label: string) => item.fields.find((candidate) => candidate.label === label)?.value ?? "";

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={"mt-3 flex gap-2 rounded-xl border p-3 text-sm leading-6 " + (ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")} role="status">
      {ok ? <Check className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" /> : <X className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

function SimShell({ title, hint, children, onNext }: { title: string; hint: string; children: React.ReactNode; onNext: () => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-48px_rgba(10,60,90,0.6)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-navy-800">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{hint}</p>
        </div>
        <button type="button" onClick={onNext} className="nx-btn nx-btn-light !min-h-[38px] !px-3 !text-[0.82rem]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> New case
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Goniometer: drag the moving arm onto the limb, then read and judge   */
/* ------------------------------------------------------------------ */

const CX = 180;
const CY = 130;
const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (deg: number, r: number) => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))] as const;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

function normalMax(item: SkillAtlasItem): number | null {
  const match = field(item, "Normal range").match(/0\s*[–-]\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function makeGonioCase(items: SkillAtlasItem[]) {
  const item = pick(items);
  const spec = item.demo as JointDemoSpec;
  const max = Math.abs(spec.rom);
  const limited = Math.random() < 0.5;
  const target = Math.round(limited ? max * (0.3 + Math.random() * 0.4) : max * (0.93 + Math.random() * 0.07));
  return { item, spec, target, limited: target < max - 10 };
}

export function GoniometerSim({ data }: { data: SkillData }) {
  const items = useMemo(() => data.atlas.filter((item) => item.demo?.goniometer && normalMax(item)), [data]);
  const [round, setRound] = useState(() => makeGonioCase(items));
  const [arm, setArm] = useState(round.spec.from);
  const [recorded, setRecorded] = useState<number | null>(null);
  const [judged, setJudged] = useState<null | boolean>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const sign = round.spec.rom >= 0 ? 1 : -1;
  const raw = norm(sign * (arm - round.spec.from));
  // Moving the arm the wrong way reads 0 rather than wrapping around the dial.
  const reading = Math.round(raw > 200 ? 0 : raw);
  const limbAngle = round.spec.from + sign * round.target;

  const next = useCallback(() => {
    const fresh = makeGonioCase(items);
    setRound(fresh);
    setArm(fresh.spec.from);
    setRecorded(null);
    setJudged(null);
  }, [items]);

  const fromPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width) * 360 - CX;
    const y = CY - ((event.clientY - box.top) / box.height) * 260;
    setArm((Math.atan2(y, x) * 180) / Math.PI);
  };

  const [px, py] = at(round.spec.prox, 110);
  const [lx, ly] = at(limbAngle, 100);
  const [ax, ay] = at(arm, 96);
  const close = recorded !== null && Math.abs(recorded - round.target) <= 3;
  const nMax = normalMax(round.item) ?? Math.abs(round.spec.rom);

  return (
    <SimShell title="Goniometer trainer" hint="Drag the dashed moving arm onto the limb (or use the − / + buttons), record the reading, then judge it." onNext={next}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#f5fbff]">
          <svg
            ref={svgRef}
            viewBox="0 0 360 260"
            className="block h-auto w-full touch-none select-none"
            role="img"
            aria-label={`Goniometer on ${round.item.title}. Current reading ${reading} degrees.`}
            onPointerDown={(event) => {
              if (recorded !== null) return;
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              fromPointer(event);
            }}
            onPointerMove={(event) => dragging.current && recorded === null && fromPointer(event)}
            onPointerUp={() => (dragging.current = false)}
          >
            <line x1={CX} y1={CY} x2={px} y2={py} stroke="#7d93ab" strokeWidth="20" strokeLinecap="round" />
            <line x1={CX} y1={CY} x2={lx} y2={ly} stroke="#0db3aa" strokeWidth="18" strokeLinecap="round" />
            <circle cx={CX} cy={CY} r="34" fill="rgba(255,255,255,0.8)" stroke="#0a1f3d" strokeWidth="1.5" />
            {Array.from({ length: 36 }, (_, index) => {
              const angle = round.spec.from + index * 10 * sign;
              const [x1, y1] = at(angle, 28);
              const [x2, y2] = at(angle, index % 3 === 0 ? 20 : 24);
              return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0a1f3d" strokeWidth="1" />;
            })}
            <line x1={CX} y1={CY} x2={at(round.spec.prox, 104)[0]} y2={at(round.spec.prox, 104)[1]} stroke="#0a1f3d" strokeWidth="3.5" />
            <line x1={CX} y1={CY} x2={ax} y2={ay} stroke="#0a1f3d" strokeWidth="3.5" strokeDasharray="8 4" />
            <circle cx={ax} cy={ay} r="11" fill="#0a1f3d" opacity="0.12" />
            <circle cx={ax} cy={ay} r="6" fill="#0a1f3d" />
            <circle cx={CX} cy={CY} r="5" fill="#fff" stroke="#0a1f3d" strokeWidth="2.5" />
            <rect x="12" y="12" width="96" height="32" rx="10" fill="#0a1f3d" />
            <text x="60" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#2ee6d6">{reading}°</text>
            <text x={at(round.spec.prox, 128)[0]} y={at(round.spec.prox, 128)[1] + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#45607a">{round.spec.proxLabel}</text>
            <text x={at(limbAngle, 122)[0]} y={at(limbAngle, 122)[1] + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#047a85">{round.spec.distLabel}</text>
          </svg>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2">
            <span className="inline-flex items-center gap-2 text-xs text-slate-600">
              <PoseGlyph pose={round.spec.pose} className="h-7 w-8 text-navy-800" /> Axis: <strong className="text-navy-800">{round.spec.axis}</strong>
            </span>
            <span className="flex gap-1.5">
              {[-5, -1, 1, 5].map((step) => (
                <button
                  key={step}
                  type="button"
                  disabled={recorded !== null}
                  onClick={() => setArm((value) => value + step * sign)}
                  className="inline-flex min-h-[34px] min-w-[40px] items-center justify-center gap-0.5 rounded-lg border border-slate-300 px-2 text-xs font-bold text-navy-800 disabled:opacity-40"
                  aria-label={`${step > 0 ? "Increase" : "Decrease"} by ${Math.abs(step)} degrees`}
                >
                  {step > 0 ? <Plus className="h-3 w-3" aria-hidden="true" /> : <Minus className="h-3 w-3" aria-hidden="true" />}
                  {Math.abs(step)}
                </button>
              ))}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{round.item.group}</p>
          <h4 className="mt-1 text-xl font-bold text-navy-800">{round.item.title}</h4>
          <dl className="mt-3 space-y-1.5 text-sm">
            {["Position", "Stationary arm", "Moving arm"].map((label) =>
              field(round.item, label) ? (
                <div key={label}>
                  <dt className="inline font-bold text-navy-800">{label}: </dt>
                  <dd className="inline text-slate-600">{field(round.item, label)}</dd>
                </div>
              ) : null,
            )}
          </dl>
          {recorded === null ? (
            <button
              type="button"
              className="nx-btn nx-btn-primary mt-4"
              onClick={() => {
                setRecorded(reading);
                recordDrillAnswer(Math.abs(reading - round.target) <= 3);
              }}
            >
              Record {reading}°
            </button>
          ) : (
            <>
              <Feedback ok={close}>
                {close ? (
                  <>Accurate. The limb was at <strong>{round.target}°</strong>; you recorded {recorded}°.</>
                ) : (
                  <>The limb was at <strong>{round.target}°</strong>; you recorded {recorded}°. Line the moving arm up with the limb&apos;s midline landmark, not its edge.</>
                )}
              </Feedback>
              <p className="mt-4 text-sm font-bold text-navy-800">Normal range is 0–{nMax}°. Is {round.target}° within normal limits?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: "Within normal limits", value: false },
                  { label: "Limited", value: true },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    disabled={judged !== null}
                    onClick={() => {
                      setJudged(option.value);
                      recordDrillAnswer(option.value === round.limited);
                    }}
                    className={
                      "rounded-full border px-4 py-2 text-sm font-bold " +
                      (judged === null
                        ? "border-slate-300 text-navy-800 hover:border-teal-500"
                        : option.value === round.limited
                          ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                          : judged === option.value
                            ? "border-rose-300 bg-rose-50 text-rose-900"
                            : "border-slate-200 text-slate-400")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {judged !== null ? (
                <Feedback ok={judged === round.limited}>
                  {round.limited
                    ? `${round.target}° is below the expected 0–${nMax}°: document it as limited, compare with the other side and look for the cause (end-feel, pain, tissue).`
                    : `${round.target}° is within the expected range (0–${nMax}°). Small differences between textbooks and people are normal — always compare sides.`}
                </Feedback>
              ) : null}
            </>
          )}
        </div>
      </div>
    </SimShell>
  );
}

/* ------------------------------------------------------------------ */
/* Grading simulators: MMT, reflexes, spasticity (Modified Ashworth)    */
/* ------------------------------------------------------------------ */

type GradeCase = { grade: string; setup?: string; text: string; explain: string; demo?: { spec: JointDemoSpec; fraction: number; resistance: "max" | "moderate" | "minimal" | "none"; gravity?: "against" | "minimized" } };

const mmtGrades = [
  { grade: "5", fine: false, explain: "Full range against gravity and holds against maximal resistance = 5 (Normal)." },
  { grade: "4", fine: false, explain: "Full range against gravity, holds against moderate resistance but yields to maximal = 4 (Good)." },
  { grade: "3+", fine: true, explain: "Full range against gravity and holds only minimal resistance = 3+." },
  { grade: "3", fine: false, explain: "Full range against gravity with no added resistance = 3 (Fair)." },
  { grade: "3−", fine: true, explain: "More than half, but not all, of the range against gravity = 3−." },
  { grade: "2+", fine: true, explain: "Less than half of the range against gravity (or full range gravity-minimised plus slight resistance) = 2+." },
  { grade: "2", fine: false, explain: "Full range only in the gravity-minimised position = 2 (Poor)." },
  { grade: "2−", fine: true, explain: "Partial range in the gravity-minimised position = 2−." },
  { grade: "1", fine: false, explain: "A palpable or visible contraction without joint movement = 1 (Trace)." },
  { grade: "0", fine: false, explain: "No palpable contraction = 0 (Zero)." },
];

function mmtCase(items: SkillAtlasItem[], fine: boolean): GradeCase {
  const item = pick(items);
  const options = mmtGrades.filter((grade) => fine || !grade.fine);
  const chosen = pick(options);
  const p35 = field(item, "Position (grades 3–5)");
  const p02 = field(item, "Position (grades 0–2)");
  const res = field(item, "Resistance");
  const palp = field(item, "Palpate");
  const lines: Record<string, string> = {
    "5": "The patient completes the full range against gravity and holds firmly against your maximal resistance.",
    "4": "The patient completes the full range against gravity and holds against strong-to-moderate resistance, but gives way under maximal resistance.",
    "3+": "The patient completes the full range against gravity and holds only against light resistance.",
    "3": "The patient completes the full range against gravity, but the limb drops as soon as you add any resistance.",
    "3−": "The patient moves through more than half — but not all — of the range against gravity.",
    "2+": "Against gravity the patient only starts the movement — less than half of the range.",
    "2": `The patient cannot move against gravity. Repositioned with gravity minimised (${p02.replace(/\.$/, "")}), they complete the full range.`,
    "2−": `With gravity minimised (${p02.replace(/\.$/, "")}), the patient moves through only part of the range.`,
    "1": `No joint movement in any position, but you feel a flicker of contraction when palpating: ${palp}`,
    "0": `No joint movement, and nothing can be felt when palpating: ${palp}`,
  };
  const spec = item.demo;
  const demo = spec
    ? (() => {
        switch (chosen.grade) {
          case "5":
            return { spec, fraction: 1, resistance: "max" as const, gravity: "against" as const };
          case "4":
            return { spec, fraction: 1, resistance: "moderate" as const, gravity: "against" as const };
          case "3+":
            return { spec, fraction: 1, resistance: "minimal" as const, gravity: "against" as const };
          case "3":
            return { spec, fraction: 1, resistance: "none" as const, gravity: "against" as const };
          case "3−":
            return { spec, fraction: 0.7, resistance: "none" as const, gravity: "against" as const };
          case "2+":
            return { spec, fraction: 0.35, resistance: "none" as const, gravity: "against" as const };
          case "2":
            return { spec, fraction: 1, resistance: "none" as const, gravity: "minimized" as const };
          case "2−":
            return { spec, fraction: 0.45, resistance: "none" as const, gravity: "minimized" as const };
          default:
            return { spec, fraction: 0, resistance: "none" as const, gravity: "minimized" as const };
        }
      })()
    : undefined;
  return { grade: chosen.grade, setup: `${item.title} — test position: ${p35} Resistance: ${res}`, text: lines[chosen.grade], explain: chosen.explain, demo };
}

const reflexGrades = [
  { grade: "0", text: "No response, even when the patient clenches their teeth or pulls the hands apart (reinforcement).", explain: "Absent reflex = 0. Think lower motor neuron, root or peripheral nerve, or neuropathy." },
  { grade: "1+", text: "A small, slow response that only appears with reinforcement.", explain: "Diminished (trace) = 1+. Can be normal in some people — compare sides and look for other LMN signs." },
  { grade: "2+", text: "A brisk, ordinary response, equal to the other side.", explain: "Normal = 2+." },
  { grade: "3+", text: "A brisker-than-average response that spreads to nearby muscles, without clonus.", explain: "Brisk = 3+. May be normal if symmetrical; asymmetry or other UMN signs make it significant." },
  { grade: "4+", text: "A very brisk response with sustained clonus.", explain: "Hyperactive with clonus = 4+. An upper motor neuron sign — look for Babinski, Hoffmann and spasticity." },
];

const masGrades = [
  { grade: "0", text: "No increase in muscle tone through the whole range.", explain: "MAS 0 = no increase in tone." },
  { grade: "1", text: "A slight catch and release (or minimal resistance) only at the end of the range.", explain: "MAS 1 = slight increase: catch and release or minimal resistance at the end of range." },
  { grade: "1+", text: "A catch, followed by minimal resistance through the rest (less than half) of the range.", explain: "MAS 1+ = catch followed by minimal resistance through less than half of the range." },
  { grade: "2", text: "A more marked increase in tone through most of the range, but the part still moves easily.", explain: "MAS 2 = marked increase through most of the range, limb easily moved." },
  { grade: "3", text: "A considerable increase in tone — passive movement is difficult.", explain: "MAS 3 = considerable increase, passive movement difficult." },
  { grade: "4", text: "The part is rigid in flexion or extension.", explain: "MAS 4 = rigid." },
];
const masMuscles = ["elbow flexors", "wrist flexors", "finger flexors", "knee extensors", "ankle plantarflexors", "hip adductors"];
const masSpeed = "You move the limb quickly (in about one second) through its range";

export function GradeSim({ data, mode, level }: { data: SkillData; mode: "mmt" | "reflex" | "mas"; level: SkillLevelId }) {
  const fine = levelRank(level) >= 2;
  const mmtItems = useMemo(() => data.atlas.filter((item) => field(item, "Position (grades 3–5)") && field(item, "Position (grades 0–2)")), [data]);
  const reflexItems = useMemo(() => data.atlas.filter((item) => field(item, "Tap")), [data]);
  const build = useCallback((): GradeCase => {
    if (mode === "mmt") return mmtCase(mmtItems, fine);
    if (mode === "reflex") {
      const item = pick(reflexItems);
      const grade = pick(reflexGrades);
      return { grade: grade.grade, text: `${item.title} (${field(item, "Root")}): you tap ${field(item, "Tap")}. ${grade.text}`, explain: grade.explain };
    }
    const grade = pick(masGrades);
    return { grade: grade.grade, text: `${masSpeed} — testing the ${pick(masMuscles)}. ${grade.text}`, explain: grade.explain };
  }, [mode, mmtItems, reflexItems, fine]);
  const [round, setRound] = useState<GradeCase>(() => build());
  const [answer, setAnswer] = useState<string | null>(null);
  const grades = mode === "mmt" ? mmtGrades.filter((grade) => fine || !grade.fine).map((grade) => grade.grade) : mode === "reflex" ? reflexGrades.map((g) => g.grade) : masGrades.map((g) => g.grade);
  const title = mode === "mmt" ? "MMT grading simulator" : mode === "reflex" ? "Reflex grading simulator" : "Modified Ashworth simulator";
  const hint =
    mode === "mmt"
      ? fine
        ? "Advanced: includes + and − grades (Daniels & Worthingham convention)."
        : "Choose the grade (0–5). Plus/minus grades unlock at Advanced."
      : mode === "reflex"
        ? "Grade the deep tendon reflex from 0 to 4+."
        : "Grade the resistance to fast passive stretch.";

  return (
    <SimShell
      title={title}
      hint={hint}
      onNext={() => {
        setRound(build());
        setAnswer(null);
      }}
    >
      <div className={round.demo ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}>
        {round.demo ? (
          <JointDemo spec={round.demo.spec} fraction={round.demo.fraction} resistance={round.demo.resistance} gravityOverride={round.demo.gravity} />
        ) : null}
        <div>
          {round.setup ? <p className="mb-2 text-xs leading-5 text-slate-500">{round.setup}</p> : null}
          <p className="rounded-2xl bg-slate-50 p-4 text-[15px] leading-7 text-slate-700">{round.text}</p>
          <p className="mt-4 text-sm font-bold text-navy-800">What grade do you record?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                disabled={answer !== null}
                onClick={() => {
                  setAnswer(grade);
                  recordDrillAnswer(grade === round.grade);
                }}
                className={
                  "min-w-[52px] rounded-xl border px-3 py-2 text-base font-extrabold " +
                  (answer === null
                    ? "border-slate-300 text-navy-800 hover:border-teal-500 hover:bg-teal-50"
                    : grade === round.grade
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : grade === answer
                        ? "border-rose-300 bg-rose-50 text-rose-900"
                        : "border-slate-200 text-slate-400")
                }
              >
                {grade}
              </button>
            ))}
          </div>
          {answer !== null ? <Feedback ok={answer === round.grade}>{answer === round.grade ? "Correct. " : `Not quite — the grade is ${round.grade}. `}{round.explain}</Feedback> : null}
        </div>
      </div>
    </SimShell>
  );
}

/* ------------------------------------------------------------------ */
/* Body map: find and name the key sensory points                       */
/* ------------------------------------------------------------------ */

export function BodyMapSim({ data }: { data: SkillData }) {
  const points = useMemo(() => data.atlas.filter((item) => item.point), [data]);
  const [mode, setMode] = useState<"find" | "name">("find");
  const [target, setTarget] = useState(() => pick(points));
  const [tap, setTap] = useState<{ x: number; y: number } | null>(null);
  const [named, setNamed] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>(() => shuffleOptions(points, target));

  function shuffleOptions(all: SkillAtlasItem[], correct: SkillAtlasItem) {
    const others = all.filter((item) => item.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...others].sort(() => Math.random() - 0.5).map((item) => item.title);
  }
  const next = () => {
    const fresh = pick(points);
    setTarget(fresh);
    setTap(null);
    setNamed(null);
    setOptions(shuffleOptions(points, fresh));
  };
  const point = target.point!;
  const distance = tap ? Math.hypot(tap.x - point.x, tap.y - point.y) : Infinity;
  const hit = distance <= 22;

  const markers: ChartMarker[] =
    mode === "find"
      ? tap
        ? [
            { id: "tap", view: point.view, x: tap.x, y: tap.y, tone: hit ? "correct" : "wrong" },
            ...(hit ? [] : [{ id: "answer", view: point.view, x: point.x, y: point.y, tone: "correct" as const, label: target.title }]),
          ]
        : []
      : [{ id: "q", view: point.view, x: point.x, y: point.y, tone: named === null ? "active" : named === target.title ? "correct" : "wrong", label: named !== null ? target.title : undefined }];

  return (
    <SimShell title="Key sensory point trainer" hint="Find mode: tap where you would test. Name mode: say which level the highlighted point tests." onNext={next}>
      <div className="mb-3 inline-flex rounded-full border border-slate-200 p-1">
        {(["find", "name"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setTap(null);
              setNamed(null);
            }}
            className={"rounded-full px-4 py-1.5 text-sm font-bold " + (mode === value ? "bg-[#0a1f3d] text-white" : "text-slate-600")}
          >
            {value === "find" ? "Find it" : "Name it"}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <BodyChart
          view={point.view}
          markers={markers}
          onPick={
            mode === "find" && !tap
              ? (value) => {
                  setTap(value);
                  recordDrillAnswer(Math.hypot(value.x - point.x, value.y - point.y) <= 22);
                }
              : undefined
          }
          label={`Body chart, ${point.view} view. Tap to answer.`}
        />
        <div>
          {mode === "find" ? (
            <>
              <p className="text-[15px] leading-7 text-slate-700">
                Tap the key sensory point for <strong className="text-navy-800">{target.title}</strong> on the {point.view} view.
              </p>
              {tap ? (
                <Feedback ok={hit}>
                  {hit ? "Correct spot. " : "Not quite — the green point shows the key sensory point. "}
                  {field(target, "Key sensory point")}
                </Feedback>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-[15px] leading-7 text-slate-700">Which level does the highlighted key sensory point test?</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={named !== null}
                    onClick={() => {
                      setNamed(option);
                      recordDrillAnswer(option === target.title);
                    }}
                    className={
                      "rounded-xl border px-3 py-2 text-sm font-bold " +
                      (named === null ? "border-slate-300 text-navy-800 hover:border-teal-500" : option === target.title ? "border-emerald-400 bg-emerald-50 text-emerald-900" : option === named ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 text-slate-400")
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
              {named !== null ? <Feedback ok={named === target.title}>{target.title}: {field(target, "Key sensory point")}</Feedback> : null}
            </>
          )}
        </div>
      </div>
    </SimShell>
  );
}

/* ------------------------------------------------------------------ */
/* Vital signs tools                                                    */
/* ------------------------------------------------------------------ */

function NumberField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-teal-500">
        <input type="number" inputMode="numeric" value={Number.isFinite(value) ? value : ""} onChange={(event) => onChange(Number(event.target.value))} className="h-10 w-full bg-transparent text-sm text-navy-800 outline-none" />
        {suffix ? <span className="text-xs text-slate-500">{suffix}</span> : null}
      </span>
    </label>
  );
}

export function VitalsTool() {
  const [age, setAge] = useState(40);
  const [rest, setRest] = useState(72);
  const [low, setLow] = useState(50);
  const [high, setHigh] = useState(70);
  const [sbp, setSbp] = useState(128);
  const [dbp, setDbp] = useState(82);
  const [hr, setHr] = useState(84);
  const [spo2, setSpo2] = useState(97);

  const hrMax = 220 - age;
  const hrMaxTanaka = Math.round(208 - 0.7 * age);
  const reserve = hrMax - rest;
  const thr = (pct: number) => Math.round(reserve * (pct / 100) + rest);
  const map = Math.round(dbp + (sbp - dbp) / 3);

  const flags: { tone: "stop" | "caution" | "ok"; text: string }[] = [];
  if (sbp > 200 || dbp > 110) flags.push({ tone: "stop", text: "Resting BP above 200/110 mmHg — do not start exercise; recheck and refer for medical review." });
  if (sbp < 90) flags.push({ tone: "caution", text: "Systolic below 90 mmHg — check for symptoms of hypotension before exercise." });
  if (hr > 120 || hr < 40) flags.push({ tone: "stop", text: "Resting heart rate outside 40–120 bpm — do not start; assess rhythm and symptoms first." });
  else if (hr > 100) flags.push({ tone: "caution", text: "Resting tachycardia (>100 bpm) — find out why (pain, fever, anxiety, dehydration) before progressing." });
  if (spo2 < 90) flags.push({ tone: "stop", text: "SpO₂ below 90% at rest — do not start; seek medical advice." });
  else if (spo2 < 94) flags.push({ tone: "caution", text: "SpO₂ 90–93% — monitor closely; check the patient's usual baseline." });
  if (!flags.length) flags.push({ tone: "ok", text: "Within usual pre-exercise limits — proceed with monitoring (RPE, symptoms, HR/BP response)." });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-bold text-navy-800">Target heart rate (Karvonen)</h3>
        <p className="mt-0.5 text-sm text-slate-600">THR = ((HRmax − HRrest) × intensity) + HRrest</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label="Age" value={age} onChange={setAge} suffix="yrs" />
          <NumberField label="Resting HR" value={rest} onChange={setRest} suffix="bpm" />
          <NumberField label="Intensity from" value={low} onChange={setLow} suffix="%" />
          <NumberField label="Intensity to" value={high} onChange={setHigh} suffix="%" />
        </div>
        <div className="mt-4 rounded-2xl bg-[#0a1f3d] p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2ee6d6]">Training zone</p>
          <p className="mt-1 text-2xl font-extrabold">{thr(low)}–{thr(high)} bpm</p>
          <p className="mt-1 text-xs text-[#a9bfd6]">HRmax 220 − age = {hrMax} bpm (Tanaka 208 − 0.7 × age = {hrMaxTanaka}). Beta-blockers blunt HR — use RPE instead.</p>
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-bold text-navy-800">Ready to exercise? (resting check)</h3>
        <p className="mt-0.5 text-sm text-slate-600">Educational screen based on common ACSM-style thresholds — always follow your clinic&apos;s protocol.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label="Systolic BP" value={sbp} onChange={setSbp} suffix="mmHg" />
          <NumberField label="Diastolic BP" value={dbp} onChange={setDbp} suffix="mmHg" />
          <NumberField label="Heart rate" value={hr} onChange={setHr} suffix="bpm" />
          <NumberField label="SpO₂" value={spo2} onChange={setSpo2} suffix="%" />
        </div>
        <p className="mt-3 text-sm text-slate-600">Mean arterial pressure: <strong className="text-navy-800">{map} mmHg</strong> (DBP + ⅓ pulse pressure)</p>
        <ul className="mt-3 space-y-2">
          {flags.map((flag) => (
            <li key={flag.text} className={"rounded-xl border p-3 text-sm leading-6 " + (flag.tone === "stop" ? "border-rose-200 bg-rose-50 text-rose-900" : flag.tone === "caution" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900")}>
              {flag.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
