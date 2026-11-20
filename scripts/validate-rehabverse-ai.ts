import assert from "node:assert/strict";
import { applyUpdates, EMPTY_DRAFT, isReady, nextFocus, scrubPII, type IntakeDraft } from "../src/lib/rehabverse/ai/intake-spec.ts";
import { screenPatientText } from "../src/lib/rehabverse/ai/safety.ts";
import { guardReply } from "../src/lib/rehabverse/ai/guard.ts";
import { buildIntakeMessages } from "../src/lib/rehabverse/ai/prompts.ts";
import { parseModelJson, runIntakeTurn, type ModelCall } from "../src/lib/rehabverse/ai/intake-turn.ts";
import { extractFromAnswer, GREETING, QUESTIONS } from "../src/lib/rehabverse/ai/questions.ts";

/**
 * RehabVerse AI assistant: everything that can be tested WITHOUT a live model (the model call is a mock). The safety screen, the reply guard,
 * the validation of what the model "learned", the scripted fallback when it fails, and the privacy of what is sent to it.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };

/* 1. What the model says it learned is never trusted. */
{
  const { draft, accepted } = applyUpdates(EMPTY_DRAFT, { regions: ["lumbar", "nonsense", "knee"], pain_now: "7", pain_worst: 14, pain_best: -1, duration: "1_4w", onset: "someday", aggravating: "  bending\n and   sitting  ", bogus: "x", symptoms: ["pain", "wings"] });
  eq(draft.regions, ["lumbar", "knee"], "only real region ids are kept");
  eq([draft.pain_now, draft.pain_worst, draft.pain_best], [7, null, null], "pain is an integer from 0 to 10, anything else is dropped");
  eq([draft.duration, draft.onset], ["1_4w", ""], "duration and onset must be real choices");
  eq(draft.aggravating, "bending and sitting", "text is tidied");
  eq(draft.symptoms, ["pain"], "only real symptom ids are kept");
  ok(!accepted.includes("regions" as never) === false && !("bogus" in draft), "unknown fields are ignored");
  const wiped = applyUpdates(draft, { regions: [], aggravating: "", pain_now: null, duration: "" });
  eq([wiped.draft.regions, wiped.draft.aggravating, wiped.draft.pain_now, wiped.draft.duration], [["lumbar", "knee"], "bending and sitting", 7, "1_4w"], "an empty answer can never wipe what is recorded");
  eq(applyUpdates(EMPTY_DRAFT, "nonsense").accepted, [], "a non-object is ignored");
  eq(applyUpdates(EMPTY_DRAFT, { own_words: "x".repeat(5000) }).draft.own_words.length, 900, "text is capped");
  eq(nextFocus(EMPTY_DRAFT), "regions", "the interview starts with where it hurts");
  eq(nextFocus({ ...EMPTY_DRAFT, regions: ["knee"] }), "pain_now", "then how strong it is");
}
eq(scrubPII("call me on 0300 1234567 or mail a.b@gmail.com, CNIC 42101-1234567-1"), "call me on [removed] or mail [removed], CNIC [removed]", "phone numbers, e-mail addresses and ID numbers are removed before the model sees them");

/* 2. The safety screen runs on plain code, in English and Roman Urdu. */
const emergencies = [
  "I have numbness around my groin and I cannot control my urine",
  "mujhe peshab rokne mein mushkil ho rahi hai aur groin mein sunn-pan hai",
  "I have chest pain and I can't breathe properly",
  "mujhe seene mein dard hai aur saans nahi aa rahi",
  "I want to die",
];
for (const text of emergencies) ok(screenPatientText(text), `emergency recognised: ${text}`);
for (const text of ["my lower back hurts when I bend forward", "mujhe kamar mein dard hai jhukne par barhta hai", "what is cauda equina syndrome?", "my knee is stiff in the morning"]) {
  eq(screenPatientText(text), null, `not an emergency: ${text}`);
}
ok(screenPatientText(emergencies[0])!.suggestedFlags.includes("rf_bladder"), "an emergency pre-ticks the matching red-flag question");

/* 3. The reply guard. */
const good = [
  "That sounds exhausting, waking up at night with it. Where exactly do you feel it the most?",
  "Aap ki baat samajh aa rahi hai, do hafte se neend bhi kharab hai. Ye dard kamar ke kis hisse mein hota hai?",
  "Are you taking any painkillers at the moment?",
  "I can't diagnose, but your physiotherapist will examine you properly. When did it start?",
];
for (const text of good) ok(guardReply(text).ok, `allowed: ${text}`);
const bad: [string, string][] = [
  ["It sounds like you have a slipped disc. When did it start?", "diagnosis"],
  ["This could be sciatica. Does it spread to the leg?", "diagnosis"],
  ["Aap ko slip disc lag raha hai. Kab se hai?", "diagnosis"],
  ["You could take paracetamol 500 mg for it.", "medicine"],
  ["Aap dawai lein aur rest karein.", "treatment advice"],
  ["You should rest and apply ice. How is it today?", "treatment advice"],
  ["I recommend some stretching. Where does it hurt?", "treatment advice"],
  ["I'm a doctor and I can help you.", "claims to be a person or clinician"],
  ["Don't worry, it's nothing serious. When did it start?", "reassurance or promise"],
  ["Koi serious baat nahi hai. Kab se hai?", "reassurance or promise"],
  ["It will definitely get better soon. How long has it been?", "reassurance or promise"],
  ["What is your phone number? Where does it hurt?", "asks for identifying details"],
  ["Where does it hurt? How long? What makes it worse? Anything else?", "asks several questions"],
  ["Visit https://example.com for help.", "link or contact detail"],
];
for (const [text, reason] of bad) { const r = guardReply(text); ok(!r.ok && r.reason === reason, `blocked (${reason}): ${text}`); }
eq(guardReply("**Thank you.** Where is it?").ok && (guardReply("**Thank you.** Where is it?") as { text: string }).text, "Thank you. Where is it?", "markdown is stripped");

/* 4. Reading the model's JSON. */
eq(parseModelJson('Here you go:\n```json\n{"reply":"Hi","updates":{},"ready":false}\n```')?.reply, "Hi", "JSON inside a code fence is found");
eq(parseModelJson("I am sorry I cannot"), null, "no JSON gives null");
eq(parseModelJson('{"reply": 3}'), null, "a reply that is not text gives null");

/* 5. One turn, with a mock model. */
const scripted = (answer: string | null, spy: { calls: number; messages: unknown[] } = { calls: 0, messages: [] }): ModelCall => async (messages) => {
  spy.calls++; spy.messages.push(messages);
  return answer === null ? null : { text: answer, model: "mock-model" };
};
const turn = (patientText: string, draft: IntakeDraft, callModel: ModelCall, over: { lang?: "en" | "ru"; turnNumber?: number } = {}) =>
  runIntakeTurn({ lang: over.lang ?? "en", history: [{ role: "assistant", text: GREETING.en }], draft, patientText, turnNumber: over.turnNumber ?? 1 }, { callModel });

{ // a good model answer
  const spy = { calls: 0, messages: [] as unknown[] };
  const reply = '{"reply":"Two weeks of that must be wearing, especially at night. How strong is it right now, from 0 to 10?","updates":{"regions":["lumbar"],"duration":"1_4w","aggravating":"bending forward","bogus":1},"ready":false}';
  const r = await turn("my lower back has hurt for 2 weeks, worse when I bend. 0300 1234567", EMPTY_DRAFT, scripted(reply, spy));
  eq([r.draft.regions, r.draft.duration, r.draft.aggravating], [["lumbar"], "1_4w", "bending forward"], "the model's notes fill the form");
  eq([r.fallback, r.status, r.model], [false, "open", "mock-model"], "a good answer is used");
  ok(r.reply.startsWith("Two weeks of that"), "the model's warm reply is shown");
  const sent = JSON.stringify(spy.messages[0]);
  ok(!sent.includes("1234567") && sent.includes("[removed]"), "a phone number the patient typed is never sent to the model");
  ok(sent.includes("Never diagnose") && sent.includes("ONE question") && sent.includes("never claim to be a human") === false && sent.includes("Never claim to be a human"), "the rules travel with every call");
  ok(!/full_name|phone|email|address/.test(sent.replace(/Never ask for their name, phone, address, email or any ID number\./, "")), "no identity field is ever put in the prompt");
}
{ // the model breaks a rule: its notes are kept, its words are not
  const r = await turn("it started after lifting a heavy box", EMPTY_DRAFT, scripted('{"reply":"It sounds like you have a slipped disc. Where does it hurt?","updates":{"regions":["lumbar"],"onset":"sudden"},"ready":false}'));
  eq([r.fallback, r.draft.regions, r.draft.onset], [true, ["lumbar"], "sudden"], "a rule-breaking reply is replaced but what was learned is kept");
  ok(!/slipped/.test(r.reply) && r.reply.includes("?"), "the patient never sees the diagnosis, and still gets a question");
}
{ // the model returns nonsense twice: plain code reads the answer
  const spy = { calls: 0, messages: [] as unknown[] };
  const r = await turn("mujhe kamar mein dard hai", EMPTY_DRAFT, scripted("sorry, no json here", spy), { lang: "ru" });
  eq(spy.calls, 2, "one repair attempt, then the script takes over");
  eq([r.fallback, r.draft.regions], [true, ["lumbar"]], "the answer is read in plain code");
  ok(r.reply.includes(QUESTIONS.pain_now!.ru), "the conversation continues with the next scripted question, in Roman Urdu");
}
{ // the model is unavailable and the answer cannot be read
  const r = await turn("hmm", EMPTY_DRAFT, scripted(null));
  ok(r.fallback && r.reply.includes(QUESTIONS.regions!.en) && r.draft.regions.length === 0, "an unreadable answer is asked again, not guessed");
}
{ // an emergency never reaches the model
  const spy = { calls: 0, messages: [] as unknown[] };
  const r = await turn("I have chest pain and cannot breathe", EMPTY_DRAFT, scripted('{"reply":"ok","updates":{},"ready":false}', spy));
  eq([spy.calls, r.status, r.model], [0, "safety_stop", "safety"], "an emergency stops the chat before any model is called");
  ok(/1122|emergency|urgent/i.test(r.reply), "the patient is told to get urgent help");
}
{ // finishing is decided by code
  const nearly: IntakeDraft = { ...EMPTY_DRAFT, regions: ["knee"], pain_now: 5, duration: "1_3m", aggravating: "stairs", relieving: "rest", functional_limitations: "cannot climb stairs", medical_conditions: "None reported", medications: "" };
  eq(isReady(nearly), false, "not ready while medications and own_words are unknown");
  const early = await turn("fine", nearly, scripted('{"reply":"Thank you, I will show you what I noted now.","updates":{},"ready":true}'));
  eq([early.ready, early.status, early.fallback], [false, "open", true], "a model that says it is finished too early is overruled");
  ok(early.reply.includes(QUESTIONS.onset!.en), "and the next missing question is asked");
  const done = await turn("I take no medicines and I just want to walk my kids to school", nearly, scripted('{"reply":"Thank you for sharing that. I will now show you what I have noted so you can check it.","updates":{"medications":"None reported","own_words":"Wants to walk the children to school"},"ready":true}'));
  eq([done.ready, done.status, done.fallback], [true, "completed", false], "when every required field is known the interview completes");
  eq(isReady(done.draft), true, "and the form is complete");
  const lateButModelAsks = await turn("none", nearly, scripted('{"reply":"Anything else?","updates":{"medications":"None reported","own_words":"Wants to get back to normal"},"ready":false}'));
  eq([lateButModelAsks.ready, lateButModelAsks.status], [true, "completed"], "code, not the model, decides it is finished");
  const capped = await turn("ok", EMPTY_DRAFT, scripted(null), { turnNumber: 26 });
  eq(capped.status, "completed", "a conversation that runs long is handed to the patient to review");
}
ok(buildIntakeMessages({ lang: "ru", history: [], draft: EMPTY_DRAFT, focus: "regions", patientText: "hi" })[0].content.includes("Roman Urdu"), "the preferred language is in the prompt");
eq(extractFromAnswer("pain_now", "about 7 out of 10").pain_now, 7, "plain-code reading: a pain number");
eq(extractFromAnswer("duration", "3 hafte se").duration, "1_4w", "plain-code reading: duration in Roman Urdu");
eq(extractFromAnswer("medications", "nahi").medications, "None reported", "plain-code reading: none");
eq(isReady(applyUpdates(EMPTY_DRAFT, { other_symptoms: "None reported" }).draft), false, "a single answer never finishes the interview");
ok(nextFocus({ ...EMPTY_DRAFT, regions: ["knee"], pain_now: 3, duration: "lt_1w", onset: "sudden", possible_cause: "fall", aggravating: "stairs", relieving: "rest", other_symptoms: "None reported" }) === "functional_limitations", "'no other symptoms' counts as answered, so the interview moves on");
eq(extractFromAnswer("onset", "after lifting a box").onset, "unknown", "an onset that fits no choice is kept in the patient's own words");

/* 6. The code around it (text-level checks). */
import { readFileSync } from "node:fs";
const src = (file: string) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const model = src("src/lib/rehabverse/ai/model.ts");
ok(model.includes('import "server-only"') && model.includes("REHAB_AI_MODELS") && model.includes("setTimeout"), "the model caller is server-only, configurable and has a timeout");
ok(/glm|gemma|llama/i.test(model), "there is a chain of free models to fall back through");
for (const file of ["intake-spec", "safety", "guard", "prompts", "questions", "intake-turn"]) ok(!/from "(@\/|server-only)/.test(src(`src/lib/rehabverse/ai/${file}.ts`)), `${file}.ts is plain code (testable without the server)`);

/* 7. The server and screens around the assistant. */
const actions = src("src/app/rehabverse/ai-actions.ts");
ok(actions.includes("aiAssistAllowed") && actions.includes("getOverview") && actions.includes("rehab_ai_get_conversation") && actions.includes("p_patient_id: context.patientId"), "every AI action checks the switch on the server, takes the patient from the session and loads the conversation only for that patient");
ok(!/patientId\??:\s*string/.test(actions.slice(actions.indexOf("export async function startIntakeChatAction"))), "no AI action accepts a patient id from the browser");
ok(actions.includes("rehab_ai_open_conversation") && actions.includes("rehab_ai_append_turn") && actions.includes("createAdminClient"), "conversations are written by the server through the database functions");
ok(actions.indexOf("runIntakeTurn") > actions.indexOf("aiAssistAllowed"), "the model is only reached after the switch check");
const chat = src("src/components/rehabverse/IntakeChat.tsx");
ok(chat.includes("Use the normal form") && chat.includes("closeIntakeChatAction") && chat.includes("IntakeWizard"), "the chat can always be left for the normal form, and ends in the normal questionnaire");
ok(chat.includes("I am an AI assistant") && chat.includes("1122"), "the notice says it is an AI and gives the emergency number");
ok(!/(dangerouslySetInnerHTML)/.test(chat), "chat text is never rendered as HTML");
ok(src("src/app/rehabverse/start/page.tsx").includes("aiAssistAllowed()") && src("src/app/rehabverse/start/page.tsx").includes("IntakeWizardLoader"), "the start page shows the normal form to everyone without the switch");
const wizard = src("src/components/rehabverse/IntakeWizard.tsx");
ok(wizard.includes('"safety"') && wizard.includes("aiConversationId") && wizard.includes("form.no_red_flags || form.red_flags.length > 0"), "the questionnaire (with its red-flag step) still ends every assessment");
ok(src("src/app/api/rehabverse/ai/selftest/route.ts").includes("isStaff()"), "the AI self-test is admin only");
ok(src("src/components/rehabverse/admin/AdminPatientRecord.tsx").includes("<AiConversations"), "the admin sees the conversation");
ok(!/GREETING\.[a-z]+.*(doctor|physiotherapist) hoon/.test(src("src/lib/rehabverse/ai/questions.ts")) , "the greeting never claims to be a clinician");

console.log(`RehabVerse AI assistant: ${checks} checks passed (safety screen, reply guard, validation, fallback and privacy, with a mock model).`);
