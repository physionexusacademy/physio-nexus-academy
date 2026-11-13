import { ArrowRight, BookOpen, Flame, GraduationCap, Hand, Languages, Ruler, Sparkles, Stethoscope, Trophy } from "lucide-react";
import { lessonIndex, manualLessonMetas } from "@/lib/teacher/lesson-index";
import { BOOKS } from "@/lib/books";
import "./home-features.css";

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
          <li className="hf-card hf-teacher">
            <a href="/learn" className="hf-link" aria-label="PNA Teacher — free step-by-step lessons">
              <div className="hf-media" aria-hidden="true">
                <div className="hf-chat">
                  <span className="hf-chat-label"><GraduationCap className="h-3.5 w-3.5" /> Today&apos;s concept</span>
                  <strong>The Convex–Concave Rule</strong>
                  <span className="hf-chat-line">Stop memorising roll and glide. See it once…</span>
                </div>
                <div className="hf-pills"><span className="hf-pill hf-pill-on">English</span><span className="hf-pill">Roman Urdu</span></div>
              </div>
              <div className="hf-body">
                <span className="hf-tag">Free</span>
                <h3>PNA Teacher</h3>
                <p>Hard concepts explained one small step at a time, with quick checks and flashcards — in English or Roman Urdu.</p>
                <span className="hf-meta">{lessonIndex.length} lessons · {manualLessonMetas.length} technique lessons</span>
                <span className="hf-go">Start learning <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hf-skills">
            <a href="/skills" className="hf-link" aria-label="Clinical Skills Lab — practise assessment skills">
              <div className="hf-media" aria-hidden="true">
                <div className="hf-levels">
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((level, i) => (
                    <span key={level} className={"hf-level" + (i === 0 ? " hf-level-on" : "")}><Ruler className="h-3.5 w-3.5" /> {level}</span>
                  ))}
                </div>
                <span className="hf-stat">39 joint motions · 3D demonstrations</span>
              </div>
              <div className="hf-body">
                <span className="hf-tag">Free</span>
                <h3>Clinical Skills Lab</h3>
                <p>Practise manual muscle testing, goniometry, neuro exam and more — with 3D demonstrations, quizzes and OSCE stations.</p>
                <span className="hf-meta">Beginner to expert levels</span>
                <span className="hf-go">Open the Skills Lab <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </a>
          </li>

          <li className="hf-card hf-vp">
            <a href="/virtual-patient" className="hf-link" aria-label="Virtual Patient — examine a 3D patient">
              <div className="hf-media" aria-hidden="true">
                <div className="hf-patient">
                  <span className="hf-patient-top"><span>Beginner</span><span>Shoulder</span></span>
                  <strong>Saleem Akhtar, 54</strong>
                  <span className="hf-chat-line">School teacher with a stiff, painful left shoulder…</span>
                </div>
                <div className="hf-steps"><span>1 History</span><span>2 Examine</span><span>3 Diagnose</span><span>OSCE score</span></div>
              </div>
              <div className="hf-body">
                <span className="hf-tag">Free</span>
                <h3>Virtual Patient</h3>
                <p>Examine a 3D patient like a real one, find the hidden diagnosis — red flags included — and get an OSCE-style score.</p>
                <span className="hf-meta">3D patient · hidden diagnosis</span>
                <span className="hf-go">Meet a patient <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
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
