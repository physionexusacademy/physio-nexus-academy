import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEEDBACK_FLAGS, INTAKE_DURATION, INTAKE_REGIONS } from "../src/lib/rehabverse/intake.ts";
import { ASK_ORDER, EMPTY_DRAFT, MAX_PATIENT_MESSAGE, nextFocus, type FieldKey, type IntakeDraft } from "../src/lib/rehabverse/ai/intake-spec.ts";
import { runIntakeTurn, type ModelCall } from "../src/lib/rehabverse/ai/intake-turn.ts";
import { EMPTY_CHECKIN, MAX_CHECKIN_MESSAGE, STEP_ORDER, nextStep, type CheckinDraft, type CheckinStep } from "../src/lib/rehabverse/ai/checkin-shared.ts";
import { runCheckinTurn } from "../src/lib/rehabverse/ai/checkin-turn.ts";
import { flagsFromText } from "../src/lib/rehabverse/ai/checkin-safety.ts";
import { COACH_PROMPT, checkinPrompt, intakePrompt, type ChatPrompt } from "../src/lib/rehabverse/ai/chat-quick.ts";
import { QUICK_QUESTIONS } from "../src/lib/rehabverse/ai/coach-spec.ts";

/**
 * The RehabVerse chats must be easy for anyone, including a person who finds reading or writing hard: every question says what to do, shows an
 * example, and offers answers to TAP. Tested without a browser or a model: every question has its tap answers in English and Roman Urdu, every
 * tap answer is understood by the assistant's own reading of answers (so a tap never leads to "I didn't catch that", even when no AI service
 * answers), the warning-sign taps stop the check-in and tick the matching sign, and the screens use the shared kit with big, labelled controls.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };
const noModel: ModelCall = async () => null;
const langs = ["en", "ru"] as const;

/* 1. The intake: a prompt for every question the assistant asks, with taps. */
const FILL: Record<string, unknown> = { regions: ["knee"], pain_now: 5, duration: "1_4w", onset: "gradual", possible_cause: "lifting", aggravating: "stairs", relieving: "rest", symptoms: ["stiffness"], functional_limitations: "walking", previous_treatment: "none", medical_conditions: "none", medications: "none", own_words: "walk" };
const draftBefore = (focus: FieldKey): IntakeDraft => {
  const draft: Record<string, unknown> = { ...EMPTY_DRAFT };
  for (const key of ASK_ORDER) { if (key === focus) break; draft[key] = FILL[key]; }
  return draft as IntakeDraft;
};
const whole = (prompt: ChatPrompt, label: string) => {
  for (const lang of langs) {
    ok(prompt.title[lang].trim().length >= 12, `${label}: a clear instruction in ${lang}`);
    ok(prompt.quick.every((chip) => chip.label[lang].trim() && chip.send[lang].trim()), `${label}: every tap answer is filled in (${lang})`);
    ok(prompt.quick.every((chip) => chip.label[lang].length <= 120), `${label}: tap answers are short enough to read at a glance (${lang})`);
    ok(new Set(prompt.quick.map((chip) => chip.label[lang])).size === prompt.quick.length, `${label}: no two tap answers say the same (${lang})`);
  }
  ok(prompt.quick.length <= 11, `${label}: not more than 11 tap answers`);
};
for (const focus of ASK_ORDER) {
  const draft = draftBefore(focus);
  eq(nextFocus(draft), focus, `intake ${focus}: test setup reaches this question`);
  const prompt = intakePrompt(draft);
  whole(prompt, `intake ${focus}`);
  ok(prompt.quick.length >= 3 || focus === "own_words", `intake ${focus}: tap answers are offered`);
  ok(prompt.example.en.length > 8 && prompt.example.ru.length > 8, `intake ${focus}: an example of a good answer`);
  ok(prompt.quick.every((chip) => chip.send.en.length <= MAX_PATIENT_MESSAGE), `intake ${focus}: a tap is never longer than a message may be`);
  /* every tap is understood by the plain-code reader, so it never ends in "I didn't catch that" */
  for (const lang of langs) {
    for (const chip of prompt.quick) {
      const r = await runIntakeTurn({ lang, history: [], draft, patientText: chip.send[lang], turnNumber: 1 }, { callModel: noModel });
      ok(r.status !== "open" || nextFocus(r.draft) !== focus, `intake ${focus} (${lang}): tapping "${chip.send[lang]}" is understood`);
    }
  }
}
{
  const done = intakePrompt(draftBeforeAll());
  ok(done.quick.length === 0 && /green button|hare button/i.test(done.title.en + done.title.ru), "intake: when everything is known the instruction points to the one big button");
}
function draftBeforeAll(): IntakeDraft { return { ...EMPTY_DRAFT, ...(FILL as Partial<IntakeDraft>) }; }
{
  const regions = intakePrompt(EMPTY_DRAFT).quick;
  eq(regions.map((c) => c.label.en), INTAKE_REGIONS.map((o) => o.label.en), "intake: every body area of the form can be tapped");
  const duration = intakePrompt(draftBefore("duration")).quick;
  eq(duration.map((c) => c.label.en), INTAKE_DURATION.map((o) => o.label.en), "intake: every duration of the form can be tapped");
  const pain = intakePrompt(draftBefore("pain_now")).quick;
  eq(pain.map((c) => c.label.en), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], "intake: pain is tapped as a number from 0 to 10");
  ok(pain.every((c) => c.send.en === c.label.en) && pain[0].tone === "good" && pain[10].tone === "bad", "intake: a pain tap sends just the number, coloured from calm to strong");
  for (const lang of langs) {
    const many = await runIntakeTurn({ lang, history: [], draft: EMPTY_DRAFT, patientText: regions.at(-1)!.send[lang], turnNumber: 1 }, { callModel: noModel });
    eq(many.draft.regions, ["multiple"], `intake (${lang}): the "more than one area" tap fills the form's "More than one area"`);
  }
}

/* 2. The check-in: a prompt for every step; the warning-sign taps are safe. */
const ctx = { dayNumber: 3, title: "Day 3", point: "24h", pointLabel: "Next day (~24 h)", session: { painBefore: 3, painDuring: 5, painAfter: 4, difficulty: 6 } };
const checkinBefore = (step: CheckinStep): CheckinDraft => {
  const draft: CheckinDraft = { ...EMPTY_CHECKIN };
  for (const key of STEP_ORDER) {
    if (key === step) break;
    if (key === "pain") draft.pain = 3;
    if (key === "signs") draft.signs = "no";
    if (key === "response") draft.symptom_response = "better";
    if (key === "function") draft.function_score = 3;
    if (key === "new_symptoms") draft.new_symptoms = false;
  }
  return draft;
};
for (const step of STEP_ORDER) {
  const draft = checkinBefore(step);
  eq(nextStep(draft), step, `check-in ${step}: test setup reaches this question`);
  const prompt = checkinPrompt(draft);
  whole(prompt, `check-in ${step}`);
  ok(prompt.quick.every((chip) => chip.send.en.length <= MAX_CHECKIN_MESSAGE), `check-in ${step}: a tap is never longer than a message may be`);
  ok(prompt.example.en.length > 8 && prompt.example.ru.length > 8 && prompt.quick.length >= 1, `check-in ${step}: an example and at least one tap answer`);
  for (const lang of langs) {
    for (const chip of prompt.quick) {
      const r = await runCheckinTurn({ lang, history: [], draft, patientText: chip.send[lang], turnNumber: 1, ctx }, { callModel: noModel });
      ok(r.status !== "open" || r.step !== step, `check-in ${step} (${lang}): tapping "${chip.send[lang]}" is understood`);
    }
  }
}
{
  const signs = checkinPrompt(checkinBefore("signs"));
  eq(signs.quick.length, 1 + FEEDBACK_FLAGS.length, "check-in: the safety question offers No and every warning sign of the form");
  for (const lang of langs) {
    const no = await runCheckinTurn({ lang, history: [], draft: checkinBefore("signs"), patientText: signs.quick[0].send[lang], turnNumber: 1, ctx }, { callModel: noModel });
    ok(no.status === "open" && no.draft.signs === "no" && no.draft.flags.length === 0, `check-in (${lang}): tapping No is a calm "none", and the chat never ticks "None of these" for the patient`);
    for (const [i, flag] of FEEDBACK_FLAGS.entries()) {
      const chip = signs.quick[i + 1];
      ok(chip.tone === "bad" && flagsFromText(chip.send[lang]).includes(flag.id), `check-in (${lang}): the tap "${flag.id}" names that sign, so the form can tick it`);
      const r = await runCheckinTurn({ lang, history: [], draft: checkinBefore("signs"), patientText: chip.send[lang], turnNumber: 1, ctx }, { callModel: noModel });
      ok(r.status === "safety_stop" && r.draft.flags.includes(flag.id), `check-in (${lang}): tapping a warning sign stops the chat, tells the physiotherapist and ticks "${flag.id}"`);
    }
  }
}
{
  const done = checkinPrompt({ ...EMPTY_CHECKIN, ...checkinBefore("note"), note: "ok", done: true } as CheckinDraft);
  ok(done.quick.length === 0 && /Save/.test(done.title.en), "check-in: when all is answered the instruction says Save");
}

/* 3. The coach. */
{
  ok(COACH_PROMPT.quick.length === 0, "coach: its tap questions come from the coach's own list (one per intent), each tied to the open exercise");
  ok(QUICK_QUESTIONS.length >= 5 && QUICK_QUESTIONS.every((q) => q.label.en.length <= 30 && q.label.ru.length <= 30), "coach: five short tap questions");
  ok(COACH_PROMPT.title.en.length > 12 && COACH_PROMPT.title.ru.length > 12 && COACH_PROMPT.example.en.length > 8, "coach: an instruction and an example");
}

/* 4. The screens. */
const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
{
  const kit = src("src/components/rehabverse/ChatKit.tsx");
  const css = src("src/components/rehabverse/chat-kit.css");
  const rule = (selector: string) => (css.match(new RegExp(`${selector.replace(/[.[\]]/g, "\\$&")}\\s*\\{([^}]*)\\}`)) ?? [])[1] ?? "";
  for (const [file, label] of [["IntakeChat", "Your message"], ["CoachChat", "Your question"], ["CheckinChat", "Your answer"]] as const) {
    const code = src(`src/components/rehabverse/${file}.tsx`);
    ok(/from "\.\/ChatKit"/.test(code) && /<YourTurn/.test(code) && /<ChatLog/.test(code), `${file}: built from the shared chat kit`);
    ok(code.includes(`"${label}"`) && !/<textarea|<Send\b/.test(code), `${file}: the box keeps its label "${label}", and the box and Send button come only from the kit`);
    ok(/ck-big/.test(code) && /ck-lead/.test(code), `${file}: the screen before the chat says in one line what will happen, with big buttons`);
    ok(/<HowItWorks/.test(code), `${file}: the three steps (read, tap or write, press Send) are shown`);
  }
  ok(/role="log"/.test(kit) && /<textarea/.test(kit) && /type="submit"/.test(kit) && /<T en="Send" ru="Bhejein" \/>/.test(kit), "kit: the conversation log, the box, and a Send button that says Send (not only an icon)");
  ok(/data-now/.test(kit) && /Question now/.test(kit) && /Abhi ka sawal/.test(kit), "kit: the open question is highlighted and named");
  ok(/data-coach-quick/.test(kit), "kit: the coach's tap questions keep their test hooks");
  ok(/aria-label=\{inputLabel\}/.test(kit) && /enterKeyHint="send"/.test(kit), "kit: the box is labelled for screen readers and the phone keyboard shows a Send key");
  const px = (text: string, prop: string) => { const m = text.match(new RegExp(`${prop}:\\s*([\\d.]+)(px|rem)`)); return m ? Number(m[1]) * (m[2] === "rem" ? 16 : 1) : 0; };
  ok(px(rule(".ck-chip"), "min-height") >= 44 && px(rule(".ck-send"), "min-height") >= 44 && px(rule(".ck-quit"), "min-height") >= 44, "css: every tap target is at least 44px tall");
  ok(px(rule(".ck-compose textarea"), "font-size") >= 16, "css: the box text is 16px or more, so phones do not zoom in");
  ok(px(rule(".ck-bubble"), "font-size") >= 16, "css: messages are read at 16px");
  ok(/dvh/.test(css) && /max-width:\s*520px/.test(css), "css: heights use the phone's real screen (dvh) and the Send button goes full width on a phone");
  ok(/prefers-reduced-motion/.test(css), "css: calm for people who turned animations off");
}
{
  /* the owner asked for no "AI-written from PNA content" label anywhere a visitor reads */
  for (const file of ["src/components/home/LobbySearch.tsx", "src/components/nexus/CommandPalette.tsx"]) {
    ok(!/from PNA content|PNA content par/i.test(src(file)), `${file}: no "from PNA content" label`);
  }
}

console.log(`RehabVerse chat screens: ${checks} checks passed (every question has an instruction, an example and tap answers in English and Roman Urdu; every tap is understood without any AI service; warning-sign taps stop the check-in and tick the sign; big labelled controls, 16px text and 44px targets).`);
