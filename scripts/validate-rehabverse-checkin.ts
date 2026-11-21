import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEEDBACK_FLAGS } from "../src/lib/rehabverse/intake.ts";
import {
  CHECKIN_WINDOWS, EMPTY_CHECKIN, MAX_CHECKIN_TURNS, STEP_ORDER, checkinPending, chatVersusForm, isAnswered, nextStep, readCheckinDraft, type CheckinDraft,
} from "../src/lib/rehabverse/ai/checkin-shared.ts";
import {
  AFTER_STOP, CHECKIN_STOP, HELP, QUESTION, applyReading, asksPhysio, checkinGreeting, readResponse, readScale, readSkip, readStepAnswer, readYesNo, scriptedAck, summaryText,
} from "../src/lib/rehabverse/ai/checkin-spec.ts";
import { flagsForAlert, flagsFromText, readSigns, screenCheckinText, stripDenials } from "../src/lib/rehabverse/ai/checkin-safety.ts";
import { guardAck } from "../src/lib/rehabverse/ai/checkin-guard.ts";
import { buildCheckinMessages, checkinSystemPrompt, type CheckinContext } from "../src/lib/rehabverse/ai/checkin-prompts.ts";
import { runCheckinTurn, type CheckinTurnResult } from "../src/lib/rehabverse/ai/checkin-turn.ts";
import type { ModelCall } from "../src/lib/rehabverse/ai/intake-turn.ts";
import type { Lang } from "../src/lib/rehabverse/ai/intake-spec.ts";
import type { Turn } from "../src/lib/rehabverse/ai/prompts.ts";

/**
 * RehabVerse recovery check-in chat (Phase E): everything that can be tested WITHOUT a live model (the model call is a mock). Plain denials such
 * as "no chest pain" must not alarm, every real warning sign must, the safety question and its order are code, the model can only add one guarded
 * sentence, the chat never ticks "None of these", a stopped chat pre-ticks the right warning signs, and the privacy of what the model is told.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };

const ctx: CheckinContext = { dayNumber: 3, title: "Day 3: hips, call 0300 1234567", point: "24h", pointLabel: "Next day (~24 h)", session: { painBefore: 3, painDuring: 5, painAfter: 4, difficulty: 6 } };
const noModel = () => { const spy = { calls: 0, call: (async () => { spy.calls++; return null; }) as ModelCall }; return spy; };
const scripted = (reply: unknown) => { const spy = { calls: 0, messages: [] as unknown[], call: (async (messages: unknown) => { spy.calls++; spy.messages.push(messages); return { text: typeof reply === "string" ? reply : JSON.stringify(reply), model: "mock" }; }) as ModelCall }; return spy; };
const turn = (draft: CheckinDraft, text: string, over: { lang?: Lang; turnNumber?: number; history?: Turn[] } = {}, model = noModel()) =>
  runCheckinTurn({ lang: over.lang ?? "en", history: over.history ?? [], draft, patientText: text, turnNumber: over.turnNumber ?? 1, ctx }, { callModel: model.call }).then((r) => ({ r, model }));

/** Runs a whole conversation through the engine and returns each result. */
async function chat(lines: string[], lang: Lang = "en", model: () => { calls: number; call: ModelCall } = noModel): Promise<CheckinTurnResult[]> {
  let draft: CheckinDraft = EMPTY_CHECKIN;
  const out: CheckinTurnResult[] = [];
  for (const [i, line] of lines.entries()) {
    const r = await runCheckinTurn({ lang, history: [], draft, patientText: line, turnNumber: i + 1, ctx }, { callModel: model().call });
    out.push(r);
    draft = r.draft;
    if (r.status !== "open" || r.draft.done) break;
  }
  return out;
}

/* 1. Denials must not alarm, and real warning signs must. */
{
  const denials = [
    "no", "No.", "nope", "none", "none of those", "none of these", "nothing", "nothing like that", "no, nothing like that", "no chest pain", "No chest pain, no dizziness, no numbness",
    "no chest pain, dizziness or numbness", "no chest pain or dizziness", "no chest pain, no dizziness or fainting", "I have no chest pain", "i dont have any chest pain",
    "I didn't have any dizziness", "I did not fall", "never fell", "no falls", "no swelling", "my knee is not swollen", "not dizzy", "no sharp pain", "no sharp or severe pain",
    "no problem with breathing", "no trouble breathing", "no pops or tears", "no, only a bit tired", "all good", "all fine", "bilkul nahi", "nahi", "nahi koi nahi", "koi masla nahi",
    "seene mein dard nahi", "chakkar nahi aaya", "seene mein dard nahi hai, chakkar nahi hai, sunn pan nahi", "seene mein dard, chakkar ya sunn pan nahi", "koi dard nahi", "kuch nahi hua",
    "kuch bhi nahi", "sab theek hai", "sab theek", "saans ki takleef nahi", "sooj nahi", "No chest pain.", "NO CHEST PAIN, NO DIZZINESS", "no numbness or tingling", "no weakness",
  ];
  for (const text of denials) {
    ok(screenCheckinText(text) === null, `a plain denial does not alarm the screen: "${text}"`);
    const signs = readSigns(text);
    ok(signs.answer === "no" && signs.flags.length === 0, `"${text}" is read as no warning signs (got ${signs.answer}, ${signs.flags})`);
  }
  const positives: [string, string[]][] = [
    ["yes", []], ["Yes.", []], ["yeah", []], ["haan", []], ["haan chakkar aaya", ["fb_dizzy"]], ["I felt dizzy", ["fb_dizzy"]], ["my calf hurts", ["fb_calf"]], ["my calf is swollen", ["fb_calf"]],
    ["numbness in my foot", ["fb_neuro"]], ["no feeling in my foot", ["fb_neuro"]], ["no chest pain but my calf is swollen", ["fb_calf"]], ["no but my knee gave way", []],
    ["no, my knee swelled up", ["fb_joint"]], ["I fell yesterday", ["fb_injury"]], ["slipped on the stairs", ["fb_injury"]], ["I felt a pop in my knee", ["fb_injury"]],
    ["sharp pain in my back", ["fb_severe_pain"]], ["the pain is severe", ["fb_severe_pain"]], ["my knee is locked", ["fb_joint"]], ["pins and needles in my hand", ["fb_neuro"]],
    ["seene mein dard hai", ["fb_chest"]], ["pindli mein dard", ["fb_calf"]], ["jor sooj gaya", ["fb_joint"]], ["tingling", ["fb_neuro"]], ["my leg feels weak", ["fb_neuro"]],
    ["chest tightness", ["fb_chest"]], ["breathing is hard", ["fb_chest"]], ["no chest pain, sharp pain at night", ["fb_severe_pain"]], ["no dizziness but I fainted once", ["fb_dizzy"]],
    ["koi dard nahi lekin chakkar aaya", ["fb_dizzy"]], ["bladder control is difficult", ["fb_neuro"]],
  ];
  for (const [text, flags] of positives) {
    const signs = readSigns(text);
    ok(signs.answer === "yes", `"${text}" is taken as a warning sign (got ${signs.answer})`);
    for (const id of flags) ok(signs.flags.includes(id), `"${text}" ticks ${id} (got ${signs.flags})`);
  }
  // sentences that must still alarm the shared screen even though they contain a "no"
  for (const text of ["no feeling in my foot", "no chest pain but my chest hurts now", "no way I could bear the sharp pain", "no but my knee gave way", "no, I felt a pop in my shoulder", "I have no strength and my calf is swollen and hot"]) {
    ok(screenCheckinText(text) !== null || flagsFromText(text).length > 0, `a denial never hides a real report: "${text}"`);
  }
  eq(stripDenials("No chest pain, no dizziness."), "", "denials are removed completely");
  ok(stripDenials("no chest pain, sharp pain at night").includes("sharp pain"), "a report after a denial is kept");
  eq(screenCheckinText("my chest hurts")?.kind, "cardiac", "the shared emergency rules still apply (chest pain)");
  ok(screenCheckinText("my chest hurts")?.level === "emergency", "chest pain is an emergency");
  eq(screenCheckinText("I felt a pop in my knee")?.message, CHECKIN_STOP, "the coach's 'rest of today's session' wording is replaced by the check-in wording");
  ok(!/today'?s session/i.test(CHECKIN_STOP.en) && !/aaj ke session/i.test(CHECKIN_STOP.ru), "the check-in stop wording does not talk about today's session");
}

/* 2. Mapping to the form's own warning-sign list. */
{
  const ids = FEEDBACK_FLAGS.map((f) => f.id);
  for (const kind of ["cardiac", "breathing", "heart", "stroke", "cauda-equina", "neck-vascular", "fracture", "dizziness", "numbness-or-weakness", "severe-pain", "pop-or-tear", "fall", "giving-way", "swelling"]) {
    const mapped = flagsForAlert(kind, "");
    ok(mapped.every((id) => ids.includes(id)), `${kind} maps to ids of the check-in form (${mapped})`);
  }
  eq(flagsForAlert("swelling", "my calf is swollen"), ["fb_calf"], "a swollen calf is the calf sign");
  eq(flagsForAlert("swelling", "my knee is swollen"), ["fb_joint"], "a swollen knee is the joint sign");
  eq(flagsForAlert("cardiac", "my chest hurts"), ["fb_chest"], "chest pain ticks the chest sign");
  eq(flagsForAlert("serious-pathology", "x"), [], "an alert with no matching sign ticks nothing");
  const reachable = new Set<string>();
  for (const text of ["chest pain", "dizzy", "numb foot", "calf", "sharp pain", "a pop", "swollen knee"]) for (const id of flagsFromText(text)) reachable.add(id);
  ok(ids.every((id) => reachable.has(id)), "every warning sign of the form can be recognised from plain words");
}

/* 3. Reading answers. */
{
  const scale: [string, number | null][] = [["3", 3], ["pain is 3", 3], ["3/10", 3], ["3 out of 10", 3], ["about 4", 4], ["three", 3], ["3 or 4", 4], ["3-4", 4], ["10", 10], ["0", 0], ["11", null], ["it was 2 hours ago, pain 5", 5], ["I did 2 sets", null], ["3 and 7", null],
    ["a lot", null], ["I slept 6 hours, pain is 2", 2], ["abhi dard 6 hai", 6], ["10/10", 10], ["7.", 7]];
  for (const [text, expected] of scale) eq(readScale(text), expected, `scale "${text}"`);
  eq(readScale("no pain", { zeroWords: true }), 0, "no pain is 0 on the pain question");
  eq(readScale("dard nahi", { zeroWords: true }), 0, "dard nahi is 0 on the pain question");
  eq(readScale("no pain"), null, "no pain is not a number elsewhere");
  const responses: [string, string | null][] = [["better", "better"], ["a lot better", "better"], ["much improved", "better"], ["behtar hai", "better"], ["kam ho gaya", "better"], ["same", "same"], ["about the same", "same"], ["no change", "same"], ["not better", "same"],
    ["waisi hi", "same"], ["kam nahi hua", "same"], ["worse", "worse"], ["a bit worse", "worse"], ["zyada kharab", "worse"], ["more painful", "worse"], ["better but worse at night", null], ["hmm", null]];
  for (const [text, expected] of responses) eq(readResponse(text), expected, `response "${text}"`);
  eq([readYesNo("no"), readYesNo("yes"), readYesNo("nahi"), readYesNo("haan"), readYesNo("maybe"), readYesNo("no new symptoms"), readYesNo("nothing new")], [false, true, false, true, null, false, false], "yes and no");
  ok(readSkip("skip") && readSkip("not sure") && readSkip("pata nahi") && !readSkip("I can walk 5 minutes without trouble at all today really"), "skip words");
  eq(readStepAnswer("pain", "3"), { pain: 3 }, "pain step");
  eq(readStepAnswer("pain", "banana"), null, "pain step not understood");
  eq(readStepAnswer("function", "skip"), { skip: true }, "function can be skipped");
  eq(readStepAnswer("function", "completely normal"), { function_score: 10 }, "normal is 10 on the daily activity question");
  eq(readStepAnswer("new_symptoms", "no"), { new_symptoms: false }, "no new symptoms");
  const withDetail = readStepAnswer("new_symptoms", "yes my knee clicks when I climb stairs") as { new_symptoms: boolean; note?: string };
  ok(withDetail.new_symptoms === true && /knee clicks/.test(withDetail.note ?? ""), "new symptoms with detail keep the patient's words in the note");
  eq(readStepAnswer("note", "no"), { skip: true }, "nothing more to add");
  eq(readStepAnswer("note", "I am worried about work"), { note: "I am worried about work" }, "a note is kept in the patient's words");
  ok(!JSON.stringify(readStepAnswer("note", "call me on 0321 5551234")).includes("5551234"), "a phone number never reaches the note");
  ok(asksPhysio("should I take a tablet") && asksPhysio("can I skip tomorrow") && asksPhysio("kya main dawai le sakta hoon") && asksPhysio("when will I be better") && !asksPhysio("pain is 3") && !asksPhysio("it feels better"), "questions only the physiotherapist can answer");
  // an empty reading changes nothing, and a note is added to rather than replaced
  const d = applyReading({ ...EMPTY_CHECKIN, note: "first" }, "note", { note: "second" });
  eq(d.note, "first second", "notes add up");
  eq(applyReading(EMPTY_CHECKIN, "pain", null), EMPTY_CHECKIN, "no reading, no change");
}

/* 4. The order of questions, and what counts as done. */
{
  eq(STEP_ORDER, ["pain", "signs", "response", "function", "new_symptoms", "note"], "the safety question is second");
  eq(nextStep(EMPTY_CHECKIN), "pain", "the first question is pain");
  eq(nextStep({ ...EMPTY_CHECKIN, pain: 3 }), "signs", "then the safety question");
  ok(isAnswered({ ...EMPTY_CHECKIN, skipped: ["function"] }, "function"), "a skipped step counts as answered");
  eq(nextStep({ ...EMPTY_CHECKIN, pain: 3, signs: "no", symptom_response: "better", function_score: 8, new_symptoms: false, note: "x" }), null, "everything answered");
  for (const lang of ["en", "ru"] as const) {
    for (const step of STEP_ORDER) ok(QUESTION[step][lang].length > 10 && HELP[step][lang].length > 10, `${step} has ${lang} wording`);
    ok(checkinGreeting(lang).includes(QUESTION.pain[lang]), `the greeting (${lang}) ends with the first question`);
    ok(/\bAI\b/.test(checkinGreeting(lang)), `the greeting (${lang}) says it is an AI`);
    ok(!checkinGreeting(lang).includes("None of these"), "the greeting does not mention ticking");
  }
  for (const needle of ["chest pain", "breathing", "dizziness", "numbness", "calf", "sharp or severe", "pop, tear, twist or fall", "locked"]) ok(QUESTION.signs.en.includes(needle), `the safety question mentions "${needle}"`);
  for (const needle of ["seene", "chakkar", "sunn-pan", "pindli", "tez", "mur jana", "phans"]) ok(QUESTION.signs.ru.includes(needle), `the Roman Urdu safety question mentions "${needle}"`);
}

/* 5. Whole conversations without a model. */
{
  const en = await chat(["3", "no chest pain, no dizziness, no numbness", "better", "8", "no", "no"]);
  eq(en.map((r) => r.step), ["signs", "response", "function", "new_symptoms", "note", null], "the questions come in the planned order");
  const last = en[en.length - 1];
  ok(last.draft.done && last.status === "open", "the chat finishes with the form to check (still open until the form is saved)");
  eq([last.draft.pain, last.draft.signs, last.draft.symptom_response, last.draft.function_score, last.draft.new_symptoms, last.draft.flags], [3, "no", "better", 8, false, []], "the answers are recorded");
  ok(!/^Thank you for telling me|^Thanks, that helps|^Got it, thank you/.test(last.reply), "the closing summary is not preceded by a second, plain thank-you");
  ok(/3\/10/.test(last.reply) && /tick the safety list yourself/.test(last.reply) && /never tick 'None of these'/.test(last.reply), "the summary says what was understood and that the patient ticks the safety list");
  ok(en.every((r) => r.model === "script" && r.fallback === true || r.step === null || r.how === "script"), "without a model, scripted replies carry the chat");
  ok(en[0].reply.includes(QUESTION.signs.en), "the safety question is asked in full, as written by code");
  ok(!("none" in last.draft) && !JSON.stringify(last.draft).includes("fb_none"), "the draft has no way to say 'None of these' was ticked");

  const ru = await chat(["dard 4 hai", "nahi koi nahi", "behtar", "7", "nahi", "nahi"], "ru");
  eq(ru[ru.length - 1].draft, { ...EMPTY_CHECKIN, pain: 4, signs: "no", symptom_response: "better", function_score: 7, new_symptoms: false, skipped: ["note"], done: true }, "a Roman Urdu conversation records the same answers");
  ok(/Shukriya/.test(ru[ru.length - 1].reply) && /Save/.test(ru[ru.length - 1].reply), "the Roman Urdu summary is in Roman Urdu");

  const many = await chat(["pain 2 and it feels better than before", "no", "skip", "no", "no"]);
  eq([many[0].draft.pain, many[0].draft.symptom_response, many[0].step], [2, "better", "signs"], "one message can answer pain and the comparison");
  const asked = many.map((r) => r.step);
  ok(!asked.includes("response"), "an answered comparison is not asked again");
  eq(many[many.length - 1].draft.skipped, ["function", "note"], "skipping a question is allowed (and saying no to the last one leaves the note empty)");

  // not understood: asked again, and after two tries it is left for the form
  const lost = await chat(["banana", "banana", "no", "better", "skip", "no", "no"]);
  ok(/did not quite understand|samajh nahi/.test(lost[0].reply) && lost[0].step === "pain" && lost[0].draft.tries.pain === 1, "an answer that is not understood is asked again with help");
  ok(lost[1].draft.skipped.includes("pain") && lost[1].step === "signs", "after two tries the pain question is left for the form");
  ok(lost[lost.length - 1].draft.pain === null && /still to be filled in on the form/.test(lost[lost.length - 1].reply), "the summary says the pain number is still to be filled in");

  const unclear = await chat(["3", "hmm", "I do not know"]);
  ok(unclear[1].step === "signs" && /yes or no/.test(unclear[1].reply), "an unclear safety answer is asked again");
  eq(unclear[2].draft.signs, "unclear", "twice unclear is recorded as unclear (and the form's list is left to the patient)");
  ok(/read the list of warning signs on the form/.test(unclear[2].reply), "the patient is told to answer the list themselves");
}

/* 6. Safety: the model is never consulted, the right sign is ticked, the physiotherapist is told. */
{
  const spy = scripted({ ack: "x", updates: {}, needs_therapist: false });
  const a = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "my chest hurts and my arm feels numb", { lang: "en" }, spy);
  eq([a.r.status, a.r.notify, a.r.how, a.r.safety?.level, spy.calls], ["safety_stop", "safety", "safety", "emergency", 0], "chest pain stops the chat, tells the physiotherapist and never calls the model");
  ok(a.r.draft.flags.includes("fb_chest") && a.r.draft.signs === "reported" && a.r.draft.done, "the chest sign is pre-ticked and the chat is finished");
  ok(/1122/.test(a.r.reply) && /tick/.test(a.r.reply) && /check-in form/.test(a.r.reply), "the reply says what to do and that the form is filled in");
  const b = await turn(EMPTY_CHECKIN, "I felt a pop in my knee last night", { lang: "en" }, spy);
  eq([b.r.status, b.r.draft.flags, b.r.alert, spy.calls], ["safety_stop", ["fb_injury"], "pop-or-tear", 0], "a pop ticks the injury sign even on the first question");
  const c = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "yes", { lang: "en" }, spy);
  eq([c.r.status, c.r.notify, c.r.alert, c.r.draft.flags, c.r.draft.signs], ["safety_stop", "safety", "reported-sign", [], "reported"], "a bare yes to the safety question stops the chat and tells the physiotherapist");
  ok(c.r.reply.includes(AFTER_STOP(false).en), "with nothing named, the patient is asked to tick which sign it was");
  const d = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "no chest pain but my calf is sore", { lang: "en" }, spy);
  eq([d.r.status, d.r.draft.flags], ["safety_stop", ["fb_calf"]], "a report after a denial is not hidden by it");
  const e = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "seene mein dard hai", { lang: "ru" }, spy);
  ok(e.r.status === "safety_stop" && /1122/.test(e.r.reply) && e.r.draft.flags.includes("fb_chest"), "Roman Urdu chest pain stops the chat in Roman Urdu");
  // the screen runs on every step, not only on the safety question
  for (const [step, draft] of [["pain", EMPTY_CHECKIN], ["response", { ...EMPTY_CHECKIN, pain: 3, signs: "no" as const }], ["note", { ...EMPTY_CHECKIN, pain: 3, signs: "no" as const, symptom_response: "same" as const, function_score: 5, new_symptoms: false }]] as const) {
    const r = await turn(draft, "I feel dizzy and might faint", {}, spy);
    ok(r.r.status === "safety_stop" && r.r.draft.flags.includes("fb_dizzy"), `the safety screen runs on the ${step} question too`);
  }
  eq(spy.calls, 0, "the model was never called in any safety case");
  // a denial in the middle of another answer must not stop the chat
  const f = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "no chest pain, no dizziness", {}, spy);
  ok(f.r.status === "open" && f.r.draft.signs === "no" && f.r.notify === null, "plain denials let the chat carry on");
}

/* 7. Routing to the physiotherapist. */
{
  const a = await turn(EMPTY_CHECKIN, "pain is 4, should I take a tablet?", {}, noModel());
  ok(a.r.notify === "question" && a.r.alert === "question" && /question for your physiotherapist/.test(a.r.reply) && a.r.draft.pain === 4, "a question only the physiotherapist can answer is noted for them, and the answer in the same message is still recorded");
  const b = await turn(EMPTY_CHECKIN, "9", {}, noModel());
  ok(b.r.notify === "question" && b.r.alert === "high-pain" && /high number/.test(b.r.reply), "a pain of 8 or more is made sure the physiotherapist sees");
  const c = await turn(EMPTY_CHECKIN, "7", {}, noModel());
  eq([c.r.notify, c.r.alert], [null, null], "a pain of 7 is not routed");
  const d = await turn({ ...EMPTY_CHECKIN, pain: 3, signs: "no" }, "better", {}, scripted({ ack: "Thank you.", updates: {}, needs_therapist: true }));
  ok(d.r.notify === "question", "the model can ask for the physiotherapist to be told (it can only add attention, never remove it)");
}

/* 8. The model: one guarded sentence, and nothing else. */
{
  const good = scripted({ ack: "I am glad it feels a little better today.", updates: { symptom_response: "better", new_symptoms: null }, needs_therapist: false });
  const a = await turn({ ...EMPTY_CHECKIN, pain: 3, signs: "no" }, "it feels a little lighter today", {}, good);
  eq([a.r.draft.symptom_response, a.r.how, a.r.fallback], ["better", "model", false], "free wording is understood through the model");
  ok(a.r.reply.startsWith("I am glad it feels a little better today.") && a.r.reply.includes(QUESTION.function.en), "the model's sentence is followed by the question that code chose");
  // the model can never set pain or function, and cannot override the plain reading
  const b = await turn(EMPTY_CHECKIN, "a bit sore", {}, scripted({ ack: "Thanks.", updates: { pain: 9, symptom_response: "worse" }, needs_therapist: false }));
  eq([b.r.draft.pain, b.r.draft.symptom_response, b.r.step], [null, null, "pain"], "the model cannot invent a pain number or a comparison on the pain question");
  const c = await turn({ ...EMPTY_CHECKIN, pain: 3, signs: "no" }, "worse", {}, scripted({ ack: "Thanks.", updates: { symptom_response: "better" }, needs_therapist: false }));
  eq(c.r.draft.symptom_response, "worse", "code's reading wins over the model's");
  const d = await turn({ ...EMPTY_CHECKIN, pain: 3, signs: "no", symptom_response: "same", function_score: 5 }, "no", {}, scripted({ ack: "Thanks.", updates: { new_symptoms: true }, needs_therapist: false }));
  eq(d.r.draft.new_symptoms, false, "a model cannot turn a plain no into a yes");
  const e = await turn({ ...EMPTY_CHECKIN, pain: 3, signs: "no", symptom_response: "same", function_score: 5 }, "not really, a little tingly maybe", {}, scripted({ ack: "Thanks for telling me.", updates: { new_symptoms: true }, needs_therapist: false }));
  eq(e.r.draft.new_symptoms, true, "free wording can still be understood as new symptoms");
  // bad acknowledgements are replaced by a scripted one
  const base = { ...EMPTY_CHECKIN, pain: 3, signs: "no" as const };
  const bad: [string, unknown][] = [
    ["reassurance", "That is completely normal, nothing to worry about."], ["prediction", "You will be fine soon."], ["diagnosis", "It sounds like a hamstring strain."], ["medicine", "Maybe take some paracetamol."],
    ["advice", "You should rest and ice it."], ["question", "How are you sleeping?"], ["invented number", "Your pain of 7 is high."], ["claims to be a person", "I am your physiotherapist and I am happy."],
    ["json", "{\"ack\":\"hi\"}"], ["too long", "Thank you ".repeat(30)], ["two sentences too many", "Thanks. Great. Wonderful. Super."], ["roman urdu advice", "Aap aaram karein."], ["link", "See www.example.com"], ["not text", 42],
  ];
  for (const [name, ack] of bad) {
    const r = await turn(base, "better", {}, scripted({ ack, updates: {}, needs_therapist: false }));
    ok(r.r.how === "script" && r.r.fallback === true && r.r.reply.includes(QUESTION.function.en) && !r.r.reply.includes(String(ack)), `a bad acknowledgement (${name}) is replaced by a scripted one`);
    ok(r.r.draft.symptom_response === "better", `the answer is still recorded when the acknowledgement is rejected (${name})`);
  }
  ok(guardAck("Good to hear it feels better.", "better").ok && guardAck("Aap ne acha bataya, shukriya.", "x").ok && guardAck("I am sorry the pain is 6 at the moment.", "6").ok, "good acknowledgements pass");
  ok(!guardAck("I am sorry the pain is 6.", "it hurts").ok, "a number the patient did not say is refused");
  // plain text, no JSON, a broken JSON, and a model that is down
  for (const text of ["Thank you for telling me.", "{ not json", ""]) {
    const r = await turn({ ...base }, "better", {}, scripted(text));
    ok(r.r.draft.symptom_response === "better" && r.r.reply.includes(QUESTION.function.en) && r.r.fallback, `an unusable model reply does not break the chat ("${text.slice(0, 12)}")`);
  }
  const down = await turn(base, "better", {}, noModel());
  ok(down.r.fallback && down.r.model === "script" && down.model.calls === 1, "a model that is down is asked once, then the scripted chat carries on");
  const garbage = scripted("I cannot help with that");
  const g = await turn(base, "better", {}, garbage);
  ok(garbage.calls === 2 && g.r.fallback, "a model that answers without the JSON is asked once more, then the scripted chat carries on");
  eq(scriptedAck({ pain: null, response: "worse" }, "en", 1), "I am sorry it feels worse. Your physiotherapist will see that.", "the scripted acknowledgement for worse");
  ok(/physiotherapist/.test(scriptedAck({ pain: null, response: "worse" }, "ru", 1)), "and in Roman Urdu");
  ok(["en", "ru"].every((lang) => [0, 1, 2, 3].every((t) => guardAck(scriptedAck({ pain: null, response: null }, lang as Lang, t), "x").ok)), "the scripted acknowledgements would pass their own guard");
}

/* 9. The conversation limit. */
{
  const r = await turn({ ...EMPTY_CHECKIN, pain: 3 }, "hello again", { turnNumber: MAX_CHECKIN_TURNS + 1 }, noModel());
  ok(r.r.status === "completed" && r.r.draft.done && r.r.how === "limit", "a very long chat ends and leaves what was understood in the form");
}

/* 10. What the model is told, and what it is not. */
{
  const draft = { ...EMPTY_CHECKIN, pain: 3, signs: "no" as const };
  const prompt = checkinSystemPrompt("en", ctx, draft, "response");
  ok(/You are an AI assistant/.test(prompt) && /Never claim to be a human/.test(prompt) && /needs_therapist/.test(prompt), "the prompt says it is an AI and defines the physiotherapist route");
  ok(/Next day \(~24 h\)/.test(prompt) && /3\/10, 5\/10, 4\/10/.test(prompt) && /6\/10/.test(prompt), "the prompt carries the day's own feedback numbers");
  ok(!prompt.includes("0300 1234567") && prompt.includes("[removed]"), "a phone number in the day title is removed");
  ok(!/signs|flags|fb_/.test(JSON.stringify({ recorded: prompt.match(/RECORDED SO FAR: .*/)?.[0] })), "the model is not told about the safety answers");
  ok(prompt.includes(QUESTION.response.en) && /YOU MUST NEVER/.test(prompt) && /Roman Urdu/.test(prompt), "the prompt states the current question, the prohibitions and the language rule");
  const msgs = buildCheckinMessages({ lang: "ru", history: [{ role: "patient", text: "call 0321 5551234" }], ctx, draft, step: "response", patientText: "my email is a.b@example.com" });
  ok(!JSON.stringify(msgs).includes("5551234") && !JSON.stringify(msgs).includes("a.b@example.com"), "phone numbers and e-mails in the chat are removed before the model sees them");
  ok(/Language of this reply: Roman Urdu/.test(msgs[0].content), "the language of the reply is passed on");
  const spy = scripted({ ack: "Thanks.", updates: {}, needs_therapist: false });
  await turn({ ...draft }, "better", { history: Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "assistant" as const : "patient" as const, text: `line ${i}` })) }, spy);
  ok((spy.messages[0] as unknown[]).length <= 10, "only the recent turns are sent to the model");
}

/* 11. Windows, drafts and what the physiotherapist sees. */
{
  const data = (hoursAgo: number, over: Partial<{ followups: { timepoint: "24h" | "48h" | "later_same_day" }[]; completion: string; schedule: ("24h" | "48h" | "later_same_day")[] }> = {}) => ({
    programme: { errp_schedule: over.schedule ?? (["later_same_day", "24h", "48h"] as ("24h" | "48h" | "later_same_day")[]) },
    feedback: { submitted_at: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(), completion: over.completion ?? "all" }, followups: over.followups ?? [],
  });
  eq(CHECKIN_WINDOWS, { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] }, "the windows are the database function's");
  ok(checkinPending(data(24), "24h").ok, "a 24 h check-in is pending 24 h after the session");
  eq(checkinPending(data(10), "24h"), { ok: false, reason: "too_early" }, "too early");
  eq(checkinPending(data(80), "24h"), { ok: false, reason: "closed" }, "closed");
  eq(checkinPending(data(24, { followups: [{ timepoint: "24h" }] }), "24h"), { ok: false, reason: "recorded" }, "already recorded");
  eq(checkinPending(data(24, { schedule: ["48h"] }), "24h"), { ok: false, reason: "not_scheduled" }, "not scheduled");
  eq(checkinPending(data(24, { completion: "none" }), "24h"), { ok: false, reason: "no_feedback" }, "a day with nothing done has no check-ins");
  eq(checkinPending({ programme: { errp_schedule: ["24h"] }, feedback: null, followups: [] }, "24h"), { ok: false, reason: "no_feedback" }, "no feedback yet");

  eq(readCheckinDraft(null), EMPTY_CHECKIN, "a missing draft is empty");
  const dirty = readCheckinDraft({ pain: 11, function_score: 3.5, symptom_response: "great", new_symptoms: "yes", signs: "maybe", flags: ["fb_chest", "x", "fb_chest", 5], note: "a\u0000b", skipped: ["pain", "nope"], tries: { pain: 2, bogus: 3, note: 99 }, done: "true" });
  eq(dirty, { ...EMPTY_CHECKIN, flags: ["fb_chest"], note: "a b", skipped: ["pain"], tries: { pain: 2 } }, "a stored draft is cleaned before use");
  const good = readCheckinDraft({ pain: 4, signs: "no", symptom_response: "same", function_score: 6, new_symptoms: false, flags: [], note: "ok", skipped: [], tries: {}, done: true });
  eq([good.pain, good.signs, good.done], [4, "no", true], "a good draft is kept");

  const chat = { ...EMPTY_CHECKIN, pain: 3, symptom_response: "better" as const, function_score: 8, new_symptoms: false, signs: "no" as const };
  eq(chatVersusForm(chat, { pain: 3, function_score: 8, symptom_response: "better", new_symptoms: false, flag_ids: [] }), [], "no differences when the form is what the chat understood");
  const diff = chatVersusForm(chat, { pain: 5, function_score: 8, symptom_response: "worse", new_symptoms: true, flag_ids: ["fb_joint"] });
  eq(diff.map((d) => d.field), ["Pain", "Symptoms compared with before", "New symptoms", "Warning signs"], "the physiotherapist sees what changed after the chat");
  eq(diff[0], { field: "Pain", chat: "3/10", form: "5/10" }, "with both values");
  const reported = chatVersusForm({ ...EMPTY_CHECKIN, flags: ["fb_calf"], signs: "reported" }, { pain: 5, function_score: null, symptom_response: "same", new_symptoms: null, flag_ids: [] });
  ok(reported.some((d) => /reported in the chat but not on the form/.test(d.field)), "a warning sign reported in the chat but not saved on the form is called out");
}

/* 12. Wiring: the server, the screens and the database. */
{
  const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const actions = src("src/app/rehabverse/ai-actions.ts");
  ok(actions.includes("checkinPending(") && actions.includes("getSession(sessionId)"), "the server checks the check-in is open before a chat starts or continues");
  ok(actions.includes("startCheckinChatAction") && actions.includes("checkinChatTurnAction") && actions.includes("closeCheckinChatAction"), "the three check-in actions exist");
  const checkinPart = actions.slice(actions.indexOf("startCheckinChatAction"));
  ok(checkinPart.includes("await patientContext()") && checkinPart.includes("rehab_ai_coach_notify") && checkinPart.includes("rehab_ai_checkin_held") && checkinPart.includes('p_kind: "feedback"'), "every check-in call checks the switch on the server; routing and holds go through the database functions");
  ok(/stored\.session_id !== input\.sessionId/.test(checkinPart) && /stored\.timepoint !== input\.timepoint/.test(checkinPart) && /answers\.done/.test(checkinPart), "a conversation belongs to one day and one check-in, and a finished chat takes no more messages");
  ok(!/submitFollowupAction|rehab_submit_followup/.test(actions), "the chat can never save the check-in itself: only the patient's own form does");
  const page = src("src/app/rehabverse/me/day/[id]/page.tsx");
  ok(page.includes("ai={await aiAssistAllowed()}"), "the day page offers the assistants only when the admin switched AI on");
  const session = src("src/components/rehabverse/DaySession.tsx");
  ok(session.includes("<CheckinChat") && session.includes("checkinPending") && !/CHECKIN_WINDOWS|WINDOWS\s*[:=]\s*Record/.test(session.replace(/import .*CHECKIN_WINDOWS.*/, "")), "the check-in form hosts the chat and takes its windows from the shared rules");
  const ui = src("src/components/rehabverse/CheckinChat.tsx");
  ok(!/dangerouslySetInnerHTML/.test(ui) && !ui.includes("fb_none"), "chat text is never rendered as HTML, and the chat has no way to tick 'None of these'");
  ok(/onFill/.test(ui) && /closeCheckinChatAction/.test(ui), "the chat fills the form and records that it was used");
  const migration = src("supabase/migrations/20261123120000_rehab_ai_checkin.sql");
  ok(/revoke all on function public\.%s from public, anon, authenticated/.test(migration) && /grant execute on function public\.%s to service_role/.test(migration), "the database functions are for the server only");
  ok(/ai_assist <> 'on'/.test(migration) && /notified_/.test(migration) && !/\bdrop\b/i.test(migration.replace(/--.*$/gm, "")) && /kind in \('coach', 'feedback'\)/.test(migration), "they re-check the switch, notify once per kind, drop nothing, and serve both conversation kinds");
  for (const file of ["checkin-shared", "checkin-spec", "checkin-safety", "checkin-guard", "checkin-prompts", "checkin-turn"]) ok(!/server-only|getCloudflareContext|fetch\(/.test(src(`src/lib/rehabverse/ai/${file}.ts`)), `${file} is plain code: no server imports, no network`);
  const clientSide = src("src/components/rehabverse/CheckinChat.tsx") + src("src/components/rehabverse/DaySession.tsx");
  ok(!/checkin-turn|checkin-safety|checkin-prompts|checkin-guard/.test(clientSide), "the browser bundle gets none of the chat engine (only the light shared file)");
  const admin = src("src/components/rehabverse/admin/SessionReview.tsx");
  ok(admin.includes("chatVersusForm"), "the physiotherapist's day review shows what changed after the chat");
}

console.log(`RehabVerse check-in chat: ${checks} checks passed (denials vs warning signs, readers, order of questions, model guard, routing, privacy, windows, wiring; English and Roman Urdu).`);
