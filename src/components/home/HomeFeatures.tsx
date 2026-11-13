import { ArrowRight, BookOpen, Flame, GraduationCap, Hand, Languages, Ruler, Sparkles, Stethoscope, Trophy } from "lucide-react";
import { lessonIndex, manualLessonMetas } from "@/lib/teacher/lesson-index";
import { BOOKS } from "@/lib/books";
import { VP_CASE_COUNT } from "@/lib/virtual-patient/links";
import "./home-features.css";
import "./home-flagships.css";

/**
 * "What you'll find here" — the seven things PNA does best, one card each, so a first-time visitor
 * understands the whole academy in one screen. Server-rendered, no JavaScript. Every card is one link.
 * The small previews are built from plain markup (no extra images to load) and match the real screens.
 */
export function HomeFeatures() {
  return (
    <section id="features" className="hf" aria-labelledby="hf-title">
      <div className="container-content">
        <p className="nx-kicker nx-kicker-light">What you will find here</p>
        <h2 id="hf-title" className="nx-title mt-2 text-3xl text-navy-800 sm:text-4xl">Seven ways to learn, practise and recover</h2>
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
                <div className="hx-levels"><span className="on">Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span></div>
              </div>
              <div className="hx-body">
                <span className="hx-badge"><Ruler className="h-3.5 w-3.5" aria-hidden="true" /> Practise · Free</span>
                <h3>Clinical Skills Lab</h3>
                <p className="hx-tag">Measure, test and examine like a clinician.</p>
                <ul className="hx-ticks">
                  <li>Muscle testing, goniometry, neuro exam, balance</li>
                  <li>3D demonstrations of every technique</li>
                  <li>Four levels, level tests and OSCE stations</li>
                </ul>
                <span className="hx-meta">Beginner to expert</span>
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

          <li className="hf-card hf-rv" data-pna-home-feature="rehabverse-v1">
            <div className="hf-media hf-media-photo">
              <img src="/images/rehabverse-guide.webp" width={800} height={500} loading="lazy" decoding="async" alt="The PNA virtual physio guide demonstrating a bird-dog exercise in 3D" />
            </div>
            <div className="hf-body">
              <span className="hf-tag hf-tag-new"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> New · for patients</span>
              <h3>PNA RehabVerse — <span className="hf-h3-sub">Guided rehab at home, with a 3D physio guide</span></h3>
              <p>A physiotherapist-approved exercise programme made for you. Every exercise is shown in 3D, in English or Roman Urdu — <i>ghar par rehab, step by step.</i></p>
              <ol className="hf-rv-steps" aria-label="How RehabVerse works">
                <li><b>1</b> Create your account</li>
                <li><b>2</b> Answer a few safety questions</li>
                <li><b>3</b> Your physio builds your programme</li>
                <li><b>4</b> Follow it day by day in 3D</li>
              </ol>
              <div className="hf-rv-cta">
                <a href="/rehabverse/register" className="nx-btn nx-btn-primary">Create your account <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="/rehabverse/login" className="nx-btn nx-btn-light">I already have an account</a>
                <a href="/rehabverse/library" className="hf-text-link">Browse the 3D exercise library</a>
              </div>
              <p className="hf-fine">Virtual guide — not a real clinician. Your physiotherapist reviews and approves everything. Not for emergencies.</p>
            </div>
          </li>

          <li className="hf-card hf-mt">
            <a href="/manual-therapy" className="hf-link" aria-label="Manual Therapy — techniques with hand placement and safety">
              <div className="hf-media hf-media-photo">
                <img src="/images/pathway-features/manual-therapy.webp" width={384} height={192} loading="lazy" decoding="async" alt="" />
              </div>
              <div className="hf-body">
                <span className="hf-tag">Free</span>
                <h3>Manual Therapy</h3>
                <p>{manualLessonMetas.length} techniques with hand placement, dosage, contraindications and safety — explained for students and physiotherapists.</p>
                <span className="hf-go"><Hand className="h-4 w-4" aria-hidden="true" /> Explore techniques <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hf-daily">
            <a href="/daily-challenge#play-daily" className="hf-link" aria-label="Daily Clinical Challenge — five questions every day">
              <div className="hf-media hf-media-photo">
                <img src="/images/pathway-features/daily-challenge.webp" width={384} height={192} loading="lazy" decoding="async" alt="" />
              </div>
              <div className="hf-body">
                <span className="hf-tag"><Flame className="h-3.5 w-3.5" aria-hidden="true" /> Every day</span>
                <h3>Daily Clinical Challenge</h3>
                <p>Five quick clinical questions a day. Score points, learn from every explanation and climb the public leaderboard.</p>
                <span className="hf-go"><Trophy className="h-4 w-4" aria-hidden="true" /> Take today&apos;s challenge <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hf-books">
            <a href="#books" className="hf-link" aria-label="Books by Dr. Sajjad Raza PT — see all books">
              <div className="hf-media hf-media-photo">
                <img src="/images/pathway-features/books-resources.webp" width={384} height={192} loading="lazy" decoding="async" alt="" />
              </div>
              <div className="hf-body">
                <span className="hf-tag">Order online</span>
                <h3>Physiotherapy Books</h3>
                <p>All {BOOKS.length} printed books by Dr. Sajjad Raza PT — manual therapy, rehabilitation and clinical cases. Delivered to your door.</p>
                <span className="hf-go"><BookOpen className="h-4 w-4" aria-hidden="true" /> See all books <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>
        </ul>

        <p className="hf-foot">
          <Languages className="h-4 w-4" aria-hidden="true" /> Everything is in English and Roman Urdu.
          <a href="#explore-pna">Looking for something else? Browse by who you are</a>
          <a href="/symptom-checker"><Stethoscope className="h-4 w-4" aria-hidden="true" /> Not sure what is wrong? Try the symptom checker</a>
        </p>
      </div>
    </section>
  );
}
