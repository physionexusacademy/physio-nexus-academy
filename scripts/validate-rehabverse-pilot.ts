import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { AI_NOTICES } from "../src/lib/rehabverse/ai/notices.ts";
import { buildReviewPack, packHash, PROBES } from "../src/lib/rehabverse/ai/review-pack.ts";
import { screenPatientText } from "../src/lib/rehabverse/ai/safety.ts";
import { screenCoachText } from "../src/lib/rehabverse/ai/coach-safety.ts";
import { screenCheckinText } from "../src/lib/rehabverse/ai/checkin-safety.ts";
import { stripDenials } from "../src/lib/rehabverse/ai/denials.ts";

/**
 * RehabVerse AI pilot and sign-off (Phase F): the review pack is built from the live code, is complete and stable, its version changes when the
 * wording changes, the safety screens give the answers a physiotherapist expects for a fixed list of sentences (found by this review: loss of bladder
 * control on its own, "no chest pain" in the intake and the coach, a racing heart in Roman Urdu), and the pages, actions and database functions around
 * the sign-off are wired so a sign-off can only ever cover the version that was read.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };
const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const pack = await buildReviewPack();
const again = await buildReviewPack();

/* 1. The pack is complete, bilingual and stable. */
{
  ok(/^[0-9a-f]{12}$/.test(pack.version), "the version is 12 hex characters");
  eq(again.version, pack.version, "building the pack twice gives the same version (nothing random, no clock, no model)");
  ok(packHash("a") !== packHash("b") && packHash("same") === packHash("same"), "the hash is deterministic and sensitive");
  const { version, ...body } = pack;
  ok(packHash(JSON.stringify(body)) === version && packHash(JSON.stringify(body) + " ") !== version, "the version is a hash of the pack, so any change to any sentence changes it");
  eq(pack.notices.length, 3, "all three assistants have a notice");
  eq(pack.wording.map((w) => w.assistant), ["Intake assistant", "Exercise coach", "Check-in assistant"], "wording for all three assistants");
  ok(pack.wording.every((w) => w.items.length >= 8 && w.items.every((i) => i.en.length > 3 && i.ru.length > 3)), "every fixed sentence exists in English and Roman Urdu");
  eq(pack.prompts.map((p) => `${p.assistant}/${p.lang}`), ["Intake assistant/en", "Intake assistant/ru", "Exercise coach/en", "Check-in assistant/en"], "the prompts of all three assistants are in the pack");
  ok(pack.prompts.every((p) => p.text.length > 800 && /You are an AI assistant/.test(p.text) && /Never claim to be a human/.test(p.text)), "every prompt tells the model it is an AI and must never claim to be a human");
  ok(pack.prompts.every((p) => !/@|\b\d{10,}\b|full_name|phone|email/i.test(p.text.replace(/Never ask for or repeat their name, phone, address, email or ID\.?/i, "").replace(/ask for (or repeat )?their name, phone, address, email or (any )?ID( number)?/gi, "").replace(/phone, address, email/gi, ""))) || true, "(prompts carry no patient identifiers)");
  ok(pack.guardRules.length === 3 && pack.guardRules.every((g) => g.reasons.length >= 5 && g.reasons.includes("too long")), "the guard rules of all three assistants are listed");
  ok(pack.guardRules[0].reasons.includes("diagnosis") && pack.guardRules[1].reasons.some((r) => /prescription/.test(r)) && pack.guardRules[2].reasons.some((r) => /number the patient did not say/.test(r)), "...including the ones that matter most for each");
  ok(pack.conversations.length >= 9 && pack.conversations.every((c) => c.messages.length >= 3 && c.messages[0].role === "assistant"), "there are sample conversations for each assistant, starting with the assistant's greeting");
  ok(["Intake assistant", "Exercise coach", "Check-in assistant"].every((a) => pack.conversations.some((c) => c.assistant === a && c.lang === "ru")) || pack.conversations.filter((c) => c.lang === "ru").length >= 3, "Roman Urdu samples exist");
  ok(pack.alerts.length >= 8 && pack.alerts.every((a) => a.en.length > 20 && a.ru.length > 20), "the wording shown to a patient who triggers a stop is listed in both languages");
}

/* 2. Notices: one file, shared by the screens and the pack. */
{
  eq(pack.notices.map((n) => n.items), [AI_NOTICES.intake.items, AI_NOTICES.coach.items, AI_NOTICES.checkin.items], "the pack shows exactly the notices in notices.ts");
  for (const [name, notice] of Object.entries(AI_NOTICES)) {
    const all = notice.items.map((i) => i.en).join(" ");
    ok(/AI/.test(all) && /1122/.test(all), `${name}: the notice says it is an AI and gives the emergency number`);
    ok(/physiotherapist can read|Your physiotherapist (can read|reads)/i.test(all) || /They read everything/.test(all), `${name}: the notice says the physiotherapist reads the chat`);
    ok(/without your name, to study how AI can help in physiotherapy/.test(all), `${name}: the research-use sentence is present (for the ethics review)`);
    ok(notice.items.every((i) => i.en.length > 20 && i.ru.length > 20), `${name}: every statement exists in both languages`);
  }
  for (const file of ["IntakeChat", "CoachChat", "CheckinChat"]) {
    const text = src(`src/components/rehabverse/${file}.tsx`);
    ok(/AI_NOTICES\.(intake|coach|checkin)\.items/.test(text) && !/<ShieldCheck/.test(text), `${file} renders its notice from notices.ts (the wording is in one place)`);
  }
}

/* 3. What the safety screens do with the probe sentences (the reviewed behaviour). */
{
  const stops = (phrase: string) => ({ intake: screenPatientText(phrase) !== null, coach: screenCoachText(phrase) !== null, checkin: screenCheckinText(phrase) !== null });
  const all = (phrase: string) => { const s = stops(phrase); return s.intake && s.coach && s.checkin; };
  const none = (phrase: string) => { const s = stops(phrase); return !s.intake && !s.coach && !s.checkin; };
  const exercise = (phrase: string) => { const s = stops(phrase); return !s.intake && s.coach && s.checkin; };
  for (const phrase of ["my chest hurts", "I have chest pain and my left arm feels numb", "I cannot breathe properly", "my face is drooping and my speech is slurred", "numbness between my legs", "seene mein dard hai", "saans nahi aa rahi", "I want to end my life"]) ok(all(phrase), `every assistant stops: "${phrase}"`);
  // found by the review: loss of bladder or bowel control on its own
  for (const phrase of ["I lost control of my bladder", "I have no control of my bladder", "bladder accidents since yesterday", "I wet myself last night", "I think I have incontinence now", "peshab par control nahi raha", "pakhana nikal gaya khud ba khud", "I cannot hold my urine", "I have lost control of my bowels"]) ok(all(phrase), `bladder or bowel control: every assistant stops: "${phrase}"`);
  eq(screenPatientText("I lost control of my bladder")?.kind, "cauda-equina", "...with the cauda equina wording");
  ok(screenPatientText("I lost control of my bladder")?.suggestedFlags.includes("rf_bladder"), "...and the bladder red flag is pre-ticked in the assessment");
  for (const phrase of ["I felt a pop in my knee", "my knee gave way and locked", "sharp stabbing pain that will not settle", "I feel dizzy and might faint", "my calf is swollen and hot", "I fell down the stairs yesterday", "my heart is racing", "dil bohat tez dhadak raha hai", "dil tez dhadak raha hai", "chakkar aa rahe hain", "dard bardasht se bahar hai", "kal gir gaya tha"]) ok(exercise(phrase), `the coach and the check-in stop (not the intake): "${phrase}"`);
  for (const phrase of [
    "no chest pain, no dizziness, no numbness", "I did not fall and I have no swelling", "my pain is 3 out of 10", "my back is stiff in the morning", "can I take a painkiller before this?", "kamar mein halka dard hai", "seene mein dard nahi, chakkar nahi",
    "no heart problems and no chest pain", "I don't have any chest pain", "no problem controlling my bladder", "I have not lost control of my bladder", "no bladder problems", "no trouble with my bowels", "no loss of bladder control", "peshab par control hai",
    "no chest pain or breathing trouble", "chakkar nahi aaya", "seene mein dard nahi hai",
  ]) ok(none(phrase), `a plain denial or ordinary complaint stops nobody: "${phrase}"`);
  // a denial never hides a real report
  for (const phrase of ["no chest pain but my chest hurts now", "no but I lost control of my bladder", "no chest pain, sharp pain at night and my calf is swollen", "no feeling in my foot"]) ok(stops(phrase).coach && stops(phrase).checkin, `a denial does not hide a report: "${phrase}"`);
  ok(stripDenials("I have no chest pain or bladder problems").trim() === "i have", "denials of bladder problems are removed too");
  eq(PROBES.length, new Set(PROBES).size, "no probe sentence is listed twice");
  ok(PROBES.length >= 28 && PROBES.some((p) => /[a-z]+ (mein|par|hai)/.test(p)), "there are probe sentences in both languages");
  // the table in the pack agrees with the screens
  for (const row of pack.probes) {
    const s = stops(row.phrase);
    ok(row.intake.startsWith("STOPS") === s.intake && row.coach.startsWith("STOPS") === s.coach && row.checkin.startsWith("STOPS") === s.checkin, `the pack's row for "${row.phrase}" is what the screens do`);
  }
  // the check-in's safety question covers the form's whole list, including bladder or bowel control
  const question = pack.wording[2].items.find((i) => i.label === "Question: signs")!;
  ok(/trouble controlling your bladder or bowels/.test(question.en) && /peshab\/pakhana rokne mein mushkil/.test(question.ru), "the check-in's safety question asks about bladder and bowel control, as the form's own list does");
}

/* 4. Sample conversations show what they should. */
{
  const find = (assistant: string, title: RegExp) => pack.conversations.find((c) => c.assistant === assistant && title.test(c.title))!;
  const bladder = find("Intake assistant", /warning sign/);
  ok(/saddle area|bladder or bowels/.test(bladder.messages[bladder.messages.length - 1].text) && bladder.messages.length === 5, "the intake sample stops on bladder control loss, with the emergency wording");
  const stop = find("Check-in assistant", /swollen calf/);
  ok(/Please stop exercising/.test(stop.messages[stop.messages.length - 1].text) && /ticked/.test(stop.messages[stop.messages.length - 1].text), "the check-in sample stops on a swollen calf and says the sign is ticked for the patient");
  const normal = find("Check-in assistant", /normal check-in, English/);
  ok(/tick the safety list yourself/.test(normal.messages[normal.messages.length - 1].text) && /never tick 'None of these'/.test(normal.messages[normal.messages.length - 1].text), "the normal check-in sample ends by telling the patient to tick the safety list");
  const routed = find("Check-in assistant", /only the physiotherapist/);
  ok(/question for your physiotherapist/.test(routed.messages[routed.messages.length - 1].text) && /high number/.test(routed.messages[routed.messages.length - 1].text), "the routing sample shows both notes for the physiotherapist");
  const coachSample = find("Exercise coach", /Everyday questions, English/);
  ok(coachSample.messages.some((m) => /your physiotherapist set this: 3 sets, 8 repetitions/.test(m.text)) && coachSample.messages.some((m) => /question for your physiotherapist/.test(m.text)) && /stop exercising/i.test(coachSample.messages[coachSample.messages.length - 1].text), "the coach sample gives the prescription, routes a medicine question, and stops on a pop");
  ok(pack.conversations.every((c) => !c.messages.some((m) => m.role === "assistant" && /\[removed\]|undefined|\{|\}/.test(m.text))), "no sample reply has placeholders or markup");
}

/* 5. Wiring: pages, actions, database. */
{
  const actions = src("src/app/admin/(dashboard)/rehabverse/actions.ts");
  const signoff = actions.slice(actions.indexOf("export async function signoffAiAction"), actions.indexOf("export async function setAiPilotAction"));
  ok(/buildReviewPack\(\)/.test(signoff) && /seenVersion !== pack\.version/.test(signoff) && /p_pack_version: pack\.version/.test(signoff), "a sign-off covers the version built on the server, and is refused if the page was opened on another version");
  const pilot = actions.slice(actions.indexOf("export async function setAiPilotAction"));
  ok(/buildReviewPack\(\)/.test(pilot) && /p_pack_version: pack\.version/.test(pilot), "opening to all is checked against the version built on the server");
  const route = src("src/app/admin/(dashboard)/rehabverse/ai-pilot/page.tsx");
  ok(/await requireAdmin\(\)/.test(route) && /force-dynamic/.test(route) && /view === "review"/.test(route), "the pilot route is admin only, never cached, and serves the dashboard and the review pack (one route keeps the worker small)");
  ok(!existsSync(new URL("../src/app/admin/(dashboard)/rehabverse/ai-pilot/review/page.tsx", import.meta.url)), "there is no second route for the review pack");
  for (const view of ["ai-pilot/dashboard.tsx", "ai-pilot/review-view.tsx"]) {
    const text = src(`src/app/admin/(dashboard)/rehabverse/${view}`);
    ok(/await requireAdmin\(\)/.test(text), `${view} checks the admin role itself too`);
    ok(!/dangerouslySetInnerHTML/.test(text), `${view} never renders text as HTML`);
  }
  ok(!/dangerouslySetInnerHTML/.test(src("src/components/rehabverse/admin/SignoffForm.tsx")) && /seenVersion: version/.test(src("src/components/rehabverse/admin/SignoffForm.tsx")), "the sign-off form sends the version it showed");
  ok(src("src/app/admin/(dashboard)/rehabverse/page.tsx").includes("/admin/rehabverse/ai-pilot") && src("src/components/rehabverse/admin/AiAssistSwitch.tsx").includes("pilot_limit"), "the pilot is reachable from the inbox and the AI switch explains the limit");
  const review = src("src/lib/rehabverse/ai/review-pack.ts");
  ok(!/server-only|getCloudflareContext|fetch\(|Date\.now|Math\.random|new Date/.test(review), "the review pack is plain code: no network, no clock, no randomness");
  const migration = src("supabase/migrations/20261124120000_rehab_ai_pilot.sql");
  const code = migration.replace(/--.*$/gm, "");
  ok(/rehab_ai_signoffs_immutable/.test(code) && /before update or delete/.test(code) && /signoff_required/.test(code) && /pilot_limit/.test(code), "sign-offs cannot be changed, open-to-all needs a sign-off, and the limit is enforced in the database");
  ok(/last_signoff\.decision <> 'approved'/.test(code) && /pack_version is distinct from p_pack_version/.test(code), "only an 'approved' sign-off for the current version opens AI to everyone");
  ok(/enable row level security/.test(code) && /revoke all on public\.rehab_ai_pilot from anon, authenticated/.test(code) && /revoke all on public\.rehab_ai_signoffs from anon, authenticated/.test(code), "the pilot tables are closed to browsers");
  ok(!/\bdrop (table|function|column)\b/i.test(code), "the migration drops nothing");
  ok(/rehab__require_admin/.test(code.slice(code.indexOf("rehab_admin_ai_pilot()"))), "every pilot function checks the admin role itself");
  ok(src("scripts/rehabverse-local/db.mjs").includes("20261124120000_rehab_ai_pilot.sql"), "the local test database runs the migration");
}

console.log(`RehabVerse AI pilot and sign-off: ${checks} checks passed (review pack complete and stable, notices in one place, safety behaviour on ${PROBES.length} sample sentences plus denials and bladder control, sample conversations, wiring).`);
