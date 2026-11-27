"use client";

/**
 * The Treatment stage of the Virtual Patient: the student chooses what to do for this patient and the PNA Teacher performs it in the
 * PNA clinic — manual therapy, TENS / IFT / ultrasound / NMES, a hot or ice pack, education or an urgent referral — then the patient
 * does the home exercises (the RehabVerse 3D movements) while he coaches. Unsafe choices are stopped with the reason. The section is
 * complete when this case's treatments and at least two of its exercises are done.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Dumbbell, Flame, Hand, Loader2, MessageCircle, Play, ShieldAlert, Siren, SkipForward, Snowflake, Square, Volume2, VolumeX, Zap } from "lucide-react";
import type { ExamRoom, Side } from "@/lib/virtual-patient/engine";
import type { VirtualCase } from "@/lib/virtual-patient/cases";
import { AREAS, PLANS, exerciseCoach, exerciseVerdict, exercisesNeeded, offeredTreatments, scoreTreatment, treatmentComplete, treatmentShow, verdict, type Bi, type TreatScore, type Treatment, type TreatShow } from "@/lib/virtual-patient/treatments";
import type { ExerciseDef, Region } from "@/lib/rehabverse/types";
import type { StageView, TeachingStage } from "@/lib/avatar/stage";
import type { PnaTeacher } from "@/lib/avatar/teacher";
import type { TreatProps } from "@/lib/virtual-patient/treatment-props";
import type { Rig } from "@/components/rehabverse/ExercisePlayer";
import { unlockAudio } from "@/lib/speech/voices";
import { useVoice } from "@/lib/speech/preference";
import type { Lang } from "./ExamContext";

const REGIONS_FOR: Record<string, Region[]> = {
  "Lumbar spine": ["lumbar"], "Cervical spine": ["cervical", "thoracic"], Shoulder: ["shoulder"], Knee: ["knee"], Hip: ["hip"], Ankle: ["ankle_foot"],
  "Wrist and hand": ["elbow_hand"], "Wrist & hand": ["elbow_hand"], "Elbow & hand": ["elbow_hand"], "Lower limb nerves": ["ankle_foot", "knee"], Neurology: ["knee", "ankle_foot"], Chest: [],
};
const GROUPS: { id: Treatment["group"]; label: string; icon: typeof Hand }[] = [
  { id: "manual", label: "Manual therapy", icon: Hand },
  { id: "electro", label: "Electrotherapy", icon: Zap },
  { id: "thermal", label: "Heat and cold", icon: Flame },
  { id: "education", label: "Education", icon: MessageCircle },
  { id: "refer", label: "Referral", icon: Siren },
];
const VERDICT: Record<string, { text: string; cls: string }> = {
  best: { text: "Right for this patient", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ok: { text: "Reasonable addition", cls: "bg-sky-50 text-sky-800 border-sky-200" },
  unneeded: { text: "Not indicated here", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  avoid: { text: "Unsafe — stopped", cls: "bg-rose-50 text-rose-800 border-rose-200" },
};

type Running = { id: string; title: string; kind: "treat" | "exercise" };
export type TreatResult = TreatScore & { done: string[]; exercises: string[]; refused: string[] };

const pick = (b: Bi, lang: Lang) => (lang === "ur" ? b.ur : b.en);
const fromRv = (b: { en: string; ru: string }): Bi => ({ en: b.en, ur: b.ru });

export function TreatPanel({ room, caseData, lang, onCaption, onFinish }: { room: ExamRoom; caseData: VirtualCase; lang: Lang; onCaption: (text: string | null, timer?: string | null) => void; onFinish: (result: TreatResult) => void }) {
  const plan = PLANS[caseData.id];
  const { voice, setVoice } = useVoice();
  const [teacherReady, setTeacherReady] = useState(false);
  const [teacherFailed, setTeacherFailed] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [exDone, setExDone] = useState<string[]>([]);
  const [refused, setRefused] = useState<string[]>([]);
  const [running, setRunning] = useState<Running | null>(null);
  const [step, setStep] = useState<{ chip: string; index: number; total: number } | null>(null);
  const [note, setNote] = useState<{ tone: "good" | "warn" | "stop"; text: string } | null>(null);
  const [exercises, setExercises] = useState<ExerciseDef[]>([]);

  const docRef = useRef<PnaTeacher | null>(null);
  const stageRef = useRef<TeachingStage | null>(null);
  const propsRef = useRef<TreatProps | null>(null);
  const rigRef = useRef<Rig | null>(null);
  const rafRef = useRef(0);
  const langRef = useRef(lang);
  langRef.current = lang;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  const offered = useMemo(() => (plan ? offeredTreatments(caseData.area, plan) : []), [caseData.area, plan]);

  /* The PNA Teacher walks into the clinic once, and the exercise list loads. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ PnaTeacher }, { TreatProps }] = await Promise.all([import("@/lib/avatar/teacher"), import("@/lib/virtual-patient/treatment-props")]);
        const doc = await PnaTeacher.create({ light: false });
        if (cancelled) return doc.dispose();
        docRef.current = doc;
        propsRef.current = new TreatProps(room);
        setTeacherReady(true);
      } catch (error) {
        console.error("[vp-treat] the PNA Teacher could not be loaded", error);
        if (!cancelled) setTeacherFailed(true);
      }
    })();
    if (plan) {
      void import("@/lib/rehabverse/library").then(async ({ loadRegion }) => {
        const regions = REGIONS_FOR[caseData.area] ?? [];
        const lists = await Promise.all(regions.map((r) => loadRegion(r).catch(() => [] as ExerciseDef[])));
        const all = new Map<string, ExerciseDef>();
        lists.flat().forEach((e) => all.set(e.id, e));
        const wanted = [...plan.exercises, ...Object.keys(plan.avoidExercises ?? {})];
        if (wanted.some((id) => !all.has(id))) {
          const { loadExercises } = await import("@/lib/rehabverse/library");
          (await loadExercises(wanted)).forEach((e, id) => all.set(id, e));
        }
        if (cancelled) return;
        // The right programme first, then the region's other exercises (a choice, not a quiz of everything).
        const ordered = [...wanted.map((id) => all.get(id)).filter(Boolean) as ExerciseDef[], ...[...all.values()].filter((e) => !wanted.includes(e.id))];
        setExercises(ordered.slice(0, 10).sort((a, b) => a.name.en.localeCompare(b.name.en)));
      });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stageRef.current?.dispose();
      stageRef.current = null;
      rigRef.current?.dispose();
      rigRef.current = null;
      propsRef.current?.dispose();
      propsRef.current = null;
      docRef.current?.dispose();
      docRef.current = null;
      onCaption(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, caseData.id]);

  useEffect(() => {
    stageRef.current?.setLang(lang);
  }, [lang]);
  useEffect(() => {
    stageRef.current?.setVoice(voice);
  }, [voice]);

  const stopCurrent = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stageRef.current?.dispose();
    stageRef.current = null;
    rigRef.current?.dispose();
    rigRef.current = null;
    propsRef.current?.clear();
    onCaption(null);
    setStep(null);
    setRunning(null);
  }, [onCaption]);

  /** Plays one choreography on the room; `exercise` drives the patient's movement while he coaches. */
  const play = useCallback(async (built: TreatShow, onEnd: () => void, exercise?: ExerciseDef) => {
    const doc = docRef.current;
    if (!doc) return;
    const { TeachingStage } = await import("@/lib/avatar/stage");
    const side = built.choreo.side as Side;
    if (built.choreo.position === "sidelying") room.downSide = side === "left" ? "right" : "left";
    let lastStep = -1;
    const area = plan ? AREAS[plan.area] : null;
    const stage = new TeachingStage(room, doc, built.choreo, { lang: langRef.current, voice: voiceRef.current, speed: 1, light: false }, (view: StageView) => {
      if (view.step !== lastStep) {
        lastStep = view.step;
        setStep({ chip: view.chip, index: view.step, total: view.steps });
        const prop = built.props[view.step] ?? null;
        if (plan && area) {
          const s = plan.side;
          const sign = s === "left" ? 1 : -1;
          const out = [-area.palm[0] * sign, -area.palm[1], -area.palm[2]] as [number, number, number];
          propsRef.current?.show(prop, plan.area, s, out, area.along);
        }
      }
      const text = view.line ? (langRef.current === "ur" ? view.line.ur : view.line.en) : null;
      onCaption(text, built.timer[view.step] ?? null);
      if (view.done) {
        cancelAnimationFrame(rafRef.current);
        window.setTimeout(() => {
          stopCurrent();
          onEnd();
        }, 700);
      }
    });
    stageRef.current = stage;
    stage.init();
    let rig: Rig | null = null;
    if (exercise) {
      const { buildRig } = await import("@/components/rehabverse/ExercisePlayer");
      rig = buildRig(room, exercise, side, false);
      rigRef.current = rig;
    }
    const { sampleCycle } = await import("@/lib/rehabverse/motion");
    stage.start();
    let last = performance.now();
    let clock = 0;
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt * 1000;
      stage.tick(dt);
      if (rig) {
        const state = sampleCycle(rig.segments, clock);
        rig.apply(state.pose, undefined, { index: state.index, f: state.f });
        rig.update(state.segment.kind, state.f);
      }
      propsRef.current?.update(dt);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [room, plan, onCaption, stopCurrent]);

  /** The teacher explains why he will not do it (an unsafe choice). */
  const refuse = useCallback((t: Treatment, why: Bi) => {
    setRefused((list) => (list.includes(t.id) ? list : [...list, t.id]));
    setNote({ tone: "stop", text: `${t.name.en}: ${pick(why, langRef.current)}` });
    if (!docRef.current || !plan) return;
    setRunning({ id: t.id, title: t.name.en, kind: "treat" });
    void play({
      choreo: { kind: "technique", slug: "vp-refuse", title: t.name, side: plan.side, position: room.getPosition(), patient: {}, enter: { away: 1, towardFeet: 0.4 }, review: { status: "draft" }, lessonTitle: t.name.en, steps: [
        { chip: "Stop", stand: { side: "tested", at: "upperarm01", distance: 0.85, face: "camera" }, gesture: "care", look: "camera", say: [{ en: `I won't do that for this patient. ${why.en}`, ur: `Main is patient ke liye yeh nahi karunga. ${why.ur}`, src: "vp-treatment" }], overlays: [], notes: [], holdSec: 1 },
      ] },
      props: [null], timer: [null],
    }, () => undefined);
  }, [play, plan, room]);

  const perform = useCallback((t: Treatment) => {
    if (!plan || running) return;
    unlockAudio();
    const v = verdict(plan, t.id);
    if (v === "avoid") return refuse(t, plan.avoid![t.id]);
    const built = treatmentShow(t.id, plan, caseData.start);
    if (!built) return;
    setNote(null);
    setRunning({ id: t.id, title: t.name.en, kind: "treat" });
    void play(built, () => {
      setDone((list) => (list.includes(t.id) ? list : [...list, t.id]));
      setNote(v === "unneeded" ? { tone: "warn", text: `${t.name.en} is not indicated for ${caseData.patient.name} — it costs time without helping this problem.` } : { tone: "good", text: `${t.name.en}: ${v === "best" ? "the right choice for this patient." : "a reasonable addition."}` });
    });
  }, [plan, running, refuse, caseData, play]);

  const performExercise = useCallback((e: ExerciseDef) => {
    if (!plan || running) return;
    unlockAudio();
    const v = exerciseVerdict(plan, e.id);
    const name = fromRv(e.name);
    if (v === "avoid") {
      const why = plan.avoidExercises![e.id];
      return refuse({ id: e.id, group: "manual", name, what: name, dose: name }, why);
    }
    setNote(null);
    setRunning({ id: e.id, title: e.name.en, kind: "exercise" });
    const lines = [fromRv(e.setup), ...e.steps.map(fromRv)].slice(0, 4);
    void play({ choreo: exerciseCoach(name, lines, plan.side), props: [null, null], timer: [null, `${e.dosage.sets} × ${e.dosage.reps ?? `${e.dosage.holdSeconds ?? 20} s`}`] }, () => {
      setExDone((list) => (list.includes(e.id) ? list : [...list, e.id]));
      setNote(v === "best" ? { tone: "good", text: `${e.name.en}: part of the right home programme.` } : { tone: "warn", text: `${e.name.en} is not the priority for this patient's problem.` });
    }, e);
  }, [plan, running, refuse, play]);

  if (!plan) {
    return <p className="text-sm text-slate-600">There is no treatment stage for this patient.</p>;
  }

  const complete = treatmentComplete(plan, done, exDone);
  const need = exercisesNeeded(plan);
  const exHit = exDone.filter((id) => plan.exercises.includes(id)).length;
  const finish = () => {
    stopCurrent();
    const score = scoreTreatment(plan, done, exDone, refused);
    onFinish({ ...score, done, exercises: exDone, refused });
  };

  const card = (t: Treatment) => {
    const did = done.includes(t.id);
    const stopped = refused.includes(t.id);
    const v = verdict(plan, t.id);
    const shown = did || stopped ? VERDICT[stopped ? "avoid" : v] : null;
    const isRunning = running?.id === t.id;
    return (
      <li key={t.id} className={"rounded-2xl border p-3 " + (isRunning ? "border-teal-500 bg-teal-50" : "border-slate-200")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-navy-800">{pick(t.name, lang)}</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">{pick(t.what, lang)}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">Dose: {pick(t.dose, lang)}</p>
            {shown ? <span className={"mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold " + shown.cls}>{shown.text}</span> : null}
          </div>
          <button type="button" onClick={() => perform(t)} disabled={!teacherReady || Boolean(running)} className="inline-flex flex-none items-center gap-1 rounded-xl bg-[#0a1f3d] px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-40" aria-label={`Perform ${t.name.en}`}>
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : did ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {did ? "Again" : "Perform"}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div data-pna-vp-treat={caseData.id}>
      <div className="rounded-2xl bg-[#0a1f3d] p-3 text-white">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#2ee6d6]">Treatment · PNA clinic</p>
        <p className="mt-1 text-sm">Choose what {caseData.patient.name} needs today. The PNA Teacher performs it; the patient does the home exercises.</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold " + (complete ? "bg-emerald-400 text-[#04263a]" : "bg-white/10")}>
            {complete ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            {complete ? "Section complete" : `Treatments ${plan.best.filter((id) => done.includes(id)).length}/${plan.best.length} · Exercises ${Math.min(exHit, need)}/${need}`}
          </span>
          <button type="button" onClick={() => setVoice(!voice)} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-bold" aria-pressed={voice}>
            {voice ? <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />} Voice
          </button>
        </div>
        {!teacherReady && !teacherFailed ? <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#a9bfd6]"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> The PNA Teacher is coming into the clinic…</p> : null}
        {teacherFailed ? <p className="mt-2 text-xs text-rose-200">The 3D therapist could not be loaded on this device. You can still choose treatments and see the feedback.</p> : null}
      </div>

      {running ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-teal-300 bg-teal-50 p-2.5 text-[13px] text-teal-900" role="status">
          <Loader2 className="h-4 w-4 flex-none animate-spin" aria-hidden="true" />
          <span className="min-w-0 flex-1"><strong>{running.title}</strong>{step ? ` · ${step.chip} (${step.index + 1}/${step.total})` : ""}</span>
          <button type="button" onClick={() => stageRef.current?.next()} className="rounded-lg bg-white px-2 py-1 text-xs font-bold" aria-label="Next step"><SkipForward className="h-3.5 w-3.5" aria-hidden="true" /></button>
          <button type="button" onClick={stopCurrent} className="rounded-lg bg-white px-2 py-1 text-xs font-bold" aria-label="Stop"><Square className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
      ) : null}
      {note ? (
        <p className={"mt-3 flex gap-2 rounded-2xl p-3 text-[13px] leading-5 " + (note.tone === "good" ? "bg-emerald-50 text-emerald-900" : note.tone === "warn" ? "bg-amber-50 text-amber-900" : "bg-rose-50 text-rose-900")} role="status">
          {note.tone === "stop" ? <ShieldAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" /> : note.tone === "warn" ? <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />}
          <span>{note.text}</span>
        </p>
      ) : null}

      {GROUPS.map(({ id, label, icon: Icon }) => {
        const list = offered.filter((t) => t.group === id);
        if (!list.length) return null;
        return (
          <section key={id} className="mt-4">
            <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}</h3>
            <ul className="mt-1.5 space-y-1.5">{list.map(card)}</ul>
          </section>
        );
      })}

      {plan.exercises.length || exercises.length ? (
        <section className="mt-4">
          <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"><Dumbbell className="h-3.5 w-3.5" aria-hidden="true" /> Home exercises (patient performs)</h3>
          {!exercises.length ? <p className="mt-1.5 text-xs text-slate-500">Loading the exercises…</p> : null}
          <ul className="mt-1.5 space-y-1.5">
            {exercises.map((e) => {
              const did = exDone.includes(e.id);
              const stopped = refused.includes(e.id);
              const v = exerciseVerdict(plan, e.id);
              const shown = did || stopped ? VERDICT[stopped ? "avoid" : v === "best" ? "best" : "unneeded"] : null;
              return (
                <li key={e.id} className={"flex items-start gap-2 rounded-2xl border p-3 " + (running?.id === e.id ? "border-teal-500 bg-teal-50" : "border-slate-200")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-navy-800">{lang === "ur" ? e.name.ru : e.name.en}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">{lang === "ur" ? e.summary.ru : e.summary.en}</p>
                    {shown ? <span className={"mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold " + shown.cls}>{shown.text}</span> : null}
                  </div>
                  <button type="button" onClick={() => performExercise(e)} disabled={!teacherReady || Boolean(running)} className="inline-flex flex-none items-center gap-1 rounded-xl bg-[#0a1f3d] px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-40" aria-label={`Do ${e.name.en}`}>
                    {did ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />} {did ? "Again" : "Do it"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="sticky bottom-0 mt-4 bg-white pt-2">
        <button type="button" onClick={finish} disabled={Boolean(running)} className={"nx-btn w-full disabled:opacity-40 " + (complete ? "nx-btn-primary" : "nx-btn-light")}>
          {complete ? "Finish treatment — see my score" : "Finish treatment now"}
        </button>
        <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-500"><Snowflake className="h-3 w-3" aria-hidden="true" /> Doses are teaching examples. The 3D hand positions are a draft for clinical review.</p>
      </div>
    </div>
  );
}
