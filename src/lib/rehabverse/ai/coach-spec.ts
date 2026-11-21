import type { Bi, ExerciseDef } from "../types.ts";
import type { Lang } from "./intake-spec.ts";

/**
 * The exercise coach: what it knows (today's prescribed exercises plus the reviewed library text for them) and the answers it can give
 * WITHOUT any model. Everything here is plain code, so it is tested without a model and works when the model is down.
 *
 * Rules the coach keeps: it explains what the physiotherapist prescribed and what the library says; it never changes a dose, swaps or
 * skips an exercise, advises on medicines or heat/ice, diagnoses, or reassures about symptoms. Anything like that goes to the physiotherapist.
 */
export type CoachDose = {
  sets: number | null; reps: number | null; holdSeconds: number | null; restSeconds: number | null; durationSeconds: number | null;
  frequency: string | null; side: string;
};
export type CoachLibrary = { summary: Bi; targets: string; equipment: string | null; setup: Bi; steps: Bi[]; breathing: Bi; mistakes: Bi[]; safety: Bi[] };
export type CoachExercise = {
  index: number;
  id: string;
  name: Bi;
  dose: CoachDose;
  /** Written by the physiotherapist for this patient. */
  precautions: string | null;
  notes: string | null;
  /** The reviewed library text (patient-facing fields only); null when the library has no entry. */
  library: CoachLibrary | null;
};
/** The patient-facing part of a library exercise: all the coach reads (a full ExerciseDef is assignable to it). */
export type CoachDef = Pick<ExerciseDef, "id" | "name" | "summary" | "targets" | "equipment" | "setup" | "steps" | "breathing" | "mistakes" | "safety" | "dosage">;
export type CoachContext = { dayNumber: number; title: string; exercises: CoachExercise[] };

export type PlanLine = {
  exercise_id: string; exercise_title: string; sets: number | null; reps: number | null; hold_seconds: number | null; rest_seconds: number | null;
  duration_seconds: number | null; side: string; frequency: string | null; precautions: string | null; notes: string | null;
};

export const MAX_COACH_TURNS = 30;
export const MAX_COACH_MESSAGE = 600;

/** Builds the coach's knowledge of today from the prescription and the library. Clinician-only library fields (contraindications, progressions, regressions) are never copied. */
export function buildCoachContext(day: { day_number: number; title: string }, plan: PlanLine[], defs: Map<string, CoachDef>): CoachContext {
  return {
    dayNumber: day.day_number,
    title: day.title,
    exercises: plan.map((line, index): CoachExercise => {
      const def = defs.get(line.exercise_id);
      return {
        index,
        id: line.exercise_id,
        name: def?.name ?? { en: line.exercise_title, ru: line.exercise_title },
        dose: {
          sets: line.sets ?? def?.dosage.sets ?? null, reps: line.reps ?? def?.dosage.reps ?? null, holdSeconds: line.hold_seconds ?? def?.dosage.holdSeconds ?? null,
          restSeconds: line.rest_seconds ?? def?.dosage.restSeconds ?? null, durationSeconds: line.duration_seconds ?? def?.dosage.durationSeconds ?? null,
          frequency: line.frequency ?? def?.dosage.frequency ?? null, side: line.side,
        },
        precautions: line.precautions?.trim() || null,
        notes: line.notes?.trim() || null,
        library: def
          ? { summary: def.summary, targets: def.targets, equipment: def.equipment ?? null, setup: def.setup, steps: def.steps, breathing: def.breathing, mistakes: def.mistakes, safety: def.safety }
          : null,
      };
    }),
  };
}

/** What the coach's words about amounts are checked against (coach-guard.ts): sets, repetitions, time and other units are separate, so "3 sets" is not allowed just because a hold is 3 seconds. */
export type Amounts = { sets: Set<number>; reps: Set<number>; time: Set<number>; other: Set<number> };
export const AMOUNT_UNIT = /(\d+(?:\.\d+)?)\s*(?:x\s*)?(reps?|repetitions?|sets?|times|seconds?|secs?|minutes?|mins?|degrees?|cm|kg|kilos?|%|percent)\b/gi;
export const amountKind = (unit: string): keyof Amounts => {
  const u = unit.toLowerCase();
  if (u.startsWith("set")) return "sets";
  if (u.startsWith("rep") || u === "times") return "reps";
  if (u.startsWith("sec") || u.startsWith("min")) return "time";
  return "other";
};

/** Every amount the coach may state: the prescription, and the amounts written in the library text and the physiotherapist's notes for today's exercises. */
export function allowedAmounts(ctx: CoachContext): Amounts {
  const a: Amounts = { sets: new Set(), reps: new Set(), time: new Set(), other: new Set() };
  const scan = (text: string | null | undefined) => { for (const m of (text ?? "").matchAll(AMOUNT_UNIT)) a[amountKind(m[2])].add(Number(m[1])); };
  for (const ex of ctx.exercises) {
    const d = ex.dose;
    if (d.sets) a.sets.add(d.sets);
    if (d.reps) a.reps.add(d.reps);
    for (const seconds of [d.holdSeconds, d.restSeconds, d.durationSeconds]) if (seconds) { a.time.add(seconds); a.time.add(Math.round(seconds / 60)); }
    scan(d.frequency); scan(ex.precautions); scan(ex.notes);
    const lib = ex.library;
    if (lib) for (const bi of [lib.summary, lib.setup, lib.breathing, ...lib.steps, ...lib.mistakes, ...lib.safety]) { scan(bi.en); scan(bi.ru); }
  }
  return a;
}

/* ───────────────────────── wording ───────────────────────── */

const t = (lang: Lang, value: Bi) => (lang === "ru" ? value.ru : value.en);
const first = (text: string) => text.replace(/\s+/g, " ").trim();

export const COACH_GREETING: Record<Lang, string> = {
  en: "Hello, I am your exercise coach, an AI assistant. I can explain each exercise in today's plan, how many to do, your breathing, and common mistakes. Pick an exercise and ask, or type your question. Your physiotherapist sets your exercises, so anything about changing them, medicines or symptoms goes to them.",
  ru: "Assalam-o-alaikum, main aap ka exercise coach hoon, ek AI assistant. Main aaj ke plan ki har exercise samjha sakta hoon: kaise karni hai, kitni baar, saans, aur aam ghaltiyan. Exercise chunein aur poochein, ya apna sawal likhein. Exercises aap ke physiotherapist tay karte hain, isliye unhein badalne, dawai ya alamaat ke baare mein sawal unhi se hoga.",
};

export const COACH_DISCLAIMER: Record<Lang, string> = {
  en: "I am an AI coach, not a doctor or a physiotherapist.",
  ru: "Main AI coach hoon, doctor ya physiotherapist nahi.",
};

const FOR_PHYSIO: Record<Lang, string> = {
  en: "That is a question for your physiotherapist: they chose your exercises and the amounts, and only they can change them. I have noted it for them, and you can also write it in your feedback after today's session.",
  ru: "Ye sawal aap ke physiotherapist ke liye hai: unhon ne aap ki exercises aur miqdar tay ki hain aur sirf wohi unhein badal sakte hain. Maine ye unke liye note kar liya hai, aur aap aaj ke session ke baad feedback mein bhi likh sakte hain.",
};
export const NOTED_FOR_PHYSIO: Record<Lang, string> = {
  en: "I have noted this for your physiotherapist.",
  ru: "Maine ye aap ke physiotherapist ke liye note kar liya hai.",
};

/** The pain answer reuses the wording of the guide that is already shown throughout RehabVerse (src/lib/rehabverse/guide.ts, TOPIC_PAIN). */
const PAIN: Record<Lang, string> = {
  en: "A mild to moderate ache or stretch can be normal while you get stronger. But sharp, severe or worsening pain is not okay: stop, rest, and tell your physiotherapist in your feedback. Your physiotherapist sets the limit that is right for you. If you felt a pop, tearing, dizziness, chest pain or new numbness or weakness, stop now and get help.",
  ru: "Halka se darmiyana dard ya khinchao exercise mein normal ho sakta hai jab aap mazboot ho rahe hon. Lekin tez, shadeed ya barhta hua dard theek nahi: ruk jayein, aaram karein aur apne physiotherapist ko feedback mein bataein. Aap ke liye sahi hadd aap ke physiotherapist tay karte hain. Agar pop, phatne jaisa ehsas, chakkar, seene mein dard ya naya sunn-pan ya kamzori mehsoos hui to abhi ruk jayein aur madad lein.",
};

export const COACH_MENU: Record<Lang, string> = {
  en: "I can help with how to do an exercise, how many to do, your breathing, common mistakes, and what you need. Pick an exercise below and tap a question, or type it. For anything about changing your plan, medicines or symptoms, your physiotherapist is the right person.",
  ru: "Main madad kar sakta hoon: exercise kaise karni hai, kitni baar, saans, aam ghaltiyan, aur kya cheez chahiye. Neeche se exercise chunein aur sawal dabayein, ya likh dein. Plan badalne, dawai ya alamaat ke baare mein aap ke physiotherapist hi sahi insaan hain.",
};

export const COACH_LIMIT: Record<Lang, string> = {
  en: "We have talked a lot today. Please use your feedback form after the session, and ask your physiotherapist about anything else.",
  ru: "Aaj hum ne bohat baat kar li. Session ke baad feedback form istemal karein aur baaki baat apne physiotherapist se poochein.",
};

/** Shown when the patient types a safety problem: stop, and the physiotherapist is told. Never reassures. */
export const COACH_STOP: Record<Lang, string> = {
  en: "Please stop exercising for now. What you describe needs your physiotherapist to look at it, and I have told them. Please do not carry on with the rest of today's session. If it feels serious, or you have chest pain, trouble breathing, fainting, or sudden weakness or numbness, call 1122 or go to the nearest emergency department now.",
  ru: "Barah-e-karam abhi exercise rok dein. Jo aap bata rahe hain use aap ke physiotherapist ko dekhna hoga, aur maine unhein bata diya hai. Aaj ke session ki baaki exercises na karein. Agar halat serious lage, ya seene mein dard, saans mein mushkil, behoshi, ya achanak kamzori ya sunn-pan ho, to abhi 1122 par call karein ya qareebi emergency department jayein.",
};

/* ───────────────────────── what the patient is asking ───────────────────────── */

export type Intent = "how" | "dose" | "mistakes" | "breathing" | "equipment" | "safety" | "pain" | "physio" | "plan";

const norm = (text: string) => text.toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9؀-ۿ?\s/]/g, " ").replace(/\s+/g, " ").trim();

/** Questions that only the physiotherapist can answer: changing the plan, substituting or skipping, medicines, heat and ice, diagnosis, outcome, other exercises. */
const PHYSIO_ONLY: RegExp[] = [
  /\b(can|could|may|should|shall) i (skip|replace|swap|change|stop|do (more|less|extra|double|another|something else|a different|it without)|add|increase|decrease|reduce|use (a )?(heavier|lighter|different)|do it (on|in|with|without)|miss|leave out)\b/,
  /\b(instead of|in place of|substitute|alternative exercise|different exercise|another exercise|more exercises?|extra exercises?|add (another|more)|harder|easier version|too easy|too hard|make it (harder|easier))\b/,
  /\b(kam|zyada|double|aur|extra)\s+(kar|karun|karoon|kar lun|kar loon|kar sakta|kar sakti)\b|\b(chhod|chor|skip)\s+(doon|don|dun|sakta|sakti|dein)\b|\b(badal|badalna|badlun)\b/,
  /\b(medicine|medication|tablet|painkiller|pain killer|paracetamol|panadol|ibuprofen|brufen|diclofenac|voltaren|cream|gel|spray|injection|ointment|supplement|dawai|dawa|goli|ilaaj|ilaj)\b/,
  /\b(ice|heat|hot pack|cold pack|hot water|garam seak|seak|barf|massage|brace|belt|tape|taping|cupping|dry needling|ultrasound|tens|rest day|bed rest)\b/,
  /\b(diagnos\w*|what is wrong|whats wrong|what do i have|is it (a |an )?[a-z ]{3,30}\?|slipped disc|sciatica|arthritis|fracture|tear|torn|ligament|cancer|surgery|operation|scan|mri|x-?ray|bimari|kya hua hai mujhe|kya masla hai)\b/,
  /\b(will i (get|be|recover|heal)|how long (will|until|before) (it|i|my)|when will (it|i)|am i (ok|okay|fine|getting better|improving)|theek ho (jaunga|jaungi|jaye ga|jayega)|kab tak theek)\b/,
];

const DOSE = /\b(how many|how much|how often|how long|how many times|sets?|reps?|repetitions?|hold|rest between|frequency|times a day|per day|kitni|kitne|kitna|kab tak|kitni dair|kitni baar|kitna waqt|dose)\b/;
const HOW = /\b(how (do|to|can|should) (i|you)|how is (it|this) done|how do i do|steps?|technique|position|starting position|get into|start(ing)?|kaise|kese|tareeqa|tariqa|shuru|samjha|explain|show me|what do i do)\b/;
const MISTAKES = /\b(mistake|mistakes|wrong|incorrect|form|common error|avoid|galat|ghalti|ghaltiyan|ghalat)\b/;
const BREATH = /\b(breath\w*|inhale|exhale|saans|sans)\b/;
const EQUIPMENT = /\b(equipment|what do i need|need anything|need a|towel|band|chair|mat|weights?|dumbbell|bottle|kya chahiye|cheez chahiye|saman)\b/;
const PAIN_WORDS = /\b(hurt|hurts|hurting|pain|painful|sore|ache|aching|uncomfortable|burn|burning|pinch|strain|discomfort|dard|dukh|takleef|chubh|jalan|dard ho)\b/;
const SAFETY = /\b(safe|safety|precaution|careful|stop if|when to stop|kab rukna|hifazat)\b/;
const PLAN = /\b(today|todays|plan|what exercises|how many exercises|all exercises|aaj|kya kya|konsi exercises?)\b/;

/**
 * Replaces an exercise's full name with "this exercise" before the safety screen reads the message: "What if Prone chest lift hurts?" is a
 * question about an exercise, not a report of chest pain. Only the whole name is masked, so "my chest hurts when I do the chest lift" is still an alarm.
 */
export function maskExerciseNames(text: string, ctx: CoachContext): string {
  let out = text;
  const names = ctx.exercises.flatMap((ex) => [ex.name.en, ex.name.ru]).filter((n) => n.trim().length >= 3).sort((a, b) => b.length - a.length);
  for (const name of names) out = out.replace(new RegExp(name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "gi"), "this exercise");
  return out;
}

export function detectIntent(text: string, ctx?: CoachContext): Intent | null {
  let t = norm(text);
  // an exercise's own name must not be read as a question about something else ("Core brace" is not about a brace)
  if (ctx) {
    for (const ex of ctx.exercises) for (const name of [ex.name.en, ex.name.ru]) { const n = norm(name); if (n.length >= 3) t = t.split(n).join(" x "); }
    // ...and a partly typed name ("band row")
    const words = new Set(ctx.exercises.flatMap((ex) => norm(`${ex.name.en} ${ex.name.ru}`).split(" ")).filter((w) => w.length >= 4));
    t = t.split(" ").map((w) => (words.has(w) ? "x" : w)).join(" ");
  }
  if (!t) return null;
  if (PHYSIO_ONLY.some((rule) => rule.test(t))) return "physio";
  if (PAIN_WORDS.test(t)) return "pain";
  if (DOSE.test(t)) return "dose";
  if (MISTAKES.test(t)) return "mistakes";
  if (BREATH.test(t)) return "breathing";
  if (EQUIPMENT.test(t)) return "equipment";
  if (SAFETY.test(t)) return "safety";
  if (PLAN.test(t) && !HOW.test(t)) return "plan";
  if (HOW.test(t)) return "how";
  return null;
}

/** Which exercise is meant: a name or a distinctive word of its name in the message, otherwise the one the patient has open. */
export function pickExercise(text: string, ctx: CoachContext, focus: number | null): CoachExercise | null {
  const t = norm(text);
  let best: { exercise: CoachExercise; score: number } | null = null;
  for (const exercise of ctx.exercises) {
    const words = new Set(norm(`${exercise.name.en} ${exercise.name.ru}`).split(" ").filter((w) => w.length >= 4 && !["with", "your", "from", "lying", "sitting", "standing", "strap", "each", "side"].includes(w)));
    const score = [...words].filter((w) => t.includes(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { exercise, score };
  }
  if (best) return best.exercise;
  return focus !== null && ctx.exercises[focus] ? ctx.exercises[focus] : ctx.exercises.length === 1 ? ctx.exercises[0] : null;
}

/* ───────────────────────── answers made from the plan and the library ───────────────────────── */

const nameOf = (ex: CoachExercise, lang: Lang) => t(lang, ex.name);

function doseText(ex: CoachExercise, lang: Lang): string {
  const d = ex.dose;
  const ru = lang === "ru";
  const parts: string[] = [];
  if (d.sets) parts.push(ru ? `${d.sets} sets` : `${d.sets} set${d.sets === 1 ? "" : "s"}`);
  if (d.reps) parts.push(ru ? `har set mein ${d.reps} reps` : `${d.reps} repetitions each`);
  if (d.holdSeconds) parts.push(ru ? `${d.holdSeconds} second hold` : `hold for ${d.holdSeconds} seconds`);
  if (d.durationSeconds) parts.push(ru ? `${d.durationSeconds >= 60 ? `${Math.round(d.durationSeconds / 60)} minute` : `${d.durationSeconds} second`}` : d.durationSeconds >= 60 ? `${Math.round(d.durationSeconds / 60)} minutes` : `${d.durationSeconds} seconds`);
  if (d.restSeconds) parts.push(ru ? `sets ke beech ${d.restSeconds} second rest` : `rest ${d.restSeconds} seconds between sets`);
  if (d.frequency) parts.push(ru ? `kitni baar: ${d.frequency}` : `how often: ${d.frequency}`);
  const side = d.side === "left" ? (ru ? "sirf left side" : "left side only") : d.side === "right" ? (ru ? "sirf right side" : "right side only") : d.side === "alternate" ? (ru ? "baari baari dono side" : "alternate sides") : "";
  if (side) parts.push(side);
  return parts.join(ru ? ", " : ", ");
}

export function answerFor(intent: Intent, ex: CoachExercise | null, ctx: CoachContext, lang: Lang): { text: string; notify: boolean } {
  const ru = lang === "ru";
  if (intent === "physio") return { text: FOR_PHYSIO[lang], notify: true };
  if (intent === "pain") return { text: `${PAIN[lang]}${ex?.precautions ? `\n\n${ru ? "Aap ke physiotherapist ne is exercise ke liye likha hai" : "Your physiotherapist wrote for this exercise"}: ${first(ex.precautions)}` : ""}\n\n${NOTED_FOR_PHYSIO[lang]}`, notify: true };
  if (intent === "plan") {
    const lines = ctx.exercises.map((e, i) => `${i + 1}. ${nameOf(e, lang)} (${doseText(e, lang) || (ru ? "miqdar aap ke physiotherapist ne likhi" : "amount set by your physiotherapist")})`);
    return { text: `${ru ? `Aaj (din ${ctx.dayNumber}) ki exercises` : `Today's exercises (day ${ctx.dayNumber})`}:\n${lines.join("\n")}`, notify: false };
  }
  if (!ex) {
    const names = ctx.exercises.map((e, i) => `${i + 1}. ${nameOf(e, lang)}`).join("\n");
    return { text: `${ru ? "Kis exercise ke baare mein? Neeche se chunein" : "Which exercise do you mean? Pick one below"}:\n${names}`, notify: false };
  }
  const lib = ex.library;
  switch (intent) {
    case "dose": {
      const text = doseText(ex, lang);
      return { text: text ? `${nameOf(ex, lang)}: ${ru ? "aap ke physiotherapist ne ye tay kiya hai" : "your physiotherapist set this"}: ${text}.${ex.notes ? ` ${first(ex.notes)}` : ""}` : `${ru ? "Is exercise ki miqdar aap ke physiotherapist ne likhi hai" : "Your physiotherapist set the amount for this exercise"}.`, notify: false };
    }
    case "how": {
      if (!lib) return { text: `${nameOf(ex, lang)}: ${ru ? "Mere paas is exercise ke steps nahi hain. Demo dekhein ya apne physiotherapist se poochein" : "I do not have the steps for this exercise. Watch the demo or ask your physiotherapist"}.`, notify: false };
      const steps = lib.steps.map((s, i) => `${i + 1}. ${first(t(lang, s))}`).join("\n");
      return { text: `${nameOf(ex, lang)}\n${ru ? "Shuru ki position" : "Starting position"}: ${first(t(lang, lib.setup))}\n${steps}\n${ru ? "Saans" : "Breathing"}: ${first(t(lang, lib.breathing))}`, notify: false };
    }
    case "mistakes": {
      if (!lib || !lib.mistakes.length) return { text: ru ? "Is exercise ke liye mere paas aam ghaltiyon ki list nahi hai." : "I do not have a list of common mistakes for this exercise.", notify: false };
      return { text: `${nameOf(ex, lang)} — ${ru ? "aam ghaltiyan" : "common mistakes"}:\n${lib.mistakes.map((m) => `• ${first(t(lang, m))}`).join("\n")}`, notify: false };
    }
    case "breathing":
      return { text: lib ? `${nameOf(ex, lang)} — ${ru ? "saans" : "breathing"}: ${first(t(lang, lib.breathing))}` : ru ? "Normal saans lete rahein, saans na rokein." : "Keep breathing normally and do not hold your breath.", notify: false };
    case "equipment":
      return { text: `${nameOf(ex, lang)}: ${lib?.equipment ? `${ru ? "aap ko chahiye" : "you need"}: ${lib.equipment}` : ru ? "koi khaas cheez nahi chahiye" : "no special equipment is needed"}.`, notify: false };
    case "safety": {
      const lines = lib?.safety.map((s) => `• ${first(t(lang, s))}`) ?? [];
      if (ex.precautions) lines.unshift(`• ${ru ? "Aap ke physiotherapist" : "Your physiotherapist"}: ${first(ex.precautions)}`);
      return { text: `${nameOf(ex, lang)} — ${ru ? "hifazat" : "stay safe"}:\n${lines.join("\n") || PAIN[lang]}`, notify: false };
    }
    default:
      return { text: COACH_MENU[lang], notify: false };
  }
}

/* ───────────────────────── a coach talking, not a form ───────────────────────── */

/**
 * A short, warm opening and (every other answer) a closing line around an answer made from the plan, so the scripted answers sound like a
 * coach and not like a printout. Nothing in them says anything about amounts, symptoms or the plan, so they cannot change what the answer
 * means; the choice is made by the turn number, so a patient asking several things in a row does not read the same sentence twice.
 */
const OPENERS: Partial<Record<Intent, Bi[]>> = {
  how: [
    { en: "Sure, here is how to do it.", ru: "Zaroor, aaiye step by step dekhte hain." },
    { en: "Of course. Let me walk you through it.", ru: "Bilkul, main samjha deta hoon." },
    { en: "Happy to explain. Here we go.", ru: "Theek hai, suniye." },
  ],
  dose: [
    { en: "Good question. This is what your physiotherapist set for you.", ru: "Achha sawal hai. Aap ke physiotherapist ne ye tay kiya hai." },
    { en: "Here is your prescription for it.", ru: "Ye raha aap ka prescription is ke liye." },
    { en: "Sure, here is the amount.", ru: "Zaroor, miqdar ye hai." },
  ],
  mistakes: [
    { en: "It helps to know what to watch out for.", ru: "Ye jaan lena achha hai ke kin cheezon se bachna hai." },
    { en: "Good to ask. These are the common slips.", ru: "Achha kiya poocha. Aam ghaltiyan ye hain." },
    { en: "Sure, here is what to avoid.", ru: "Zaroor, in se bachein." },
  ],
  breathing: [
    { en: "Breathing makes a real difference. Here is what to do.", ru: "Saans se bohat farq parta hai. Ye karein." },
    { en: "Good thinking. Here is how to breathe with it.", ru: "Achha khayal hai. Saans aise lein." },
    { en: "Sure, about your breathing.", ru: "Zaroor, saans ke baare mein." },
  ],
  equipment: [
    { en: "Here is what you will need.", ru: "Is ke liye ye chahiye hoga." },
    { en: "Good to get ready first. Here you go.", ru: "Pehle tayyari kar lena achha hai. Ye dekhiye." },
    { en: "Sure, this is what to have ready.", ru: "Zaroor, ye cheezein tayyar rakhein." },
  ],
  safety: [
    { en: "Good to ask. Staying safe comes first.", ru: "Achha kiya poocha. Hifazat sab se pehle." },
    { en: "Of course. Here is how to keep it safe.", ru: "Bilkul. Ye hifazat ki baatein hain." },
    { en: "Sure, here is what to keep in mind.", ru: "Zaroor, ye dhyan mein rakhein." },
  ],
  plan: [
    { en: "Here is what is planned for you today.", ru: "Aaj aap ke liye ye plan hai." },
    { en: "Sure, here is today's plan.", ru: "Zaroor, aaj ka plan ye hai." },
    { en: "Let us look at today together.", ru: "Aaiye aaj ka plan saath dekhte hain." },
  ],
  pain: [
    { en: "Thank you for asking about this before carrying on.", ru: "Aage barhne se pehle poochna achha kiya." },
    { en: "I am glad you asked. This matters.", ru: "Achha hua aap ne poocha. Ye zaroori hai." },
    { en: "Let us take that carefully.", ru: "Is baat ko ehtiyaat se lete hain." },
  ],
};
const CLOSERS: Bi[] = [
  { en: "Tell me if you would like to go through anything else.", ru: "Kuch aur poochna ho to batayein." },
  { en: "You can ask me anything else about today's plan.", ru: "Aaj ke plan ke baare mein jo bhi poochna ho, poochein." },
];
const CLOSING_INTENTS: Intent[] = ["how", "dose", "mistakes", "breathing", "equipment", "plan"];

export function conversational(intent: Intent, text: string, lang: Lang, seed: number): string {
  if (intent === "physio") return text; // the physiotherapist's message stays exactly as it is
  const n = Math.abs(Math.trunc(seed));
  const openers = OPENERS[intent];
  const open = openers ? t(lang, openers[n % openers.length]) : "";
  const close = CLOSING_INTENTS.includes(intent) && n % 2 === 0 ? t(lang, CLOSERS[(n >> 1) % CLOSERS.length]) : "";
  return [open, text, close].filter(Boolean).join("\n\n");
}

/** The quick questions offered for the exercise the patient has open (they send these exact sentences). */
export const QUICK_QUESTIONS: { intent: Intent; label: Bi; ask: (name: Bi) => Bi }[] = [
  { intent: "how", label: { en: "How do I do it?", ru: "Kaise karni hai?" }, ask: (n) => ({ en: `How do I do ${n.en}?`, ru: `${n.ru} kaise karni hai?` }) },
  { intent: "dose", label: { en: "How many?", ru: "Kitni baar?" }, ask: (n) => ({ en: `How many sets and reps of ${n.en}?`, ru: `${n.ru} kitni baar karni hai?` }) },
  { intent: "mistakes", label: { en: "Common mistakes", ru: "Aam ghaltiyan" }, ask: (n) => ({ en: `What are the common mistakes in ${n.en}?`, ru: `${n.ru} mein aam ghaltiyan kya hain?` }) },
  { intent: "breathing", label: { en: "Breathing", ru: "Saans" }, ask: (n) => ({ en: `How should I breathe during ${n.en}?`, ru: `${n.ru} mein saans kaise lun?` }) },
  { intent: "pain", label: { en: "What if it hurts?", ru: "Agar dard ho?" }, ask: (n) => ({ en: `What if ${n.en} hurts?`, ru: `Agar ${n.ru} mein dard ho to?` }) },
];
