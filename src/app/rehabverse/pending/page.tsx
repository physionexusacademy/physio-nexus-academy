import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PendingApproval } from "@/components/rehabverse/PendingApproval";
import { currentUser, getOverview, isStaff } from "@/lib/rehabverse/api";

export const metadata: Metadata = { title: "Waiting for approval", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Where a new account waits for the clinic's decision (and where a declined request reads the reason). */
export default async function PendingPage() {
  const user = await currentUser();
  if (!user) redirect("/rehabverse/login");
  if (await isStaff()) redirect("/admin/rehabverse");
  const overview = await getOverview();
  if (!overview.patient) redirect("/rehabverse/register");
  if (!overview.patient.status || overview.patient.status === "active") redirect("/rehabverse/start");
  return (
    <div className="container-content py-8 sm:py-12">
      <PendingApproval name={overview.patient.full_name} reference={overview.patient.reference_code} status={overview.patient.status ?? "pending"} note={overview.patient.decision_note ?? null} />
    </div>
  );
}
