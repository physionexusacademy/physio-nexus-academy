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
  published_at?: string | null;
  submitted_at?: string | null;
};

export function PublicCasePdfButton({ item }: { item: PublicCasePdfData }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const { downloadClinicalReportPdf } = await import("@/lib/clinical-registry/pdf");
      downloadClinicalReportPdf({
        patient: { displayName: "De-identified educational case" },
        category: item.condition_label,
        condition: item.case_title,
        assessmentDate: item.published_at || item.submitted_at || new Date().toISOString().slice(0, 10),
        status: "Published",
        initialAssessment: {
          demographics: { ageBand: item.age_band },
          subjectiveNotes: item.clinical_context,
        },
        interventions: [{ intervention: item.intervention_summary }],
        clinicalSummary: item.outcome_summary,
        recommendations: item.evidence_reference ? ["Evidence reference: " + item.evidence_reference] : [],
      });
    } catch {
      setError("The case PDF could not be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={download} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50">
        <FileDown size={14} /> {busy ? "Preparing PDF…" : "Download case PDF"}
      </button>
      {error && <p role="alert" className="text-[10px] text-red-700">{error}</p>}
    </div>
  );
}
