import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { holdLine, repLine, spokenNumber, START_LINE } from "../src/lib/formcheck/spoken.ts";

/**
 * RehabVerse made for everyone, the camera first: one huge button in the day, a full-screen camera studio above every floating button, a picture of where the phone goes, a giant
 * counter, spoken instructions and spoken counting in Roman Urdu or English, big targets and big words, Roman Urdu from the first screen for a patient who chose it, and today's
 * session as the first and biggest thing on the dashboard. (A browser run, scripts/rehabverse-local/e2e-camera-ui.cjs, measures the same things on a phone-size screen.)
 */
let checks = 0;
const ok = (c: boolean, m: string) => { checks++; assert.ok(c, m); };
const eq = (a: unknown, b: unknown, m: string) => { checks++; assert.deepEqual(a, b, m); };
const read = (p: string) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const walk = (dir: string, out: string[] = []) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };

/* ---------- what is said out loud ---------- */
eq([1, 2, 3, 5, 10, 20].map((n) => spokenNumber(n, "ru")), ["ek", "do", "teen", "paanch", "das", "bees"], "Roman Urdu number words");
eq([21, 30, 0].map((n) => spokenNumber(n, "ru")), ["21", "30", "0"], "above 20 (and zero) the digits are spoken");
eq([1, 7, 12].map((n) => spokenNumber(n, "en")), ["1", "7", "12"], "English says the digits");
eq(repLine(3, 8, "ru"), { text: "teen", done: false }, "a repetition says just the number");
eq(repLine(8, 8, "ru").done, true, "the last repetition says it is done");
ok(/Shabash/.test(repLine(8, 8, "ru").text) && /Well done/.test(repLine(8, 8, "en").text), "the happy line is in both languages");
eq(repLine(9, undefined, "en"), { text: "9", done: false }, "without a target it only counts");
eq(holdLine(3000, 30, "ru"), null, "no hold line before 5 seconds");
eq(holdLine(5200, 30, "ru"), { text: "paanch", done: false }, "5 seconds is said");
eq(holdLine(30500, 30, "en")?.done, true, "the hold target is announced");
ok(START_LINE.ru.length > 3 && START_LINE.en.length > 3, "there is a start line in both languages");

/* ---------- the look: targets, words, layers ---------- */
const studio = read("src/components/rehabverse/formcheck/camera-studio.css");
const friendly = read("src/components/rehabverse/rv-friendly.css");
const rule = (css: string, selector: string) => { const m = css.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}")); return m ? m[1] : ""; };
const px = (css: string, selector: string, prop: string) => { const m = rule(css, selector).match(new RegExp(prop + ":\\s*(\\d+(?:\\.\\d+)?)px")); return m ? Number(m[1]) : 0; };
ok(px(studio, ".fc-hero", "min-height") >= 96, "the camera button in the day is at least 96px tall");
ok(px(studio, ".fc-go", "min-height") >= 72, "the start button is at least 72px tall");
ok(px(studio, ".fc-side", "min-height") >= 80, "the left/right buttons are at least 80px tall");
ok(px(studio, ".fc-iconbtn", "width") >= 48 && px(studio, ".fc-iconbtn", "height") >= 48, "the round buttons are at least 48px");
ok(px(studio, ".fc-soft", "min-height") >= 52, "the other buttons are at least 52px tall");
ok(px(studio, ".fc-stop i", "width") >= 72, "the Finish button is at least 72px");
ok(px(studio, ".fc-count b", "font-size") >= 64, "the counter is at least 64px");
ok(px(studio, ".fc-lead", "font-size") >= 20, "the instruction text is at least 20px");
ok(px(friendly, ".rv-today", "min-height") >= 100, "today's session button is at least 100px tall");
for (const [name, css] of [["camera-studio.css", studio], ["rv-friendly.css", friendly]] as const) {
  const small = [...css.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => Number(m[1])).filter((n) => n < 14);
  ok(small.length === 0, `${name}: no text under 14px`);
}
ok(/@media \(prefers-reduced-motion: reduce\)/.test(studio) && /data-motion="calm"/.test(studio), "the studio's movement stops for reduce-motion and for the site's calm switch");
ok(/@media \(prefers-reduced-motion: reduce\)/.test(friendly), "today's button movement stops for reduce-motion");
// the studio sits above every other layer on the patient side (floating coach, WhatsApp, bottom bar)
const z = px(studio, ".fc-studio", "z-index") || Number((rule(studio, ".fc-studio").match(/z-index:\s*(\d+)/) ?? [])[1] ?? 0);
const others: number[] = [];
for (const f of walk("src").filter((f) => f.endsWith(".css") && !/admin\.css$|camera-studio\.css$/.test(f))) for (const m of read(f).matchAll(/z-index:\s*(\d+)/g)) others.push(Number(m[1]));
ok(/position:\s*fixed;\s*inset:\s*0/.test(rule(studio, ".fc-studio")) && z > Math.max(...others), `the studio (z-index ${z}) is above every other layer (highest ${Math.max(...others)})`);

/* ---------- the screens ---------- */
const slot = read("src/components/rehabverse/formcheck/FormCheckSlot.tsx");
const panel = read("src/components/rehabverse/formcheck/FormCheckPanel.tsx");
ok(/data-pna-formcheck-open/.test(slot) && /className="fc-hero"/.test(slot) && /unlockRecorded\(\)/.test(slot), "the day shows one big hero button, and pressing it lets the voice start");
ok(/Camera se check karein/.test(slot) && /Koi video ya tasveer save nahi hoti/.test(slot), "the button and the privacy line are in Roman Urdu");
ok(/createPortal\(/.test(panel) && /document\.body/.test(panel) && /role="dialog" aria-modal="true"/.test(panel), "the studio is a full-screen dialog outside the page");
ok(/document\.body\.style\.overflow = "hidden"/.test(panel) && /e\.key === "Escape"/.test(panel), "the page behind is locked and Escape closes");
ok(/<PlacementArt/.test(panel) && /fc-go/.test(panel) && /data-pna-formcheck-start/.test(panel) && /disabled=\{needSide\}/.test(panel), "set-up: a picture, one big start button, and a side must be chosen first");
ok(/fc-count/.test(panel) && /data-pna-formcheck-reps/.test(panel) && /data-pna-formcheck-stop/.test(panel), "live: a giant counter and a big Finish button");
ok(/counted \? <T en="Well done!" ru="Shabash!"/.test(panel) && /Nothing was counted/.test(panel) && /Kuch ginti nahi hua/.test(panel), "finish: 'Well done' only when something was counted; otherwise it says so and helps the patient try again");
ok(/data-pna-formcheck-more/.test(panel) && /data-pna-formcheck-ghost-toggle/.test(panel), "the small options live in one 'More' sheet");
ok(/useVoice\(\)/.test(panel) && /useSay\(voice, lang\)/.test(panel) && /introSpoken\.current = true;\s*say\(intro, "now"\)/.test(panel), "the set-up instruction is read aloud when the studio opens (voice on by default)");
ok(/repLine\(/.test(panel) && /holdLine\(/.test(panel) && /START_LINE\[lang\]/.test(panel) && (panel.match(/say\(line\.text, "skip"\)/g) ?? []).length === 2, "every repetition, every 5 seconds of a hold and the start are said (a count never cuts in over a sentence)");
ok(/say\(cue\.text\[lang\], "queue"\)/.test(panel), "tips are spoken too");
ok(/aria-pressed=\{voice\}/.test(panel) && /Awaaz/.test(panel), "the voice switch is big, labelled and in Roman Urdu");
ok(!/\bru=""/.test(panel + slot), "no Roman Urdu text is left empty");
const say = read("src/components/rehabverse/formcheck/useSay.ts");
ok(/mode === "skip"\) return/.test(say) && /mode === "now"\) current\.current\?\.cancel\(\)/.test(say) && /if \(!on \|\| !text\) return/.test(say), "speech: a count is skipped while talking, a 'now' line replaces, nothing when the voice is off");

/* ---------- Roman Urdu from the first screen, and today first ---------- */
const hook = read("src/components/rehabverse/useDefaultLanguage.ts");
ok(/preferred !== "ru" \|\| hasLangChoice\(\)/.test(hook) && /writeLang\("ur"\)/.test(hook), "a patient who chose Roman Urdu starts in Roman Urdu, unless this browser already has a choice");
ok(/useDefaultLanguage\(/.test(read("src/components/rehabverse/PatientDashboard.tsx")) && /useDefaultLanguage\(preferredLanguage\)/.test(read("src/components/rehabverse/DaySession.tsx")), "the dashboard and the day apply it");
ok(/preferredLanguage=\{patient\.preferred_language\}/.test(read("src/app/rehabverse/me/day/[id]/page.tsx")), "the day page passes the patient's language");
const dash = read("src/components/rehabverse/PatientDashboard.tsx");
ok(dash.indexOf('className="rv-today"') > 0 && dash.indexOf('className="rv-today"') < dash.indexOf("<AiAssistCard") && dash.indexOf('className="rv-today"') < dash.indexOf("<ScreeningPanel"), "today's session is the first card on the dashboard, above the AI notice and everything else");
eq((dash.match(/Start today's session/g) ?? []).length, 1, "there is one 'Start today's session' button, not two");


/* ---------- the camera permission ---------- */
const permission = read("src/lib/formcheck/browser/permission.ts");
const cam = read("src/lib/formcheck/browser/camera.ts");
const guide = read("src/components/rehabverse/formcheck/CameraPermissionGuide.tsx");
ok(/navigator\.permissions\.query\(\{ name: "camera"/.test(permission) && /addEventListener\("change"/.test(permission) && /allowsFeature\("camera"\)/.test(permission), "permission: reads the camera state, listens for a change and can tell a site-policy block from the person's block");
ok(!/localStorage|sessionStorage|indexedDB|fetch\(/.test(permission), "permission: stores and sends nothing");
ok(/policyAllowsCamera\(\) === false \? "policy" : "denied"/.test(cam), "camera: a block by the site's own policy is told apart from the person's block");
ok(/"android"/.test(guide) && /"ios"/.test(guide) && /Permissions/.test(guide) && /data-pna-formcheck-guide-check><RefreshCw aria-hidden="true" \/> <T en="Check again" ru="Dobara check karein"/.test(guide) && /Phone ki Settings/.test(guide), "guide: steps for Android and iPhone, a check-again button and the phone-settings fallback, in Roman Urdu");
ok(/onListen/.test(guide) && /guideSpeech\(/.test(guide), "guide: the steps can be listened to");
ok(/const blocked = perm === "denied" \|\| \(fc\.problem === "denied" && perm === "unknown"\)/.test(panel) && /\{!blocked \? \(/.test(panel), "panel: when blocked the guide replaces the Start button");
ok(/data-pna-formcheck-prompt-note/.test(panel) && /Start dabane par/.test(panel), "panel: before the browser asks, the screen says what will happen and what to press");
ok(/watchCameraPermission\(setPerm\)/.test(panel), "panel: the guide goes away by itself when the person allows the camera");
ok(/getUserMedia/.test(cam) && cam.indexOf("getUserMedia") < cam.indexOf("await video.play()"), "camera: the browser is asked straight away, from the tap on Start");
const fcHook = read("src/components/rehabverse/formcheck/useFormCheck.ts");
ok(fcHook.indexOf("await openCamera(") < fcHook.indexOf("PoseRuntime.create("), "the camera is asked for BEFORE the pose model loads, so the question appears at once");

console.log(`Camera and design: ${checks} checks passed (spoken counting, big targets, studio above every layer, Roman Urdu first, today first).`);
