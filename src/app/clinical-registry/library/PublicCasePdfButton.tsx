"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

type PublicCasePdfData = {
  case_title: string;
  condition_label: string;
  age_band: string | null;
  clinical_context: string;
  intervention_summary: string;
  outcome_summary: string;
  evidence_reference: string | null;
  published_at: string;
};

export function PublicCasePdfButton({ item }: { item: PublicCasePdfData }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { downloadClinicalReportPdf } = await import("@/lib/clinical-registry/pdf");
      downloadClinicalReportPdf({
        patient: { displayName: "De-identified educational case" },
        category: item.condition_label,
        condition: item.case_title,
        assessmentDate: item.published_at,
        status: "Published",
        initialAssessment: {
          demographics: { ageBand: item.age_band },
          subjectiveNotes: item.clinical_context,
        },
        interventions: [{ intervention: item.intervention_summary }],
        clinicalSummary: item.outcome_summary,
        recommendations: item.evidence_reference ? ["Evidence reference: " + item.evidence_reference] : [],
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={download} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50">
      <FileDown size={14} /> {busy ? "Preparing PDF…" : "Download case PDF"}
    </button>
  );
}
