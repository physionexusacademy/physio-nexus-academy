/**
 * What the Treatment stage offers for one patient, from one of two sources:
 *  - the book (public/virtual-patient/book/<slug>.json, built from the Conditions & Treatment chapters): the chapter's own manual
 *    therapy rows (I), modalities with its "Indicated?" verdict (K), its exercise prescription (J) and its plan (N) — word for word;
 *  - PLANS in treatments.ts for the emergencies that are not treated (stop and refer) and for patients without a book chapter.
 * Either way the TreatPanel sees the same shape. Pure logic, no three.js.
 */
import type { PatientPosition, Side } from "./engine";
import type { TreatArea } from "./treat-points";
import { AREAS, PLANS, TREATMENTS, manualShow, modalityShow, show, talkShow, treatment, P, fingersFor, consent, type Bi, type PropKind, type TreatGroup, type TreatPlan, type TreatShow, type Treatment, type Verdict } from "./treatments";

export type TreatOption = {
  id: string;
  group: TreatGroup;
  name: Bi;
  what: Bi;
  dose: Bi;
  /** When to stop or modify (the book's column). */
  stop?: Bi;
  verdict: Verdict;
  /** Why it is unsafe (refusal), or the book's comment. */
  note?: Bi;
};

export type TreatSetup = {
  source: "book" | "plan";
  bookTitle?: string;
  bookSlug?: string;
  area: TreatArea;
  side: Side;
  start: PatientPosition;
  options: TreatOption[];
  /** The right home exercises (RehabVerse ids). */
  exercises: string[];
  avoidExercises: Record<string, Bi>;
  /** Extra exercises to offer from the region (shown, not required). */
  show: (id: string) => TreatShow | null;
  /** Book notes shown above the options (e.g. "Preferred starting choice"). */
  notes: string[];
};

/* ------------------------------------------------------------------ */
/* The book chapter data                                               */
/* ------------------------------------------------------------------ */

export type BookTest = { name: string; fields: Record<string, string>; result: "positive" | "negative" | "not-recorded" };
export type BookChapter = {
  slug: string;
  area: string;
  title: string;
  ch: string;
  lead: string;
  case: string[];
  working: string;
  plan: string;
  side: Side;
  age: number | null;
  female: boolean;
  differentials: { name: string; key: string; next: string }[];
  qa: string[];
  tests: BookTest[];
  redFlags: Record<string, string>[];
  manual: { name: string; why: string; finding: string; application: string; stop: string; anim: string }[];
  manualNotes: string[];
  exercise: Record<string, string>[];
  exerciseNotes: string[];
  exercises3d: string[];
  modalities: { name: string; indicated: string; comment: string; anim: string }[];
  modalityNotes: string[];
  pathway: string[];
};

const chapterCache = new Map<string, Promise<BookChapter>>();
export function loadBookChapter(slug: string): Promise<BookChapter> {
  let p = chapterCache.get(slug);
  if (!p) {
    p = fetch(`/virtual-patient/book/${slug}.json`).then((r) => {
      if (!r.ok) throw new Error(`book ${slug}: ${r.status}`);
      return r.json() as Promise<BookChapter>;
    });
    p.catch(() => chapterCache.delete(slug));
    chapterCache.set(slug, p);
  }
  return p;
}

export type BookIndex = { count: number; patients: { slug: string; title: string; area: string; ch: string; case: string; tests: number; exercises3d: number }[] };
let indexPromise: Promise<BookIndex> | null = null;
export function loadBookIndex(): Promise<BookIndex> {
  indexPromise ??= fetch("/virtual-patient/book/index.json").then((r) => r.json() as Promise<BookIndex>).catch((e) => {
    indexPromise = null;
    throw e;
  });
  return indexPromise;
}

/** Where on the body a book chapter is treated. */
export function areaForBook(slug: string): TreatArea {
  const s = slug;
  if (/cervic|whiplash|neck|thoracic-outlet|headache/.test(s)) return "cervical";
  if (/thoracic|rib|copd|asthma|pneumonia|respiratory|cardiac|heart/.test(s)) return "thoracic";
  if (/lumbar|low-back|cauda|spondylo|pelvic/.test(s)) return "lumbar";
  if (/rotator|capsulitis|glenohumeral|acromio|biceps|humerus|shoulder/.test(s)) return "shoulder";
  if (/lateral-epicondyl/.test(s)) return "elbow-lateral";
  if (/medial-epicondyl|cubital/.test(s)) return "elbow-medial";
  if (/carpal|quervain|radius|scaphoid|trigger/.test(s)) return "wrist";
  if (/hamstring/.test(s)) return "calf";
  if (/hip|gluteal|femoroacetabular|groin/.test(s)) return "hip";
  if (/achilles/.test(s)) return "achilles";
  if (/plantar|heel/.test(s)) return "heel";
  if (/ankle/.test(s)) return "ankle";
  if (/tibial/.test(s)) return "shin";
  if (/knee|patell|acl|menisc|arthroplasty/.test(s)) return "knee";
  if (/stroke/.test(s)) return "shoulder";
  return "thigh";
}

/** The book's "Indicated?" wording → verdict. Not routinely recommended is "not needed", never "unsafe": the book does not forbid it. */
function verdictFromIndicated(text: string): Verdict {
  const t = text.toLowerCase();
  if (/contraindicat|avoid|do not use/.test(t)) return "avoid";
  if (/not (routinely )?recommended|not routine|doctor-directed|not indicated|^no\b/.test(t)) return "unneeded";
  if (/^recommended|^yes|^indicated|first[- ]line|core/.test(t)) return "best";
  return "ok";
}

const same = (s: string): Bi => ({ en: s, ur: s });
const GENERIC_OF: Record<string, string> = { hotpack: "hot-pack", icepack: "ice-pack", tens: "tens", ift: "ift", ultrasound: "ultrasound", nmes: "nmes" };
const MANUAL_OF: Partial<Record<TreatArea, string>> = {
  lumbar: "lumbar-pa", thoracic: "thoracic-pa", cervical: "thoracic-pa", shoulder: "shoulder-posterior-glide", knee: "patellar-mobilisation",
  ankle: "talocrural-glide", hip: "hip-distraction", "elbow-lateral": "elbow-mwm", heel: "plantar-release",
};

/** The book's own lines go into the first steps of a demonstration: why, then how, then when to stop. */
function withBook(s: TreatShow, lines: Bi[]): TreatShow {
  const steps = s.choreo.steps.map((step, i) => {
    const extra = lines[i];
    if (!extra || !extra.en) return step;
    return { ...step, say: [{ en: extra.en, ur: extra.ur, src: "vp-book", urFallback: true as const }, ...(i === 0 ? step.say.slice(-1) : [])] };
  });
  return { ...s, choreo: { ...s.choreo, steps } };
}

/** A generic hands-on demonstration at the area (support, stretch, generic mobilisation). */
function handsOn(t: Treatment, plan: TreatPlan, kind: "support" | "stretch" | "mobilise", lines: Bi[]): TreatShow {
  const area = AREAS[plan.area];
  const fingers = fingersFor(area.palm, area.along);
  const touch = (at: string, hand: "L" | "R") => ({ hand, at, palm: area.palm, fingers, shape: "flat" as const });
  const stand = { side: "tested" as const, at: area.at, distance: 0.45, face: "patient" as const };
  return show(t, plan.area, plan.side, area.position, area.pose?.(plan.side) ?? {}, [
    { chip: "Explain", stand: { ...stand, distance: 0.6 }, gesture: "open", look: "patient", say: [lines[0] ?? t.what, consent(area)] },
    { chip: kind === "support" ? "Apply" : "Position", stand, contacts: [touch(P(`${plan.area}-e1`), "R"), touch(P(`${plan.area}-e2`), "L")], look: "hands", say: [lines[1] ?? t.dose] },
    { chip: kind === "support" ? "Check" : "Perform", stand, contacts: [touch(P(plan.area), "R"), touch(P(`${plan.area}-e3`), "L")], move: kind === "support" ? undefined : { kind: "glide", dir: kind === "stretch" ? area.palm : area.along, amplitudeMm: kind === "stretch" ? 4 : 6, hz: kind === "stretch" ? 0.15 : 1 }, look: "hands", holdSec: 2, timer: kind === "stretch" ? "3 × 30 s" : kind === "mobilise" ? "3 × 45 s" : undefined, say: [lines[2] ?? { en: "Tell me how that feels.", ur: "Batayein kaisa mehsoos ho raha hai." }] },
    { chip: "Reassess", stand: { ...stand, distance: 0.6 }, gesture: "care", look: "patient", say: [{ en: "Now we re-check the movement or symptom we found at the start.", ur: "Ab shuru wali harkat ya takleef dobara check karte hain." }] },
  ]);
}

function showFor(anim: string, plan: TreatPlan, start: PatientPosition, name: string, lines: Bi[], what: Bi, dose: Bi): TreatShow | null {
  const base: Treatment = { id: `book-${anim}`, group: "manual", name: same(name), what, dose };
  if (GENERIC_OF[anim]) {
    const t = { ...treatment(GENERIC_OF[anim])!, name: same(name) };
    return withBook(modalityShow(t, plan), lines);
  }
  if (anim === "massage") return withBook(manualShow({ ...treatment("massage")!, name: same(name) }, plan), lines);
  if (anim === "slider") {
    const id = ["cervical", "shoulder", "elbow-lateral", "elbow-medial", "wrist", "forearm-dorsal", "thoracic"].includes(plan.area) ? "cervical-lateral-glide" : "sciatic-slider";
    return withBook(manualShow({ ...treatment(id)!, name: same(name) }, plan), lines);
  }
  if (anim === "distraction") {
    if (["hip", "knee", "ankle", "thigh", "calf"].includes(plan.area)) return withBook(manualShow({ ...treatment("hip-distraction")!, name: same(name) }, plan), lines);
    return handsOn(base, plan, "mobilise", lines);
  }
  if (anim === "mobilise") {
    const id = MANUAL_OF[plan.area];
    return id ? withBook(manualShow({ ...treatment(id)!, name: same(name) }, plan), lines) : handsOn(base, plan, "mobilise", lines);
  }
  if (anim === "stretch" || anim === "support") return handsOn(base, plan, anim, lines);
  return talkShow({ ...base, group: "education" }, { ...plan, advice: lines.filter((l) => l.en) }, start);
}

/* ------------------------------------------------------------------ */
/* Setups                                                              */
/* ------------------------------------------------------------------ */

/** The book chapter → what the student can choose, word for word, with the book's verdicts. */
export function setupFromBook(book: BookChapter, start: PatientPosition, side?: Side): TreatSetup {
  const area = areaForBook(book.slug);
  const s: Side = side ?? book.side;
  const plan: TreatPlan = { area, side: s, best: [], exercises: [], advice: [] };
  const options: TreatOption[] = [];
  const lines = new Map<string, { anim: string; name: string; lines: Bi[]; what: Bi; dose: Bi }>();
  options.push({ id: "book-education", group: "education", name: { en: "Education and advice (the book's plan)", ur: "Samjhana aur mashwara (kitaab ka plan)" }, what: same(book.plan || book.working), dose: same(book.pathway[book.pathway.length - 1] ?? ""), verdict: "best" });
  lines.set("book-education", { anim: "talk", name: "Education and advice", lines: [same(`Working diagnosis: ${book.working}.`), same(`Plan: ${book.plan}`)], what: same(book.plan), dose: same("") });
  book.manual.forEach((m, i) => {
    const id = `book-manual-${i}`;
    options.push({ id, group: "manual", name: same(m.name), what: same(m.why), dose: same(m.application), stop: same(m.stop), verdict: "ok", note: m.finding ? same(`Finding that justifies it: ${m.finding}`) : undefined });
    lines.set(id, { anim: m.anim, name: m.name, lines: [same(m.why), same(m.application), same(m.stop ? `Stop or modify if: ${m.stop}` : "")], what: same(m.why), dose: same(m.application) });
  });
  book.modalities.forEach((m, i) => {
    const id = `book-modality-${i}`;
    const verdict = verdictFromIndicated(m.indicated);
    const group: TreatGroup = /ice|cold|heat|warm/i.test(m.name) ? "thermal" : m.anim === "support" || m.anim === "talk" ? "manual" : "electro";
    options.push({ id, group, name: same(m.name), what: same(m.comment), dose: same(`Indicated? ${m.indicated}`), verdict, note: same(m.indicated) });
    lines.set(id, { anim: m.anim, name: m.name, lines: [same(`${m.name}: ${m.indicated}. ${m.comment}`), same(m.comment)], what: same(m.comment), dose: same(m.indicated) });
  });
  const urgent = /emergency|urgent(ly)? (referral|refer|review)|same-day|immediate(ly)? refer/i.test(`${book.working} ${book.plan}`);
  if (urgent) {
    options.push({ id: "refer", group: "refer", name: treatment("refer")!.name, what: same(book.plan), dose: treatment("refer")!.dose, verdict: "best" });
    lines.set("refer", { anim: "talk", name: "Urgent referral", lines: [same(`Working diagnosis: ${book.working}.`), same(`Plan: ${book.plan}`)], what: same(book.plan), dose: same("") });
    for (const o of options) if (o.id !== "refer" && o.id !== "book-education") { o.verdict = "avoid"; o.note = same(`Not now: ${book.plan}`); }
  }
  const notes = [...book.manualNotes.filter((n) => /preferred|avoid|starting choice/i.test(n)), ...book.modalityNotes.slice(0, 1)];
  return {
    source: "book",
    bookTitle: book.title,
    bookSlug: book.slug,
    area,
    side: s,
    start,
    options,
    exercises: urgent ? [] : book.exercises3d,
    avoidExercises: {},
    notes,
    show: (id) => {
      const l = lines.get(id);
      if (!l) return null;
      return showFor(l.anim, plan, start, l.name, l.lines, l.what, l.dose);
    },
  };
}

/** The hand-written plan (emergencies, patients without a chapter). */
export function setupFromPlan(caseId: string, start: PatientPosition): TreatSetup | null {
  const plan = PLANS[caseId];
  if (!plan) return null;
  const named = new Set([...plan.best, ...(plan.ok ?? []), ...Object.keys(plan.avoid ?? {})]);
  const options: TreatOption[] = TREATMENTS.filter((t) => t.group !== "manual" || !t.regions || named.has(t.id)).map((t) => ({
    id: t.id, group: t.group, name: t.name, what: t.what, dose: t.dose,
    verdict: plan.avoid?.[t.id] ? "avoid" : plan.best.includes(t.id) ? "best" : plan.ok?.includes(t.id) ? "ok" : "unneeded",
    note: plan.avoid?.[t.id],
  }));
  return {
    source: "plan", area: plan.area, side: plan.side, start, options, exercises: plan.exercises, avoidExercises: plan.avoidExercises ?? {}, notes: [],
    show: (id) => {
      const t = treatment(id);
      if (!t) return null;
      if (t.group === "education" || t.group === "refer") return talkShow(t, plan, start);
      if (t.group === "manual") return manualShow(t, plan);
      return modalityShow(t, plan);
    },
  };
}

/** The 26 original patients → their book chapter (treatment from the book), except the emergencies, which stay "stop and refer". */
export const CASE_BOOK: Record<string, string> = {
  "lumbar-l5": "lumbar-radiculopathy", "c6-radiculopathy": "cervical-radiculopathy", "carpal-tunnel": "carpal-tunnel-syndrome",
  "rotator-cuff-tear": "rotator-cuff-tendinopathy", "frozen-shoulder": "adhesive-capsulitis", "acl-tear": "acl-injury", "knee-oa": "knee-osteoarthritis",
  "ankle-sprain": "lateral-ankle-sprain", stroke: "stroke-rehabilitation", "ulnar-neuropathy-elbow": "cubital-tunnel-syndrome", "lumbar-stenosis": "lumbar-spinal-stenosis",
  "lateral-elbow": "lateral-epicondylalgia", "plantar-heel-pain": "plantar-heel-pain", "hip-oa": "hip-osteoarthritis", "tkr-stiff-knee": "knee-and-hip-arthroplasty-rehabilitation",
  "diabetic-neuropathy": "falls-and-frailty",
};

/* ------------------------------------------------------------------ */
/* Judging the treatment                                               */
/* ------------------------------------------------------------------ */

export const exercisesNeededFor = (s: TreatSetup) => Math.min(2, s.exercises.length);
export function setupComplete(s: TreatSetup, done: string[], exDone: string[]) {
  const best = s.options.filter((o) => o.verdict === "best").every((o) => done.includes(o.id));
  return best && exDone.filter((id) => s.exercises.includes(id)).length >= exercisesNeededFor(s);
}
export function scoreSetup(s: TreatSetup, done: string[], exDone: string[], refused: string[]) {
  const name = (id: string) => s.options.find((o) => o.id === id)?.name.en ?? id;
  const best = s.options.filter((o) => o.verdict === "best").map((o) => o.id);
  const detail: string[] = best.map((id) => `${done.includes(id) ? "✓" : "✗"} ${name(id)}`);
  for (const id of done) {
    const o = s.options.find((x) => x.id === id);
    if (o?.verdict === "ok") detail.push(`✓ ${o.name.en} (an option the book lists)`);
    if (o?.verdict === "unneeded") detail.push(`✗ ${o.name.en} — the book: ${o.note?.en ?? "not routinely recommended"}`);
  }
  const need = exercisesNeededFor(s);
  const exHit = exDone.filter((id) => s.exercises.includes(id)).length;
  if (need) detail.push(`${exHit >= need ? "✓" : "✗"} Exercises from the book's prescription: ${exHit} of at least ${need}`);
  for (const id of refused) detail.push(`✗ Unsafe choice stopped: ${name(id)}`);
  const unneeded = done.filter((id) => s.options.find((o) => o.id === id)?.verdict === "unneeded").length;
  let total = Math.round((best.length ? (best.filter((id) => done.includes(id)).length / best.length) * 50 : 50) + (need ? (Math.min(need, exHit) / need) * 30 : 30) + Math.max(0, 20 - refused.length * 10) - unneeded * 5);
  if (best.includes("refer") && !done.includes("refer")) total = Math.min(total, 30);
  total = Math.max(0, Math.min(100, total));
  return { total, detail, passed: total >= 70 && refused.length === 0 };
}

export type { PropKind };
