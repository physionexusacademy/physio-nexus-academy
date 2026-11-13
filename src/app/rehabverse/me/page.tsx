import type { Metadata } from "next";
import { PatientDashboardLoader } from "@/components/rehabverse/PatientDashboardLoader";
import { getHistory, getNotifications } from "@/lib/rehabverse/api";
import { requirePatient } from "@/lib/rehabverse/guard";

export const metadata: Metadata = { title: "My programme", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyProgrammePage() {
  const overview = await requirePatient();
  const [history, notifications] = await Promise.all([
    overview.programme ? getHistory().catch(() => null) : Promise.resolve(null),
    getNotifications().catch(() => []),
  ]);
  return <PatientDashboardLoader overview={overview} history={history} notifications={notifications} />;
}
