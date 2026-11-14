// Entry bundled by scripts/validate-speech.mjs: checks voice choice and Roman Urdu preparation with a mocked speech synthesiser.
import { genderOf, planSpeech, voicesFor } from "../src/lib/speech/voices";
import { convertRun, splitRuns, toDevanagari, toUrdu } from "../src/lib/speech/roman-urdu";
import fs from "node:fs";

type V = { name: string; lang: string; localService: boolean; default: boolean; voiceURI: string };
const v = (name: string, lang: string, local = true, def = false): V => ({ name, lang, localService: local, default: def, voiceURI: name });
const g = globalThis as unknown as Record<string, unknown>;
function install(voices: V[]) {
  g.window = { speechSynthesis: { getVoices: () => voices, addEventListener() {}, removeEventListener() {}, cancel() {}, speak() {}, pause() {}, resume() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  g.SpeechSynthesisUtterance = function () {} as unknown;
}
g.fetch = async () => ({ ok: true, json: async () => JSON.parse(fs.readFileSync("public/teacher/ur-lexicon.json", "utf8")) });

const failures: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) failures.push(what); };

const EN_US = v("Google US English", "en-US"), EN_GB = v("Google UK English Female", "en-GB"), EN_IN_M = v("Microsoft Ravi Online (Natural) - English (India)", "en-IN", false);
const HI = v("Google हिन्दी", "hi-IN"), HI_M = v("Microsoft Prabhat Online (Natural) - Hindi (India)", "hi-IN", false), UR = v("Microsoft Asad Online (Natural) - Urdu (Pakistan)", "ur-PK", false);

// 1. English: Indian/Pakistani English first, natural/online first, male for the avatar
install([EN_US, EN_GB, EN_IN_M]);
check(voicesFor("en", "male")[0]?.name === EN_IN_M.name, "English picks the natural en-IN voice");
install([EN_US, EN_GB]);
check(voicesFor("en")[0]?.name === EN_GB.name, "English falls back to en-GB before en-US");
check((await planSpeech("Hello", "en")).mode === "english", "English plan");

// 2. Urdu planning
install([EN_US, HI]);
let plan = await planSpeech("Shoulder ko posterior glide karein.", "ur");
check(plan.mode === "hindi", "Hindi voice is used for Roman Urdu when there is no Urdu voice");
check(plan.segments.length === 1 && plan.segments[0].text === "Shoulder को posterior glide करें." .replace(".", "।") && plan.segments[0].voice?.name === HI.name, "Default: one code-mixed utterance in the Hindi voice (got " + JSON.stringify(plan.segments.map((x) => x.text)) + ")");
plan = await planSpeech("Shoulder ko posterior glide karein.", "ur", { split: true });
check(plan.segments.length === 4 && plan.segments.map((x) => x.voice?.name).join("|") === [EN_US, HI, EN_US, HI].map((x) => x.name).join("|"), "English terms stay on the English voice, Urdu words on the Hindi voice");
check(plan.segments[1].text.includes("को"), "ko → को");
install([EN_US, UR]);
plan = await planSpeech("Shoulder ko posterior glide karein.", "ur");
check(plan.mode === "urdu" && plan.segments[0].text.includes("کو") && plan.segments[0].text.includes("Shoulder"), "Urdu voice gets Urdu script, English terms stay Latin");
install([EN_US, HI_M, UR]);
check((await planSpeech("karein", "ur")).mode === "hindi", "Hindi first when both exist");
check((await planSpeech("karein", "ur", { ur: UR.name })).mode === "urdu", "A saved Urdu voice wins");
install([EN_US]);
plan = await planSpeech("karein", "ur");
check(plan.mode === "none" && Boolean(plan.note), "No Urdu/Hindi voice → silent with a note");
install([]);
check((await planSpeech("Hello", "en")).mode === "none", "No voices at all → silent");

// 2b. The therapist is a man: a known male voice beats any other (even a natural female one); otherwise the pitch is lowered
const ARIA = v("Microsoft Aria Online (Natural) - English (United States)", "en-US", false), GOOGLE_MALE = v("Google UK English Male", "en-GB"), IN_PLAIN = v("English India", "en-IN");
const GOOGLE_HI = v("Google \u0939\u093f\u0928\u094d\u0926\u0940", "hi-IN");
install([ARIA, GOOGLE_MALE, EN_US]);
plan = await planSpeech("Hello", "en");
check(plan.segments[0].voice?.name === GOOGLE_MALE.name && plan.segments[0].pitch === 1, "A known male voice beats a natural female one");
install([ARIA]);
plan = await planSpeech("Hello", "en");
check(plan.segments[0].voice?.name === ARIA.name && plan.segments[0].pitch === 0.7, "Only a female voice: pitch lowered to 0.7 (got " + plan.segments[0].pitch + ")");
install([IN_PLAIN]);
plan = await planSpeech("Hello", "en");
check(plan.segments[0].pitch === 0.8, "Unlabelled voice: pitch 0.8");
install([ARIA]);
plan = await planSpeech("Hello", "en", { en: ARIA.name });
check(plan.segments[0].pitch === 1, "A voice the visitor chose is never altered");
install([EN_US, GOOGLE_HI, HI_M]);
plan = await planSpeech("karein", "ur");
check(plan.segments[0].voice?.name === HI_M.name && plan.segments[0].pitch === 1, "Male Hindi voice (Prabhat) beats Google Hindi (female)");
install([EN_US, GOOGLE_HI]);
plan = await planSpeech("karein", "ur");
check(plan.segments[0].voice?.name === GOOGLE_HI.name && plan.segments[0].pitch === 0.7, "Google Hindi is recognised as female and lowered");
install([EN_US, EN_IN_M]);
check(genderOf(EN_IN_M) === "male" && genderOf(ARIA) === "female" && genderOf(IN_PLAIN) === null, "genderOf");

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
console.log(`Speech checks passed: voice choice (English, Hindi, Urdu, none), run splitting, ${cases.length} conversion spot checks.`);
