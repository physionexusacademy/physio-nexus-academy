import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SOURCE } from "../src/lib/rehabverse/library/source.ts";
import type { Bi, ExerciseDef } from "../src/lib/rehabverse/types.ts";
import { buildCoachContext, detectIntent, answerFor, maskExerciseNames, pickExercise, QUICK_QUESTIONS, COACH_STOP, COACH_MENU, type CoachContext, type PlanLine } from "../src/lib/rehabverse/ai/coach-spec.ts";
import { screenCoachText } from "../src/lib/rehabverse/ai/coach-safety.ts";
import { guardCoachReply } from "../src/lib/rehabverse/ai/coach-guard.ts";
import { runCoachTurn } from "../src/lib/rehabverse/ai/coach-turn.ts";
import { buildCoachMessages, coachSystemPrompt } from "../src/lib/rehabverse/ai/coach-prompts.ts";
import type { ModelCall } from "../src/lib/rehabverse/ai/intake-turn.ts";

/**
 * RehabVerse exercise coach: everything that can be tested WITHOUT a live model (the model call is a mock). The safety screen, the answers made
 * from the prescription and the reviewed library, the routing of questions only the physiotherapist can answer, the guard on the model's
 * replies (it must not change the plan), the fallback, and the privacy of what the model is told.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };

const library = Object.values(SOURCE).flat() as ExerciseDef[];
const defs = new Map(library.map((e) => [e.id, e]));
const byId = (id: string) => { const e = defs.get(id); if (!e) throw new Error(`no exercise ${id}`); return e; };
const line = (id: string, over: Partial<PlanLine> = {}): PlanLine => ({
  exercise_id: id, exercise_title: byId(id).name.en, sets: 2, reps: 10, hold_seconds: 3, rest_seconds: 30, duration_seconds: null, side: "left", frequency: "once a day",
  precautions: "Keep the movement small and slow. Call 0300 1234567 if unsure.", notes: "Stop if your back starts to ache.", ...over,
});
const ctxOf = (ids: string[], over: (id: string) => Partial<PlanLine> = () => ({})) => buildCoachContext({ day_number: 3, title: "Day 3: hips" }, ids.map((id) => line(id, over(id))), defs);

// a day with three real exercises
const ids = ["clamshell", "heel-slide", "glute-bridge"].filter((id) => defs.has(id));
const ctx = ctxOf(ids);
const clam = ctx.exercises[0];
const catalogue: Bi[] = library.map((e) => e.name);
const noModel = (): { calls: number; call: ModelCall } => { const spy = { calls: 0, call: (async () => { spy.calls++; return null; }) as ModelCall }; return spy; };
const scripted = (reply: unknown): { calls: number; call: ModelCall } => { const spy = { calls: 0, call: (async () => { spy.calls++; return { text: typeof reply === "string" ? reply : JSON.stringify(reply), model: "mock" }; }) as ModelCall }; return spy; };
const turn = (text: string, over: Partial<Parameters<typeof runCoachTurn>[0]> = {}, model = noModel()) =>
  runCoachTurn({ lang: "en", history: [], patientText: text, ctx, focus: 0, turnNumber: 1, catalogue, ...over }, { callModel: model.call }).then((r) => ({ r, model }));

/* 1. What the coach knows. */
{
  ok(ctx.exercises.length === ids.length && ids.length === 3, "the three real exercises are in today's context");
  eq([clam.dose.sets, clam.dose.reps, clam.dose.holdSeconds, clam.dose.restSeconds], [2, 10, 3, 30], "the dose is the physiotherapist's prescription");
  const json = JSON.stringify(ctx);
  for (const e of ctx.exercises) {
    const def = byId(e.id);
    for (const text of [...def.contraindications, ...def.progressions, ...def.regressions, ...def.indications]) ok(!json.includes(JSON.stringify(text).slice(1, -1)), `clinician-only text is never given to the coach (${e.id})`);
  }
  const prompt = coachSystemPrompt("en", ctx, 0);
  ok(prompt.includes("Prescribed for this patient: 2 sets, 10 reps, hold 3 seconds, rest 30 seconds, how often: once a day, side: left"), "the prompt states the prescription");
  ok(prompt.includes("You are an AI assistant") && prompt.includes("needs_therapist") && /Never claim to be a human/.test(prompt), "the prompt says it is an AI and defines the physiotherapist route");
  ok(!prompt.includes("0300 1234567") && prompt.includes("[removed]"), "a phone number in the physiotherapist's note is removed before the model sees it");
  ok(/The patient currently has exercise \[1\] open/.test(prompt), "the prompt says which exercise is open");
  const msgs = buildCoachMessages({ lang: "en", history: [{ role: "patient", text: "call me on 0321 5551234" }], ctx, focus: 0, patientText: "my email is a.b@example.com, how do i do it" });
  ok(!JSON.stringify(msgs).includes("5551234") && !JSON.stringify(msgs).includes("a.b@example.com"), "phone numbers and e-mails in the chat are removed before the model sees them");
  eq(buildCoachContext({ day_number: 1, title: "x" }, [line(ids[0])], new Map()).exercises[0].library, null, "an exercise missing from the library still works from the prescription alone");
}

/* 2. Safety first: the model is never consulted. */
{
  const alarming = [
    "I felt a pop in my knee", "my knee gave way when I stood up", "I have a sharp pain in my back now", "I feel dizzy and might faint", "my leg is numb and tingling",
    "my calf is swollen and hot", "I fell while doing the bridge", "my heart is racing", "I have chest pain", "the pain is getting worse and worse",
    "ghutne mein awaaz aayi aur tez dard hai", "mujhe chakkar aa raha hai", "paon mein sunn pan ho gaya hai", "seene mein dard hai", "meri taang mein kamzori hai",
    "pindli sooj gayi hai",
  ];
  for (const text of alarming) {
    const { r, model } = await turn(text);
    ok(r.status === "safety_stop" && r.how === "safety" && r.notify === "safety" && r.model === "safety", `a safety problem stops the coach and alerts the physiotherapist: "${text}"`);
    ok(model.calls === 0, `...and the model is not consulted: "${text}"`);
    ok(/stop|ruk|rok/i.test(r.reply) && /1122/.test(r.reply), `...the patient is told to stop and given the emergency number (in the language they wrote): "${text}"`);
  }
  const roman = await turn("mujhe chakkar aa raha hai", { lang: "ru" });
  ok(/Barah-e-karam abhi exercise rok dein/.test(roman.r.reply), "the stop message is in Roman Urdu when the conversation is");
  eq(screenCoachText("I have chest pain")?.level, "emergency", "chest pain is an emergency");
  eq(screenCoachText("my knee gave way")?.level, "urgent", "a joint giving way is urgent");
  const calm = [
    "How do I do the clamshell?", "How many reps?", "my knee is a little stiff after sitting", "I like these exercises", "what does neutral spine mean?", "the video loads slowly",
    "I did the exercises yesterday and felt great", "Is the band too long?", "ye exercise kaise karni hai", "main kal ye kar chuka hoon",
  ];
  for (const text of calm) ok(screenCoachText(text) === null, `an ordinary message is not an alarm: "${text}"`);
  eq((await turn("x".repeat(5000))).r.status, "open", "a very long message is cut short and handled");
  // an exercise name must not set off the alarm, but a real report using the same word still must
  const chest = ctxOf(["prone-thoracic-extension"]);
  const asked = await turn("What if Prone chest lift (thoracic extension) hurts?", { ctx: chest, focus: 0 });
  ok(asked.r.status === "open" && asked.r.intent === "pain", "asking about an exercise whose name contains 'chest' is not a chest-pain alarm");
  const real = await turn("my chest hurts when I do the chest lift", { ctx: chest, focus: 0 });
  ok(real.r.status === "safety_stop" && real.r.notify === "safety", "...but a real chest-pain report during it still stops the coach");
}

/* 3. Questions only the physiotherapist can answer go to them, without the model. */
{
  const physio = [
    "Can I do more reps?", "Can I take a painkiller before this?", "Can I use ice after?", "What is wrong with me?", "Will I get better soon?", "Can I skip this exercise?",
    "Should I use a heavier band?", "Can I do something else instead?", "is it a slipped disc?", "can I do it on the bed instead", "I want extra exercises", "Can I do double today?",
    "kya main zyada kar loon?", "dawai le sakta hoon?", "garam seak kar loon?", "kab tak theek ho jaunga",
  ];
  for (const text of physio) {
    const { r, model } = await turn(text);
    ok(r.how === "script" && r.intent === "physio" && r.notify === "question" && model.calls === 0, `routed to the physiotherapist without the model: "${text}"`);
    ok(/physiotherapist/i.test(r.reply) && /noted|note/i.test(r.reply), `...and says so: "${text}"`);
  }
  const named = ctxOf(["clamshell", "heel-slide"]);
  named.exercises[0] = { ...named.exercises[0], name: { en: "Core brace", ru: "Core brace" } };
  eq(detectIntent("How do I do Core brace?", named), "how", "an exercise name that contains a flagged word (brace) is not read as a question about braces");
  eq(detectIntent("How many reps of core brace", named), "dose", "...and the same for amounts");
}

/* 4. Everyday questions are answered from the plan and the library, without the model. */
{
  const how = await turn(`How do I do ${clam.name.en}?`, { focus: 1 });
  ok(how.r.how === "script" && how.r.intent === "how" && how.model.calls === 0, "'how' is answered without the model");
  ok(how.r.reply.includes(clam.library!.setup.en.replace(/\s+/g, " ").trim()) && how.r.reply.includes("1. ") && how.r.reply.includes(clam.library!.breathing.en.replace(/\s+/g, " ").trim()), "...from the reviewed library: starting position, numbered steps and breathing");
  eq(how.r.exercise, 0, "a name in the question beats the exercise that is open");
  const dose = await turn("How many sets and reps?", { focus: 0 });
  ok(dose.r.intent === "dose" && /2 sets/.test(dose.r.reply) && /10 repetitions/.test(dose.r.reply) && /hold for 3 seconds/.test(dose.r.reply) && /rest 30 seconds/.test(dose.r.reply) && /left side only/.test(dose.r.reply), "'how many' gives the physiotherapist's amounts, not the library defaults");
  const different = ctxOf(ids, () => ({ sets: 4, reps: 6, hold_seconds: 8 }));
  const d2 = await turn("how many reps", { ctx: different, focus: 0 });
  ok(/4 sets/.test(d2.r.reply) && /6 repetitions/.test(d2.r.reply) && /8 seconds/.test(d2.r.reply), "...whatever the physiotherapist prescribed");
  const mistakes = await turn("What are the common mistakes?", { focus: 0 });
  ok(mistakes.r.intent === "mistakes" && clam.library!.mistakes.every((m) => mistakes.r.reply.includes(m.en.replace(/\s+/g, " ").trim())), "mistakes are listed from the library");
  const breathing = await turn("How should I breathe?", { focus: 0 });
  ok(breathing.r.intent === "breathing" && breathing.r.reply.includes(clam.library!.breathing.en.replace(/\s+/g, " ").trim()), "breathing comes from the library");
  const equipment = await turn("What do I need for this?", { focus: 0 });
  ok(equipment.r.intent === "equipment" && /you need|no special equipment/.test(equipment.r.reply), "equipment is answered");
  const pain = await turn("What if it hurts?", { focus: 0 });
  ok(pain.r.intent === "pain" && pain.r.notify === "question" && /sharp, severe or worsening pain is not okay/.test(pain.r.reply) && pain.r.reply.includes("Keep the movement small and slow"), "'what if it hurts' uses the guide's pain wording and the physiotherapist's precaution, and tells the physiotherapist");
  ok(!/\b\d+\s*(\/|out of)\s*10\b/.test(pain.r.reply), "...and states no pain score limit");
  const plan = await turn("What exercises do I have today?", { focus: 0 });
  ok(plan.r.intent === "plan" && ctx.exercises.every((e) => plan.r.reply.includes(e.name.en)), "the day's plan can be listed");
  const which = await turn("how do I do it?", { ctx: ctxOf(ids), focus: null });
  ok(/Which exercise do you mean/.test(which.r.reply) && ctx.exercises.every((e) => which.r.reply.includes(e.name.en)), "with several exercises and none open, the coach asks which one");
  const single = ctxOf([ids[0]]);
  eq(pickExercise("how do i do it", single, null)?.index, 0, "with one exercise there is nothing to ask");
  const ru = await turn(`${clam.name.ru} kaise karni hai?`, { lang: "ru" });
  ok(ru.r.reply.includes(clam.library!.setup.ru.replace(/\s+/g, " ").trim()) && /Shuru ki position/.test(ru.r.reply), "Roman Urdu answers use the Roman Urdu library text");
  const ruDose = await turn("kitni baar karni hai?", { lang: "ru", focus: 0 });
  ok(/2 sets/.test(ruDose.r.reply) && /har set mein 10 reps/.test(ruDose.r.reply), "...and Roman Urdu amounts");
}

/* 5. Every real exercise answers every quick question, in both languages. */
{
  let combos = 0;
  for (const exercise of library) {
    const single = ctxOf([exercise.id]);
    for (const lang of ["en", "ru"] as const) {
      for (const q of QUICK_QUESTIONS) {
        const text = q.ask(exercise.name)[lang];
        eq([screenCoachText(maskExerciseNames(text, single)), detectIntent(text, single)], [null, q.intent], `the quick question "${text}" is understood and is not an alarm`);
        const answer = answerFor(q.intent, single.exercises[0], single, lang);
        ok(answer.text.length > 20 && !/undefined|null|NaN|\[object/.test(answer.text), `the answer to "${text}" is real text`);
        combos++;
      }
    }
  }
  ok(combos === library.length * 2 * QUICK_QUESTIONS.length && library.length >= 90, `all ${library.length} exercises x 2 languages x ${QUICK_QUESTIONS.length} quick questions work`);
}

/* 6. The model, behind the guard. */
{
  const good = scripted({ reply: "Keep your feet together and let the top knee lift slowly, like a clam opening. Breathe out as you lift.", needs_therapist: false });
  const a = await turn("what does it mean to keep my hips stacked?", {}, good);
  ok(a.r.how === "model" && a.model.calls === 1 && !a.r.fallback && a.r.notify === null && a.r.model === "mock" && /clam opening/.test(a.r.reply), "a free technique question reaches the model and a good reply is used");
  const q = scripted({ reply: "That is hard to judge from here. Stop if it hurts.", needs_therapist: true });
  const b = await turn("my hip feels odd while I do the third one, any idea?", {}, q);
  ok(b.r.how === "model" && b.r.notify === "question" && /noted this for your physiotherapist/.test(b.r.reply), "when the model says the physiotherapist must answer, the patient is told it was noted and the physiotherapist is told");
  const plain = scripted("Lift the top knee only as far as you can keep your hips still.");
  const c = await turn("what does hips stacked mean", {}, plain);
  ok(c.r.how === "model" && /hips still/.test(c.r.reply), "a plain-text model answer is accepted (the guard still applies)");
  const none = await turn("what does hips stacked mean", {}, noModel());
  ok(none.r.how === "menu" && none.r.fallback && none.r.reply === COACH_MENU.en && none.model.calls === 1, "without a model the scripted menu answers (once asked: no repair for a missing model)");
  const garbage = await turn("what does hips stacked mean", {}, scripted("{ nonsense ]["));
  ok(garbage.r.how === "menu" && garbage.r.fallback && garbage.model.calls === 2, "garbage gets one repair attempt, then the scripted menu");
  const bad: [string, string][] = [
    ["You probably have a slipped disc, so be careful.", "diagnosis"],
    ["You could take some paracetamol before you start.", "medicine"],
    ["Use an ice pack afterwards.", "ice"],
    ["Do 5 more reps today if it feels good.", "more reps"],
    ["Try 12 reps with a short rest.", "a number that is not in the plan"],
    ["Do three sets of it.", "a spelled-out amount that is not in the plan"],
    ["Try the glute bridge instead of this one.", "swaps for a library exercise that is not today's"],
    ["I am a physiotherapist and I would say keep going.", "claims to be a clinician"],
    ["That is nothing serious, carry on.", "reassurance"],
    ["Just push through the pain, it passes.", "pushes through pain"],
    ["Your pain should stay below 5/10 while you do it.", "a pain threshold"],
    ["You can skip this exercise if it is too hard.", "skips"],
    ["Please send me your phone number so we can follow up.", "asks for identifying details"],
    ["Read more at https://example.com/clam", "a link"],
    ["Is it the left? Is it the right? Which hip is it?", "three questions"],
    ["x".repeat(900), "too long"],
    ['{"reply":"hi"}', "markup"],
    ["Increase the resistance a little each week.", "changes the load"],
    ["You will definitely get better with this.", "a promise"],
  ];
  const withCatalogue = (text: string) => guardCoachReply(text, ctx, catalogue);
  for (const [text, why] of bad) ok(!withCatalogue(text).ok, `the guard refuses a reply that ${why}: "${text.slice(0, 50)}"`);
  const fine = [
    "Keep your feet together and let the top knee lift slowly. Breathe out as you lift.",
    "Aim for 2 sets of 10, as your physiotherapist wrote.",
    "Hold for 3 seconds at the top, then lower slowly and rest 30 seconds.",
    "Try to keep your hips still and your movement small and slow.",
    "Nice work. If anything hurts sharply, stop and tell your physiotherapist in your feedback.",
  ];
  for (const text of fine) ok(withCatalogue(text).ok, `the guard allows ordinary coaching: "${text.slice(0, 50)}"`);
  // a reply the guard refuses never reaches the patient
  const sneaky = await turn("what does hips stacked mean", {}, scripted({ reply: "You can do 20 more reps, it will heal faster.", needs_therapist: false }));
  ok(sneaky.r.how === "menu" && sneaky.r.fallback && !/20 more/.test(sneaky.r.reply), "a refused model reply is replaced by the scripted menu");
}

/* 7. Limits and language. */
{
  const model = noModel();
  const long = await turn("how do I do it?", { turnNumber: 31 }, model);
  ok(long.r.status === "completed" && long.r.how === "limit" && model.calls === 0, "a very long conversation ends politely, without the model");
  // the reply follows the language the patient WRITES in; the page's language switch only decides when the message does not show one
  const ru = await turn("ye hips stacked ka kya matlab hai", { lang: "en" }, noModel());
  eq(ru.r.reply, COACH_MENU.ru, "a patient who writes Roman Urdu gets the scripted menu in Roman Urdu, whatever the page's language switch says");
  const en = await turn("what does hips stacked mean", { lang: "ru" }, noModel());
  eq(en.r.reply, COACH_MENU.en, "a patient who writes English gets English");
  const quiet = await turn("5", { lang: "ru" }, noModel());
  eq(quiet.r.reply, COACH_MENU.ru, "a message that shows no language falls back to the page's language switch");
  ok(/1122/.test(COACH_STOP.en) && /1122/.test(COACH_STOP.ru), "the stop message gives the emergency number in both languages");
}

/* 8. Wiring. */
{
  const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const actions = src("src/app/rehabverse/ai-actions.ts");
  ok(/data\.access !== "open"/.test(actions) && actions.includes("getSession(sessionId)"), "the coach works only on a day that is open to the signed-in patient");
  ok(actions.includes("await patientContext()") && actions.includes("rehab_ai_coach_notify") && actions.includes("rehab_ai_coach_hold"), "every coach call checks the switch on the server, and routing and holds go through the database functions");
  ok(/session_id/.test(actions) && /owner && owner !== input\.sessionId/.test(actions), "a conversation belongs to one day");
  ok(src("src/app/rehabverse/me/day/[id]/page.tsx").includes("ai={await aiAssistAllowed()}"), "the day page offers the coach only when the admin switched AI on");
  const session = src("src/components/rehabverse/DaySession.tsx");
  ok(session.includes('ai && access === "open"') && session.includes("<CoachChat"), "the coach is shown only on an open day and only when offered");
  ok(src("src/components/rehabverse/DaySessionLoader.tsx").includes("ssr: false"), "the day screen loads in the browser only (the worker does not grow)");
  ok(!/dangerouslySetInnerHTML/.test(src("src/components/rehabverse/CoachChat.tsx")), "coach text is never rendered as HTML");
  const migration = src("supabase/migrations/20261122120000_rehab_ai_coach.sql");
  ok(/revoke all on function public\.%s from public, anon, authenticated/.test(migration) && /grant execute on function public\.%s to service_role/.test(migration), "the database functions are for the server only");
  ok(/ai_assist <> 'on'/.test(migration) && /notified_/.test(migration) && !/\bdrop\b/i.test(migration.replace(/--.*$/gm, "")), "they re-check the switch, notify once per kind, and drop nothing");
  const library_ = src("src/lib/rehabverse/ai/library-server.ts");
  ok(library_.includes('import "server-only"') && library_.includes("ASSETS") && /slim/.test(library_), "the library is read from the static assets, not bundled, and only patient-facing fields are kept");
  for (const file of ["coach-spec", "coach-safety", "coach-guard", "coach-prompts", "coach-turn"]) ok(!/server-only|getCloudflareContext|fetch\(/.test(src(`src/lib/rehabverse/ai/${file}.ts`)), `${file} is plain code: no server imports, no network`);
}

console.log(`RehabVerse exercise coach: ${checks} checks passed (safety screen, plan-grounded answers, physiotherapist routing, guard, fallback, privacy; every library exercise x 2 languages x 5 quick questions).`);
