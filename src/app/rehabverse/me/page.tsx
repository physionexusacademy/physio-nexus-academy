import type { Metadata } from "next";
import { PatientDashboardLoader } from "@/components/rehabverse/PatientDashboardLoader";
import { getHistory, getMyFollowup, getMyOutcomes, getMyScreening, getNotifications } from "@/lib/rehabverse/api";
import { dueList } from "@/lib/outcomes/plan";
import { requirePatient } from "@/lib/rehabverse/guard";

export const metadata: Metadata = { title: "My programme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyProgrammePage() {
  const overview = await requirePatient();
  const [history, notifications, followup, screening, outcomes] = await Promise.all([
    overview.programme ? getHistory().catch(() => null) : Promise.resolve(null),
    getNotifications().catch(() => []),
    getMyFollowup().catch(() => null), // null until the follow-up migration is live: the dashboard simply hides the reminder switch
    getMyScreening(false).catch(() => null), // only asks whether there is a screening to show (nothing is logged); null until its migration is live
    getMyOutcomes().catch(() => null), // null until the outcome-measures migration is live
  ]);
  // Questionnaires the physiotherapist chose that are open now (due, or late): the dashboard points the patient to them.
  const outcomesDue = outcomes?.plan
    ? dueList({ items: outcomes.plan.items, anchor: new Date(outcomes.plan.anchor_at) }, new Set(outcomes.responses.map((r) => `${r.instrument}:${r.timepoint}`)), new Date()).filter((d) => d.state !== "upcoming").length
    : 0;
  const hasScreening = Boolean(screening && (screening.visible || screening.waiting_for_review));
  return <PatientDashboardLoader overview={overview} history={history} notifications={notifications} followup={followup} hasScreening={hasScreening} outcomesDue={outcomesDue} />;
}
