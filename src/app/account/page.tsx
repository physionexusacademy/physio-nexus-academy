import type { Metadata } from "next";
import { Activity, BarChart3, LockKeyhole, Radar, Sparkles, Smartphone } from "lucide-react";
import { AccountApp } from "@/components/student/AccountApp";
import { AccountCta } from "@/components/student/AccountCta";

export const metadata: Metadata = {
  title: { absolute: "My PNA — your personal learning record | Physio Nexus Academy" },
  description: "A free student account that records every lesson, skill, patient and challenge you finish, shows your strengths and gaps, and keeps your progress on every device.",
  alternates: { canonical: "https://physionexusacademy.com/account" },
};

const features = [
  { icon: Activity, title: "Every activity recorded", text: "Lessons, skill levels, virtual patients and daily challenges are saved the moment you finish them, with XP and scores." },
  { icon: Sparkles, title: "PNA notices for you", text: "See your strongest area, the skill you have neglected, your week against last week and your next best step." },
  { icon: Radar, title: "Your learning balance", text: "A live map of how you split your time between learning, practising, examining and testing yourself." },
  { icon: BarChart3, title: "Streaks and levels", text: "A five-week activity map, your streak and your level from New Student to Clinical Legend." },
  { icon: Smartphone, title: "Every device", text: "Start on your phone, continue on a laptop. Progress you already made on this device is brought over." },
  { icon: LockKeyhole, title: "Private by design", text: "Only you can see your record. Download it or delete it whenever you like." },
];

export default function AccountLanding() {
  return (
    <AccountApp>
    <main className="acct-page">
      <section className="acct-hero nx-sky nx-grid">
        <div className="container-content">
          <p className="acct-kicker"><Sparkles className="h-4 w-4" aria-hidden="true" /> Student account · free</p>
          <h1>Your personal PNA.</h1>
          <p className="acct-lead">Every lesson, skill, patient and challenge you finish is recorded in your own private record — so PNA can show your strengths, your gaps and your next best step.</p>
          <AccountCta />
        </div>
      </section>
      <section className="container-content acct-features" aria-label="What you get">
        <ul>
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title}><span><Icon className="h-5 w-5" aria-hidden="true" /></span><strong>{title}</strong><p>{text}</p></li>
          ))}
        </ul>
        <p className="acct-fine">Free for every student and physiotherapist. No payment details. Patients using RehabVerse sign in separately — your clinical information is never mixed with your learning record.</p>
      </section>
    </main>
    </AccountApp>
  );
}
