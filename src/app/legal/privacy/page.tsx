import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Physio Nexus Academy handles information submitted through forms, registrations, student accounts and weekly clinical quizzes.",
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

      <h2>Daily Clinical Challenge Reminders</h2>
      <p>
        If you take part in the Daily Clinical Challenge, we may e-mail the Gmail address you
        entered, addressed by the name you entered, with a short daily reminder that includes your
        own challenge record (missions, points and best score). Every reminder has a one-click
        unsubscribe link; once you use it we never send you a reminder again. We do not track
        whether you open these e-mails, and we do not share your address with anyone.
      </p>

      <h2>Student Accounts (My PNA)</h2>
      <p>
        If you create a free student account, we store your name, email address, study stage,
        goal and (optionally) university and city, together with a record of the learning you
        complete while signed in: the activity name, the area of the academy, the XP earned, any
        score and the date. This record is private to your account: other students and the
        public cannot see it. It is used to show you your own progress and insights. You can
        download or permanently delete your record at any time from the My PNA page. Visitors
        without an account keep their progress only on their own device.
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
