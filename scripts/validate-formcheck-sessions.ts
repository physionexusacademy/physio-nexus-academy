import assert from "node:assert/strict";
import { CAMERA_SPECS, FormCheckSession, SETUP_MESSAGES, STATUS_MESSAGES, lintCue, specFor, type CameraSpec, type SessionOptions, type SessionState, type SessionSummary } from "../src/lib/formcheck/index.ts";
import { cycles, feetEnd, lyingSide, play, plankSide, seatedFront, seatedSide, type Scene } from "./formcheck-synthetic.ts";

/**
 * A whole exercise set rehearsed through the session with synthetic people: set-up gate, neutral position, counting and timing, cues and refusals. This tests the
 * logic of the tool (deterministic, seeded noise). It does not test the pose model or accuracy on real bodies: that is the feasibility trial and the validation study.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert(condition, message); };
const spec = (id: string): CameraSpec => specFor(id)!;

function run(id: string, scene: Scene, w: number, h: number, seconds: number, options: SessionOptions = {}, play_: Parameters<typeof play>[5] = {}) {
  const session = new FormCheckSession(spec(id), options);
  const states: SessionState[] = [];
  play(scene, w, h, seconds, (frame) => states.push(session.push(frame)), play_);
  const summary: SessionSummary = session.finish();
  return { session, states, summary, last: states[states.length - 1], final: session.state };
}
const firstActive = (states: SessionState[]) => states.findIndex((s) => s.phase === "active");

/* 1. chin tuck: ten seconds of stillness, then five repetitions with the library's 5 s hold */
{
  const T0 = 4000, up = 1000, hold = 5200, down = 1000, gap = 1500;
  const scene = seatedSide((t) => ({ earBack: 0.05 * cycles(t, T0, up, hold, down, gap, 5) }));
  const { states, summary, final } = run("chin-tuck", scene, 720, 1280, 50);
  const a = firstActive(states);
  ok(a > 0 && states[a].hint === STATUS_MESSAGES.ready, "a person who is in view and still gets their neutral position taken, then the set starts");
  ok(states.slice(0, a).some((s) => s.phase === "calibrating"), "the neutral position is taken before counting starts");
  ok(summary.reps === 5 && summary.partial === 0, `five chin tucks are counted as five (${summary.reps}, partial ${summary.partial})`);
  ok(summary.records.length === 5 && summary.records.every((r) => !r.shortHold && r.holdMs >= 5000), `each repetition held the library's 5 s (${summary.records.map((r) => Math.round(r.holdMs))})`);
  ok(Object.keys(summary.cues).length === 0, "no cue is given to a person who does the exercise as asked");
  ok(summary.coverage.fraction > 0.95, `nearly every frame gave a reading (${summary.coverage.fraction.toFixed(2)})`);
  ok(states.every((s) => s.primary === null || s.primary.shown === false), "no angle is shown to the person: no movement type has been validated");
  ok(final.phase === "finished" && summary.limits.en.length > 30, "the summary carries what the camera cannot do for this exercise");
  ok(summary.baseline && Math.abs(summary.baseline.ear_fwd - 0.12) < 0.03, "the baseline is the person's own start position");
}
{
  const scene = seatedSide((t) => ({ earBack: 0.012 * cycles(t, 4000, 1000, 2000, 1000, 1500, 5) }));
  const { summary } = run("chin-tuck", scene, 720, 1280, 30);
  ok(summary.reps === 0 && summary.partial >= 3, `a movement that does not reach the target is partial, never a repetition (${summary.reps} reps, ${summary.partial} partial)`);
}
// a person who leaves the picture in the middle of a repetition: no repetition is invented
{
  const scene = seatedSide((t) => ({ earBack: 0.05 * cycles(t, 4000, 1000, 5200, 1000, 1500, 5) }));
  const { states, summary } = run("chin-tuck", scene, 720, 1280, 50, {}, { gaps: [[14000, 18500]] });
  ok(states.some((s) => s.hint === STATUS_MESSAGES.lost || s.hint === STATUS_MESSAGES.paused || s.hint === SETUP_MESSAGES.no_person), "the person is told when they are lost");
  ok(summary.reps <= 4 && summary.reps >= 3, `the repetition that was interrupted is not counted (${summary.reps} of 5)`);
  ok((summary.refusals.no_person ?? 0) > 50, "the refusals are counted by reason");
}

/* 2. neck side bend: a shoulder shrug during a repetition gets one cue */
{
  const base = (t: number) => ({ tilt: 20 * cycles(t, 4000, 1000, 5200, 1000, 1500, 4) });
  const clean = run("neck-side-bend", seatedFront(base), 720, 1280, 40);
  ok(clean.summary.reps === 4, `four side bends are counted as four (${clean.summary.reps})`);
  ok(Object.keys(clean.summary.cues).length === 0, "no cue for a clean side bend");
  const shrug = run("neck-side-bend", seatedFront((t) => ({ ...base(t), shrug: t > 15000 && t < 18500 ? 9 : 0 })), 720, 1280, 40);
  ok(shrug.summary.cues["neck-side-bend-level"] === 1, `a shrug that is held gets exactly one cue (${JSON.stringify(shrug.summary.cues)})`);
  const cueState = shrug.states.find((s) => s.cue);
  ok(cueState && cueState.cue!.text.en === "Keep your shoulders level and relaxed." && lintCue(cueState.cue!.text.en).length === 0, "the cue is the fixed sentence, which obeys the wording rules");
  const flick = run("neck-side-bend", seatedFront((t) => ({ ...base(t), shrug: Math.floor(t / 100) % 2 === 0 && t > 15000 && t < 18000 ? 9 : 0 })), 720, 1280, 40);
  ok(!flick.summary.cues["neck-side-bend-level"], "a flicker that does not last is not cued");
}

/* 3. a held stretch: the timer counts while the head stays tilted */
{
  const { summary, final } = run("upper-trapezius-stretch", seatedFront((t) => ({ tilt: t > 5000 && t < 42000 ? 20 : 0 })), 720, 1280, 45, { tested: "left" });
  ok(summary.bestHoldMs >= 30000, `a 30 s stretch is timed (${Math.round(summary.bestHoldMs / 1000)} s)`);
  ok(final.phase === "finished", "the set finishes");
}

/* 4. the glute bridge from the side, and the pelvis watched in a second pass from the feet */
{
  const scene = lyingSide((t) => ({ lift: cycles(t, 4000, 1200, 3200, 1200, 2000, 5) }));
  const { states, summary } = run("glute-bridge", scene, 1280, 720, 50);
  ok(firstActive(states) > 0, "a person lying side on in a landscape frame passes the set-up check (the wide extent counts)");
  ok(summary.peak.hip_angle >= 30, `the bridge moves the hip angle by at least the target (${summary.peak.hip_angle.toFixed(0)} degrees)`);
  ok(summary.reps === 5, `five bridges are counted as five (${summary.reps})`);
  const second = (drop: (t: number) => number) => run("glute-bridge", feetEnd((t) => ({ drop: drop(t) })), 1280, 720, 30, { pass: 2 });
  const level = second(() => 0);
  ok(Object.keys(level.summary.cues).length === 0 && firstActive(level.states) > 0, "level hips from the feet end: no cue, and the feet-end view passes the set-up check");
  const dropped = second((t) => (t > 8000 && t < 12000 ? 9 : 0));
  ok(dropped.summary.cues["bridge-hips-level"] === 1, `a dropping hip gets one cue (${JSON.stringify(dropped.summary.cues)})`);
  const knees = run("glute-bridge", feetEnd((t) => ({ gap: t > 8000 && t < 12000 ? 1.6 : 1 })), 1280, 720, 30, { pass: 2 });
  ok(knees.summary.cues["bridge-knees-apart"] === 1, `knees that fall apart get one cue (${JSON.stringify(knees.summary.cues)})`);
}

/* 5. the plank: a steady position is timed, a sagging hip is cued and restarts the timer */
{
  const steady = run("front-plank", plankSide(() => ({})), 1280, 720, 30);
  ok(steady.summary.bestHoldMs >= 20000 && Object.keys(steady.summary.cues).length === 0, `a steady plank is timed with no cue (${Math.round(steady.summary.bestHoldMs / 1000)} s)`);
  const sag = run("front-plank", plankSide((t) => ({ sag: t > 20000 && t < 24000 ? 0.12 : 0 })), 1280, 720, 40);
  ok(sag.summary.cues["plank-line"] === 1, `a sagging hip gets one cue (${JSON.stringify(sag.summary.cues)})`);
  const mid = sag.states.find((s, i) => i > 0 && sag.states[i - 1].holdMs > 15000 && s.holdMs === 0);
  ok(mid, "the timer starts again after a sag that is longer than the grace time");
}

/* 6. seated thoracic rotation: counted from how much narrower the shoulders look; the hips are watched */
{
  const turn = (t: number) => 30 * cycles(t, 4000, 900, 0, 900, 1200, 6);
  const { summary } = run("seated-thoracic-rotation", seatedFront((t) => ({ turn: turn(t) })), 720, 1280, 40, { tested: "left" });
  ok(summary.reps === 6, `six trunk turns of 30 degrees are counted as six (${summary.reps})`);
  ok(summary.peak.trunk_turn > 24 && summary.peak.trunk_turn < 36, `the turn is read from the width ratio (${summary.peak.trunk_turn.toFixed(0)} degrees for a drawn 30)`);
  const hips = run("seated-thoracic-rotation", seatedFront((t) => ({ turn: turn(t), hipTurn: t > 17000 && t < 20000 ? 14 : 0 })), 720, 1280, 40, { tested: "left" });
  ok(hips.summary.cues["seated-rotation-hips"] === 1, `hips that turn with the trunk get one cue (${JSON.stringify(hips.summary.cues)})`);
}

/* 7. the session refuses instead of guessing */
{
  const noSide = new FormCheckSession(spec("seated-thoracic-rotation"));
  ok(noSide.state.phase === "unavailable" && noSide.state.hint === STATUS_MESSAGES.needSide, "a one-sided exercise waits until the person says which side");
  const noFace = new FormCheckSession(spec("neck-rotation"));
  ok(noFace.state.phase === "unavailable" && noFace.state.hint === STATUS_MESSAGES.needFace, "an exercise that needs the face view says so when the face model is not running");
  const blind = run("neck-rotation", seatedFront(() => ({})), 720, 1280, 10, { face: true }, {});
  const blindFrames = new FormCheckSession(spec("neck-rotation"), { face: true });
  let state = blindFrames.state;
  play(seatedFront(() => ({})), 720, 1280, 6, (frame) => { state = blindFrames.push({ ...frame, head: undefined }); });
  ok(state.phase === "calibrating" && state.primary === null, "with the face model on but no face found the exercise never starts and shows no number");
  ok(blind.summary.baseline !== null, "with the face model working it starts");
  const far = (t: number) => { const s = seatedFront(() => ({}))(t); return { ...s, lm: Object.fromEntries(Object.entries(s.lm).map(([k, p]) => [k, [0.5 + ((p as [number, number])[0] - 0.5) * 0.4, 0.5 + ((p as [number, number])[1] - 0.5) * 0.4]])) as typeof s.lm }; };
  const tooFar = run("neck-side-bend", far, 720, 1280, 8);
  ok(tooFar.last.phase === "setup" && tooFar.last.hint === SETUP_MESSAGES.too_far, "a person who is too far from the phone is told to come closer and the set never starts");
  const dark = run("neck-side-bend", seatedFront(() => ({})), 720, 1280, 6, {}, { luma: 20 });
  ok(dark.last.phase === "setup" && dark.last.hint === SETUP_MESSAGES.too_dark, "a dark room is reported and the set never starts");
  const fidget = run("neck-side-bend", seatedFront((t) => ({ tilt: 12 * Math.sin(t / 220) })), 720, 1280, 10);
  ok(fidget.last.phase === "calibrating" && fidget.summary.reps === 0, "a person who keeps moving never gets a neutral position taken, so nothing is counted");
}

/* 8. every spec can be started: the metrics of each exercise read from a body that has all the landmarks it needs */
for (const s of CAMERA_SPECS) {
  const session = new FormCheckSession(s, { tested: "left", face: true, pass: 1 });
  ok(session.state.phase === "setup", `${s.id} starts in the set-up phase`);
  if (s.second) ok(new FormCheckSession(s, { tested: "left", pass: 2 }).state.phase === "setup", `${s.id}: the second pass starts in the set-up phase`);
}

console.log(`Form Check sessions: ${checks} checks passed (synthetic people: the logic of a whole set, not the pose model).`);
