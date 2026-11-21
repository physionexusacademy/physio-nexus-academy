import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SOURCE } from "../src/lib/rehabverse/library/source.ts";
import type { ExerciseDef } from "../src/lib/rehabverse/types.ts";
import { LANGUAGE_REMINDER, languageOf, languageRule, replyLanguage, replyMatchesLanguage, withLanguageReminder } from "../src/lib/rehabverse/ai/reply-lang.ts";
import { buildCoachContext, COACH_MENU, conversational, type Intent, type PlanLine } from "../src/lib/rehabverse/ai/coach-spec.ts";
import { runCoachTurn } from "../src/lib/rehabverse/ai/coach-turn.ts";
import { screenCoachText } from "../src/lib/rehabverse/ai/coach-safety.ts";
import { buildCoachMessages } from "../src/lib/rehabverse/ai/coach-prompts.ts";
import { EMPTY_DRAFT } from "../src/lib/rehabverse/ai/intake-spec.ts";
import { runIntakeTurn, type ModelCall } from "../src/lib/rehabverse/ai/intake-turn.ts";
import { buildIntakeMessages, type Turn } from "../src/lib/rehabverse/ai/prompts.ts";
import { screenPatientText } from "../src/lib/rehabverse/ai/safety.ts";
import { EMPTY_CHECKIN } from "../src/lib/rehabverse/ai/checkin-shared.ts";
import { runCheckinTurn } from "../src/lib/rehabverse/ai/checkin-turn.ts";
import { buildCheckinMessages, type CheckinContext } from "../src/lib/rehabverse/ai/checkin-prompts.ts";

/**
 * The RehabVerse assistants answer in the language the patient WRITES in. A patient who types Roman Urdu used to get English whenever the page's
 * language switch said English (the scripted answers, the safety messages, the next question and the prompt all followed the switch, not the
 * patient). Now: Roman Urdu or Urdu script in -> Roman Urdu out; English in -> English out; a message that shows no language ("ok", "5") keeps
 * the language of the conversation so far, and only then the switch. A model reply in the wrong language is never shown.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };
const patient = (text: string): Turn => ({ role: "patient", text });
const assistant = (text: string): Turn => ({ role: "assistant", text });

/* 1. Which language a message is in. */
{
  const roman = [
    "mere ghutne me dard hai", "is exercise ko kaise karun", "kitni baar karni hai", "pain bohat hai", "mujhe pain hai exercise ke baad", "haan theek hai", "nahi", "ye hips stacked ka kya matlab hai",
    "Aaj kaisa raha, thora better hai", "can you tell me kitni dair hold karna hai", "kamar me dard hai aur taang sunn hai", "main kal ye kar chuka hoon", "mujhe chakkar aa raha hai", "جی ہاں",
  ];
  const english = [
    "how many sets and reps of clamshell?", "my knee hurts when I bend it", "What if it hurts?", "I did the exercises and feel a bit better", "is it ok to continue", "Can I skip this one today?",
    "what does neutral spine mean?", "the video loads slowly", "I have chest pain",
  ];
  const silent = ["ok", "okay", "thanks", "yes", "no", "5", "hello", "", "  ", "3/10"];
  for (const text of roman) eq(languageOf(text), "ru", `Roman Urdu is recognised: "${text}"`);
  for (const text of english) eq(languageOf(text), "en", `English is recognised: "${text}"`);
  for (const text of silent) eq(languageOf(text), null, `a message with no language is neutral: "${text}"`);
}

/* 2. Which language the reply is in. */
{
  eq(replyLanguage("kitni baar", [], "en"), "ru", "Roman Urdu text, English page: Roman Urdu");
  eq(replyLanguage("how many reps", [], "ru"), "en", "English text, Roman Urdu page: English (the reply mirrors what is written)");
  eq(replyLanguage("ok", [patient("mere kandhe me dard hai"), assistant("Theek hai")], "en"), "ru", "a neutral message keeps the language of the patient's earlier messages");
  eq(replyLanguage("ok", [patient("my shoulder hurts"), assistant("Thank you"), patient("haan thora")], "ru"), "ru", "the NEWEST earlier message with a language decides");
  eq(replyLanguage("5", [], "ru"), "ru", "no language anywhere: the page's language switch decides");
  eq(replyLanguage("5", [assistant("Assalam-o-alaikum")], "en"), "en", "the assistant's own earlier words do not count as the patient's language");
  ok(replyMatchesLanguage("Zaroor, apni peeth ke bal lait jayein aur ghutne mode lein.", "ru"), "a Roman Urdu reply matches Roman Urdu");
  ok(!replyMatchesLanguage("Sure, start lying on your back with both knees bent.", "ru"), "an English reply does not match Roman Urdu");
  ok(!replyMatchesLanguage("Zaroor, apni peeth ke bal lait jayein aur ghutne mode lein.", "en"), "a Roman Urdu reply does not match English");
  ok(!replyMatchesLanguage("زبردست، آگے بڑھیں اور آہستہ کریں", "ru"), "Urdu script is not shown (the site writes Roman Urdu)");
  ok(replyMatchesLanguage("Theek hai.", "ru") && replyMatchesLanguage("Good.", "ru"), "a very short reply is not judged");
  ok(languageRule("ru").includes("NEVER answer in English") && languageRule("en").includes("English"), "the model is told the language of this reply");
  ok(withLanguageReminder("hello", "ru").endsWith(LANGUAGE_REMINDER.ru) && withLanguageReminder("hello", "en").endsWith(LANGUAGE_REMINDER.en), "the reminder is the last thing the model reads");
}

/* 3. The exercise coach. */
const library = Object.values(SOURCE).flat() as ExerciseDef[];
const defs = new Map(library.map((e) => [e.id, e]));
const line = (id: string): PlanLine => ({ exercise_id: id, exercise_title: defs.get(id)!.name.en, sets: 2, reps: 10, hold_seconds: 3, rest_seconds: 30, duration_seconds: null, side: "left", frequency: "once a day", precautions: null, notes: null });
const ids = ["clamshell", "heel-slide", "glute-bridge"].filter((id) => defs.has(id));
const ctx = buildCoachContext({ day_number: 3, title: "Day 3: hips" }, ids.map(line), defs);
const noModel = () => { const spy = { calls: 0, messages: [] as unknown[], call: (async (m: unknown) => { spy.calls++; spy.messages.push(m); return null; }) as ModelCall }; return spy; };
const replies = (list: unknown[]) => { const spy = { calls: 0, messages: [] as { role: string; content: string }[][], call: (async (m: { role: string; content: string }[]) => { spy.messages.push(m); const next = list[Math.min(spy.calls, list.length - 1)]; spy.calls++; return { text: typeof next === "string" ? next : JSON.stringify(next), model: "mock" }; }) as unknown as ModelCall }; return spy; };
const coach = (text: string, over: { lang?: "en" | "ru"; history?: Turn[]; turnNumber?: number } = {}, model = noModel()) =>
  runCoachTurn({ lang: over.lang ?? "en", history: over.history ?? [], patientText: text, ctx, focus: 0, turnNumber: over.turnNumber ?? 1, catalogue: library.map((e) => e.name) }, { callModel: model.call }).then((r) => ({ r, model }));
{
  // scripted answers
  for (const text of ["ye exercise kaise karni hai", "kitni baar karni hai", "saans kaise lun", "kya chahiye is ke liye", "isme aam ghaltiyan kya hain", "aaj ka plan kya hai"]) {
    const { r } = await coach(text, { lang: "en" });
    eq(languageOf(r.reply), "ru", `Roman Urdu question, English page: the answer is in Roman Urdu: "${text}"`);
    ok(!/Starting position|your physiotherapist set this|Today's exercises|stay safe|Breathing:/.test(r.reply), `...and none of the English labels slip in: "${text}"`);
  }
  for (const text of ["How do I do it?", "How many sets and reps?", "How should I breathe?", "What do I need for it?"]) {
    const { r } = await coach(text, { lang: "ru" });
    eq(languageOf(r.reply), "en", `English question, Roman Urdu page: the answer is in English: "${text}"`);
  }
  // safety messages
  for (const text of ["seene mein dard hai", "mujhe chakkar aa raha hai", "paon mein sunn pan ho gaya hai"]) {
    const screen = screenCoachText(text);
    ok(screen !== null, `the safety screen reads Roman Urdu: "${text}"`);
    eq((await coach(text, { lang: "en" })).r.reply, screen!.message.ru, `a Roman Urdu warning sign gets the stop message in Roman Urdu, on an English page: "${text}"`);
  }
  for (const text of ["I have chest pain", "I feel dizzy and might faint"]) {
    eq((await coach(text, { lang: "ru" })).r.reply, screenCoachText(text)!.message.en, `an English warning sign gets the stop message in English, on a Roman Urdu page: "${text}"`);
  }
  // a neutral message keeps the conversation's language
  const sticky = await coach("ok", { lang: "en", history: [patient("mujhe kamar ki exercise ke baare me poochna hai"), assistant("Zaroor")] });
  eq(sticky.r.reply, COACH_MENU.ru, "a neutral message keeps the patient's Roman Urdu");
  eq((await coach("ok", { lang: "ru" })).r.reply, COACH_MENU.ru, "...and with nothing said before, the page's language switch decides");

  // the model's reply
  const free = "kamar seedhi rakhun ya thori jhuki hui";
  const wrongThenRight = replies([{ reply: "Keep your back straight and move slowly.", needs_therapist: false }, { reply: "Kamar ko seedha rakhein aur aahista harkat karein.", needs_therapist: false }]);
  const a = await coach(free, { lang: "en" }, wrongThenRight);
  ok(a.r.how === "model" && !a.r.fallback && /Kamar ko seedha/.test(a.r.reply) && wrongThenRight.calls === 2, "an English model reply to a Roman Urdu patient is refused and the model is asked once more");
  const wrongTwice = replies([{ reply: "Keep your back straight and move slowly.", needs_therapist: false }]);
  const b = await coach(free, { lang: "en" }, wrongTwice);
  ok(b.r.how === "menu" && b.r.reply === COACH_MENU.ru && wrongTwice.calls === 2, "two English replies in a row: the scripted menu answers, in Roman Urdu");
  const right = replies([{ reply: "Kamar ko seedha rakhein aur aahista harkat karein.", needs_therapist: false }]);
  const sent = (await coach(free, { lang: "en" }, right)).model.messages[0] as { role: string; content: string }[];
  ok(sent[0].content.includes("Language of this reply: Roman Urdu") && sent[sent.length - 1].content.endsWith(LANGUAGE_REMINDER.ru), "the model is told to answer in Roman Urdu, in the instructions and again behind the patient's message");
  const english = replies([{ reply: "Keep your back straight and move slowly.", needs_therapist: false }]);
  const c = await coach("should my back stay straight or a little curved", { lang: "ru" }, english);
  ok(c.r.how === "model" && /back straight/.test(c.r.reply), "an English patient on a Roman Urdu page gets the English reply");
  ok(buildCoachMessages({ lang: "en", history: [], ctx, focus: 0, patientText: "hi" })[0].content.includes("Language of this reply: English"), "the English prompt names English");
}

/* 4. Scripted answers sound like a coach, and say nothing new. */
{
  const intents: Intent[] = ["how", "dose", "mistakes", "breathing", "equipment", "safety", "plan", "pain"];
  for (const lang of ["en", "ru"] as const) {
    for (const intent of intents) {
      const seen = new Set<string>();
      for (let seed = 1; seed <= 6; seed++) {
        const text = conversational(intent, "BODY", lang, seed);
        const added = text.replace("BODY", " ");
        seen.add(text);
        ok(text.includes("BODY"), `the answer itself is kept: ${intent}/${lang}/${seed}`);
        ok(!/\d/.test(added) && !/normal|fine\b|nothing serious|heal|recover|promise|diagnos/i.test(added), `the words added around the answer promise nothing and give no amounts: ${intent}/${lang}/${seed}: "${added.trim()}"`);
      }
      ok(seen.size >= 3, `the wording changes from one answer to the next: ${intent}/${lang} (${seen.size} different)`);
    }
    eq(conversational("physio", "BODY", lang, 3), "BODY", `the physiotherapist routing stays exactly as written (${lang})`);
  }
}

/* 5. The intake conversation. */
{
  const intake = (text: string, model: { call: ModelCall }, lang: "en" | "ru" = "en", history: Turn[] = []) =>
    runIntakeTurn({ lang, history, draft: EMPTY_DRAFT, patientText: text, turnNumber: 1 }, { callModel: model.call });
  const text = "meri kamar me dard hai";
  const scriptedOnly = await intake(text, noModel());
  eq(languageOf(scriptedOnly.reply), "ru", "no model: the scripted question is in Roman Urdu for a Roman Urdu patient on an English page");
  const english = replies([{ reply: "I am sorry to hear that. Where does it hurt the most?", updates: { regions: ["lumbar"] }, ready: false }]);
  const refused = await intake(text, english);
  ok(refused.fallback && languageOf(refused.reply) === "ru" && english.calls === 2, "an English model reply to a Roman Urdu patient is refused: the scripted Roman Urdu question answers");
  const good = replies([{ reply: "Ye sun kar afsos hua. Ye dard aap ko kab se hai?", updates: { regions: ["lumbar"] }, ready: false }]);
  const used = await intake(text, good);
  ok(!used.fallback && /kab se/.test(used.reply) && good.calls === 1, "a Roman Urdu model reply is used");
  const stop = screenPatientText("mujhe seene mein dard hai");
  ok(stop !== null, "the safety screen reads Roman Urdu");
  eq((await intake("mujhe seene mein dard hai", noModel(), "en")).reply, stop!.message.ru, "a Roman Urdu warning sign gets the stop message in Roman Urdu");
  ok(buildIntakeMessages({ lang: "ru", history: [], draft: EMPTY_DRAFT, focus: "regions", patientText: "hi" })[0].content.includes("Language of this reply: Roman Urdu"), "the intake prompt names the language of this reply");
  const last = buildIntakeMessages({ lang: "ru", history: [], draft: EMPTY_DRAFT, focus: "regions", patientText: "hi" }).at(-1)!;
  ok(last.content.endsWith(LANGUAGE_REMINDER.ru), "the intake reminder is the last thing the model reads");
}

/* 6. The check-in. */
{
  const ctxCheckin: CheckinContext = { dayNumber: 3, title: "Day 3: hips", point: "24h", pointLabel: "Next day (~24 h)", session: { painBefore: 3, painDuring: 5, painAfter: 4, difficulty: 6 } };
  const draft = { ...EMPTY_CHECKIN, signs: "no" as const };
  const run = (text: string, model: { call: ModelCall }, lang: "en" | "ru" = "en", history: Turn[] = []) =>
    runCheckinTurn({ lang, history, draft, patientText: text, turnNumber: 2, ctx: ctxCheckin }, { callModel: model.call });
  const englishAck = replies([{ ack: "Thank you for sharing that with me today.", updates: {}, needs_therapist: false }]);
  const r1 = await run("dard 3 hai abhi", englishAck);
  eq(languageOf(r1.reply), "ru", "a Roman Urdu answer gets a Roman Urdu reply (the next question too), whatever the page's language switch says");
  ok(!/Thank you for sharing/.test(r1.reply) && englishAck.calls === 2, "an English acknowledgement for a Roman Urdu patient is refused, and the scripted Roman Urdu one is used");
  const romanAck = replies([{ ack: "Batane ka shukriya, dard ka bataya.", updates: {}, needs_therapist: false }]);
  const r2 = await run("dard 3 hai abhi", romanAck);
  ok(/Batane ka shukriya/.test(r2.reply) && romanAck.calls === 1, "a Roman Urdu acknowledgement is used");
  const r3 = await run("pain is 3 right now", noModel(), "ru");
  eq(languageOf(r3.reply), "en", "an English answer gets an English reply, even on a Roman Urdu page");
  const r4 = await run("ok", noModel(), "en", [patient("mujhe thora behtar lag raha hai")]);
  eq(languageOf(r4.reply), "ru", "a neutral message keeps the patient's Roman Urdu");
  const msgs = buildCheckinMessages({ lang: "ru", history: [], ctx: ctxCheckin, draft, step: "pain", patientText: "dard 3 hai" });
  ok(msgs[0].content.includes("Language of this reply: Roman Urdu") && msgs.at(-1)!.content.endsWith(LANGUAGE_REMINDER.ru), "the check-in prompt names the language, and the reminder comes last");
}

/* 7. Wiring. */
{
  const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  for (const file of ["coach-turn", "intake-turn", "checkin-turn"]) {
    const code = src(`src/lib/rehabverse/ai/${file}.ts`);
    ok(/replyLanguage\(text, input\.history, input\.lang\)/.test(code) && /replyMatchesLanguage/.test(code), `${file}: the reply language is the language the patient writes in, and a wrong-language model reply is refused`);
    ok(!/\[input\.lang\]/.test(code), `${file}: no reply is picked by the page's language switch any more`);
  }
}

console.log(`RehabVerse reply language: ${checks} checks passed (Roman Urdu in -> Roman Urdu out for the coach, the intake and the check-in; English in -> English out; neutral messages keep the conversation's language; wrong-language model replies refused; warm, promise-free wording around scripted answers).`);
