import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntakeWizardLoader } from "@/components/rehabverse/IntakeWizardLoader";
import { requirePatient } from "@/lib/rehabverse/guard";

export const metadata: Metadata = { title: "Symptom assessment", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OPEN = ["submitted", "needs_clinical_assessment", "in_review", "cleared_for_programme"];

export default async function StartPage() {
  const overview = await requirePatient();
  // One open assessment at a time: if one is waiting, or a programme exists, go to the dashboard.
  const assessments = overview.assessments ?? [];
  const live = overview.programme && ["active", "paused"].includes(overview.programme.status);
  const drafting = !overview.programme && assessments[0]?.status === "programme_created"; // programme being prepared
  if (live || drafting || assessments.some((a) => OPEN.includes(a.status))) redirect("/rehabverse/me");
  return (
    <div className="container-content pb-16 pt-6 sm:pt-10">
      <IntakeWizardLoader />
    </div>
  );
}
