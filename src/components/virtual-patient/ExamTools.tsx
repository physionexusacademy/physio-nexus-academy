"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { NERVE_LABEL } from "@/lib/virtual-patient/anatomy";
import type { PatientPosition, PickResult, Side } from "@/lib/virtual-patient/engine";
import {
  HEALTHY_VITALS, MOTIONS, MUSCLE_TESTS, REFLEXES, REFLEX_AMPLITUDE, SPECIAL_TESTS, TAPE,
  reflexFor, romFor, sensationFor, signFor, specialFor, strengthFor, tapeFor, tenderFor,
  type MotionId, type MuscleTestId, type ReflexId, type SpecialTestId, type TapeId,
} from "@/lib/virtual-patient/exam";
import { useExam } from "./ExamContext";

export type ToolId = "look" | "palpate" | "sensation" | "rom" | "mmt" | "reflex" | "special" | "tape";
export type PickHandler = ((pick: PickResult | null) => void) | null;

const SIDES: Side[] = ["left", "right"];
const other = (side: Side): Side => (side === "left" ? "right" : "left");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const title = (text: string) => text.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const LANDMARK_NAMES: Record<string, string> = {
  "suprasternal-notch": "Suprasternal notch", "sternal-angle": "Sternal angle", xiphoid: "Xiphoid process", umbilicus: "Umbilicus",
  "ac-joint": "AC joint", coracoid: "Coracoid process", "medial-epicondyle": "Medial epicondyle", "lateral-epicondyle": "Lateral epicondyle",
  olecranon: "Olecranon", "radial-styloid": "Radial styloid", c7: "C7 spinous process", "scapular-spine": "Spine of the scapula",
  "inferior-angle": "Inferior angle of the scapula", "iliac-crest": "Iliac crest", psis: "PSIS", asis: "ASIS", "femoral-pulse": "Femoral pulse",
  "greater-trochanter": "Greater trochanter", "ischial-tuberosity": "Ischial tuberosity", patella: "Patella", "tibial-tuberosity": "Tibial tuberosity",
  "popliteal-fossa": "Popliteal fossa", "fibular-head": "Head of the fibula", "medial-malleolus": "Medial malleolus",
  "lateral-malleolus": "Lateral malleolus", "dorsalis-pedis": "Dorsalis pedis pulse", calcaneus: "Calcaneus",
};

function SidePicker({ side, onChange, disabled }: { side: Side; onChange: (side: Side) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 p-0.5">
      {SIDES.map((s) => (
        <button key={s} type="button" disabled={disabled} onClick={() => onChange(s)} aria-pressed={side === s} className={"rounded-full px-3 py-1 text-xs font-bold " + (side === s ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
          {s === "left" ? "Left" : "Right"}
        </button>
      ))}
    </div>
  );
}
function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; group?: string }[]; label: string }) {
  const groups = [...new Set(options.map((o) => o.group ?? ""))];
  return (
    <label className="block">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy-800">
        {groups.map((g) =>
          g ? (
            <optgroup key={g} label={g}>
              {options.filter((o) => o.group === g).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </optgroup>
          ) : (
            options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)
          ),
        )}
      </select>
    </label>
  );
}
function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" | "good" }) {
  const cls = { info: "bg-slate-50 text-slate-700", warn: "bg-amber-50 text-amber-900", good: "bg-emerald-50 text-emerald-900" }[tone];
  return <p className={"mt-3 rounded-2xl p-3 text-[13px] leading-6 " + cls}>{children}</p>;
}
function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={(primary ? "bg-[#0a1f3d] text-white hover:bg-[#123a63]" : "border border-slate-300 bg-white text-navy-800 hover:border-teal-500") + " rounded-xl px-3 py-2 text-[13px] font-bold disabled:opacity-40"}>
      {children}
    </button>
  );
}

/** Moves the patient to a position if he isn't already there. */
function usePositioner() {
  const { room } = useExam();
  return async (position: PatientPosition, down?: Side) => {
    const needsMove = room.getPosition() !== position || (position === "sidelying" && down && room.downSide !== down);
    if (!needsMove) return false;
    room.setPosition(position, true, down ? { down } : {});
    await wait(650);
    return true;
  };
}

/* ------------------------------------------------------------------ */

function LookTool() {
  const { caseData, log, mode } = useExam();
  const vitals = caseData.findings.vitals ?? HEALTHY_VITALS;
  const [shown, setShown] = useState(false);
  return (
    <div>
      <p className="text-sm leading-6 text-slate-700">{caseData.findings.observation ?? "He looks comfortable at rest. No obvious swelling, wasting or deformity."}</p>
      <div className="mt-3">
        <Btn primary onClick={() => { setShown(true); log({ kind: "vitals" }); }}>Take vital signs</Btn>
      </div>
      {shown ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[["Heart rate", `${vitals.hr} bpm`], ["Blood pressure", `${vitals.bp} mmHg`], ["Resp. rate", `${vitals.rr} /min`], ["SpO₂", `${vitals.spo2}%`], ["Temperature", `${vitals.temp} °C`]].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[#0a1f3d] p-3 text-white">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7fe8de]">{label}</dt>
              <dd className="mt-0.5 text-base font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {mode === "guided" ? <Note>Look first: posture, gait, swelling, wasting, colour. Then check vital signs before any exercise testing.</Note> : null}
    </div>
  );
}

function PalpateTool({ registerPick }: { registerPick: (h: PickHandler) => void }) {
  const { caseData, log, say, mode, room } = useExam();
  const [last, setLast] = useState<{ name: string; tender: string | null } | null>(null);
  useEffect(() => {
    registerPick((pick) => {
      if (!pick) return;
      const landmark = pick.landmark?.id ?? null;
      const tender = tenderFor(caseData.findings, pick.side, landmark, pick.region);
      const name = landmark ? LANDMARK_NAMES[landmark] ?? title(landmark) : pick.region;
      const hurts = Boolean(tender && !/not tender/i.test(tender));
      room.addMarker(pick, hurts ? "#e5484d" : "#2ee6d6");
      setLast({ name: `${name} (${pick.side})`, tender });
      if (hurts) say(tender!.startsWith("“") ? tender!.replace(/[“”]/g, "") : "Ouch — that's sore.");
      log({ kind: "palpate", side: pick.side, landmark, region: pick.region, tender: hurts });
    });
    return () => registerPick(null);
  }, [caseData, log, say, registerPick, room]);
  return (
    <div>
      <p className="text-sm leading-6 text-slate-700">Tap the body to palpate. Compare both sides.</p>
      {last ? (
        <Note tone={last.tender && !/not tender/i.test(last.tender) ? "warn" : "info"}>
          <strong>{mode === "guided" ? last.name : "You palpate here."}</strong> {last.tender ?? "Not tender. Normal texture and temperature."}
        </Note>
      ) : null}
      <div className="mt-3"><Btn onClick={() => room.clearMarkers()}>Clear marks</Btn></div>
    </div>
  );
}

const SENSE_TEXT = {
  normal: ["Yes — feels normal.", "Haan, bilkul theek mehsoos hua."],
  reduced: ["I feel it, but less than the other side.", "Mehsoos hota hai, magar doosri taraf se kam."],
  absent: ["I can't feel that at all.", "Wahan kuch mehsoos nahi hua."],
  tingling: ["It feels tingly — pins and needles.", "Jhunjhunahat si hoti hai."],
} as const;
const SENSE_COLOR = { normal: "#16a34a", reduced: "#f59e0b", absent: "#e5484d", tingling: "#a855f7" } as const;

function SensationTool({ registerPick }: { registerPick: (h: PickHandler) => void }) {
  const { caseData, log, say, mode, lang, room } = useExam();
  const [modality, setModality] = useState<"touch" | "pin">("touch");
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => {
    registerPick((pick) => {
      if (!pick) return;
      if (pick.covered) {
        setLast("Under the shorts — not tested in this simulator.");
        return;
      }
      const response = sensationFor(caseData.findings, pick);
      room.addMarker(pick, SENSE_COLOR[response]);
      say(SENSE_TEXT[response][lang === "ur" ? 1 : 0]);
      const map = [pick.dermatome ? `Dermatome ${pick.dermatome}` : pick.nerve === "trigeminal" ? "Trigeminal nerve" : null, pick.nerve && pick.nerve !== "trigeminal" ? NERVE_LABEL[pick.nerve] : null].filter(Boolean).join(" · ");
      setLast(`${pick.region} (${pick.side}): ${response}${mode === "guided" && map ? ` — ${map}` : ""}`);
      log({ kind: "sensation", side: pick.side, dermatome: pick.dermatome, nerve: pick.nerve, region: pick.region, response });
    });
    return () => registerPick(null);
  }, [caseData, log, say, registerPick, room, mode, lang]);
  return (
    <div>
      <div className="inline-flex rounded-full border border-slate-200 p-0.5">
        {([["touch", "Light touch"], ["pin", "Pinprick"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setModality(id)} className={"rounded-full px-3 py-1 text-xs font-bold " + (modality === id ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>{label}</button>
        ))}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">His eyes are closed. Tap the skin to test, then the same point on the other side. Green = normal, amber = reduced, red = absent, purple = tingling.</p>
      {last ? <Note>{last}</Note> : null}
      <div className="mt-3"><Btn onClick={() => room.clearMarkers()}>Clear marks</Btn></div>
    </div>
  );
}

function RomTool() {
  const { room, caseData, log, say, setOverlay, mode } = useExam();
  const position = usePositioner();
  const [motionId, setMotionId] = useState<MotionId>("knee-flexion");
  const [side, setSide] = useState<Side>("left");
  const [angle, setAngle] = useState(0);
  const [endNote, setEndNote] = useState<string | null>(null);
  const [kind, setKind] = useState<"active" | "passive">("active");
  const [value, setValue] = useState("");
  const def = MOTIONS.find((m) => m.id === motionId)!;
  const truth = romFor(caseData.findings, motionId, side);

  useEffect(() => {
    let live = true;
    (async () => {
      await position(def.position);
      if (!live) return;
      room.setPose(def.pose(side, 0), { replace: true, duration: 500 });
      setAngle(0);
      setEndNote(null);
      setOverlay((o) => ({ ...o, gonio: { ...def.gonio, side, motion: def.id } }));
      room.frameCamera(true, room.boneWorld(def.gonio.axis, side), 1.75);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionId, side]);
  useEffect(() => () => setOverlay((o) => ({ ...o, gonio: undefined })), [setOverlay]);

  const active = async () => {
    setKind("active");
    log({ kind: "rom", motion: motionId, side, truth: truth.active });
    say(truth.active < def.normal - 5 ? (truth.pain ? `${truth.pain}. That's as far as I can go.` : "That's as far as I can go.") : "Like this?");
    await room.setPose(def.pose(side, truth.active), { replace: true, duration: 1100 });
    setAngle(truth.active);
  };
  const passive = (next: number) => {
    setKind("passive");
    const limited = Math.min(next, truth.passive);
    room.setPose(def.pose(side, limited), { replace: true, animate: false });
    setAngle(limited);
    if (next >= truth.passive) {
      setEndNote(`End of range: ${truth.endFeel}.${truth.pain ? ` ${truth.pain}.` : ""}`);
      if (truth.pain) say("Ah — that hurts.");
    } else setEndNote(null);
  };
  const record = () => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    log({ kind: "rom", motion: motionId, side, truth: kind === "active" ? truth.active : truth.passive, recorded: n });
    setValue("");
  };

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Motion" value={motionId} onChange={setMotionId} options={MOTIONS.map((m) => ({ id: m.id, label: `${m.label} (normal ${m.normal}°)`, group: title(m.joint) }))} />
        <SidePicker side={side} onChange={setSide} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Position: {def.position}. Axis, stationary and moving arms are shown on the joint.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn primary onClick={active}>Ask him to move (active)</Btn>
      </div>
      <label className="mt-3 block">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Move passively — {Math.round(angle)}°</span>
        <input type="range" min={0} max={Math.max(def.normal, truth.passive) + 15} value={angle} onChange={(e) => passive(Number(e.target.value))} className="mt-1 w-full accent-teal-600" aria-label="Passive range" />
      </label>
      {endNote ? <Note tone="warn">{endNote}</Note> : null}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Record {kind} ROM (°)</span>
          <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9-]/g, ""))} className="mt-1 w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. 120" />
        </label>
        <Btn onClick={record} disabled={!value}>Record</Btn>
      </div>
      {mode === "guided" ? <Note>Normal {def.label.toLowerCase()}: 0–{def.normal}°. Compare active with passive — a big gap points to weakness or pain, not stiffness.</Note> : null}
    </div>
  );
}

function MmtTool() {
  const { room, caseData, log, say, setOverlay, mode } = useExam();
  const position = usePositioner();
  const [testId, setTestId] = useState<MuscleTestId>("knee-ext");
  const [side, setSide] = useState<Side>("left");
  const [stage, setStage] = useState<"rest" | "lifted" | "done">("rest");
  const [result, setResult] = useState<string | null>(null);
  const busy = useRef(false);
  const def = MUSCLE_TESTS.find((t) => t.id === testId)!;
  const grade = strengthFor(caseData.findings, testId, side);
  const note = caseData.findings.strengthNote?.[`${testId}.${side}`];
  const pain = caseData.findings.painOnResistance?.[`${testId}.${side}`];

  useEffect(() => {
    let live = true;
    (async () => {
      await position(def.position, def.down === "other" ? other(side) : undefined);
      if (!live) return;
      room.setPose(def.rest(side), { replace: true, duration: 500 });
      setStage("rest");
      setResult(null);
      room.frameCamera(true, room.boneWorld(def.push.bone, side), 1.7);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, side]);
  useEffect(() => () => setOverlay((o) => ({ ...o, push: undefined })), [setOverlay]);

  const lift = async () => {
    if (busy.current) return;
    busy.current = true;
    log({ kind: "mmt", test: testId, side, truth: grade });
    if (grade >= 3) {
      await room.setPose(def.hold(side), { replace: true, duration: 900 });
      setStage("lifted");
      setResult(`He moves through the full range against gravity.${note ? ` ${note}` : ""}`);
    } else if (grade === 2) {
      await room.setPose(def.give(side, 0.65), { replace: true, duration: 900 });
      await room.setPose(def.rest(side), { replace: true, duration: 700 });
      say("I can't lift it all the way.");
      setResult(`He can't complete the range against gravity.${note ? ` ${note}` : ""} Try gravity-minimised.`);
    } else {
      say("I'm trying…");
      setResult(grade === 1 ? "No movement — you feel a flicker of contraction in the muscle." : "No movement and no contraction.");
    }
    busy.current = false;
  };
  const resist = async () => {
    if (busy.current || stage !== "lifted") return;
    busy.current = true;
    setOverlay((o) => ({ ...o, push: { bone: def.push.bone, side, text: def.push.text } }));
    await wait(700);
    if (grade >= 5) {
      await room.setPose(def.give(side, 0.04), { replace: true, duration: 300 });
      await room.setPose(def.hold(side), { replace: true, duration: 300 });
      setResult(`You push ${def.push.text} — he holds firmly against maximal resistance.${pain ? ` ${pain}` : ""}`);
    } else if (grade >= 4) {
      await room.setPose(def.give(side, 0.22), { replace: true, duration: 700 });
      setResult(`Against strong pressure he gives way a little, then holds against moderate resistance.${pain ? ` ${pain}` : ""}`);
    } else {
      await room.setPose(def.give(side, 1), { replace: true, duration: 500 });
      say("I can't hold it.");
      setResult(`As soon as you push, the limb drops — he can't hold against resistance.${pain ? ` ${pain}` : ""}`);
    }
    if (pain) say("Ow — that hurts.");
    setOverlay((o) => ({ ...o, push: undefined }));
    setStage("done");
    busy.current = false;
  };
  const gravityMinimised = () =>
    setResult(grade >= 3 ? "Full range easily with gravity minimised (test against gravity instead)." : grade === 2 ? "With gravity minimised he moves through the full range." : grade === 1 ? "Flicker of contraction only — no movement." : "No contraction felt.");
  const record = (g: number) => log({ kind: "mmt", test: testId, side, truth: grade, recorded: g });

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Muscle test" value={testId} onChange={setTestId} options={MUSCLE_TESTS.map((t) => ({ id: t.id, label: `${t.label} — ${t.root}` }))} />
        <SidePicker side={side} onChange={setSide} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{def.muscles} · {def.nerve} nerve · tested {def.position === "sidelying" ? "side-lying" : def.position}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn primary onClick={lift}>Ask him to move against gravity</Btn>
        <Btn onClick={resist} disabled={stage !== "lifted"}>Apply resistance</Btn>
        <Btn onClick={gravityMinimised}>Gravity-minimised</Btn>
      </div>
      {result ? <Note tone="info">{result}</Note> : null}
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Record grade (Oxford 0–5)</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((g) => (
          <button key={g} type="button" onClick={() => record(g)} className="min-w-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-extrabold text-navy-800 hover:border-teal-500">{g}</button>
        ))}
      </div>
      {mode === "guided" ? <Note>5 holds maximal resistance · 4 gives under strong resistance · 3 full range against gravity only · 2 full range gravity-minimised · 1 flicker · 0 nothing.</Note> : null}
    </div>
  );
}

function ReflexTool() {
  const { room, caseData, log, setOverlay, mode } = useExam();
  const position = usePositioner();
  const [reflexId, setReflexId] = useState<ReflexId>("patellar");
  const [side, setSide] = useState<Side>("left");
  const [reinforce, setReinforce] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const busy = useRef(false);
  const def = REFLEXES.find((r) => r.id === reflexId)!;

  useEffect(() => {
    let live = true;
    (async () => {
      await position(def.position);
      if (!live) return;
      room.setPose(def.base(side), { replace: true, duration: 450 });
      setResult(null);
      const at = def.target.landmark ? room.landmarkWorld(def.target.landmark, side) : room.boneWorld(def.target.bone ?? def.target.between?.[0] ?? "foot", side);
      room.frameCamera(true, at, 1.35);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reflexId, side]);
  useEffect(() => () => setOverlay((o) => ({ ...o, hammer: undefined })), [setOverlay]);

  const targetPoint = () => {
    if (reflexId === "patellar") return room.landmarkWorld("patella", side).lerp(room.landmarkWorld("tibial-tuberosity", side), 0.55);
    if (def.target.landmark) return room.landmarkWorld(def.target.landmark, side);
    if (def.target.between) return room.boneWorld(def.target.between[0], side).lerp(room.boneWorld(def.target.between[1], side), 0.7);
    return room.boneWorld(def.target.bone!, side);
  };
  const tap = async () => {
    if (busy.current) return;
    busy.current = true;
    log({ kind: "reflex", reflex: reflexId, side, truth: def.kind === "dtr" ? reflexFor(caseData.findings, reflexId as "patellar", side) : signFor(caseData.findings, reflexId as "babinski", side) ? "present" : "absent" });
    setOverlay((o) => ({ ...o, hammer: { at: targetPoint, key: Date.now() } }));
    await wait(260);
    const base = def.base(side);
    if (def.kind === "dtr") {
      const grade = reflexFor(caseData.findings, reflexId as "patellar", side);
      let amp = REFLEX_AMPLITUDE[grade];
      if (grade === "1+" && reinforce) amp = 0.4;
      if (grade === "0" && reinforce) amp = 0;
      const beats = grade === "4+" ? 4 : 1;
      for (let i = 0; i < beats; i++) {
        if (amp > 0) {
          await room.setPose({ ...base, ...def.jerk(side, i === 0 ? amp : amp * 0.45) }, { duration: 110 });
          await room.setPose({ ...base, ...def.jerk(side, 0) }, { duration: 240 });
        }
      }
      setResult(
        amp === 0 ? "No visible response." : grade === "1+" ? (reinforce ? "A small response appears with reinforcement." : "A very small, slow response.") : grade === "2+" ? "A brisk, normal response." : grade === "3+" ? "A very brisk response that spreads to neighbouring muscles." : "Very brisk, with repeated beats (clonus).",
      );
    } else {
      const present = signFor(caseData.findings, reflexId as "babinski", side);
      if (reflexId === "clonus") {
        const beats = present ? 6 : 1;
        for (let i = 0; i < beats; i++) {
          await room.setPose({ ...base, ...def.jerk(side, 1) }, { duration: 120 });
          await room.setPose({ ...base, ...def.jerk(side, 0.2) }, { duration: 120 });
        }
        await room.setPose(base, { duration: 200 });
        setResult(present ? "Sustained rhythmic beats of the ankle (more than 3) — sustained clonus." : "One or two beats, then it stops — no sustained clonus.");
      } else {
        await room.setPose({ ...base, ...def.jerk(side, present ? 1 : 0) }, { duration: 260 });
        await wait(700);
        await room.setPose(base, { duration: 300 });
        setResult(reflexId === "babinski" ? (present ? "The big toe extends upwards and the other toes fan." : "The toes curl downwards (flexor response).") : present ? "The thumb flexes — positive." : "No thumb movement — negative.");
      }
    }
    setOverlay((o) => ({ ...o, hammer: undefined }));
    busy.current = false;
  };
  const record = (value: string) => {
    const truth = def.kind === "dtr" ? reflexFor(caseData.findings, reflexId as "patellar", side) : signFor(caseData.findings, reflexId as "babinski", side) ? "present" : "absent";
    log({ kind: "reflex", reflex: reflexId, side, truth, recorded: value });
  };

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Reflex or sign" value={reflexId} onChange={setReflexId} options={REFLEXES.map((r) => ({ id: r.id, label: `${r.label} — ${r.root}`, group: r.kind === "dtr" ? "Deep tendon reflexes" : "UMN signs" }))} />
        <SidePicker side={side} onChange={setSide} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{def.how}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Btn primary onClick={tap}>{def.kind === "dtr" ? "Tap the tendon" : "Perform"}</Btn>
        {def.kind === "dtr" ? (
          <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            <input type="checkbox" checked={reinforce} onChange={(e) => setReinforce(e.target.checked)} className="accent-teal-600" /> Reinforcement (Jendrassik)
          </label>
        ) : null}
      </div>
      {result ? <Note>{result}</Note> : null}
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Record</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {(def.kind === "dtr" ? ["0", "1+", "2+", "3+", "4+"] : ["present", "absent"]).map((g) => (
          <button key={g} type="button" onClick={() => record(g)} className="min-w-[42px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-extrabold text-navy-800 hover:border-teal-500">
            {g === "present" ? (reflexId === "babinski" ? "Upgoing (present)" : "Present") : g === "absent" ? (reflexId === "babinski" ? "Downgoing (absent)" : "Absent") : g}
          </button>
        ))}
      </div>
      {mode === "guided" ? <Note>Grades: 0 absent · 1+ reduced · 2+ normal · 3+ brisk · 4+ with clonus. Always compare sides and use reinforcement before calling a reflex absent.</Note> : null}
    </div>
  );
}

function SpecialTool() {
  const { room, caseData, log, say, mode } = useExam();
  const position = usePositioner();
  const [testId, setTestId] = useState<SpecialTestId>("slr");
  const [side, setSide] = useState<Side>("left");
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const def = SPECIAL_TESTS.find((t) => t.id === testId)!;
  const bilateral = def.bilateral === false;

  useEffect(() => {
    setResult(null);
    setDone(false);
  }, [testId, side]);

  const perform = async () => {
    if (busy.current) return;
    busy.current = true;
    setResult(null);
    await position(def.position);
    for (const pose of def.sequence(side)) await room.setPose(pose, { replace: true, duration: 900 });
    const outcome = specialFor(caseData.findings, testId, side);
    log({ kind: "special", test: testId, side, positive: outcome.positive });
    if (testId === "romberg") {
      say("Eyes closed…");
      for (let i = 0; i < (outcome.positive ? 4 : 1); i++) {
        await room.setPose({ trunk: { abd: outcome.positive ? 6 : 1 } }, { replace: true, duration: 450 });
        await room.setPose({ trunk: { abd: outcome.positive ? -6 : -1 } }, { replace: true, duration: 450 });
      }
      await room.setPose({}, { replace: true, duration: 300 });
    }
    const quote = /“([^”]+)”/.exec(outcome.text)?.[1];
    if (quote) say(quote);
    else if (outcome.positive) say("That brings on my symptoms.");
    const text = mode === "osce" ? outcome.text.replace(/\s*(Positive|Negative)( \(right\))?\.?$/i, "") : outcome.text;
    setResult(text);
    setDone(true);
    busy.current = false;
  };
  const record = (positive: boolean) => log({ kind: "special", test: testId, side, positive: specialFor(caseData.findings, testId, side).positive, recorded: positive });

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Special test" value={testId} onChange={setTestId} options={SPECIAL_TESTS.map((t) => ({ id: t.id, label: t.label }))} />
        {bilateral ? <span className="text-xs font-semibold text-slate-500">Both sides</span> : <SidePicker side={side} onChange={setSide} />}
      </div>
      <p className="mt-2 text-xs text-slate-500">{def.purpose} · {def.position}.</p>
      <div className="mt-3"><Btn primary onClick={perform}>Perform the test</Btn></div>
      {result ? <Note tone="info">{result}</Note> : null}
      {done ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => record(true)}>Record positive</Btn>
          <Btn onClick={() => record(false)}>Record negative</Btn>
        </div>
      ) : null}
    </div>
  );
}

function TapeTool() {
  const { room, caseData, log, setOverlay } = useExam();
  const position = usePositioner();
  const [tapeId, setTapeId] = useState<TapeId>("true-leg-length");
  const [side, setSide] = useState<Side>("left");
  const def = TAPE.find((t) => t.id === tapeId)!;
  const measure = async () => {
    await position(def.position);
    room.setPose({}, { replace: true, animate: false });
    const value = tapeFor(caseData.findings, tapeId, side);
    const hip = room.boneWorld("upperleg01", side), knee = room.boneWorld("lowerleg01", side), ankle = room.boneWorld("foot", side);
    let at: () => THREE.Vector3;
    if (tapeId === "true-leg-length" || tapeId === "apparent-leg-length") {
      const from = tapeId === "true-leg-length" ? room.landmarkWorld("asis", side) : room.landmarkWorld("umbilicus", "mid");
      const to = room.landmarkWorld("medial-malleolus", side);
      room.showTape(from, to);
      at = () => from.clone().lerp(to, 0.5);
    } else {
      const centre = tapeId === "thigh-girth" ? knee.clone().lerp(hip, 0.3) : tapeId === "knee-girth" ? knee.clone() : knee.clone().lerp(ankle, 0.28);
      const axis = tapeId === "calf-girth" ? ankle.clone().sub(knee) : hip.clone().sub(knee);
      room.showRing(centre, axis, value / 100 / (2 * Math.PI));
      at = () => centre.clone();
    }
    room.frameCamera(true, at(), 1.8);
    setOverlay((o) => ({ ...o, tape: { at, text: `${value} cm` } }));
    log({ kind: "tape", tape: tapeId, side, value });
  };
  useEffect(() => () => {
    room.clearTape();
    setOverlay((o) => ({ ...o, tape: undefined }));
  }, [room, setOverlay]);
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Measurement" value={tapeId} onChange={setTapeId} options={TAPE.map((t) => ({ id: t.id, label: t.label }))} />
        <SidePicker side={side} onChange={setSide} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{def.how}. Measure both sides and compare.</p>
      <div className="mt-3"><Btn primary onClick={measure}>Measure</Btn></div>
    </div>
  );
}

export const TOOLS: { id: ToolId; label: string }[] = [
  { id: "look", label: "Look & vitals" },
  { id: "palpate", label: "Palpate" },
  { id: "rom", label: "Goniometer (ROM)" },
  { id: "mmt", label: "Muscle test (MMT)" },
  { id: "reflex", label: "Reflexes" },
  { id: "sensation", label: "Sensation" },
  { id: "special", label: "Special tests" },
  { id: "tape", label: "Tape measure" },
];

export function ToolPanel({ tool, registerPick }: { tool: ToolId; registerPick: (h: PickHandler) => void }) {
  const panel = useMemo(() => {
    switch (tool) {
      case "look": return <LookTool />;
      case "palpate": return <PalpateTool registerPick={registerPick} />;
      case "sensation": return <SensationTool registerPick={registerPick} />;
      case "rom": return <RomTool />;
      case "mmt": return <MmtTool />;
      case "reflex": return <ReflexTool />;
      case "special": return <SpecialTool />;
      case "tape": return <TapeTool />;
    }
  }, [tool, registerPick]);
  return <div key={tool}>{panel}</div>;
}
