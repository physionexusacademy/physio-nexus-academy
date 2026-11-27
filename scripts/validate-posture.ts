/**
 * Checks the posture screen: every measurement against hand-worked examples built from synthetic skeletons (the expected numbers were worked out
 * on paper, not produced by the code under test), the agreement statistics against a published example, and the page's wording and privacy.
 *   npm run validate:posture
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { band, MIN_FRAMES, readFrame, summarise, METRICS } from "../src/lib/posture/measures.ts";
import { agreement, icc, repeatability } from "../src/lib/posture/validation.ts";
import { analyse, parseCsv, readStudy } from "../src/lib/posture/validation-csv.ts";
import { TERMS } from "../src/lib/posture/text.ts";
import { LM, type Frame, type LandmarkName } from "../src/lib/formcheck/types.ts";

const W = 720, H = 1280;
function skeleton(points: Partial<Record<LandmarkName, [number, number]>>, visible: Partial<Record<LandmarkName, number>> = {}, t = 0): Frame {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0.9 }));
  for (const [name, [x, y]] of Object.entries(points) as [LandmarkName, [number, number]][]) lm[LM[name]] = { x: x / W, y: y / H, v: visible[name] ?? 0.95 };
  return { t, w: W, h: H, lm };
}
const near = (actual: number | undefined, expected: number, tolerance: number, label: string) =>
  assert.ok(actual !== undefined && Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected} (+/- ${tolerance}), got ${actual}`);

// ---- side view, person facing the RIGHT of the picture, left side nearest the camera
const side = (earForward: number, shoulderForward = 0, kneeForward = 0): Frame =>
  skeleton({
    nose: [360 + earForward + 40, 190], leftEar: [360 + earForward, 180], leftShoulder: [360 + shoulderForward, 300], leftHip: [360, 560], leftKnee: [360 + kneeForward, 820], leftAnkle: [360, 1100],
  }, { rightEar: 0.2, rightShoulder: 0.2, rightHip: 0.2, rightKnee: 0.2, rightAnkle: 0.2 });
{
  const upright = readFrame(side(0), "side");
  near(upright.headForward, 0, 0.01, "ear over shoulder");
  near(upright.earShoulderAngle, 90, 0.01, "ear straight above the shoulder is 90 degrees");
  near(upright.trunkLean, 0, 0.01, "no trunk lean");
  near(upright.kneeAngle, 180, 0.01, "straight knee");
  assert.equal(upright._side, "left");

  // ear 52 px in front of the shoulder, trunk 260 px long: 20 percent; atan2(120, 52) = 66.57 degrees
  const head = readFrame(side(52), "side");
  near(head.headForward, 20, 0.01, "head forward as a share of the trunk");
  near(head.earShoulderAngle, 66.57, 0.01, "ear-shoulder angle with the head forward");
  // shoulder 26 px in front of the hip over 260 px: atan(0.1) = 5.71 degrees; 36 px in front of the ankle over (1100-180)=920: 3.91 percent
  const lean = readFrame(side(0, 26), "side");
  near(lean.trunkLean, 5.71, 0.01, "trunk lean");
  near(lean.standingOffset, 100 * 26 / 920, 0.01, "shoulder over ankle");
  // knee 20 px forward of the hip-ankle line: the interior angle is 171.52 degrees
  near(readFrame(side(0, 0, 20), "side").kneeAngle, 171.52, 0.01, "bent knee");
  // a person behind the line: the ear 52 px BEHIND the shoulder reads as a negative offset and an angle above 90
  const back = readFrame(side(-52), "side");
  assert.ok(back.headForward! < 0 && back.earShoulderAngle! > 90, "a head held back reads negative");
}

// ---- the same person facing the LEFT of the picture (mirrored) reads the same: forward is forward
{
  const mirror = (f: Frame): Frame => ({ ...f, lm: f.lm.map((p) => ({ ...p, x: 1 - p.x })) });
  const a = readFrame(side(52, 26, 20), "side"), b = readFrame(mirror(side(52, 26, 20)), "side");
  for (const key of ["headForward", "earShoulderAngle", "trunkLean", "standingOffset", "kneeAngle"] as const) near(b[key], a[key]!, 0.001, `mirrored ${key}`);
}

// ---- the nearer side is chosen by visibility
{
  const right = skeleton({ nose: [400, 190], rightEar: [360, 180], rightShoulder: [360, 300], rightHip: [360, 560], rightKnee: [360, 820], rightAnkle: [360, 1100] }, { leftEar: 0.1, leftShoulder: 0.1, leftHip: 0.1, leftKnee: 0.1, leftAnkle: 0.1 });
  assert.equal(readFrame(right, "side")._side, "right");
}

// ---- front view: the person's own left and right, whichever side of the picture they appear on
const front = (left: Record<string, [number, number]>, right: Record<string, [number, number]>) => skeleton({
  leftShoulder: left.shoulder, rightShoulder: right.shoulder, leftHip: left.hip, rightHip: right.hip, leftEar: left.ear, rightEar: right.ear, leftKnee: left.knee, rightKnee: right.knee, leftAnkle: left.ankle, rightAnkle: right.ankle,
});
{
  // facing the camera: the person's left is on the right of the picture. Left shoulder 10 px higher over 200 px: atan(10/200) = 2.862 degrees, positive = left higher
  const f = front(
    { shoulder: [460, 300], hip: [440, 560], ear: [420, 150], knee: [410, 820], ankle: [430, 1100] },
    { shoulder: [260, 310], hip: [260, 560], ear: [300, 150], knee: [250, 820], ankle: [290, 1100] },
  );
  const r = readFrame(f, "front");
  near(r.shoulderTilt, 2.862, 0.001, "left shoulder 10 px higher over 200 px");
  near(r.hipTilt, 0, 0.001, "level hips");
  near(r.headTilt, 0, 0.001, "level head");
  // shoulders' middle at 360, hips' middle at 350: the shoulders sit 10 px to the person's left, over a shoulder width of 200 px = 5 percent
  near(r.trunkShift, 5, 0.001, "shoulders shifted towards the person's left");
  // left knee: hip (440,560), ankle (430,1100), knee (410,820). The line is at x = 435.185 at the knee; the knee is 25.185 px towards the midline (350) over a leg of 540.09 px = 4.663 percent
  near(r.leftKnee, 4.663, 0.001, "knee falling in (knock-knee pattern), positive");
  // right knee: hip (260,560), ankle (290,1100), knee (250,820): the line is at x = 274.44 at the knee; the knee is 24.44 px AWAY from the midline (350): bowed out, negative
  near(r.rightKnee, -(24.444 / Math.hypot(30, 540)) * 100, 0.01, "right knee bowed out");
  assert.ok(r.rightKnee! < 0, "a knee outside the line reads negative");

  // a back view puts the person's left on the left of the picture: the same body reads the same
  const back = front(
    { shoulder: [260, 300], hip: [280, 560], ear: [300, 150], knee: [310, 820], ankle: [290, 1100] },
    { shoulder: [460, 310], hip: [460, 560], ear: [420, 150], knee: [430, 820], ankle: [430, 1100] },
  );
  const b = readFrame(back, "front");
  near(b.shoulderTilt, 2.862, 0.001, "back view: left shoulder higher is still positive");
  // shoulders' middle at 360, hips' middle at 370: in a back view the person's left is the left of the picture, so the shoulders (more to the left of the picture) are towards the person's LEFT: positive, 5 percent
  near(b.trunkShift, 5, 0.001, "back view: the same physical shift to the person's left is still positive");
  // hips' middle at 350 instead: the shoulders (360) are now to the right of the picture, which is the person's RIGHT: negative
  const back2 = front(
    { shoulder: [260, 300], hip: [240, 560], ear: [300, 150], knee: [310, 820], ankle: [290, 1100] },
    { shoulder: [460, 310], hip: [460, 560], ear: [420, 150], knee: [430, 820], ankle: [430, 1100] },
  );
  near(readFrame(back2, "front").trunkShift, -5, 0.001, "back view: a shift to the person's right is negative");
}

// ---- a metric whose landmarks are not seen well is left out, never guessed
{
  const f = side(52);
  f.lm[LM.leftEar].v = 0.3;
  const r = readFrame(f, "side");
  assert.equal(r.headForward, undefined, "an unseen ear gives no head-forward number");
  assert.equal(r.earShoulderAngle, undefined);
  assert.ok(r.kneeAngle !== undefined, "the knee is still read");
}

// ---- a capture: the median of the frames, the spread, the floor, and refusing to answer from too few frames
{
  const frames: Frame[] = [];
  for (let i = 0; i < 40; i++) frames.push(side(52 + (i % 2 ? 0.5 : -0.5), 0, 0));
  const out = summarise(frames, "side");
  assert.ok(out.ok);
  if (out.ok) {
    const hf = out.results.find((x) => x.id === "headForward")!;
    near(hf.value, 20, 0.3, "median head forward over the capture");
    assert.ok(hf.plusMinus >= 2, "the stated uncertainty is never below the metric floor");
    assert.ok(hf.steady, "a steady capture is called steady");
    assert.equal(out.side, "left");
  }
  assert.deepEqual(summarise(frames.slice(0, MIN_FRAMES - 1), "side"), { ok: false, reason: "too_few_frames", frames: MIN_FRAMES - 1 });
  const empty = Array.from({ length: 30 }, (_, i) => skeleton({}, {}, i)).map((f) => ({ ...f, lm: f.lm.map((p) => ({ ...p, v: 0 })) }));
  const none = summarise(empty, "side");
  assert.ok(!none.ok && none.reason === "no_person");
  // an unsteady capture is flagged
  const shaky: Frame[] = [];
  for (let i = 0; i < 40; i++) shaky.push(side(52 + (i % 2 ? 40 : -40)));
  const s = summarise(shaky, "side");
  assert.ok(s.ok && !s.results.find((x) => x.id === "headForward")!.steady, "a wobbling capture is called unsteady");
  // a metric seen in too few frames is reported as unreadable
  const patchy = frames.map((f, i) => { const g = { ...f, lm: f.lm.map((p) => ({ ...p })) }; if (i % 3) g.lm[LM.leftEar].v = 0.2; return g; });
  const p = summarise(patchy, "side");
  assert.ok(p.ok && p.unreadable.includes("headForward"), "a metric seen in fewer than the minimum number of frames is unreadable");
}

// ---- the bands: a value inside its own uncertainty is not called a finding
assert.equal(band("shoulderTilt", 0.8, 1), "within_error");
assert.equal(band("shoulderTilt", 2, 1), "mild");
assert.equal(band("shoulderTilt", -4, 1), "marked");
assert.equal(band("headForward", 5, 2), "typical");
assert.equal(band("headForward", 15, 2), "mild");
assert.equal(band("headForward", 25, 2), "marked");
assert.equal(band("trunkLean", -7, 1.5), "marked");
assert.equal(band("kneeAngle", 176, 2), "typical");
assert.equal(band("kneeAngle", 150, 2), "marked");
assert.ok(METRICS.length === 11 && new Set(METRICS.map((m) => m.id)).size === 11, "eleven distinct metrics");

// ---- agreement statistics against worked examples
{
  const a = agreement([10, 12, 14, 16, 18], [9, 12, 15, 15, 17], 1);
  // differences 1, 0, -1, 1, 1: bias 0.4; sd = sqrt(((0.6)^2 + (0.4)^2 + (1.4)^2 + (0.6)^2 + (0.6)^2) / 4) = sqrt(3.2/4) = 0.8944
  near(a.bias, 0.4, 1e-9, "bias");
  near(a.sdDiff, 0.8944, 1e-4, "sd of the differences");
  near(a.upper, 0.4 + 1.96 * 0.8944, 1e-3, "upper limit of agreement");
  near(a.lower, 0.4 - 1.96 * 0.8944, 1e-3, "lower limit of agreement");
  near(a.mae, 0.8, 1e-9, "mean absolute error");
  assert.equal(a.withinTolerance, 1);
  assert.throws(() => agreement([1, 2], [1, 2]), RangeError);
  assert.throws(() => agreement([1, 2, 3], [1, 2]), RangeError);
  // Shrout and Fleiss (1979): 6 subjects rated by 4 judges: ICC(2,1) = 0.29, ICC(3,1) = 0.71
  const r = icc([[9, 2, 5, 8], [6, 1, 3, 2], [8, 4, 6, 8], [7, 1, 2, 6], [10, 5, 6, 9], [6, 2, 4, 7]]);
  near(r.icc21, 0.29, 0.005, "ICC(2,1)");
  near(r.icc31, 0.71, 0.005, "ICC(3,1)");
  near(icc([[1, 1], [2, 2], [3, 3]]).icc21, 1, 1e-9, "perfect agreement is 1");
  // repeatability: pairs differ by 1, -1, 1, -1: sd = 1.1547; SEM = 0.8165; MDC95 = 1.96 x 1.4142 x 0.8165 = 2.2633
  const rep = repeatability([5, 6, 7, 8], [4, 7, 6, 9]);
  near(rep.sem, 0.8165, 1e-4, "SEM");
  near(rep.mdc95, 2.2633, 1e-3, "MDC95");
}


// ---- the study kit: the CSV the page exports is read back and analysed correctly (hand-worked: differences 1, 0, -1, 1, 1 give bias 0.4)
{
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\n'), [["a", "b"], ["x, y", 'say "hi"']]);
  const csv = ["time,view,metric,app_value,app_plus_minus,reference_value,capture_by,phone_pitch_deg,phone_roll_deg"]
    .concat([[10, 9], [12, 12], [14, 15], [16, 15], [18, 17]].map(([a, r], i) => `"t${i}","side","headForward","${a}","2","${r}","self","","")`.replace(/\)$/, "")))
    .concat(['"t9","side","kneeAngle","170","2","","self","",""']).join("\n");
  const out = analyse(readStudy(csv));
  const hf = out.find((m) => m.metric === "headForward")!;
  assert.equal(hf.pairs, 5);
  near(hf.agreement!.bias, 0.4, 1e-9, "bias read back from the exported file");
  assert.equal(out.find((m) => m.metric === "kneeAngle"), undefined, "a row without a reference value is not analysed");
  assert.throws(() => readStudy("a,b\n1,2"), /missing the columns/);
  assert.ok(analyse(readStudy(csv.split("\n").slice(0, 3).join("\n")))[0].agreement === null, "fewer than 3 pairs is not analysed");
  assert.ok(fs.existsSync("docs/posture-validation.md") && fs.existsSync("public/posture-validation-template.csv"), "the validation protocol and the data template must exist");
  const doc = fs.readFileSync("docs/posture-validation.md", "utf8");
  for (const needle of ["Bland", "ICC(2,1)", "informed consent", "ethics", "Pre-specified acceptance", "GRRAS", "limits of agreement"]) assert.ok(doc.includes(needle), `the protocol should cover: ${needle}`);
}

// ---- the page: consent, honest limits, privacy, the level gate, and the camera permission
{
  const page = fs.readFileSync("src/app/health-calculators/posture/PostureScreen.tsx", "utf8");
  const text = fs.readFileSync("src/lib/posture/text.ts", "utf8");
  assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|WebSocket/, "the posture page must not send or store anything");
  assert.match(page, /disabled=\{!agreed\}/, "the page must require agreeing to the limits before the camera opens");
  assert.match(page, /const levelBlocks = levelOn && tilt !== null && !tilt\.level;/, "a phone that is not level must block the measurement");
  assert.match(page, /const ready = [^;]*!levelBlocks;/, "the start button must wait for a level phone");
  assert.match(page, /disabled=\{!ready\}/, "the start button must be disabled until the set-up check passes");
  assert.match(page, /MIN_FRAMES/, "the page must refuse to answer from too few good frames");
  assert.match(page, /provisional/i, "the results must say the cut-offs are provisional");
  assert.match(page, /\+\/-|±/, "every number must be shown with its plus-or-minus");
  assert.match(page, /const stop = useCallback\(\(\) => \{[^}]*closeCamera\(video\.current, stream\.current\)/, "stop() must turn the camera off");
  assert.match(page, /useEffect\(\(\) => stop, \[stop\]\)/, "the camera must be stopped when the page is left");
  assert.match(page, /setCapture\(out\);\s*stop\(\);/, "the camera must be stopped as soon as the capture ends");
  assert.doesNotMatch(page, /toDataURL|MediaRecorder|captureStream|drawImage/, "the picture must never be saved or recorded");
  const terms = TERMS.items.map((i) => i.en).join(" ");
  for (const needle of ["not a diagnosis", "can be wrong", "spine", "Nothing is recorded, uploaded or saved", "under 16"]) assert.ok(terms.includes(needle), `the terms must say: ${needle}`);
  for (const item of TERMS.items) assert.ok(item.ur.trim().length > 10 && item.ur !== item.en, "every term needs Roman Urdu");
  assert.ok(text.includes("See a physiotherapist or doctor") || page.includes("See a physiotherapist or doctor"), "the results must point to a clinician for pain, numbness or worry");
  const serverPage = fs.readFileSync("src/app/health-calculators/posture/page.tsx", "utf8");
  const loader = fs.readFileSync("src/app/health-calculators/posture/PostureLoader.tsx", "utf8");
  assert.doesNotMatch(serverPage, /from "\.\/PostureScreen"/, "the server page must not import the posture screen: the camera code and the pose library must stay out of the Worker (it has a size limit)");
  assert.match(loader, /dynamic\(\(\) => import\("\.\/PostureScreen"\), \{\s*ssr: false/, "the posture screen must load in the browser only (ssr: false)");
  const config = fs.readFileSync("next.config.js", "utf8");
  assert.ok(/source: '\/health-calculators\/posture(?:\/:path\*)?',\s*headers: \[\{ key: 'Permissions-Policy', value: 'camera=\(self\), microphone=\(\)' \}\]/.test(config), "the posture page must be allowed its own camera");
  const hub = fs.readFileSync("src/app/health-calculators/page.tsx", "utf8");
  assert.ok(hub.includes("/health-calculators/posture"), "the calculators hub must link to the posture screen");
  // A Next.js link keeps the Permissions-Policy of the page it came from (camera=()): the posture page then refuses the camera ("tell the clinic").
  assert.ok(/fullLoad: true/.test(hub) && /<a href=\{tool\.href\}/.test(hub), "the hub's posture card must be a plain link (a full page load), not a Next.js Link");
  assert.match(page, /useEffect\(\(\) => \{ reloadIfPolicyBlocksCamera\(\); \}, \[\]\)/, "the posture screen must load itself as its own document when an in-app link left it with the previous page's camera policy");
  assert.match(page, /opened\.problem === "policy" && reloadIfPolicyBlocksCamera\(\)/, "a camera refused by policy must trigger the one-time reload before any error is shown");
  const permission = fs.readFileSync("src/lib/formcheck/browser/policy-reload.ts", "utf8");
  assert.ok(/30_000/.test(permission) && /sessionStorage/.test(permission) && /catch \{\s*return false;/.test(permission), "the reload must be limited (no reload loops, none without storage to remember it)");
}

console.log("Posture screen checks passed: measurements against hand-worked skeletons (both facings, front and back), refusal to guess, capture summary, bands, agreement statistics, the study kit, and the page (consent, honest limits, nothing stored or sent, level gate, camera permission).");
