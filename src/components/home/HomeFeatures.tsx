import { ArrowRight, ClipboardCheck, GraduationCap, Hand, Languages, Play, Ruler, ShieldCheck, Sparkles, Stethoscope, UserPlus } from "lucide-react";
import { lessonIndex, manualLessonMetas } from "@/lib/teacher/lesson-index";
import { VP_CASE_COUNT } from "@/lib/virtual-patient/links";
import "./home-features.css";
import "./home-flagships.css";
import "./home-rehabverse.css";

/**
 * "What you'll find here" — the things PNA does best, one card each, so a first-time visitor
 * understands the academy in one screen. Server-rendered, no JavaScript. Every card is one link.
 * The small previews are built from plain markup (no extra images to load) and match the real screens.
 */
export function HomeFeatures() {
  return (
    <section id="features" className="hf" aria-labelledby="hf-title">
      <div className="container-content">
        <p className="nx-kicker nx-kicker-light">What you will find here</p>
        <h2 id="hf-title" className="nx-title mt-2 text-3xl text-navy-800 sm:text-4xl">Learn, practise and recover</h2>
        <p className="hf-lead">New here? Pick one. A good first week: learn a concept in <b>PNA Teacher</b>, practise it in the <b>Skills Lab</b> or on the <b>Virtual Patient</b>, then test yourself in the <b>Daily Challenge</b>.</p>

        <ul className="hf-grid">
          <li className="hf-card hx hx-teacher">
            <a href="/learn" className="hx-link" aria-label="PNA Teacher — free step-by-step lessons">
              <div className="hx-stage" aria-hidden="true">
                <div className="hx-bar">
                  <span className="hx-dots"><i /><i /><i /></span>
                  <span className="hx-lang"><b className="hx-lang-en">English</b><b className="hx-lang-ur">Roman Urdu</b></span>
                </div>
                <p className="hx-bubble hx-t-q"><em>PNA Teacher</em>In abduction, which way does the humeral head glide?</p>
                <div className="hx-opts"><span>Superior</span><span className="hx-t-pick">Inferior</span></div>
                <p className="hx-bubble hx-t-ans"><em>Sahi jawab ✓</em>Convex surface ulti taraf glide karti hai — isi liye inferior.<b className="hx-xp">+10 XP</b></p>
              </div>
              <div className="hx-body">
                <span className="hx-badge"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Learn · Free</span>
                <h3>PNA Teacher</h3>
                <p className="hx-tag">Hard concepts, explained like a great teacher would.</p>
                <ul className="hx-ticks">
                  <li>One idea at a time, about 10 minutes</li>
                  <li>English or Roman Urdu — switch anytime</li>
                  <li>Quick checks, flashcards, spaced review</li>
                </ul>
                <span className="hx-meta">{lessonIndex.length} lessons · {manualLessonMetas.length} technique lessons</span>
                <span className="hx-go">Start learning <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hx hx-skills">
            <a href="/skills" className="hx-link" aria-label="Clinical Skills Lab — practise assessment skills">
              <div className="hx-stage" aria-hidden="true">
                <svg className="hx-gonio" viewBox="0 0 220 140" role="presentation">
                  <defs>
                    <linearGradient id="hxg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2ee6d6" /><stop offset="1" stopColor="#8f7cff" /></linearGradient>
                  </defs>
                  <g className="hx-ticks-ring">
                    {Array.from({ length: 13 }, (_, i) => {
                      const a = (i * 15 * Math.PI) / 180;
                      return <line key={i} x1={70 + 46 * Math.cos(a)} y1={110 - 46 * Math.sin(a)} x2={70 + (i % 2 ? 50 : 54) * Math.cos(a)} y2={110 - (i % 2 ? 50 : 54) * Math.sin(a)} />;
                    })}
                  </g>
                  <line className="hx-arm-fixed" x1="70" y1="110" x2="190" y2="110" />
                  <circle className="hx-arc" cx="70" cy="110" r="34" />
                  <g className="hx-arm-move"><line x1="70" y1="110" x2="170" y2="110" /><circle cx="170" cy="110" r="5" /></g>
                  <circle className="hx-pivot" cx="70" cy="110" r="6" />
                </svg>
                <div className="hx-readout"><span>Shoulder flexion</span><b className="hx-deg" /></div>
                <div className="hx-levels"><span className="on">MMT</span><span>Goniometry</span><span>Neuro</span><span>OSCE</span></div>
              </div>
              <div className="hx-body">
                <span className="hx-badge"><Ruler className="h-3.5 w-3.5" aria-hidden="true" /> Practise · Free</span>
                <h3>Clinical Skills Lab</h3>
                <p className="hx-tag">Measure, test and examine like a clinician.</p>
                <ul className="hx-ticks">
                  <li>Muscle testing, goniometry, neuro exam, balance</li>
                  <li>3D demonstrations of every technique</li>
                  <li>Skill tests and OSCE stations, taught at expert depth</li>
                </ul>
                <span className="hx-meta">Expert depth · free</span>
                <span className="hx-go">Open the Skills Lab <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hx hx-vp">
            <a href="/virtual-patient" className="hx-link" aria-label="Virtual Patient — examine a 3D patient">
              <div className="hx-stage" aria-hidden="true">
                <svg className="hx-body-svg" viewBox="0 0 120 150" role="presentation">
                  <g className="hx-human">
                    <circle cx="60" cy="18" r="11" />
                    <path d="M44 38 Q60 30 76 38 L82 78 L74 80 L70 60 L70 104 L64 104 L60 82 L56 104 L50 104 L50 60 L46 80 L38 78 Z" />
                    <path d="M50 104 L48 146 M70 104 L72 146" />
                  </g>
                  <circle className="hx-hot" cx="44" cy="42" r="5" />
                  <circle className="hx-hot-ring" cx="44" cy="42" r="5" />
                </svg>
                <span className="hx-scan" />
                <span className="hx-chip hx-chip-a">Pain 6/10</span>
                <span className="hx-chip hx-chip-b">Abduction 85°</span>
                <span className="hx-chip hx-chip-c">⚠ Red flag?</span>
                <div className="hx-vsteps"><span>History</span><span>Examine</span><span>Diagnose</span><span className="score">OSCE 87%</span></div>
              </div>
              <div className="hx-body">
                <span className="hx-badge"><Stethoscope className="h-3.5 w-3.5" aria-hidden="true" /> Examine · Free</span>
                <h3>Virtual Patient</h3>
                <p className="hx-tag">A 3D patient. A hidden diagnosis. Your move.</p>
                <ul className="hx-ticks">
                  <li>Take the history, then examine in 3D</li>
                  <li>Find the diagnosis — red flags included</li>
                  <li>Get an OSCE-style score and feedback</li>
                </ul>
                <span className="hx-meta">{VP_CASE_COUNT} patients · guided or timed OSCE</span>
                <span className="hx-go">Meet a patient <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hf-rv rvx" data-pna-home-feature="rehabverse-v1">
            <div className="rvx-top">
              <div className="rvx-copy">
                <span className="rvx-badge"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> New · for patients</span>
                <h3>PNA RehabVerse <span className="rvx-sub">Guided rehab at home, with a 3D physio guide</span></h3>
                <p className="rvx-lead">Your physiotherapist builds your exercise programme. A 3D guide then shows and tells you every exercise, step by step, in English or Roman Urdu — <i>ghar par rehab, bilkul saaf.</i></p>
                <ul className="rvx-chips" aria-label="What you get">
                  <li>3D demo of every exercise</li>
                  <li>Voice in English + Roman Urdu</li>
                  <li>Safety check first</li>
                  <li>Progress and reminders</li>
                </ul>
                <div className="rvx-cta">
                  <a href="/rehabverse/register" className="nx-btn nx-btn-primary">Create your account <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                  <a href="/rehabverse/login" className="nx-btn nx-btn-light">I already have an account</a>
                </div>
                <a href="/rehabverse/library" className="rvx-link">Browse the 3D exercise library <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>

              <div className="rvx-stage" aria-hidden="true">
                <div className="rvx-floor" />
                <span className="rvx-scan" />
                <div className="rvx-hud rvx-hud-live"><i /> PNA GUIDE · LIVE 3D</div>
                <div className="rvx-hud rvx-hud-lang"><b>English</b><b>Roman Urdu</b></div>
                <svg className="rvx-fig" viewBox="0 0 400 240" role="presentation" focusable="false">
                  <defs>
                    <linearGradient id="rvxg" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="320" y2="0"><stop offset="0" stopColor="#2ee6d6" /><stop offset="1" stopColor="#8f7cff" /></linearGradient>
                  </defs>
                  <rect className="rvx-mat" x="36" y="198" width="330" height="9" rx="4.5" />
                  <g className="rvx-limbs-far">
                    <line x1="226" y1="114" x2="230" y2="196" />
                    <path d="M146 128 L146 188 L84 192" />
                  </g>
                  <g className="rvx-glow">
                    <path className="rvx-trunk" d="M142 126 Q190 108 236 112" />
                    <g className="rvx-arm"><line x1="240" y1="114" x2="240" y2="200" /><circle cx="240" cy="202" r="4" /></g>
                    <g className="rvx-leg">
                      <line x1="136" y1="128" x2="136" y2="188" />
                      <g className="rvx-shin"><line x1="136" y1="188" x2="74" y2="192" /><circle cx="72" cy="192" r="4" /></g>
                      <circle className="rvx-knee" cx="136" cy="188" r="4" />
                    </g>
                  </g>
                  <circle className="rvx-joint" cx="142" cy="126" r="7" />
                  <circle className="rvx-joint" cx="236" cy="112" r="7" />
                  <circle className="rvx-head" cx="266" cy="93" r="13" />
                  <path className="rvx-neck" d="M240 110 L257 100" />
                  <line className="rvx-level" x1="40" y1="118" x2="360" y2="118" />
                </svg>
                <span className="rvx-chip rvx-chip-a">Breathe out</span>
                <span className="rvx-chip rvx-chip-b">Hips level ✓</span>
                <span className="rvx-chip rvx-chip-c">Rep 6 / 10</span>
                <div className="rvx-sub-bar">
                  <em>Guide</em>
                  <span className="rvx-line-en">Reach one arm forward and the opposite leg back.</span>
                  <span className="rvx-line-ur">Ek bazu aage aur ulti taang peeche barhayein.</span>
                </div>
              </div>
            </div>

            <ol className="rvx-flow" aria-label="How RehabVerse works">
              <li><span className="rvx-ico"><UserPlus className="h-5 w-5" aria-hidden="true" /></span><b>1</b><strong>Create your account</strong><small>Free, takes a minute</small></li>
              <li><span className="rvx-ico"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><b>2</b><strong>Answer a few safety questions</strong><small>So your plan is safe for you</small></li>
              <li><span className="rvx-ico"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /></span><b>3</b><strong>Your physio builds your programme</strong><small>Reviewed and approved</small></li>
              <li><span className="rvx-ico"><Play className="h-5 w-5" aria-hidden="true" /></span><b>4</b><strong>Follow it day by day in 3D</strong><small>Watch, listen, do, track</small></li>
            </ol>
            <p className="rvx-fine">Virtual guide — not a real clinician. Your physiotherapist reviews and approves everything. Not for emergencies.</p>
          </li>
        </ul>

        <p className="hf-foot">
          <Languages className="h-4 w-4" aria-hidden="true" /> Everything is in English and Roman Urdu.
          <a href="/manual-therapy"><Hand className="h-4 w-4" aria-hidden="true" /> Manual therapy techniques</a>
          <a href="#explore-pna">Looking for something else? Browse by who you are</a>
          <a href="/symptom-checker"><Stethoscope className="h-4 w-4" aria-hidden="true" /> Not sure what is wrong? Try the symptom checker</a>
        </p>
      </div>
    </section>
  );
}
