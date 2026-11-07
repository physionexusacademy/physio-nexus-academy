"use client";

/**
 * Virtual Patient session: what the student did, how it scores (OSCE-style),
 * and saved progress (this device only).
 */
import { recordLearningActivity } from "@/lib/unified-progress";
import type { Side } from "./engine";
import type { HistoryId, MotionId, MuscleTestId, ReflexGrade, ReflexId, SpecialTestId, TapeId } from "./exam";
import type { ExamKey, VirtualCase } from "./cases";

export type ExamEvent =
  | { kind: "history"; id: HistoryId }
  | { kind: "rom"; motion: MotionId; side: Side; truth: number; recorded?: number }
  | { kind: "mmt"; test: MuscleTestId; side: Side; truth: number; recorded?: number }
  | { kind: "reflex"; reflex: ReflexId; side: Side; truth: ReflexGrade | "present" | "absent"; recorded?: string }
  | { kind: "sensation"; side: Side; dermatome: string | null; nerve: string | null; region: string; response: string }
  | { kind: "palpate"; side: Side; landmark: string | null; region: string; tender: boolean }
  | { kind: "special"; test: SpecialTestId; side: Side; positive: boolean; recorded?: boolean }
  | { kind: "tape"; tape: TapeId; side: Side; value: number }
  | { kind: "vitals" };

export function examKeyDone(key: ExamKey, events: ExamEvent[]) {
  const [type, value] = key.split(":") as [string, string | undefined];
  return events.some((e) => {
    switch (type) {
      case "rom": return e.kind === "rom" && e.motion === value;
      case "mmt": return e.kind === "mmt" && e.test === value;
      case "reflex": return e.kind === "reflex" && e.reflex === value;
      case "special": return e.kind === "special" && e.test === value;
      case "sensation": return e.kind === "sensation" && (e.dermatome === value || e.nerve === value);
      case "palpate": return e.kind === "palpate" && (e.landmark === value || e.region === value);
      case "tape": return e.kind === "tape" && e.tape === value;
      case "vitals": return e.kind === "vitals";
      default: return false;
    }
  });
}

export const EXAM_KEY_LABEL = (key: ExamKey) => {
  const [type, value = ""] = key.split(":");
  const nice = value.replace(/-/g, " ");
  return {
    rom: `Range of motion: ${nice}`,
    mmt: `Muscle test: ${nice}`,
    reflex: `Reflex/sign: ${nice}`,
    special: `Special test: ${nice}`,
    sensation: `Sensation: ${value}`,
    palpate: `Palpate: ${nice}`,
    tape: `Measure: ${nice}`,
    vitals: "Vital signs",
  }[type] ?? key;
};

export type SessionResult = {
  total: number;
  parts: { label: string; score: number; max: number; detail: string[] }[];
  missedRedFlag: boolean;
  passed: boolean;
};

export function scoreSession(c: VirtualCase, events: ExamEvent[], answers: { diagnosis: number | null; plan: number | null }): SessionResult {
  const asked = new Set(events.filter((e) => e.kind === "history").map((e) => (e as { id: HistoryId }).id));
  const histHit = c.key.history.filter((id) => asked.has(id));
  const examHit = c.key.exam.filter((key) => examKeyDone(key, events));

  // Accuracy of what the student recorded.
  const recorded: { ok: boolean; text: string }[] = [];
  for (const e of events) {
    if (e.kind === "rom" && e.recorded !== undefined) recorded.push({ ok: Math.abs(e.recorded - e.truth) <= 10, text: `${e.motion.replace(/-/g, " ")} (${e.side}): you ${e.recorded}°, actual ${e.truth}°` });
    if (e.kind === "mmt" && e.recorded !== undefined) recorded.push({ ok: Math.abs(e.recorded - e.truth) <= 0.5, text: `${e.test.replace(/-/g, " ")} (${e.side}): you ${e.recorded}/5, actual ${e.truth}/5` });
    if (e.kind === "reflex" && e.recorded !== undefined) recorded.push({ ok: e.recorded === e.truth, text: `${e.reflex} (${e.side}): you ${e.recorded}, actual ${e.truth}` });
    if (e.kind === "special" && e.recorded !== undefined) recorded.push({ ok: e.recorded === e.positive, text: `${e.test.replace(/-/g, " ")} (${e.side}): you ${e.recorded ? "positive" : "negative"}, actual ${e.positive ? "positive" : "negative"}` });
  }
  const accuracy = recorded.length ? recorded.filter((r) => r.ok).length / recorded.length : 0;
  const diagnosisOk = answers.diagnosis === c.questions.diagnosis.answer;
  const planOk = answers.plan === c.questions.plan.answer;
  const parts = [
    { label: "History", max: 20, score: Math.round((20 * histHit.length) / Math.max(1, c.key.history.length)), detail: c.key.history.map((id) => `${asked.has(id) ? "✓" : "✗"} ${id}`) },
    { label: "Examination", max: 35, score: Math.round((35 * examHit.length) / Math.max(1, c.key.exam.length)), detail: c.key.exam.map((key) => `${examKeyDone(key, events) ? "✓" : "✗"} ${EXAM_KEY_LABEL(key)}`) },
    { label: "Accurate findings", max: 15, score: Math.round(15 * accuracy), detail: recorded.length ? recorded.map((r) => `${r.ok ? "✓" : "✗"} ${r.text}`) : ["Record grades, angles and test results as you examine — they are marked here."] },
    { label: "Diagnosis", max: 20, score: diagnosisOk ? 20 : 0, detail: [c.questions.diagnosis.why] },
    { label: "Plan", max: 10, score: planOk ? 10 : 0, detail: [c.questions.plan.why] },
  ];
  let total = parts.reduce((sum, part) => sum + part.score, 0);
  const missedRedFlag = Boolean(c.key.redFlag) && !planOk;
  if (missedRedFlag) total = Math.min(total, 40);
  return { total, parts, missedRedFlag, passed: total >= 70 && !missedRedFlag };
}

/* ---------------- progress ---------------- */

const KEY = "pna-virtual-patient-v1";
export const VP_EVENT = "pna-virtual-patient-updated";
export type VpProgress = { cases: Record<string, { best: number; attempts: number; passedAt?: string }> };

export function getVpProgress(): VpProgress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw && typeof raw === "object" && raw.cases && typeof raw.cases === "object") return raw as VpProgress;
  } catch {
    /* ignore damaged data */
  }
  return { cases: {} };
}

export function saveResult(c: VirtualCase, result: SessionResult) {
  const progress = getVpProgress();
  const before = progress.cases[c.id];
  const today = new Date().toISOString().slice(0, 10);
  progress.cases[c.id] = {
    best: Math.max(before?.best ?? 0, result.total),
    attempts: (before?.attempts ?? 0) + 1,
    passedAt: before?.passedAt ?? (result.passed ? today : undefined),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked */
  }
  if (result.passed && !before?.passedAt) {
    const xp = { Beginner: 40, Intermediate: 60, Advanced: 80, Expert: 100 }[c.level];
    recordLearningActivity("virtual-patient", xp, `case:${c.id}`, `Virtual Patient: ${c.diagnosis} — passed`);
  }
  window.dispatchEvent(new Event(VP_EVENT));
}
