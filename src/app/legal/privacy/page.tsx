import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Physio Nexus Academy handles information submitted through forms, registrations and weekly clinical quizzes.",
  alternates: {
    canonical: "https://physionexusacademy.com/legal/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What We Collect</h2>
      <p>
        We collect information you submit through workshop registrations, appointment
        requests, home-visit requests, contact forms and weekly clinical quizzes — such as
        your name, contact details, quiz score, completion time and the details of your request.
      </p>

      <h2>How We Use It</h2>
      <p>
        Information is used to respond to requests, manage workshop registrations, provide
        patient services, prevent duplicate quiz attempts and calculate weekly quiz rankings.
        We do not sell your personal information.
      </p>

      <h2>Weekly Quiz Privacy</h2>
      <p>
        Quiz Gmail addresses are kept private and are used to enforce one attempt per weekly
        quiz and to identify the relevant participant record. Public top-scorer announcements
        may display a participant&apos;s name, score and completion time, but not their Gmail address.
      </p>

      <h2>Data Protection</h2>
      <p>
        Appointment, home-visit and quiz participant data are restricted from public database
        access and are available only through server-side systems and authorized academy staff.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by
        contacting us directly.
      </p>
    </LegalPage>
  );
}
