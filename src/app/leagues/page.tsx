import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { LeagueGate } from "@/components/student/LeagueGate";
import { TIERS } from "@/lib/student/league";
import "./leagues.css";

const url = "https://physionexusacademy.com/leagues";

export const metadata: Metadata = {
  title: "Weekly Physiotherapy Leagues — Earn XP, Rise a Tier",
  description: "Join free weekly physiotherapy leagues: earn XP from lessons, Skills Lab and the Daily Challenge, climb seven tiers from Bronze to Diamond.",
  alternates: { canonical: url },
  openGraph: { title: "Weekly Physiotherapy Leagues — Earn XP, Rise a Tier | PNA", description: "Join free weekly physiotherapy leagues: earn XP from lessons, Skills Lab and the Daily Challenge, climb seven tiers from Bronze to Diamond.", url, siteName: "Physio Nexus Academy", type: "website" },
};

const steps = [
  { title: "Learn to earn XP", text: "Lessons, skill levels, virtual patients and the Daily Clinical Challenge all add XP to your private record." },
  { title: "Meet your league", text: "Each week you join up to 30 students at your tier. Scores are counted on the server from your saved record — nothing can be typed in." },
  { title: "Climb on Sunday", text: "The top 30 % (with at least 100 XP) move up a tier; the bottom 20 % move down. Weeks run Monday to Sunday, Pakistan time." },
  { title: "Keep your edge", text: "Reach Diamond and stay there. Your best tier and every past week stay in your record." },
];

export default function LeaguesPage() {
  return (
    <main className="lgp">
      <section className="lgp-hero nx-sky nx-grid">
        <div className="container-content">
          <p className="lgp-kicker"><Trophy className="h-4 w-4" aria-hidden="true" /> Weekly leagues · free</p>
          <h1>Learn more. Rise a tier.</h1>
          <p className="lgp-lead">Every week you compete with other physiotherapy students for XP earned by actually learning — then the top of each league moves up to the next tier.</p>
          <ul className="lgp-tiers" aria-label="The seven tiers">
            {TIERS.map((tier) => <li key={tier.id} style={{ ["--c" as string]: tier.colour }}><i aria-hidden="true" />{tier.name}</li>)}
          </ul>
        </div>
      </section>
      <div className="container-content lgp-main">
        <LeagueGate />
        <ol className="lgp-how" aria-label="How leagues work">
          {steps.map((step) => <li key={step.title}><strong>{step.title}</strong><p>{step.text}</p></li>)}
        </ol>
        <p className="lgp-fine">Leagues are a learning game, not an exam or a certificate. XP comes only from activity recorded in your own PNA record (capped per activity and at 800 XP a day), so the same lesson cannot be farmed. Only your display name and weekly XP are visible to your league, and you can hide yourself from leagues at any time.</p>
      </div>
    </main>
  );
}
