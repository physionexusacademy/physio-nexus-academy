// Entry bundled by scripts/validate-speech.mjs: checks voice choice and Roman Urdu preparation with a mocked speech synthesiser.
import { genderOf, planSpeech, supportsSpeech, voicesFor } from "../src/lib/speech/voices";
import { shortFirst, splitForSpeech } from "../src/lib/speech/builtin";
import { toSpoken } from "../src/lib/speech/spoken";
import { convertRun, splitRuns, toDevanagari, toUrdu } from "../src/lib/speech/roman-urdu";
import fs from "node:fs";

type V = { name: string; lang: string; localService: boolean; default: boolean; voiceURI: string };
const v = (name: string, lang: string, local = true, def = false): V => ({ name, lang, localService: local, default: def, voiceURI: name });
const g = globalThis as unknown as Record<string, unknown>;
/** A browser with these device voices; `builtin` says whether the built-in male voice can run (Web Worker + Web Audio). */
function install(voices: V[], builtin = true, withSynth = true) {
  const win: Record<string, unknown> = { localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {} };
  if (withSynth) win.speechSynthesis = { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, cancel() {}, speak() {}, pause() {}, resume() {} };
  if (builtin) win.AudioContext = function () {};
  g.window = win;
  if (builtin) g.Worker = function () {};
  else delete g.Worker;
  if (withSynth) g.SpeechSynthesisUtterance = function () {} as unknown;
  else delete g.SpeechSynthesisUtterance;
}
g.fetch = async () => ({ ok: true, json: async () => JSON.parse(fs.readFileSync("public/teacher/ur-lexicon.json", "utf8")) });

const failures: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) failures.push(what); };

// Voices as browsers really report them: Chrome/Android ones carry no gender, Google's are female, Microsoft's say who they are.
const EN_US = v("Google US English", "en-US", false), EN_GB_F = v("Google UK English Female", "en-GB", false), ARIA = v("Microsoft Aria Online (Natural) - English (United States)", "en-US", false);
const IN_PLAIN = v("English India", "en-IN"), RAVI_ONLINE = v("Microsoft Ravi Online (Natural) - English (India)", "en-IN", false);
const DAVID = v("Microsoft David - English (United States)", "en-US"), GOOGLE_MALE = v("Google UK English Male", "en-GB", false), MARK = v("Microsoft Mark - English (United States)", "en-US");
const GOOGLE_HI = v("Google \u0939\u093f\u0928\u094d\u0926\u0940", "hi-IN", false), HEMANT = v("Microsoft Hemant - Hindi (India)", "hi-IN"), KALPANA = v("Microsoft Kalpana - Hindi (India)", "hi-IN");
const ASAD = v("Microsoft Asad - Urdu (Pakistan)", "ur-PK"), UZMA = v("Microsoft Uzma - Urdu (Pakistan)", "ur-PK");

// 1. English. The voice is always male: a natural male voice the device offers (even a streamed one: if it is slow the built-in voice takes over),
// otherwise the built-in male voice. Never a female or unlabelled one.
install([EN_US, EN_GB_F, ARIA, IN_PLAIN]);
let plan = await planSpeech("Hello", "en");
check(plan.engine === "builtin" && plan.mode === "english" && plan.segments[0].builtin === "en-us" && plan.segments[0].voice === null, "No male device voice (female, unlabelled): the built-in male voice (got " + plan.engine + ")");
check(voicesFor("en", "male").length === 0, "Unlabelled and female voices are not offered");
install([EN_US, EN_GB_F, ARIA, IN_PLAIN, RAVI_ONLINE, GOOGLE_MALE]);
plan = await planSpeech("Hello", "en");
check(plan.engine === "device" && plan.segments[0].voice?.name === RAVI_ONLINE.name, "A natural online male voice is the first choice (got " + plan.segments[0].voice?.name + ")");
check(plan.fallback?.engine === "builtin" && plan.fallback.segments[0].builtin === "en-us", "An online voice carries a built-in fallback for the case it is slow to start");
check(voicesFor("en", "male").map((x) => x.name).join("|") === [RAVI_ONLINE, GOOGLE_MALE].map((x) => x.name).join("|"), "Natural male voices are listed first");
install([EN_US, ARIA, DAVID, MARK, IN_PLAIN]);
plan = await planSpeech("Hello", "en");
check(plan.engine === "device" && plan.segments[0].voice?.name === DAVID.name && !plan.fallback, "A male voice installed on the device is used, with no fallback needed (got " + plan.segments[0].voice?.name + ")");
check(voicesFor("en", "male").map((x) => x.name).sort().join("|") === [DAVID, MARK].map((x) => x.name).sort().join("|"), "Only the male installed voices are listed");
plan = await planSpeech("Hello", "en", { en: "pna-builtin-male" });
check(plan.engine === "builtin", "The built-in voice can be chosen even when a male device voice exists");
plan = await planSpeech("Hello", "en", { en: MARK.name });
check(plan.engine === "device" && plan.segments[0].voice?.name === MARK.name, "A saved male device voice wins");
plan = await planSpeech("Hello", "en", { en: ARIA.name });
check(plan.segments[0].voice?.name !== ARIA.name, "A saved female voice is ignored");
install([ARIA, EN_US]);
plan = await planSpeech("Hello", "en", { en: ARIA.name });
check(plan.engine === "builtin", "Female voices only: built-in male voice, never the female one");
install([ARIA, EN_US], false);
plan = await planSpeech("Hello", "en");
check(plan.mode === "none" && plan.engine === "none" && Boolean(plan.note), "Female voices only and no built-in voice: silent with a note (never a female voice)");
install([], true, false);
check(supportsSpeech() && (await planSpeech("Hello", "en")).engine === "builtin", "No speech synthesiser at all: the built-in voice still speaks");
install([], false, false);
check(!supportsSpeech() && (await planSpeech("Hello", "en")).mode === "none", "Nothing can speak: silent");
check(genderOf(DAVID) === "male" && genderOf(ARIA) === "female" && genderOf(IN_PLAIN) === null && genderOf(EN_US) === "female" && genderOf(GOOGLE_HI) === "female", "genderOf");

// 2. Urdu / Roman Urdu
install([EN_US, GOOGLE_HI, KALPANA, UZMA]);
plan = await planSpeech("Shoulder ko posterior glide karein.", "ur");
check(plan.engine === "builtin" && plan.mode === "hindi", "Only female Hindi/Urdu voices: built-in male voice");
check(plan.segments.length === 1 && plan.segments[0].builtin === "hi" && plan.segments[0].text === "Shoulder को posterior glide करें।", "Built-in voice: one mixed line for the Hindi voice, Urdu words in Devanagari, English terms in Latin (it switches language by word) (got " + JSON.stringify(plan.segments.map((x) => x.text)) + ")");
install([EN_US, HEMANT, ASAD]);
plan = await planSpeech("Shoulder ko posterior glide karein.", "ur");
check(plan.engine === "device" && plan.mode === "hindi" && plan.segments.length === 1 && plan.segments[0].voice?.name === HEMANT.name, "A male Hindi voice on the device reads one mixed line");
check(plan.segments[0].text === "Shoulder को posterior glide करें।", "Roman Urdu in Devanagari, English terms in Latin (got " + plan.segments[0].text + ")");
plan = await planSpeech("karein", "ur", { ur: ASAD.name });
check(plan.mode === "urdu" && plan.segments[0].text.includes("کریں"), "A saved male Urdu voice gets Urdu script");
plan = await planSpeech("karein", "ur", { ur: "pna-builtin-male" });
check(plan.engine === "builtin", "The built-in voice can be chosen for Urdu");
install([DAVID, HEMANT]);
plan = await planSpeech("Shoulder ko posterior glide karein.", "ur", { split: true });
check(plan.engine === "device" && plan.segments.length === 4 && plan.segments.map((x) => x.voice?.name).join("|") === [DAVID, HEMANT, DAVID, HEMANT].map((x) => x.name).join("|"), "Device voices, split mode: English terms on the English voice");
install([EN_US], false);
check((await planSpeech("karein", "ur")).mode === "none", "No male Urdu/Hindi voice and no built-in voice: silent");

// 2a. Written text becomes spoken text (symbols to words, a pause instead of an arrow, a finished sentence)
check(toSpoken("Flex to 90° (about 3–5 mm) → then hold; e.g. 30% more") === "Flex to 90 degrees, about 3 to 5 mm, then hold; for example, 30 percent more.", "toSpoken: degrees, aside, range, arrow, e.g., percent, final stop (got " + toSpoken("Flex to 90° (about 3–5 mm) → then hold; e.g. 30% more") + ")");
check(toSpoken("**Step 1** — place the hand\n• keep the elbow relaxed") === "Step 1, place the hand. keep the elbow relaxed.", "toSpoken: markdown, dash, list mark, line break (got " + toSpoken("**Step 1** — place the hand\n• keep the elbow relaxed") + ")");
check(toSpoken("Already a sentence.") === "Already a sentence.", "toSpoken leaves a finished sentence alone");
check(toSpoken("5-10 baar", "ur") === "5 se 10 baar.", "toSpoken: Roman Urdu range (got " + toSpoken("5-10 baar", "ur") + ")");

// 2b. Cutting text into sentences for the built-in voice
const bits = splitForSpeech("Tilt the head 3.5 degrees. Hold it, then breathe out! Ready?");
check(bits.length === 3 && bits[0] === "Tilt the head 3.5 degrees." && bits[2] === "Ready?", "Sentences are cut after . ! ? but not inside 3.5 (got " + JSON.stringify(bits) + ")");
const longBits = splitForSpeech("This is a long line, with many clauses, " + "that goes on and on, ".repeat(20) + "and finally ends.");
check(longBits.every((x) => x.length <= 230) && longBits.length > 1, "Long sentences are cut at commas");
check(splitForSpeech("... ?! ").length === 0, "Punctuation only: nothing to say");
const lead = shortFirst(["Physio Nexus Academy (PNA) is Pakistan's online physiotherapy academy: free step-by-step lessons, 3D practice patients, a clinical skills lab."]);
check(lead.length === 2 && lead[0].length <= 80 && lead[0].endsWith(":") && lead.join(" ").replace(/\s+/g, " ").length >= 130, "The first piece of a long line is short, cut at a clause end (got " + JSON.stringify(lead) + ")");
check(shortFirst(["A short sentence."]).length === 1, "A short first sentence is left alone");

// 3. Conversion spot checks
const cases: [string, string, string][] = [["hai", "है", "ہے"], ["karein", "करें", "کریں"], ["mein", "में", "میں"], ["dekhein", "देखें", "دیکھیں"], ["logon", "लोगों", "لوگوں"], ["mushkil", "मुश्किल", "مشکل"], ["yahan", "यहां", "یہاں"]];
for (const [w, d, u] of cases) {
  check(toDevanagari(w) === d, `Devanagari ${w}: got ${toDevanagari(w)} want ${d}`);
  check(toUrdu(w) === u, `Urdu ${w}: got ${toUrdu(w)} want ${u}`);
}
const lex = new Set<string>(JSON.parse(fs.readFileSync("public/teacher/ur-lexicon.json", "utf8")));
const runs = splitRuns("Pehle patient ko aaram se lita dein, aur dard ke baare mein poochhein.", lex);
check(runs.map((r) => r.kind).join(",") === "ur,en,ur", "Run split: Urdu, English term, Urdu");
check(!convertRun("karein.", "devanagari").includes("."), "Full stop becomes danda");

if (failures.length) {
  console.error("Speech checks FAILED:\n - " + failures.join("\n - "));
  process.exit(1);
}
console.log(`Speech checks passed: male-only voice choice (natural device voice with fallback, local device voice, built-in voice, none), spoken-style text, Roman Urdu for the built-in voice, sentence cutting, run splitting, ${cases.length} conversion spot checks.`);
