import { ArrowRight, BookOpenCheck, Flame, Stethoscope, Trophy, Users } from "lucide-react";
import { TIERS } from "@/lib/student/league";
import { Ur } from "@/components/Ur";
import "./home-leagues.css";

/**
 * "Weekly Leagues" on the homepage, compact (2026-11): one glowing panel with the idea in a line, the seven tiers as a rising staircase,
 * the top of an example league in which "you" climb into the promotion zone, and the four steps of a week as one row. The board is an example (it says so); the real league is on /leagues.
 * Plain markup and CSS (no script, no data): GPU-only animation, and a finished picture for "reduce motion".
 */

type Row = { name: string; xp: number; r0: number; r1: number; me?: boolean; from?: number };

// The top four of an example league: "You" climb from 4th to 3rd, into the promotion zone.
const ROWS: Row[] = [
  { name: "Ayesha K.", xp: 640, r0: 0, r1: 0 },
  { name: "Hamza R.", xp: 585, r0: 1, r1: 1 },
  { name: "You", xp: 520, from: 400, r0: 3, r1: 2, me: true },
  { name: "Sana M.", xp: 470, r0: 2, r1: 3 },
];
const initials = (name: string) => (name === "You" ? "YOU" : name.replace(".", "").split(" ").map((p) => p[0]).join(""));

const STEPS = [
  { icon: BookOpenCheck, title: "Learn", text: "Lessons, Skills Lab, Virtual Patient and the Daily Challenge.", ur: { title: "Seekhein", text: "Lessons, Skills Lab, Virtual Patient aur Daily Challenge." } },
  { icon: Flame, title: "Earn XP", text: "Counted by the server from your own record. Nothing can be typed in.", ur: { title: "XP kamayein", text: "Server aap ke apne record se count karta hai. Kuch bhi manually type nahin kiya ja sakta." } },
  { icon: Users, title: "Meet your league", text: "Up to 30 students at your tier, Monday to Sunday.", ur: { title: "Apni league se milein", text: "Apne tier ke 30 tak students, Monday se Sunday." } },
  { icon: Trophy, title: "Climb on Sunday", text: "The top 30 % move up a tier. Reach Diamond.", ur: { title: "Itwaar ko upar chadhein", text: "Top 30 % students ek tier upar jate hain. Diamond tak pahunchein." } },
];

export function HomeLeagues() {
  return (
    <section data-pna-home-flagship="weekly-leagues-v1" className="lgx" aria-labelledby="pna-leagues-title">
      <div className="container-content">
        <div className="lgx-card lgx-compact nx-sky nx-grid">
          <div className="lgx-top">
            <div className="lgx-copy">
              <span className="lgx-badge"><Trophy className="h-3.5 w-3.5" aria-hidden="true" /> <Ur en="Compete · Free" ur="Muqabla · Free" /></span>
              <h2 id="pna-leagues-title"><Ur en="Weekly Leagues" ur="Haftawar Leagues" /> <span className="lgx-sub"><Ur en="Earn XP. Rise a tier. Reach Diamond." ur="XP kamayein. Tier mein aage barhein. Diamond tak pahunchein." /></span></h2>
              <p className="lgx-lead"><Ur en="Learn as usual, earn XP, and every Sunday the top of your league moves up a tier." ur="Aam tarah seekhein, XP kamayein, aur har itwaar league ke top students ek tier upar jate hain." /></p>
              <div className="lgx-cta">
                <a href="/leagues" className="nx-btn nx-btn-primary"><Ur en="Join a league" ur="League join karein" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="/leagues#how" className="nx-btn nx-btn-ghost"><Ur en="How it works" ur="Yeh kaise kaam karta hai" /></a>
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
            </ol>

            <div className="lgx-board" aria-hidden="true">
              <div className="lgx-board-top">
                <span className="lgx-live"><i /> <Ur en="EXAMPLE LEAGUE" ur="MISAL KI LEAGUE" /></span>
                <span className="lgx-week"><Stethoscope className="h-3.5 w-3.5" /> <Ur en="Gold · Week 12" ur="Gold · Hafta 12" /></span>
              </div>
              <div className="lgx-rows">
                <span className="lgx-zone lgx-zone-up" />
                <ol className="lgx-ranks">{ROWS.map((_, i) => <li key={i}>{i + 1}</li>)}</ol>
                {ROWS.map((row) => (
                  <div key={row.name} className="lgx-row" data-me={row.me ? "1" : undefined} data-move={row.r0 !== row.r1 ? "1" : undefined} style={{ ["--r0" as string]: row.r0, ["--r1" as string]: row.r1 }}>
                    <span className="lgx-av">{initials(row.name)}</span>
                    <span className="lgx-name">{row.name}<i className="lgx-bar" style={{ ["--w" as string]: `${Math.round((row.xp / 640) * 100)}%`, ["--w0" as string]: `${Math.round(((row.from ?? row.xp) / 640) * 100)}%` }} /></span>
                    <b className="lgx-xp">{row.from ? <span className="lgx-xp-from">{row.from}</span> : null}<span className={row.from ? "lgx-xp-to" : undefined}>{row.xp}</span> <small>XP</small></b>
                  </div>
                ))}
              </div>
              <div className="lgx-foot"><span className="lgx-lg-up">▲ <Ur en="Top 3 move up on Sunday" ur="Top 3 itwaar ko upar" /></span><span><Ur en="Example, not real students" ur="Misal hai, asal students nahin" /></span></div>
            </div>
          </div>

          <ol className="lgx-steps" aria-label="How a week works">
            {STEPS.map((step, i) => (
              <li key={step.title} title={step.text}>
                <span className="lgx-ico"><step.icon className="h-4 w-4" aria-hidden="true" /></span>
                <b>{i + 1}</b>
                <strong><Ur en={step.title} ur={step.ur.title} /></strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
