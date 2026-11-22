/**
 * CSV for the research export. Two protections: a cell that starts with = + - @ (or a tab / carriage return) is written with a leading apostrophe so a
 * spreadsheet never runs it as a formula, and a cell with a comma, quote or line break is quoted. Numbers and true/false are written as they are.
 */
const needsGuard = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "true" : "false";
  let text = typeof value === "string" ? value : JSON.stringify(value);
  if (needsGuard.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(","));
  return lines.join("\r\n") + "\r\n";
}
