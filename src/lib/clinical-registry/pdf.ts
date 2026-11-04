"use client";

type ReportRecord = Record<string, unknown>;

const textValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const safeAscii = (value: string): string => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[–—]/g, "-")
  .replace(/[’‘]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[^\x20-\x7E]/g, " ")
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)")
  .replace(/\s+/g, " ")
  .trim();

const wrap = (value: string, width = 92): string[] => {
  const words = value.split(/\s+/).filter(Boolean);
  const result: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if ((line + " " + word).length <= width) line += " " + word;
    else { result.push(line); line = word; }
  }
  if (line) result.push(line);
  return result.length ? result : [""];
};

export function downloadClinicalReportPdf(report: ReportRecord): void {
  const patient = (report.patient && typeof report.patient === "object" ? report.patient : {}) as ReportRecord;
  const assessment = (report.initialAssessment && typeof report.initialAssessment === "object" ? report.initialAssessment : {}) as ReportRecord;
  const demographics = (assessment.demographics && typeof assessment.demographics === "object" ? assessment.demographics : {}) as ReportRecord;
  const sections: Array<{ title: string; rows: Array<[string, unknown]> }> = [];
  const add = (title: string, rows: Array<[string, unknown]>) => {
    const visible = rows.filter(([, value]) => textValue(value).trim() !== "");
    if (visible.length) sections.push({ title, rows: visible });
  };

  add("PATIENT PROFILE", [
    ["Patient name / identifier", patient.displayName],
    ["Patient reference", patient.patientReference],
    ["Age (years)", demographics.ageYears],
    ["Sex", demographics.sex],
    ["Occupation / work demands", demographics.occupation],
    ["Dominant side", demographics.dominantSide],
    ["Activity level", demographics.activityLevel],
  ]);
  add("REPORT OVERVIEW", [
    ["Clinical category", report.category],
    ["Condition / working diagnosis", report.condition],
    ["Assessment date", report.assessmentDate],
    ["Report status", report.status],
  ]);
  add("SUBJECTIVE ASSESSMENT", [
    ["Main complaint", assessment.chiefComplaint],
    ["Symptom duration", assessment.symptomDuration],
    ["Pain location", assessment.painLocation],
    ["Pain score (NPRS)", assessment.painScore === null ? "" : assessment.painScore === undefined ? "" : String(assessment.painScore) + "/10"],
    ["Aggravating factors", assessment.aggravatingFactors],
    ["Relieving factors", assessment.relievingFactors],
    ["Subjective history / functional limitations", assessment.subjectiveNotes ?? assessment.subjective],
  ]);
  add("OBJECTIVE EXAMINATION & CLINICAL REASONING", [
    ["Objective findings", assessment.objectiveFindings ?? assessment.objective],
    ["Range of motion", assessment.romFindings],
    ["Muscle strength / MMT", assessment.strengthFindings],
    ["Special tests", assessment.specialTests],
    ["Neurological findings", assessment.neuroFindings],
    ["Clinical impression", assessment.clinicalImpression],
    ["Treatment goals", assessment.treatmentGoals],
    ["Plan of care", assessment.planOfCare],
  ]);

  const followUps = Array.isArray(report.followUpAssessments) ? report.followUpAssessments as ReportRecord[] : [];
  if (followUps.length) {
    sections.push({ title: "FOLLOW-UP VISITS", rows: followUps.map((item, index) => [
      `Visit ${index + 1} · ${textValue(item.date) || "Date not recorded"}`,
      [
        textValue(item.painScore) ? `NPRS: ${textValue(item.painScore)}/10` : "",
        textValue(item.subjective) ? `Subjective: ${textValue(item.subjective)}` : "",
        textValue(item.objective) ? `Objective: ${textValue(item.objective)}` : "",
        textValue(item.treatmentResponse) ? `Treatment response: ${textValue(item.treatmentResponse)}` : "",
      ].filter(Boolean).join(" | ")
    ]) });
  }
  const interventions = Array.isArray(report.interventions) ? report.interventions as ReportRecord[] : [];
  if (interventions.length) {
    sections.push({ title: "TREATMENT INTERVENTIONS", rows: interventions.map((item, index) => [
      `Intervention ${index + 1} · ${textValue(item.intervention) || "Treatment"}`,
      [
        textValue(item.date) ? `Date: ${textValue(item.date)}` : "",
        textValue(item.bodyRegion) ? `Region: ${textValue(item.bodyRegion)}` : "",
        textValue(item.techniqueOrParameters) ? `Technique / parameters: ${textValue(item.techniqueOrParameters)}` : "",
        textValue(item.dosage) ? `Dosage: ${textValue(item.dosage)}` : "",
        textValue(item.response) ? `Response: ${textValue(item.response)}` : "",
        textValue(item.homeAdvice) ? `Home advice: ${textValue(item.homeAdvice)}` : "",
      ].filter(Boolean).join(" | ")
    ]) });
  }
  const outcomes = Array.isArray(report.outcomes) ? report.outcomes as ReportRecord[] : [];
  if (outcomes.length) {
    sections.push({ title: "OUTCOME MEASURES", rows: outcomes.map((item, index) => [
      `Measure ${index + 1} · ${textValue(item.measureName) || textValue(item.measureCode) || "Outcome"}`,
      [textValue(item.value), textValue(item.unit), textValue(item.date)].filter(Boolean).join(" · ")
    ]) });
  }
  add("CLINICAL SUMMARY & DISCHARGE PLAN", [
    ["Clinical summary", report.clinicalSummary],
    ["Discharge status", report.dischargeStatus],
    ["Recommendations", Array.isArray(report.recommendations) ? report.recommendations.join("; ") : ""],
  ]);

  const title = textValue(report.condition) || "Clinical report";
  const patientName = textValue(patient.displayName) || "Patient";
  const patientRef = textValue(patient.patientReference);
  const pageWidth = 595;
  const pageHeight = 842;
  const pageContents: string[][] = [];
  let commands: string[] = [];
  let y = 760;

  const drawText = (value: string, x: number, top: number, size = 9, color = "0.16 0.22 0.28") => {
    commands.push(`BT /F1 ${size} Tf ${color} rg 1 0 0 1 ${x} ${top} Tm (${safeAscii(value)}) Tj ET`);
  };
  const drawRect = (x: number, bottom: number, width: number, height: number, color: string) => {
    commands.push(`${color} rg ${x} ${bottom} ${width} ${height} re f`);
  };
  const startPage = (pageNumber: number) => {
    commands = [];
    drawRect(0, 790, pageWidth, 52, "0.08 0.20 0.31");
    drawText("PHYSIO NEXUS ACADEMY", 42, 817, 9, "1 1 1");
    drawText("CLINICAL REGISTRY", 42, 800, 8, "0.78 0.91 0.91");
    drawText(title, 42, 768, 16, "0.08 0.20 0.31");
    drawText(`${patientName}${patientRef ? "  |  " + patientRef : ""}`, 42, 748, 9, "0.30 0.38 0.45");
    y = 718;
    pageContents[pageNumber - 1] = commands;
  };
  const finishPage = (pageNumber: number, totalPages: number) => {
    drawRect(42, 38, 511, 0.8, "0.82 0.87 0.90");
    drawText("Confidential clinical record · Handle and store securely", 42, 24, 7, "0.42 0.48 0.53");
    drawText(`Page ${pageNumber} of ${totalPages}`, 500, 24, 7, "0.42 0.48 0.53");
  };
  const ensureSpace = (needed: number) => {
    if (y - needed < 58) {
      pageContents[pageContents.length - 1] = commands;
      startPage(pageContents.length + 1);
    }
  };

  startPage(1);
  for (const section of sections) {
    ensureSpace(34);
    drawRect(42, y - 7, 511, 21, "0.91 0.96 0.96");
    drawText(section.title, 50, y, 9, "0.05 0.38 0.39");
    y -= 25;
    for (const [label, rawValue] of section.rows) {
      const value = textValue(rawValue);
      if (!value) continue;
      const wrapped = wrap(`${label}: ${value}`, 92);
      ensureSpace(wrapped.length * 13 + 5);
      for (const line of wrapped) {
        drawText(line, 50, y, 8.5);
        y -= 13;
      }
      y -= 4;
    }
    y -= 8;
  }
  if (!sections.length) {
    drawText("No clinical assessment details have been recorded.", 50, y, 9);
  }
  pageContents[pageContents.length - 1] = commands;
  const totalPages = pageContents.length;
  pageContents.forEach((page, index) => {
    commands = page;
    finishPage(index + 1, totalPages);
    pageContents[index] = commands;
  });

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const pageObjectIds = pageContents.map((_, index) => 4 + index * 2);
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageContents.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pageContents.forEach((page, index) => {
    const pageId = 4 + index * 2;
    const streamId = pageId + 1;
    const stream = page.join("\n") + "\n";
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`;
    objects[streamId] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = (patientRef || patientName).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "patient";
  anchor.href = url;
  anchor.download = `PNA-Clinical-Report-${safeName}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
