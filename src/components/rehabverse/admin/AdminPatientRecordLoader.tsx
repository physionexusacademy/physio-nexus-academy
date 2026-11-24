"use client";

import type { StudyPatient } from "@/lib/research-room";
import dynamic from "next/dynamic";
import type { AdminOutcomes, AdminPatient } from "@/lib/rehabverse/api-types";
import type { AdminFormCheckSet } from "@/lib/rehabverse/api";

// The clinician record is interactive only, so it loads in the browser: it keeps the Cloudflare worker small.
const AdminPatientRecord = dynamic(() => import("./AdminPatientRecord").then((m) => m.AdminPatientRecord), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-busy="true" aria-label="Loading patient record" />,
});

export function AdminPatientRecordLoader({ data, outcomes = null, formcheck = null, study = null }: { data: AdminPatient; outcomes?: AdminOutcomes | null; formcheck?: AdminFormCheckSet[] | null; study?: StudyPatient | null }) {
  return <AdminPatientRecord data={data} outcomes={outcomes} formcheck={formcheck} study={study} />;
}
