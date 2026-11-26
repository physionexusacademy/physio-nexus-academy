/**
 * Checks the Full Posture Scan maths against hand-worked examples (the expected numbers were worked out on paper, not produced by the code under test).
 *   npm run validate:posture-scan
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { bendNotes, compareScans, readBack, readBend, regionSeverity, skeletonPose, summarise, summariseScan, toSaved, isSaved, type Captures, type ScanCapture } from "../src/lib/posture/scan.ts";
import { MIN_FRAMES } from "../src/lib/posture/measures.ts";
import { SCAN_TERMS, VIEW_TEXT, BEND_TEXT, REGION_TEXT, FACTORS, REPORT_SAFE } from "../src/lib/posture/scan-text.ts";
import { LM, type Frame, type LandmarkName } from "../src/lib/formcheck/types.ts";

const W = 720, H = 1280;
function skeleton(points: Partial<Record<LandmarkName, [number, number]>>, visible: Partial<Record<LandmarkName, number>> = {}): Frame {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0.9 }));
  for (const [name, [x, y]] of Object.entries(points) as [LandmarkName, [number, number]][]) lm[LM[name]] = { x: x / W, y: y / H, v: visible[name] ?? 0.95 };
  return { t: 0, w: W, h: H, lm };
}
const near = (actual: number | undefined, expected: number, tolerance: number, label: string) =>
  assert.ok(actual !== undefined && Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected} (+/- ${tolerance}), got ${actual}`);

// ---- BACK view. Facing away, the person's LEFT is on the LEFT of the picture. The model's own labels are not trusted: the same picture with the labels swapped gives the same answer.
{
  const tilted = (swap: boolean) => {
    const a: [number, number] = [260, 290], b: [number, number] = [460, 310]; // the picture-left shoulder is the higher one (smaller y)
    const [ls, rs] = swap ? [b, a] : [a, b];
    return skeleton({ leftShoulder: ls, rightShoulder: rs, leftHip: swap ? [430, 600] : [290, 600], rightHip: swap ? [290, 600] : [430, 600], leftEar: swap ? [400, 170] : [320, 170], rightEar: swap ? [320, 170] : [400, 170] });
  };
  for (const swap of [false, true]) {
    const r = readBack(tilted(swap));
    // atan2(20, 200) = 5.71 degrees, positive because the person's left (picture-left) shoulder is higher
    near(r.shoulderTilt, 5.71, 0.01, `shoulder tilt, labels swapped = ${swap}`);
    near(r.hipTilt, 0, 0.01, "level hips");
    near(r.headTilt, 0, 0.01, "level ears");
    near(r.trunkShift, 0, 0.01, "shoulders over hips");
  }
  // hips 20 px to the picture-right of the shoulder midline, shoulder width 200 px: the shoulders sit to the person's LEFT of the hips: +10
  const shifted = readBack(skeleton({ leftShoulder: [260, 300], rightShoulder: [460, 300], leftHip: [310, 600], rightHip: [450, 600] }));
  near(shifted.trunkShift, 10, 0.01, "trunk shift to the person's left");
  const other = readBack(skeleton({ leftShoulder: [260, 300], rightShoulder: [460, 300], leftHip: [270, 600], rightHip: [410, 600] }));
  near(other.trunkShift, -10, 0.01, "trunk shift to the person's right");
  // a landmark that is not seen well enough is left out, not guessed
  const hidden = readBack(skeleton({ leftShoulder: [260, 290], rightShoulder: [460, 310] }, { rightShoulder: 0.3 }));
  assert.equal(hidden.shoulderTilt, undefined, "an unseen shoulder gives no tilt");
}

// ---- FORWARD BEND, seen from the side, facing the right, left side near the camera
const bend = (shoulder: [number, number], finger: [number, number] = [600, 1000]) =>
  skeleton({ leftShoulder: shoulder, leftHip: [360, 600], leftKnee: [360, 860], leftAnkle: [360, 1100], leftIndex: finger }, { rightShoulder: 0.2, rightHip: 0.2, rightKnee: 0.2, rightAnkle: 0.2, rightIndex: 0.2 });
{
  const level = readBend(bend([560, 600]));
  near(level.bendTrunk, 90, 0.01, "trunk level with the floor is 90 degrees");
  near(level.bendKnee, 180, 0.01, "straight knees");
  // shoulder 260 px from the hip at 60 degrees from upright: dx 225, dy -130, atan2(225, 130) = 59.99 degrees; the angle at the hip between trunk and thigh is 120 degrees
  const sixty = readBend(bend([585, 470]));
  near(sixty.bendTrunk, 60, 0.1, "trunk 60 degrees from upright");
  near(sixty.bendHip, 120, 0.1, "angle at the hip");
  // leg 500 px (hip y 600, ankle y 1100); fingertip at y 1000 is 100 px above the ankle: 20 percent; at the ankle: 0; 50 px below the ankle: -10
  near(readBend(bend([585, 470], [600, 1000])).reach, 20, 0.01, "fingertips 20 percent of the leg above the ankle");
  near(readBend(bend([585, 470], [600, 1100])).reach, 0, 0.01, "fingertips at the ankle");
  near(readBend(bend([585, 470], [600, 1150])).reach, -10, 0.01, "fingertips below the ankle");
  // standing upright: hip over shoulder gives 0
  near(readBend(bend([360, 300])).bendTrunk, 0, 0.01, "upright trunk");
}

// ---- A capture: the median of the frames, with its spread, and the same rules as the other views
{
  const frames = Array.from({ length: MIN_FRAMES + 10 }, () => bend([585, 470], [600, 1100]));
  const cap = summariseScan(frames, "bend");
  assert.ok(cap.ok);
  if (cap.ok) {
    const trunk = cap.results.find((r) => r.id === "bendTrunk")!;
    near(trunk.value, 60, 0.1, "median trunk bend");
    assert.equal(trunk.wobble, 0);
    assert.equal(trunk.plusMinus, 3, "the stated uncertainty is never below the floor");
    assert.ok(trunk.steady);
    assert.deepEqual(bendNotes(cap), ["straight", "reaches_ankle"]);
    assert.equal(cap.side, "left");
  }
  const few = summariseScan(frames.slice(0, MIN_FRAMES - 1), "bend");
  assert.deepEqual(few, { ok: false, reason: "too_few_frames", frames: MIN_FRAMES - 1 });
  const empty = Array.from({ length: MIN_FRAMES }, () => ({ t: 0, w: W, h: H, lm: [] }));
  assert.deepEqual(summariseScan(empty, "back"), { ok: false, reason: "no_person", frames: MIN_FRAMES });
  // bent knees are noticed
  const bentKnees = Array.from({ length: MIN_FRAMES }, () => skeleton({ leftShoulder: [585, 470], leftHip: [360, 600], leftKnee: [440, 860], leftAnkle: [360, 1100], leftIndex: [600, 900] }, { rightShoulder: 0.2, rightHip: 0.2, rightKnee: 0.2, rightAnkle: 0.2 }));
  const bk = summariseScan(bentKnees, "bend");
  assert.ok(bk.ok && bendNotes(bk).includes("bent_knees"), "bent knees are named");
}

// ---- Putting the captures together
const make = (view: "front" | "back" | "side", results: { id: string; value: number; plusMinus: number }[]): ScanCapture =>
  ({ ok: true, view, results: results.map((r) => ({ ...r, wobble: 0, frames: 30, steady: true })) as never, unreadable: [], frames: 30 });
{
  const agree: Captures = { front: make("front", [{ id: "shoulderTilt", value: 2, plusMinus: 1 }]), back: make("back", [{ id: "shoulderTilt", value: 4, plusMinus: 1 }]) };
  const s = summarise(agree);
  near(s.shoulderTilt?.value, 3, 0.001, "front and back averaged");
  assert.equal(s.shoulderTilt?.disagree, false);
  assert.deepEqual(s.shoulderTilt?.sources, ["front", "back"]);
  const clash = summarise({ front: make("front", [{ id: "shoulderTilt", value: 2, plusMinus: 1 }]), back: make("back", [{ id: "shoulderTilt", value: -4, plusMinus: 1 }]) });
  assert.equal(clash.shoulderTilt?.disagree, true, "opposite directions are flagged, not averaged away silently");
  // a difference inside the uncertainty is not a disagreement
  const noise = summarise({ front: make("front", [{ id: "shoulderTilt", value: 0.5, plusMinus: 1 }]), back: make("back", [{ id: "shoulderTilt", value: -0.5, plusMinus: 1 }]) });
  assert.equal(noise.shoulderTilt?.disagree, false);
  assert.deepEqual(summarise({}).viewsDone, []);
  assert.equal(summarise({ side: make("side", []) }).headForward, undefined);

  // severity per region: from the provisional bands (head forward 25 percent is "marked", 15 is "mild", 5 is "typical"); no data means null, never a guess
  const sev = regionSeverity(summarise({ side: make("side", [{ id: "headForward", value: 25, plusMinus: 2 }, { id: "earShoulderAngle", value: 80, plusMinus: 2 }]) }));
  assert.equal(sev.neck, 2);
  assert.equal(sev.trunk, null);
  assert.equal(sev.shoulders, null);
  assert.equal(regionSeverity(summarise({ side: make("side", [{ id: "headForward", value: 15, plusMinus: 2 }]) })).neck, 1);
  assert.equal(regionSeverity(summarise({ side: make("side", [{ id: "headForward", value: 5, plusMinus: 2 }]) })).neck, 0);
  // the side knee angle speaks for both knees
  const knees = regionSeverity(summarise({ side: make("side", [{ id: "kneeAngle", value: 150, plusMinus: 2.5 }]) }));
  assert.equal(knees.leftKnee, 2); assert.equal(knees.rightKnee, 2);

  // the skeleton is drawn level where the number is inside its own uncertainty, and is limited so it can never be drawn absurdly
  const pose = skeletonPose(summarise({ front: make("front", [{ id: "shoulderTilt", value: 0.8, plusMinus: 1 }, { id: "hipTilt", value: 4, plusMinus: 1 }]), side: make("side", [{ id: "headForward", value: 90, plusMinus: 2 }]) }));
  assert.equal(pose.shoulderTilt, 0, "a tilt smaller than its uncertainty is drawn level");
  assert.equal(pose.hipTilt, 4);
  assert.equal(pose.headForward, 40, "capped");
  assert.equal(pose.known.shoulderTilt, true);
  assert.equal(pose.known.trunkLean, undefined, "what was not measured is marked unknown");
  assert.equal(skeletonPose(summarise({})).headForward, 0);
}

// ---- Comparing two scans: a change smaller than the two uncertainties together is not called a change
{
  const c = (value: number, plusMinus: number) => ({ value, plusMinus, sources: ["front" as const], disagree: false });
  assert.equal(compareScans(c(4, 1), c(1, 1)), "better");
  assert.equal(compareScans(c(2, 1), c(1.5, 1)), "same");
  assert.equal(compareScans(c(-1, 1), c(-5, 1)), "worse", "the size matters, not the sign");
  assert.equal(compareScans(undefined, c(1, 1)), null);
}

// ---- Saving keeps numbers only
{
  const saved = toSaved(summarise({ side: make("side", [{ id: "headForward", value: 12, plusMinus: 2 }]) }), "2026-11-26T00:00:00.000Z");
  assert.ok(isSaved(JSON.parse(JSON.stringify(saved))));
  assert.ok(!isSaved({ v: 2 }));
  const text = JSON.stringify(saved);
  assert.ok(!/data:image|base64|blob:/i.test(text), "no picture is ever part of a saved scan");
}


// ---- The pages: honest limits, nothing sent, camera stopped, the heavy code kept out of the Worker
{
  const read = (p: string) => fs.readFileSync(p, "utf8");
  const screen = read("src/app/health-calculators/posture/scan/ScanScreen.tsx");
  const report = read("src/app/health-calculators/posture/scan/ScanReport.tsx");
  const viewer = read("src/components/posture/SkeletonViewer.tsx");
  const build = read("src/components/posture/skeleton-build.ts");
  const serverPage = read("src/app/health-calculators/posture/scan/page.tsx");
  const loader = read("src/app/health-calculators/posture/scan/ScanLoader.tsx");
  const config = read("next.config.js");
  const hub = read("src/app/health-calculators/page.tsx");
  const sitemap = read("src/app/sitemap.ts");

  const terms = SCAN_TERMS.items.map((i) => i.en).join(" ");
  for (const needle of ["not a diagnosis", "illustration", "NOT an X-ray", "cannot see your spine", "does not check for scoliosis", "can be wrong", "uploaded", "under 16", "Skip the forward bend"]) assert.ok(terms.includes(needle), `the terms must say: ${needle}`);
  for (const item of SCAN_TERMS.items) assert.ok(item.ur.trim().length > 10 && item.ur !== item.en, "every term needs Roman Urdu");
  for (const v of ["front", "side", "back", "bend"] as const) { assert.ok(VIEW_TEXT[v].guide.length >= 3); for (const g of VIEW_TEXT[v].guide) assert.ok(g.ur !== g.en && g.ur.length > 10, `${v} guide needs Roman Urdu`); }
  for (const b of Object.values(BEND_TEXT)) assert.ok(b.label.ur !== b.label.en || /degree/.test(b.unit.ur));
  for (const r of Object.values(REGION_TEXT)) assert.ok(r.label.ur.length > 2 && r.says.ur.length > 5);
  for (const f of Object.values(FACTORS)) assert.ok(f.label.ur !== f.label.en && f.note.ur !== f.note.en);
  assert.match(REPORT_SAFE.en, /See a physiotherapist or doctor/);
  assert.match(REPORT_SAFE.en, /illustration/);
  // no claim the tool cannot back up
  for (const text of [terms, screen, report, JSON.stringify(VIEW_TEXT), JSON.stringify(BEND_TEXT)]) assert.doesNotMatch(text, /\b(diagnos(e|es|ed|ing) your|detects? scoliosis|measures? (your )?(cobb|spinal curve)|X-ray of your|accurate to)\b/i, "no diagnostic or accuracy claim");

  // the camera is stopped after every capture and when the page is left; the picture never leaves the page
  assert.match(screen, /const stop = useCallback\(\(\) => \{[^}]*closeCamera\(video\.current, stream\.current\)/, "stop() must turn the camera off");
  assert.match(screen, /useEffect\(\(\) => stop, \[stop\]\)/, "the camera must be stopped when the page is left");
  assert.match(screen, /stop\(\);\s*setStage\("viewdone"\)/, "the camera must be stopped as soon as the capture ends");
  for (const [name, code] of [["ScanScreen", screen], ["ScanReport", report], ["SkeletonViewer", viewer], ["skeleton-build", build]] as const) {
    assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|MediaRecorder|captureStream|indexedDB/, `${name}: nothing is sent or recorded`);
  }
  assert.doesNotMatch(report, /\.src\b[^;]*localStorage|localStorage[^;]*photos|photos[^;]*localStorage/, "pictures must never be written to storage");
  assert.match(report, /toSaved\(summary\)/, "only the numbers are saved");
  assert.doesNotMatch(screen, /localStorage|sessionStorage/, "the capture screen stores nothing");
  assert.match(screen, /reloadIfPolicyBlocksCamera/, "the scan must load itself as its own document when an in-app link left it with the previous page's camera policy");
  assert.match(screen, /opened\.problem === "policy" && reloadIfPolicyBlocksCamera\(\)/);

  // the heavy code (camera, pose library, three.js) stays out of the Worker
  assert.doesNotMatch(serverPage, /ScanScreen|ScanReport|SkeletonViewer|skeleton-build|from "three"/, "the server page must not import the scan, the report or the 3D code");
  assert.match(loader, /dynamic\(\(\) => import\("\.\/ScanScreen"\), \{\s*ssr: false/, "the scan must load in the browser only");
  assert.match(report, /dynamic\(\(\) => import\("@\/components\/posture\/SkeletonViewer"\), \{ ssr: false/, "the 3D viewer must load in the browser only");

  // the route is allowed its own camera and is listed
  assert.ok(/source: '\/health-calculators\/posture\/:path\*',\s*headers: \[\{ key: 'Permissions-Policy', value: 'camera=\(self\), microphone=\(\)' \}\]/.test(config), "the scan route must be allowed its own camera");
  assert.ok(/health-calculators\/posture\(\?:\/\|\$\)/.test(config), "the blanket camera ban must exclude the posture family");
  assert.ok(hub.includes("/health-calculators/posture/scan") && /fullLoad: true/.test(hub), "the hub must link to the scan with a plain (full page load) link");
  assert.ok(sitemap.includes("/health-calculators/posture/scan"), "the scan must be in the sitemap");

  // the viewer pauses when hidden or off screen, frees its memory, and respects calm motion
  assert.match(viewer, /IntersectionObserver/); assert.match(viewer, /document\.hidden/); assert.match(viewer, /renderer\.dispose\(\)/); assert.match(viewer, /motionReduced\(\)/);
  assert.match(build, /disposeSkeleton/);
}

console.log("Posture scan checks passed: back view (labels not trusted), forward bend, capture rules, combining four views, severity per region, skeleton pose limits, scan comparison, numbers-only saving, and the pages (honest limits, nothing sent, camera stopped, heavy code kept out of the Worker, camera policy).");
