"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Armchair, BedDouble, CheckCircle2, Circle, ClipboardList, Clock, DoorOpen, PersonStanding, RotateCcw, Stethoscope, UserRound } from "lucide-react";
import { ExamRoom, webglAvailable, type PatientPosition, type PickResult } from "@/lib/virtual-patient/engine";
import { NERVE_LABEL } from "@/lib/virtual-patient/anatomy";
import { HISTORY } from "@/lib/virtual-patient/exam";
import type { VirtualCase } from "@/lib/virtual-patient/cases";
import { EXAM_KEY_LABEL, examKeyDone, saveResult, scoreSession, type ExamEvent, type SessionResult } from "@/lib/virtual-patient/session";
import { ExamContext, type ExamApi, type ExamMode, type Lang, type OverlayState } from "./ExamContext";
import { Overlays, SpeechBubble } from "./Overlays";
import { TOOLS, ToolPanel, type PickHandler, type ToolId } from "./ExamTools";
import { CasePicker, DiagnosePanel, HistoryPanel, ResultPanel } from "./Panels";

const POSITIONS: { id: PatientPosition; label: string; icon: typeof BedDouble }[] = [
  { id: "standing", label: "Standing", icon: PersonStanding },
  { id: "supine", label: "Supine", icon: BedDouble },
  { id: "prone", label: "Prone", icon: BedDouble },
  { id: "sitting", label: "Sitting", icon: Armchair },
  { id: "sidelying", label: "Side-lying", icon: BedDouble },
];
const OSCE_MINUTES = 12;
type Stage = "pick" | "exam" | "decide" | "result";
type Tab = "patient" | "examine" | "findings";

/** Recorded findings only (tests performed without a recorded result aren't listed). */
function describe(event: ExamEvent): string | null {
  switch (event.kind) {
    case "rom": return event.recorded === undefined ? null : `ROM ${event.motion.replace(/-/g, " ")} (${event.side}): ${event.recorded}°`;
    case "mmt": return event.recorded === undefined ? null : `MMT ${event.test.replace(/-/g, " ")} (${event.side}): ${event.recorded}/5`;
    case "reflex": return event.recorded === undefined ? null : `${event.reflex} (${event.side}): ${event.recorded}`;
    case "special": return event.recorded === undefined ? null : `${event.test.replace(/-/g, " ")} (${event.side}): ${event.recorded ? "positive" : "negative"}`;
    case "sensation": return `Sensation ${event.region} (${event.side}): ${event.response}`;
    case "palpate": return `Palpation ${event.landmark?.replace(/-/g, " ") ?? event.region} (${event.side}): ${event.tender ? "tender" : "not tender"}`;
    case "tape": return `${event.tape.replace(/-/g, " ")} (${event.side}): ${event.value} cm`;
    case "vitals": return "Vital signs taken";
    default: return null;
  }
}

export function VirtualPatientApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<ExamRoom | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [position, setPosition] = useState<PatientPosition>("standing");

  const [stage, setStage] = useState<Stage>("pick");
  const [caseData, setCaseData] = useState<VirtualCase | null>(null);
  const [mode, setMode] = useState<ExamMode>("guided");
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("patient");
  const [tool, setTool] = useState<ToolId>("look");
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [speech, setSpeech] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>({});
  const [identify, setIdentify] = useState<PickResult | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const pickRef = useRef<PickHandler>(null);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* 3D room */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!webglAvailable()) {
      setFailed("This device or browser can't show 3D graphics. Try Chrome or Edge on a recent phone or computer.");
      return;
    }
    const exam = new ExamRoom(mount);
    setRoom(exam);
    // Development-only handle for automated browser tests.
    if (process.env.NODE_ENV !== "production") (window as unknown as { __pnaExamRoom?: ExamRoom }).__pnaExamRoom = exam;
    exam
      .load("/virtual-patient/patient.glb", setProgress)
      .then(() => setReady(true))
      .catch(() => setFailed("The patient model could not be loaded. Check your connection and refresh the page."));
    return () => {
      exam.dispose();
      setRoom(null);
    };
  }, []);

  useEffect(() => {
    if (stage !== "exam" && stage !== "decide") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const say = useCallback((text: string) => {
    setSpeech(text);
    clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => setSpeech(null), Math.min(9000, 2500 + text.length * 45));
  }, []);
  const log = useCallback((event: ExamEvent) => setEvents((list) => [...list, event]), []);
  const registerPick = useCallback((handler: PickHandler) => {
    pickRef.current = handler;
  }, []);

  const start = (c: VirtualCase, m: ExamMode) => {
    if (!room) return;
    setCaseData(c);
    setMode(m);
    setEvents([]);
    setResult(null);
    setOverlay({});
    setIdentify(null);
    setTab("patient");
    setTool("look");
    room.clearMarkers();
    room.clearTape();
    room.setPosition(c.start);
    setPosition(c.start);
    setStartedAt(Date.now());
    setNow(Date.now());
    setStage("exam");
    say(lang === "ur" ? `Assalam-o-alaikum, main ${c.patient.name} hoon.` : `Hello, I'm ${c.patient.name}.`);
  };

  const changePosition = (next: PatientPosition) => {
    room?.setPosition(next);
    setPosition(next);
  };
  useEffect(() => {
    if (!room) return;
    const off = room.onChange(() => {
      const p = room.getPosition();
      setPosition((current) => (current === p ? current : p));
    });
    return () => {
      off();
    };
  }, [room]);

  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = down.current;
    down.current = null;
    if (!room || !s || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6 || stage !== "exam") return;
    const pick = room.pick(e.clientX, e.clientY);
    if (pickRef.current) pickRef.current(pick);
    else if (mode === "guided") setIdentify(pick);
  };

  const api: ExamApi | null = useMemo(
    () => (room && caseData ? { room, caseData, mode, lang, events, log, say, setOverlay } : null),
    [room, caseData, mode, lang, events, log, say],
  );

  const elapsedMin = Math.max(0, Math.floor((now - startedAt) / 60000));
  const remaining = OSCE_MINUTES * 60 - Math.floor((now - startedAt) / 1000);
  useEffect(() => {
    if (stage === "exam" && mode === "osce" && remaining <= 0 && caseData?.id !== "practice") setStage("decide");
  }, [remaining, stage, mode, caseData]);

  const submit = (answers: { diagnosis: number; plan: number }) => {
    if (!caseData) return;
    const scored = scoreSession(caseData, events, answers);
    setResult(scored);
    saveResult(caseData, scored);
    setStage("result");
  };

  const findings = events.map(describe).filter(Boolean) as string[];
  const practice = caseData?.id === "practice";

  return (
    <div className="vp-shell relative overflow-hidden rounded-[28px] border border-[#1d3a5f] bg-[#0a1f3d] shadow-[0_40px_90px_-50px_rgba(5,20,45,0.9)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* 3D exam room */}
        <div className="relative h-[56vh] min-h-[380px] lg:h-[78vh]">
          <div
            ref={mountRef}
            className="absolute inset-0"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            role="img"
            aria-label={`3D patient, ${position}. Drag to turn the view, pinch or scroll to zoom, tap the body to examine.`}
          />
          {room && ready ? <Overlays room={room} state={overlay} /> : null}
          {room && ready ? <SpeechBubble room={room} text={speech} /> : null}
          {!ready && !failed ? (
            <div className="absolute inset-0 grid place-items-center bg-[#0a1f3d]/85 text-white">
              <div className="w-64 text-center">
                <p className="text-sm font-semibold">Bringing the patient in…</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2ee6d6] to-[#3cc8ff]" style={{ width: `${Math.max(8, progress * 100)}%` }} />
                </div>
              </div>
            </div>
          ) : null}
          {failed ? (
            <div className="absolute inset-0 grid place-items-center bg-[#0a1f3d] p-6 text-center text-white">
              <div className="max-w-md">
                <p className="text-base font-bold">3D exam room unavailable</p>
                <p className="mt-2 text-sm text-[#a9bfd6]">{failed}</p>
                <a href="/skills" className="nx-btn nx-btn-primary mt-4">Practise in the Clinical Skills Lab</a>
              </div>
            </div>
          ) : null}
          {ready && stage !== "pick" ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center gap-1.5 p-3">
              {POSITIONS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => changePosition(id)} aria-pressed={position === id} className={"pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur " + (position === id ? "bg-[#2ee6d6] text-[#04263a]" : "bg-[#0a1f3d]/75 text-white hover:bg-[#0a1f3d]")}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                </button>
              ))}
              <button type="button" onClick={() => room?.frameCamera()} className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-[#0a1f3d]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> View
              </button>
              <span className="pointer-events-auto ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#0a1f3d]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                <Clock className="h-3.5 w-3.5 text-[#2ee6d6]" aria-hidden="true" />
                {mode === "osce" && !practice ? `${Math.max(0, Math.floor(remaining / 60))}:${String(Math.max(0, remaining % 60)).padStart(2, "0")} left` : `${elapsedMin} min`}
              </span>
            </div>
          ) : null}
          {identify && stage === "exam" && mode === "guided" ? (
            <div className="absolute bottom-3 left-3 max-w-xs rounded-2xl bg-[#0a1f3d]/85 p-3 text-xs text-white backdrop-blur" role="status">
              <p className="text-sm font-bold">{identify.landmark ? identify.landmark.id.replace(/-/g, " ") : identify.region} ({identify.side})</p>
              <p className="mt-0.5 text-[#a9bfd6]">{identify.covered ? "Under the shorts" : [identify.dermatome ? `Dermatome ${identify.dermatome}` : null, identify.nerve ? NERVE_LABEL[identify.nerve] : null].filter(Boolean).join(" · ")}</p>
            </div>
          ) : null}
        </div>

        {/* Side panel */}
        <aside className="flex max-h-none flex-col bg-white lg:h-[78vh]" aria-label="Examination panel">
          {stage === "pick" || !caseData || !api ? (
            <div className="grid flex-1 place-items-center p-6 text-center">
              <div>
                <UserRound className="mx-auto h-10 w-10 text-teal-600" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-navy-800">Choose a patient to begin</p>
                <p className="mt-1 text-xs text-slate-500">Each patient hides a diagnosis. Take a history, examine, then decide.</p>
              </div>
            </div>
          ) : (
            <ExamContext.Provider value={api}>
              <div className="border-b border-slate-200 p-3">
                <p className="text-sm font-bold text-navy-800">{caseData.patient.name}, {caseData.patient.age} · <span className="font-semibold text-slate-500">{caseData.patient.job}</span></p>
                {stage === "exam" ? (
                  <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
                    {([["patient", "History", UserRound], ["examine", "Examine", Stethoscope], ["findings", "Findings", ClipboardList]] as const).map(([id, label, Icon]) => (
                      <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={"inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold " + (tab === id ? "bg-white text-navy-800 shadow" : "text-slate-500")}>
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {stage === "exam" && tab === "patient" ? <HistoryPanel lang={lang} setLang={setLang} /> : null}
                {stage === "exam" && tab === "examine" ? (
                  <div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TOOLS.map((t) => (
                        <button key={t.id} type="button" onClick={() => { setTool(t.id); setIdentify(null); }} aria-pressed={tool === t.id} className={"rounded-xl border px-2.5 py-2 text-left text-xs font-bold " + (tool === t.id ? "border-[#0a1f3d] bg-[#0a1f3d] text-white" : "border-slate-200 text-navy-800 hover:border-teal-500")}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <ToolPanel tool={tool} registerPick={registerPick} />
                    </div>
                  </div>
                ) : null}
                {stage === "exam" && tab === "findings" ? (
                  <div>
                    {mode === "guided" && !practice ? (
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Examiner's checklist</p>
                        <ul className="mt-2 space-y-1 text-[13px]">
                          {caseData.key.history.map((id) => {
                            const done = events.some((e) => e.kind === "history" && e.id === id);
                            return <li key={id} className="flex items-center gap-1.5">{done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />} Ask: {HISTORY.find((h) => h.id === id)?.en}</li>;
                          })}
                          {caseData.key.exam.map((key) => (
                            <li key={key} className="flex items-center gap-1.5">{examKeyDone(key, events) ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />} {EXAM_KEY_LABEL(key)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Your recorded findings</p>
                    {findings.length ? (
                      <ul className="mt-1 space-y-1 text-[13px] text-slate-700">{findings.map((f, i) => <li key={i}>• {f}</li>)}</ul>
                    ) : (
                      <p className="mt-1 text-[13px] text-slate-500">Nothing recorded yet. Record grades, angles and test results as you examine.</p>
                    )}
                  </div>
                ) : null}
                {stage === "decide" ? <DiagnosePanel onSubmit={submit} /> : null}
                {stage === "result" && result ? (
                  <ResultPanel result={result} caseData={caseData} minutes={elapsedMin} onRetry={() => start(caseData, mode)} onNext={() => setStage("pick")} />
                ) : null}
              </div>
              {stage === "exam" ? (
                <div className="border-t border-slate-200 p-3">
                  {practice ? (
                    <button type="button" onClick={() => setStage("pick")} className="nx-btn nx-btn-light w-full"><DoorOpen className="h-4 w-4" aria-hidden="true" /> Back to the waiting room</button>
                  ) : (
                    <button type="button" onClick={() => { pickRef.current = null; setStage("decide"); }} className="nx-btn nx-btn-primary w-full">Finish examination — diagnose</button>
                  )}
                </div>
              ) : null}
            </ExamContext.Provider>
          )}
        </aside>
      </div>
      {stage === "pick" && ready ? (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-[#0a1f3d]/95">
          <CasePicker onStart={start} />
        </div>
      ) : null}
    </div>
  );
}
