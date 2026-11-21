"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useLang } from "@/lib/lang";
import type { DemoKind } from "@/lib/manual-therapy-depth-types";
import "./technique-demo.css";
import { motionReduced } from "@/lib/motion";

type Step = { title: string; detail: string };

/** Four steps per demonstration: what the hands do, and what the tissue does in answer. */
const STEPS: Record<DemoKind, Step[]> = {
  glide: [
    { title: "Rest position", detail: "The convex head sits in the concave surface. Find the treatment plane first: it is perpendicular to the line from the axis to the centre of the concave surface." },
    { title: "Distraction (grade I)", detail: "A small pull along the long axis unloads the joint. It tests irritability and is the safest first move." },
    { title: "Glide (grade II-III)", detail: "Take up the slack and glide along the plane. A convex surface glides opposite to the bone's movement; a concave one in the same direction." },
    { title: "Oscillate at the barrier (grade IV)", detail: "Small oscillations at the limit of range. Re-test the comparable sign after each bout, then convert the gain into active movement." },
  ],
  contract: [
    { title: "Find the barrier", detail: "Take the limb to the first resistance and note it. The barrier is where you start, not where you push." },
    { title: "Gentle isometric contraction", detail: "The patient pushes at about 10-30 percent effort against your matched resistance for 5-10 seconds. The joint does not move." },
    { title: "Full relaxation", detail: "Wait 2-3 seconds until the muscle is truly relaxed. Moving early wastes the effect." },
    { title: "Take up the new barrier", detail: "Move into the extra range the nervous system now allows, then repeat 3-5 cycles and test with active movement." },
  ],
  fascia: [
    { title: "Contact and take up slack", detail: "A broad, slow contact lifts the skin layer and takes up the slack of the fascia without sliding over the skin." },
    { title: "Wait for tissue creep", detail: "Hold with light load. Over 90-120 seconds the layers begin to shear as the tissue creeps and guarding settles." },
    { title: "Follow the release", detail: "Move with the new direction of least resistance. The change you feel is a mix of creep, fluid shift and reduced guarding." },
    { title: "Move actively", detail: "Ask the patient to move through the new range so the nervous system learns it. Re-test the target movement." },
  ],
  friction: [
    { title: "Locate the lesion", detail: "Palpate to the exact painful spot of the tendon or the band. Treat what the examination implicated, not what is easy to reach." },
    { title: "Transverse friction", detail: "Move the skin and the tissue together across the fibres with firm, short strokes. Along the fibres is a different technique." },
    { title: "Analgesia window", detail: "After a few minutes tenderness falls. This window is for loading, not for rubbing more." },
    { title: "Load the tissue", detail: "Follow with isometric then isotonic loading, so the tendon adapts in the direction of its fibres." },
  ],
  neural: [
    { title: "Neutral", detail: "The nerve lies in its bed with slack. Test the structure with a differentiating movement before any treatment." },
    { title: "Slider", detail: "One end moves toward the nerve while the other moves away, so the nerve glides with little added tension. Start here when irritable." },
    { title: "Tensioner", detail: "Both ends move away and tension rises. Use only when symptoms are low and stable, in short holds." },
    { title: "Dose by symptoms", detail: "Stay below the point where symptoms increase. A flare of arm or leg symptoms means dose down, not push on." },
  ],
  fluid: [
    { title: "Screen and prepare", detail: "Check the screening list (infection, DVT, heart failure, skin) and expose clean, intact skin. Clear the proximal region first." },
    { title: "Light skin stretch", detail: "Very light, slow strokes stretch the skin layer and move tissue fluid toward functioning nodes. Pressure is far lighter than massage." },
    { title: "Fluid and perfusion follow", detail: "Direction matters: always toward the drained region. Watch the skin and the patient's response." },
    { title: "Lock it in with movement", detail: "Finish with compression or active movement so the gain is held. Drainage alone rarely holds the result." },
  ],
  thrust: [
    { title: "Position and consent", detail: "Position the segment, confirm the screening and obtain informed consent. Positioning does most of the work." },
    { title: "Take up slack to the barrier", detail: "Take every bit of slack out until you meet the first firm resistance. Do not add force here." },
    { title: "Small, fast thrust", detail: "A few millimetres at high speed and low force beyond the barrier. A sound is common and not required." },
    { title: "Re-test", detail: "Re-test the comparable sign and the neurological screen. Follow with active movement. Do not repeat a thrust that did not release." },
  ],
  response: [
    { title: "Mark where it hurts", detail: "Record the exact location of the symptoms, including the furthest point down the limb. The location, not only the intensity, is what you will track." },
    { title: "Test one direction", detail: "Repeat one movement 10-15 times, or hold one position, and watch where the symptoms go during and after." },
    { title: "Retreat toward the spine is the right sign", detail: "Symptoms moving up the limb toward the back (centralising) mean the direction helps, even if the back is briefly worse. Spreading away means stop that direction." },
    { title: "Keep it and own it", detail: "Prescribe the direction in short, frequent bouts, progress only if the response stalls, and teach the patient to repeat it at the first sign of a recurrence." },
  ],
  appraise: [
    { title: "State the claim", detail: "Write the claim in one sentence and the outcome it should change (pain, range, function). A mechanism that cannot be measured cannot be tested." },
    { title: "Find the fair test", detail: "Look for randomised trials against a credible comparator (exercise, sham or usual care), measured on outcomes that matter to the patient." },
    { title: "Read the size of the effect", detail: "Compare the difference with the smallest change a patient would notice. A small, statistically significant gap can still be clinically meaningless." },
    { title: "Decide and protect", detail: "Rule out red flags first, offer evidence-based active care, and use the method only as an optional extra the patient knows is unproven." },
  ],
  position: [
    { title: "Find the tender point", detail: "Locate a reproducible tender point and rate it with the patient (for example 10 out of 10 on the first contact)." },
    { title: "Shorten into ease", detail: "Slack the tissue and search for the position where the tenderness drops by about 70 percent or more." },
    { title: "Hold about 90 seconds", detail: "Hold the position of ease without adding force. The tenderness should keep falling during the hold." },
    { title: "Slow return and recheck", detail: "Return slowly, recheck the point and the movement, then move into active work." },
  ],
};

const TICK_MS = 4200;

/** Each scene draws the same 480 x 250 stage; `s` is the step (0-3). */
function Scene({ kind, s }: { kind: DemoKind; s: number }) {
  const ease = "transform 1.1s cubic-bezier(.4,.1,.2,1), opacity .8s ease, stroke-dashoffset 1.2s ease";
  if (kind === "glide") {
    const dx = [0, 22, 14, 14][s];
    const dy = [0, 0, -34, -34][s];
    return (
      <g>
        <path d="M30 60 H150 A58 58 0 0 0 150 190 H30 Z" className="td-bone" />
        <line x1="150" y1="40" x2="150" y2="212" className="td-axis" />
        <g style={{ transform: `translate(${dx}px, ${dy}px)`, transition: ease }} className={s === 3 ? "td-osc" : ""}>
          <circle cx="158" cy="125" r="46" className="td-bone td-bone-b" />
          <rect x="190" y="105" width="210" height="40" rx="20" className="td-bone td-bone-b" />
        </g>
        <line x1="150" y1="82" x2="330" y2="82" className="td-barrier" />
        <text x="334" y="86" className="td-label">barrier</text>
        {s >= 1 ? <path d="M232 214 H300" className="td-arrow" markerEnd="url(#td-head)" opacity={s === 1 ? 1 : 0.35} /> : null}
        {s >= 2 ? <path d="M96 190 V140" className="td-arrow td-arrow-v" markerEnd="url(#td-head)" /> : null}
        <text x="34" y="236" className="td-label">{["convex on concave", "grade I: distraction", "grade II-III: glide along the plane", "grade IV: oscillate at the limit"][s]}</text>
      </g>
    );
  }
  if (kind === "contract") {
    const angle = [28, 28, 28, 44][s];
    const pivot = { x: 120, y: 190 };
    const rad = (a: number) => (a * Math.PI) / 180;
    const end = (a: number, r: number) => ({ x: pivot.x + r * Math.cos(rad(a)), y: pivot.y - r * Math.sin(rad(a)) });
    const e = end(angle, 230);
    const barrier = end(28, 250);
    const force = [0, 0.24, 0.02, 0][s];
    return (
      <g>
        <circle cx={pivot.x} cy={pivot.y} r="14" className="td-bone" />
        <line x1={pivot.x} y1={pivot.y} x2={e.x} y2={e.y} className="td-limb" style={{ transition: "all 1.1s cubic-bezier(.4,.1,.2,1)" }} />
        <circle cx={e.x} cy={e.y} r="12" className="td-bone td-bone-b" style={{ transition: "all 1.1s cubic-bezier(.4,.1,.2,1)" }} />
        <line x1={pivot.x} y1={pivot.y} x2={barrier.x} y2={barrier.y} className="td-barrier" />
        <text x={barrier.x + 6} y={barrier.y} className="td-label">barrier</text>
        <rect x="400" y="40" width="26" height="170" rx="13" className="td-gauge" />
        <rect x="400" y={40 + 170 * (1 - force)} width="26" height={170 * force + 0.01} rx="13" className="td-gauge-fill" style={{ transition: "all .9s ease" }} />
        <text x="372" y="226" className="td-label">effort</text>
        <text x="372" y="40" className="td-label">{s === 1 ? "10-30 %" : ""}</text>
      </g>
    );
  }
  if (kind === "fascia") {
    const shear = [0, 10, 26, 34][s];
    return (
      <g>
        <rect x="60" y="70" width="360" height="34" rx="10" className="td-skin" />
        <rect x="60" y="112" width="360" height="30" rx="10" className="td-fascia" style={{ transform: `translateX(${shear}px)`, transition: ease }} />
        <rect x="60" y="150" width="360" height="64" rx="12" className="td-muscle" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={80 + i * 44} y1="158" x2={96 + i * 44} y2="208" className="td-fibre" />)}
        <circle cx="240" cy={s === 0 ? 40 : 56} r="26" className="td-hand" style={{ transition: ease }} />
        <circle cx="240" cy="56" r="34" className="td-timer" pathLength="1" strokeDasharray="1" strokeDashoffset={[1, 0.66, 0.16, 0][s]} style={{ transition: ease, opacity: s === 0 ? 0 : 1 }} transform="rotate(-90 240 56)" />
        <text x="64" y="238" className="td-label">{["skin, fascia, muscle", "hold ~ 90-120 s", "layers shear: the release", "then move actively"][s]}</text>
      </g>
    );
  }
  if (kind === "friction") {
    const load = s === 3;
    return (
      <g>
        <rect x="150" y="30" width="180" height="190" rx="40" className="td-tendon" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={176 + i * 18} y1="44" x2={176 + i * 18} y2="206" className="td-fibre" />)}
        <ellipse cx="240" cy="125" rx="44" ry="22" className="td-lesion" style={{ opacity: [1, 1, 0.45, 0.25][s], transition: ease }} />
        <g className={s === 1 ? "td-rub" : ""} style={{ transform: s === 0 ? "translate(0,-46px)" : "translate(0,0)", transition: ease }}>
          <circle cx="240" cy="125" r="16" className="td-hand" />
        </g>
        {s === 1 ? <path d="M150 125 H330" className="td-arrow" /> : null}
        {load ? <path d="M240 232 V190" className="td-arrow td-arrow-v" markerEnd="url(#td-head)" /> : null}
        <text x="344" y="130" className="td-label">{["lesion", "across the fibres", "analgesia window", "load along the fibres"][s]}</text>
      </g>
    );
  }
  if (kind === "neural") {
    const nerveY = [150, 150, 130, 120][s];
    const dx = [0, 26, 0, 0][s];
    const tension = [0.2, 0.22, 0.8, 0.3][s];
    return (
      <g>
        <circle cx="90" cy="150" r="26" className="td-bone" style={{ transform: `translate(${-dx}px,${s === 1 ? 20 : 0}px)`, transition: ease }} />
        <circle cx="390" cy="150" r="26" className="td-bone" style={{ transform: `translate(${s === 2 ? 40 : dx}px,${s === 1 ? -20 : 0}px)`, transition: ease }} />
        <path d={`M90 150 C160 ${nerveY + 60}, 320 ${nerveY - 60}, 390 150`} className={s === 2 ? "td-nerve td-nerve-hot" : "td-nerve"} style={{ transition: "d 1s ease, stroke .6s ease" }} />
        <rect x="428" y="40" width="22" height="150" rx="11" className="td-gauge" />
        <rect x="428" y={40 + 150 * (1 - tension)} width="22" height={150 * tension + 0.01} rx="11" className={s === 2 ? "td-gauge-fill td-gauge-hot" : "td-gauge-fill"} style={{ transition: "all .9s ease" }} />
        <text x="394" y="208" className="td-label">tension</text>
        <text x="60" y="236" className="td-label">{["nerve in its bed", "slider: glide, tension constant", "tensioner: tension rises", "stay below the symptom threshold"][s]}</text>
      </g>
    );
  }
  if (kind === "fluid") {
    return (
      <g>
        {[70, 120, 170].map((y, i) => (
          <g key={y}>
            <path d={`M50 ${y} H360`} className="td-vessel" />
            {s >= 1 ? <circle cx="70" cy={y} r="6" className="td-dot" style={{ animation: `td-flow ${2.6 + i * 0.4}s linear infinite`, animationDelay: `${i * 0.5}s` }} /> : null}
          </g>
        ))}
        <circle cx="400" cy="120" r="34" className="td-node" />
        <text x="378" y="124" className="td-label">nodes</text>
        <path d="M60 210 H300" className="td-arrow" markerEnd="url(#td-head)" opacity={s >= 1 ? 1 : 0.25} />
        <text x="60" y="238" className="td-label">{["prepare, clear proximal first", "very light skin stretch", "direction: toward the nodes", "compression and movement hold it"][s]}</text>
      </g>
    );
  }
  if (kind === "thrust") {
    return (
      <g>
        <line x1="50" y1="200" x2="440" y2="200" className="td-axis" />
        <line x1="50" y1="200" x2="50" y2="36" className="td-axis" />
        <text x="404" y="222" className="td-label">range</text>
        <text x="56" y="34" className="td-label">force</text>
        <line x1="258" y1="40" x2="258" y2="200" className="td-barrier" />
        <text x="264" y="52" className="td-label">barrier</text>
        <path d="M54 198 L120 190 L190 176 L258 150" pathLength="1" className="td-curve" strokeDasharray="1" strokeDashoffset={s >= 1 ? 0 : 1} style={{ transition: ease }} />
        <path d="M258 150 L292 66 L306 150 L340 196" pathLength="1" className="td-curve td-curve-hot" strokeDasharray="1" strokeDashoffset={s >= 2 ? 0 : 1} style={{ transition: ease }} />
        {s >= 2 ? <circle cx="292" cy="66" r="7" className="td-dot" /> : null}
        <line x1="350" y1="40" x2="350" y2="200" className="td-limit" />
        <text x="354" y="52" className="td-label">anatomical limit</text>
        <text x="60" y="238" className="td-label">{["position, consent, screening", "take up slack to the barrier", "small, fast thrust", "re-test and move actively"][s]}</text>
      </g>
    );
  }
  if (kind === "response") {
    const y = [205, 170, 100, 58][s];
    const ticks: [string, number][] = [["back", 58], ["buttock", 100], ["thigh", 135], ["calf", 170], ["foot", 205]];
    return (
      <g>
        <line x1="150" y1="50" x2="150" y2="214" className="td-limb" style={{ strokeWidth: 8, stroke: "#12345a" }} />
        {ticks.map(([label, ty]) => (
          <g key={label}>
            <line x1="138" y1={ty} x2="162" y2={ty} className="td-axis" />
            <text x="172" y={ty + 4} className="td-label">{label}</text>
          </g>
        ))}
        <circle cx="150" cy={y} r="13" className="td-lesion" style={{ transition: "cy 1.1s cubic-bezier(.4,.1,.2,1)" }} />
        {s === 1 ? <path d="M286 90 V150 M286 90 l-8 10 M286 90 l8 10 M286 150 l-8 -10 M286 150 l8 -10" className="td-arrow td-rub" /> : null}
        {s === 2 ? <path d="M300 170 V70" className="td-arrow td-arrow-v" markerEnd="url(#td-head)" /> : null}
        <text x="268" y="238" className="td-label">{["symptoms mapped", "repeated movement, watch the location", "centralising: the right direction", "frequent bouts, self-managed"][s]}</text>
      </g>
    );
  }
  if (kind === "appraise") {
    const base = 192;
    const compare = 70;
    const claim = s >= 2 ? 78 : 70;
    return (
      <g>
        <line x1="60" y1={base} x2="440" y2={base} className="td-axis" />
        {s === 0 ? (
          <g>
            <rect x="120" y="50" width="240" height="90" rx="22" className="td-bone" />
            <text x="240" y="102" textAnchor="middle" className="td-label" style={{ fontSize: 16 }}>“It resets the body.”</text>
            <text x="240" y="176" textAnchor="middle" className="td-label" style={{ fontSize: 30 }}>?</text>
          </g>
        ) : null}
        {s === 1 || s === 2 ? (
          <g>
            <rect x="110" y={base - compare} width="64" height={compare} rx="10" className="td-bone" />
            <rect x="220" y={base - claim} width="64" height={claim} rx="10" className="td-bone td-bone-b" style={{ transition: ease }} />
            <text x="142" y={base + 16} textAnchor="middle" className="td-label">comparator</text>
            <text x="252" y={base + 16} textAnchor="middle" className="td-label">the method</text>
            <line x1="142" y1={base - compare - 10} x2="142" y2={base - compare + 8} className="td-barrier" />
            <line x1="252" y1={base - claim - 10} x2="252" y2={base - claim + 8} className="td-barrier" />
          </g>
        ) : null}
        {s === 2 ? (
          <g>
            <line x1="300" y1={base - 78} x2="320" y2={base - 78} className="td-limit" />
            <line x1="300" y1={base - 70} x2="320" y2={base - 70} className="td-limit" />
            <text x="326" y={base - 70} className="td-label">gap</text>
            <rect x="380" y={base - 100} width="16" height="30" rx="4" fill="#ffb347" opacity=".85" />
            <text x="352" y={base - 108} className="td-label">what matters</text>
          </g>
        ) : null}
        {s === 3 ? (
          <g>
            <rect x="90" y="60" width="140" height="54" rx="16" className="td-bone" />
            <text x="160" y="92" textAnchor="middle" className="td-label">red flags first</text>
            <rect x="250" y="60" width="150" height="54" rx="16" className="td-bone" />
            <text x="325" y="92" textAnchor="middle" className="td-label">active care first</text>
            <path d="M240 130 V170" className="td-arrow" markerEnd="url(#td-head)" />
            <text x="240" y="196" textAnchor="middle" className="td-label">optional extra, openly unproven</text>
          </g>
        ) : null}
        <text x="60" y="238" className="td-label">{["claim written down", "a fair test against a comparator", "the gap is smaller than what matters", "decide, and protect the patient"][s]}</text>
      </g>
    );
  }
  // position
  const tender = [10, 10, 5, 2][s];
  const angle = [0, 18, 34, 34][s];
  return (
    <g>
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "110px 170px", transition: ease }}>
        <line x1="110" y1="170" x2="300" y2="170" className="td-limb" />
        <circle cx="300" cy="170" r="12" className="td-bone td-bone-b" />
      </g>
      <circle cx="110" cy="170" r="14" className="td-bone" />
      <circle cx="190" cy="170" r="8" className="td-lesion" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "110px 170px", transition: ease }} />
      <rect x="390" y="40" width="26" height="170" rx="13" className="td-gauge" />
      <rect x="390" y={40 + 170 * (1 - tender / 10)} width="26" height={170 * (tender / 10) + 0.01} rx="13" className="td-gauge-fill td-gauge-hot" style={{ transition: "all 1s ease" }} />
      <text x="344" y="226" className="td-label">tender point {tender}/10</text>
      <text x="60" y="238" className="td-label">{["tender point found", "shorten into the position of ease", "hold ~ 90 s: tenderness falls", "slow return, recheck"][s]}</text>
    </g>
  );
}

/**
 * A 2D animated demonstration of what the hands do and what the tissue does in answer, in four steps. It plays by itself while it is on screen
 * (and never when the visitor asks for reduced motion), can be paused, stepped and tapped, and works without sound.
 */
export default function TechniqueDemo2D({ kind, title, captions, captionsUr }: { kind: DemoKind; title: string; captions?: Step[]; captionsUr?: Step[] }) {
  const [lang] = useLang();
  const own = lang === "ur" && captionsUr?.length ? captionsUr : captions?.length ? captions : null;
  /** This technique's own steps when given (the picture follows them in four phases), otherwise the generic four. */
  const steps = own ?? STEPS[kind];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const idx = Math.min(step, steps.length - 1);
  const scene = own ? Math.min(3, Math.floor((idx * 4) / steps.length)) : idx;

  useEffect(() => {
    setReduced(motionReduced());
    const node = box.current;
    if (!node || typeof IntersectionObserver === "undefined") return setVisible(true);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible || reduced) return;
    const id = window.setInterval(() => setStep((current) => (current + 1) % steps.length), TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, visible, reduced, steps.length]);

  const go = (next: number) => {
    setPlaying(false);
    setStep((next + steps.length) % steps.length);
  };

  return (
    <div ref={box} className="td" data-reduced={reduced ? "1" : "0"}>
      <svg viewBox="0 0 480 250" role="img" aria-label={`2D demonstration of ${title}: ${steps[idx].title}`} className="td-stage">
        <defs>
          <marker id="td-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2ee6d6" /></marker>
        </defs>
        <Scene kind={kind} s={scene} />
      </svg>
      <div className="td-caption" aria-live="polite">
        <strong>{idx + 1}. {steps[idx].title}</strong>
        <p>{steps[idx].detail}</p>
      </div>
      <div className="td-controls">
        <button type="button" onClick={() => go(idx - 1)} aria-label="Previous step"><SkipBack className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing}>{playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}</button>
        <button type="button" onClick={() => go(idx + 1)} aria-label="Next step"><SkipForward className="h-4 w-4" aria-hidden="true" /></button>
        <ol className="td-dots" aria-label="Steps">
          {steps.map((item, i) => (
            <li key={item.title}><button type="button" onClick={() => go(i)} aria-current={i === idx} aria-label={`Step ${i + 1}: ${item.title}`}>{i + 1}</button></li>
          ))}
        </ol>
      </div>
    </div>
  );
}
