import { agreement, type Agreement } from "./validation.ts";

/** Reads the CSV the posture page exports in researcher mode (quoted cells, one row per metric per capture) and works out agreement with the reference value, per metric. */
export type StudyRow = { time: string; view: string; metric: string; app: number; plusMinus: number; reference: number | null; by: string };

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

export function readStudy(text: string): StudyRow[] {
  const [head, ...body] = parseCsv(text);
  const col = (name: string) => head.indexOf(name);
  const need = ["time", "view", "metric", "app_value", "app_plus_minus", "reference_value", "capture_by"].map((n) => [n, col(n)] as const);
  const missing = need.filter(([, i]) => i < 0).map(([n]) => n);
  if (missing.length) throw new Error(`the file is missing the columns: ${missing.join(", ")}`);
  return body.map((r) => ({
    time: r[col("time")], view: r[col("view")], metric: r[col("metric")], app: Number(r[col("app_value")]), plusMinus: Number(r[col("app_plus_minus")]),
    reference: r[col("reference_value")].trim() === "" ? null : Number(r[col("reference_value")]), by: r[col("capture_by")],
  }));
}

export type MetricAgreement = { metric: string; pairs: number; agreement: Agreement | null; note?: string };

/** Per metric: the pairs that have a reference value, and their agreement (needs at least 3 pairs). Tolerance is in the metric's own unit. */
export function analyse(rows: StudyRow[], tolerance: Record<string, number> = {}): MetricAgreement[] {
  const byMetric = new Map<string, StudyRow[]>();
  for (const r of rows) if (r.reference !== null && Number.isFinite(r.reference) && Number.isFinite(r.app)) byMetric.set(r.metric, [...(byMetric.get(r.metric) ?? []), r]);
  return [...byMetric.entries()].map(([metric, list]) => list.length < 3
    ? { metric, pairs: list.length, agreement: null, note: "needs at least 3 pairs" }
    : { metric, pairs: list.length, agreement: agreement(list.map((r) => r.app), list.map((r) => r.reference as number), tolerance[metric]) });
}
