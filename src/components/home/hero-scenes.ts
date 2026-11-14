import { TIERS } from "@/lib/student/league";

/**
 * The small animated "screens" shown in the homepage hero slideshow, one per feature, as ready-made HTML strings.
 *
 * Why strings and not React components: the slideshow is large (nine cards, about 450 elements). As React elements it would be
 * sent to the browser a second time in the page's React data and walked again when the page starts up, which measurably delayed
 * the page (Lighthouse blocking time on the live site, 80 ms to about 345 ms). As one HTML string it is parsed by the browser
 * once and React never looks inside it. Everything here is trusted constant text (no visitor input), so nothing is escaped.
 *
 * Plain markup and SVG only (no images). Only the card on screen animates (see home-hero.css). The words in the screens are sample
 * text that mirrors the real feature.
 */

const ECG_UNIT = "l8 0 l4 -6 l5 12 l5 -26 l6 34 l5 -16 l5 2 l12 0";
const ECG_PATH = `M0 30 ${Array.from({ length: 8 }, () => ECG_UNIT).join(" ")}`;
const n = (value: number) => Math.round(value * 10) / 10;

const HUMAN = `<g class="sc-human"><circle cx="60" cy="18" r="11"/><path d="M44 38 Q60 30 76 38 L82 78 L74 80 L70 60 L70 104 L64 104 L60 82 L56 104 L50 104 L50 60 L46 80 L38 78 Z"/><path d="M50 104 L48 146 M70 104 L72 146"/></g>`;

/** PNA Teacher: a question, a tap, the answer (English / Roman Urdu), +XP. */
export const sceneTeacher = () =>
  `<div class="sc sc-teacher" aria-hidden="true"><div class="sc-bar"><span class="sc-dots"><i></i><i></i><i></i></span><span class="sc-lang"><b class="sc-en">English</b><b class="sc-ur">Roman Urdu</b></span></div><p class="sc-bub sc-q"><em>PNA Teacher</em>In abduction, which way does the humeral head glide?</p><div class="sc-opts"><span>Superior</span><span class="sc-pick">Inferior</span></div><p class="sc-bub sc-a"><em>Sahi jawab ✓</em>Convex surface ulti taraf glide karti hai.<b class="sc-xp">+10 XP</b></p></div>`;

/** Clinical Skills Lab: a goniometer measuring shoulder flexion. */
export const sceneSkills = () => {
  const ticks = Array.from({ length: 13 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const long = i % 2 === 0;
    const reach = long ? 76 : 71;
    return `<line x1="${n(118 + 62 * Math.cos(a))}" y1="${n(140 - 62 * Math.sin(a))}" x2="${n(118 + reach * Math.cos(a))}" y2="${n(140 - reach * Math.sin(a))}"/>`;
  }).join("");
  return `<div class="sc sc-skills" aria-hidden="true"><svg viewBox="0 0 320 176" role="presentation"><g class="sc-ticks">${ticks}</g><line class="sc-fixed" x1="118" y1="140" x2="248" y2="140"/><path class="sc-arc" d="M 168 140 A 50 50 0 0 0 74.7 115" pathLength="100"/><g class="sc-arm"><line x1="118" y1="140" x2="236" y2="140"/><circle cx="236" cy="140" r="6"/></g><circle class="sc-pivot" cx="118" cy="140" r="7"/></svg><div class="sc-readout"><span>Shoulder flexion</span><b class="sc-deg"></b></div><div class="sc-levels"><span class="on">Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span></div></div>`;
};

/** Virtual Patient: a 3D-style patient being scanned, with findings appearing, and a heartbeat line. */
export const sceneVirtual = () =>
  `<div class="sc sc-virtual" aria-hidden="true"><svg class="sc-body" viewBox="0 0 120 150" role="presentation">${HUMAN}<circle class="sc-hot" cx="44" cy="42" r="5"/><circle class="sc-hot-ring" cx="44" cy="42" r="5"/></svg><span class="sc-scan"></span><div class="sc-finds"><span class="sc-find sc-f1">Pain 6/10</span><span class="sc-find sc-f2">Abduction 85°</span><span class="sc-find sc-f3">⚠ Red flag?</span></div><div class="sc-ecg"><svg viewBox="0 0 160 60" preserveAspectRatio="none" role="presentation"><path d="${ECG_PATH}"/></svg></div><div class="sc-steps"><span>History</span><span>Examine</span><span>Diagnose</span><span class="sc-score">OSCE 87%</span></div></div>`;

/** RehabVerse: a guided home exercise (arm raise) with a progress ring. */
export const sceneRehab = () =>
  `<div class="sc sc-rehab" aria-hidden="true"><svg viewBox="0 0 320 176" role="presentation"><circle class="sc-ring-bg" cx="78" cy="88" r="50"/><circle class="sc-ring" cx="78" cy="88" r="50" pathLength="100"/><g class="sc-ring-sweep"><circle cx="78" cy="38" r="4"/></g><text x="78" y="86" text-anchor="middle" class="sc-ring-n">3/5</text><text x="78" y="104" text-anchor="middle" class="sc-ring-t">today</text><g class="sc-fig"><circle cx="228" cy="44" r="12"/><path d="M228 56 L228 108 M228 108 L212 152 M228 108 L244 152"/><path class="sc-ghost" d="M228 70 L284 70"/><g class="sc-fig-arm"><path d="M228 70 L284 70"/><circle cx="284" cy="70" r="4"/></g><path d="M228 70 L172 96"/></g></svg><span class="sc-chip sc-chip-a">Shoulder abduction</span><span class="sc-chip sc-chip-b">Set 2 of 3</span><span class="sc-chip sc-chip-c">3D guide · English / Roman Urdu</span></div>`;

/** Manual Therapy: the convex-concave rule — the head rolls one way and glides the other. */
export const sceneManual = () =>
  `<div class="sc sc-manual" aria-hidden="true"><svg viewBox="0 0 320 176" role="presentation"><path class="sc-cup" d="M118.7 77 A44 44 0 0 1 201.3 77"/><g class="sc-head"><circle cx="160" cy="92" r="34"/><circle class="sc-mark" cx="160" cy="58" r="4.5"/><path d="M160 92 L160 58"/></g><g class="sc-arrow sc-roll"><path d="M214 44 L244 44 M236 36 L244 44 L236 52"/><text x="250" y="48">roll</text></g><g class="sc-arrow sc-glide"><path d="M118 136 L88 136 M96 128 L88 136 L96 144"/><text x="42" y="140">glide</text></g></svg><p class="sc-cap">Convex on concave: glide opposite to the roll</p></div>`;

/** Daily Clinical Challenge: five questions on a glowing track, and a streak flame. */
export const sceneDaily = () =>
  `<div class="sc sc-daily" aria-hidden="true"><div class="sc-track"><span class="sc-track-line"><i></i></span>${[1, 2, 3, 4, 5].map((q) => `<span class="sc-node" style="--n:${q}">Q${q}</span>`).join("")}</div><div class="sc-daily-row"><span class="sc-streak"><svg viewBox="0 0 24 24" role="presentation"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-10z"/></svg>Daily streak</span><span class="sc-pill">5 questions</span><span class="sc-pill sc-pill-xp">+XP</span></div><p class="sc-cap">A live leaderboard and monthly champions</p></div>`;

/** Conditions guide: tiles of real guides lighting up one by one. */
export const sceneConditions = () => {
  const tiles = ["Frozen shoulder", "ACL injury", "Tennis elbow", "Low back pain", "Plantar heel pain", "Stroke rehab"];
  return `<div class="sc sc-cond" aria-hidden="true"><div class="sc-cond-grid">${tiles.map((name, i) => `<span class="sc-tile" style="--t:${i}">${name}</span>`).join("")}</div><div class="sc-cond-row"><span class="sc-pill">Red flags</span><span class="sc-pill">First steps</span><span class="sc-pill">Evidence level</span></div></div>`;
};

/** Symptom checker: where is it, how long, what next. */
export const sceneSymptom = () =>
  `<div class="sc sc-sym" aria-hidden="true"><svg class="sc-body" viewBox="0 0 120 150" role="presentation">${HUMAN}<circle class="sc-hot" cx="76" cy="45" r="6"/><circle class="sc-hot-ring" cx="76" cy="45" r="6"/></svg><ol class="sc-sym-steps"><li class="sc-s1"><b>1</b> Where does it hurt?</li><li class="sc-s2"><b>2</b> For how long?</li><li class="sc-s3"><b>3</b> Your next step</li></ol></div>`;

/** Leagues: the seven real tiers, from Bronze to Diamond. */
export const sceneLeagues = () =>
  `<div class="sc sc-league" aria-hidden="true"><div class="sc-tiers">${TIERS.map((tier, i) => `<span class="sc-tier" style="--t:${i};--c:${tier.colour}"><em>${tier.name}</em></span>`).join("")}</div><p class="sc-cap">XP from lessons, labs and daily challenges</p></div>`;
