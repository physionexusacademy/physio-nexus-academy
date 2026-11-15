import { ArrowRight, BookOpenCheck, Flame, Stethoscope, Trophy, Users } from "lucide-react";
import { TIERS } from "@/lib/student/league";
import "./home-leagues.css";

/**
 * "Weekly Leagues" on the homepage: a dark, glowing panel that shows what a league is at a glance: seven tiers, a league board in which
 * "you" climb into the promotion zone, and the four steps of a week. The board is an example (it says so); the real league is on /leagues.
 * Plain markup and CSS (no script, no data): GPU-only animation, and a finished picture for "reduce motion".
 */

type Row = { name: string; xp: number; r0: number; r1: number; me?: boolean; from?: number };

// Eight students: "You" climbs from 6th to 3rd; the ones passed move down one place each.
const ROWS: Row[] = [
  { name: "Ayesha K.", xp: 640, r0: 0, r1: 0 },
  { name: "Hamza R.", xp: 585, r0: 1, r1: 1 },
  { name: "You", xp: 520, from: 400, r0: 5, r1: 2, me: true },
  { name: "Sana M.", xp: 470, r0: 2, r1: 3 },
  { name: "Bilal A.", xp: 430, r0: 3, r1: 4 },
  { name: "Noor F.", xp: 395, r0: 4, r1: 5 },
  { name: "Usman T.", xp: 120, r0: 6, r1: 6 },
  { name: "Hira S.", xp: 60, r0: 7, r1: 7 },
];
const initials = (name: string) => (name === "You" ? "YOU" : name.replace(".", "").split(" ").map((p) => p[0]).join(""));

const STEPS = [
  { icon: BookOpenCheck, title: "Learn", text: "Lessons, Skills Lab, Virtual Patient and the Daily Challenge." },
  { icon: Flame, title: "Earn XP", text: "Counted by the server from your own record. Nothing can be typed in." },
  { icon: Users, title: "Meet your league", text: "Up to 30 students at your tier, Monday to Sunday." },
  { icon: Trophy, title: "Climb on Sunday", text: "The top 30 % move up a tier. Reach Diamond." },
];

export function HomeLeagues() {
  return (
    <section data-pna-home-flagship="weekly-leagues-v1" className="lgx" aria-labelledby="pna-leagues-title">
      <div className="container-content">
        <div className="lgx-card nx-sky nx-grid">
          <div className="lgx-top">
            <div className="lgx-copy">
              <span className="lgx-badge"><Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Compete · Free</span>
              <h2 id="pna-leagues-title">Weekly Leagues <span className="lgx-sub">Earn XP. Rise a tier. Reach Diamond.</span></h2>
              <p className="lgx-lead">Every week you join a league of students at your tier. Your XP comes from real learning, and on Sunday the top of each league moves up. Free, and it takes one tap to join.</p>
              <ul className="lgx-chips" aria-label="Where the XP comes from">
                <li>Lessons</li>
                <li>Skills Lab</li>
                <li>Virtual Patient</li>
                <li>Daily Challenge</li>
              </ul>
              <div className="lgx-cta">
                <a href="/leagues" className="nx-btn nx-btn-primary">Join a league <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="/leagues#how" className="nx-btn nx-btn-ghost">How it works</a>
              </div>
            </div>

            <div className="lgx-board" aria-hidden="true">
              <div className="lgx-board-top">
                <span className="lgx-live"><i /> EXAMPLE LEAGUE</span>
                <span className="lgx-week"><Stethoscope className="h-3.5 w-3.5" /> Gold · Week 12</span>
              </div>
              <div className="lgx-rows">
                <span className="lgx-zone lgx-zone-up" />
                <span className="lgx-zone lgx-zone-down" />
                <ol className="lgx-ranks">{ROWS.map((_, i) => <li key={i}>{i + 1}</li>)}</ol>
                {ROWS.map((row) => (
                  <div key={row.name} className="lgx-row" data-me={row.me ? "1" : undefined} data-move={row.r0 !== row.r1 ? "1" : undefined} style={{ ["--r0" as string]: row.r0, ["--r1" as string]: row.r1 }}>
                    <span className="lgx-av">{initials(row.name)}</span>
                    <span className="lgx-name">{row.name}<i className="lgx-bar" style={{ ["--w" as string]: `${Math.round((row.xp / 640) * 100)}%`, ["--w0" as string]: `${Math.round(((row.from ?? row.xp) / 640) * 100)}%` }} /></span>
                    <b className="lgx-xp">{row.from ? <span className="lgx-xp-from">{row.from}</span> : null}<span className={row.from ? "lgx-xp-to" : undefined}>{row.xp}</span> <small>XP</small></b>
                  </div>
                ))}
              </div>
              <span className="lgx-pop">+120 XP</span>
              <span className="lgx-gain">▲ In the promotion zone</span>
              <div className="lgx-legend"><span className="lgx-lg-up">▲ Promotion zone · top 30 %</span><span className="lgx-lg-down">▼ Demotion zone · bottom 20 %</span></div>
              <div className="lgx-foot"><span>Week ends Sunday midnight · Pakistan time</span><span>Example, not real students</span></div>
            </div>
          </div>

          <ol className="lgx-ladder" aria-label="The seven tiers">
            {TIERS.map((tier) => (
              <li key={tier.id} style={{ ["--c" as string]: tier.colour, ["--g" as string]: tier.glow }}>
                <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                  <path d="M50 6 88 28v44L50 94 12 72V28Z" />
                  <path d="M50 20 76 35v30L50 80 24 65V35Z" className="lgx-inner" />
                  <text x="50" y="62" textAnchor="middle">{tier.id}</text>
                </svg>
                <span>{tier.name}</span>
              </li>
            ))}
            <span className="lgx-climb" aria-hidden="true" />
          </ol>

          <ol className="lgx-steps" aria-label="How a week works">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="lgx-ico"><step.icon className="h-5 w-5" aria-hidden="true" /></span>
                <b>{i + 1}</b>
                <strong>{step.title}</strong>
                <small>{step.text}</small>
              </li>
            ))}
          </ol>
          <p className="lgx-fine">Leagues are a learning game, not an exam or a certificate. XP is capped per activity and at 800 XP a day.</p>
        </div>
      </div>
    </section>
  );
}
