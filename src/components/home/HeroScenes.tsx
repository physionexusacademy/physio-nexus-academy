import type { CSSProperties } from "react";
import { TIERS } from "@/lib/student/league";

/**
 * The small animated "screens" shown in the homepage hero slideshow, one per feature.
 * Plain markup and SVG (no images, no JavaScript): they are drawn by the browser and only the
 * slide on screen animates (see home-hero.css). The text in them is sample text that mirrors the real feature.
 */

const ECG_UNIT = "l8 0 l4 -6 l5 12 l5 -26 l6 34 l5 -16 l5 6 l12 0";
const ECG_PATH = `M0 30 ${Array.from({ length: 8 }, () => ECG_UNIT).join(" ")}`;

/** PNA Teacher: a question, a tap, the answer (English / Roman Urdu), +XP. */
export function SceneTeacher() {
  return (
    <div className="sc sc-teacher" aria-hidden="true">
      <div className="sc-bar">
        <span className="sc-dots"><i /><i /><i /></span>
        <span className="sc-lang"><b className="sc-en">English</b><b className="sc-ur">Roman Urdu</b></span>
      </div>
      <p className="sc-bub sc-q"><em>PNA Teacher</em>In abduction, which way does the humeral head glide?</p>
      <div className="sc-opts"><span>Superior</span><span className="sc-pick">Inferior</span></div>
      <p className="sc-bub sc-a"><em>Sahi jawab ✓</em>Convex surface ulti taraf glide karti hai.<b className="sc-xp">+10 XP</b></p>
    </div>
  );
}

/** Clinical Skills Lab: a goniometer measuring shoulder flexion. */
export function SceneSkills() {
  return (
    <div className="sc sc-skills" aria-hidden="true">
      <svg viewBox="0 0 320 176" role="presentation">
        <g className="sc-ticks">
          {Array.from({ length: 13 }, (_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            const long = i % 2 === 0;
            return <line key={i} x1={118 + 62 * Math.cos(a)} y1={140 - 62 * Math.sin(a)} x2={118 + (long ? 76 : 71) * Math.cos(a)} y2={140 - (long ? 76 : 71) * Math.sin(a)} />;
          })}
        </g>
        <line className="sc-fixed" x1="118" y1="140" x2="248" y2="140" />
        <path className="sc-arc" d="M 168 140 A 50 50 0 0 0 74.7 115" pathLength="100" />
        <g className="sc-arm">
          <line x1="118" y1="140" x2="236" y2="140" />
          <circle cx="236" cy="140" r="6" />
        </g>
        <circle className="sc-pivot" cx="118" cy="140" r="7" />
      </svg>
      <div className="sc-readout"><span>Shoulder flexion</span><b className="sc-deg" /></div>
      <div className="sc-levels"><span className="on">Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span></div>
    </div>
  );
}

/** Virtual Patient: a 3D-style patient being scanned, with findings appearing, and a heartbeat line. */
export function SceneVirtual() {
  return (
    <div className="sc sc-virtual" aria-hidden="true">
      <svg className="sc-body" viewBox="0 0 120 150" role="presentation">
        <g className="sc-human">
          <circle cx="60" cy="18" r="11" />
          <path d="M44 38 Q60 30 76 38 L82 78 L74 80 L70 60 L70 104 L64 104 L60 82 L56 104 L50 104 L50 60 L46 80 L38 78 Z" />
          <path d="M50 104 L48 146 M70 104 L72 146" />
        </g>
        <circle className="sc-hot" cx="44" cy="42" r="5" />
        <circle className="sc-hot-ring" cx="44" cy="42" r="5" />
      </svg>
      <span className="sc-scan" />
      <div className="sc-finds">
        <span className="sc-find sc-f1">Pain 6/10</span>
        <span className="sc-find sc-f2">Abduction 85°</span>
        <span className="sc-find sc-f3">⚠ Red flag?</span>
      </div>
      <div className="sc-ecg"><svg viewBox="0 0 160 60" preserveAspectRatio="none" role="presentation"><path d={ECG_PATH} /></svg></div>
      <div className="sc-steps"><span>History</span><span>Examine</span><span>Diagnose</span><span className="sc-score">OSCE 87%</span></div>
    </div>
  );
}

/** RehabVerse: a guided home exercise (arm raise) with a progress ring. */
export function SceneRehab() {
  return (
    <div className="sc sc-rehab" aria-hidden="true">
      <svg viewBox="0 0 320 176" role="presentation">
        <circle className="sc-ring-bg" cx="78" cy="88" r="50" />
        <circle className="sc-ring" cx="78" cy="88" r="50" pathLength="100" />
        <g className="sc-ring-sweep"><circle cx="78" cy="38" r="4" /></g>
        <text x="78" y="86" textAnchor="middle" className="sc-ring-n">3/5</text>
        <text x="78" y="104" textAnchor="middle" className="sc-ring-t">today</text>
        <g className="sc-fig">
          <circle cx="228" cy="44" r="12" />
          <path d="M228 56 L228 108 M228 108 L212 152 M228 108 L244 152" />
          <path className="sc-ghost" d="M228 70 L284 70" />
          <g className="sc-fig-arm"><path d="M228 70 L284 70" /><circle cx="284" cy="70" r="4" /></g>
          <path d="M228 70 L172 96" />
        </g>
      </svg>
      <span className="sc-chip sc-chip-a">Shoulder abduction</span>
      <span className="sc-chip sc-chip-b">Set 2 of 3</span>
      <span className="sc-chip sc-chip-c">3D guide · English / Roman Urdu</span>
    </div>
  );
}

/** Manual Therapy: the convex-concave rule — the head rolls one way and glides the other. */
export function SceneManual() {
  return (
    <div className="sc sc-manual" aria-hidden="true">
      <svg viewBox="0 0 320 176" role="presentation">
        <path className="sc-cup" d="M118.7 77 A44 44 0 0 1 201.3 77" />
        <g className="sc-head">
          <circle cx="160" cy="92" r="34" />
          <circle className="sc-mark" cx="160" cy="58" r="4.5" />
          <path d="M160 92 L160 58" />
        </g>
        <g className="sc-arrow sc-roll"><path d="M214 44 L244 44 M236 36 L244 44 L236 52" /><text x="250" y="48">roll</text></g>
        <g className="sc-arrow sc-glide"><path d="M118 136 L88 136 M96 128 L88 136 L96 144" /><text x="42" y="140">glide</text></g>
      </svg>
      <p className="sc-cap">Convex on concave: glide opposite to the roll</p>
    </div>
  );
}

/** Daily Clinical Challenge: five questions on a glowing track, and a streak flame. */
export function SceneDaily() {
  return (
    <div className="sc sc-daily" aria-hidden="true">
      <div className="sc-track">
        <span className="sc-track-line"><i /></span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="sc-node" style={{ "--n": n } as CSSProperties}>Q{n}</span>
        ))}
      </div>
      <div className="sc-daily-row">
        <span className="sc-streak"><svg viewBox="0 0 24 24" role="presentation"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-10z" /></svg>Daily streak</span>
        <span className="sc-pill">5 questions</span>
        <span className="sc-pill sc-pill-xp">+XP</span>
      </div>
      <p className="sc-cap">A live leaderboard and monthly champions</p>
    </div>
  );
}

/** Conditions guide: tiles of real guides lighting up one by one. */
export function SceneConditions() {
  const tiles = ["Frozen shoulder", "ACL injury", "Tennis elbow", "Low back pain", "Plantar heel pain", "Stroke rehab"];
  return (
    <div className="sc sc-cond" aria-hidden="true">
      <div className="sc-cond-grid">
        {tiles.map((name, i) => (
          <span key={name} className="sc-tile" style={{ "--t": i } as CSSProperties}>{name}</span>
        ))}
      </div>
      <div className="sc-cond-row"><span className="sc-pill">Red flags</span><span className="sc-pill">First steps</span><span className="sc-pill">Evidence level</span></div>
    </div>
  );
}

/** Symptom checker: where is it, how long, what next. */
export function SceneSymptom() {
  return (
    <div className="sc sc-sym" aria-hidden="true">
      <svg className="sc-body" viewBox="0 0 120 150" role="presentation">
        <g className="sc-human">
          <circle cx="60" cy="18" r="11" />
          <path d="M44 38 Q60 30 76 38 L82 78 L74 80 L70 60 L70 104 L64 104 L60 82 L56 104 L50 104 L50 60 L46 80 L38 78 Z" />
          <path d="M50 104 L48 146 M70 104 L72 146" />
        </g>
        <circle className="sc-hot" cx="76" cy="45" r="6" />
        <circle className="sc-hot-ring" cx="76" cy="45" r="6" />
      </svg>
      <ol className="sc-sym-steps">
        <li className="sc-s1"><b>1</b> Where does it hurt?</li>
        <li className="sc-s2"><b>2</b> For how long?</li>
        <li className="sc-s3"><b>3</b> Your next step</li>
      </ol>
    </div>
  );
}

/** Leagues: the seven real tiers, from Bronze to Diamond. */
export function SceneLeagues() {
  return (
    <div className="sc sc-league" aria-hidden="true">
      <div className="sc-tiers">
        {TIERS.map((tier, i) => (
          <span key={tier.id} className="sc-tier" style={{ "--t": i, "--c": tier.colour } as CSSProperties}><i /><em>{tier.name}</em></span>
        ))}
      </div>
      <p className="sc-cap">XP from lessons, labs and daily challenges</p>
    </div>
  );
}
