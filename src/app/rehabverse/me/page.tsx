import type { Metadata } from "next";
import { PatientDashboardLoader } from "@/components/rehabverse/PatientDashboardLoader";
import { getHistory, getMyFollowup, getMyScreening, getNotifications } from "@/lib/rehabverse/api";
import { requirePatient } from "@/lib/rehabverse/guard";

export const metadata: Metadata = { title: "My programme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyProgrammePage() {
  const overview = await requirePatient();
  const [history, notifications, followup, screening] = await Promise.all([
    overview.programme ? getHistory().catch(() => null) : Promise.resolve(null),
    getNotifications().catch(() => []),
    getMyFollowup().catch(() => null), // null until the follow-up migration is live: the dashboard simply hides the reminder switch
    getMyScreening(false).catch(() => null), // only asks whether there is a screening to show (nothing is logged); null until its migration is live
  ]);
  const hasScreening = Boolean(screening && (screening.visible || screening.waiting_for_review));
  return <PatientDashboardLoader overview={overview} history={history} notifications={notifications} followup={followup} hasScreening={hasScreening} />;
}
