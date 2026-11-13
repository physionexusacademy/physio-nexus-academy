"use client";

import dynamic from "next/dynamic";
import type { AdminPatient } from "@/lib/rehabverse/api-types";

// The clinician record is interactive only, so it loads in the browser: it keeps the Cloudflare worker small.
const AdminPatientRecord = dynamic(() => import("./AdminPatientRecord").then((m) => m.AdminPatientRecord), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-busy="true" aria-label="Loading patient record" />,
});

export function AdminPatientRecordLoader({ data }: { data: AdminPatient }) {
  return <AdminPatientRecord data={data} />;
}
