import dictionary from "./dictionary.json" with { type: "json" };
import { csvCell } from "./csv.ts";

export type ResearchTable = "participants" | "screening" | "outcomes" | "daily_feedback" | "adverse_events";
export const RESEARCH_TABLES = Object.keys(dictionary.tables) as ResearchTable[];
export const RESEARCH_NOTE: string = dictionary.note;
export const tableTitle = (table: ResearchTable): string => dictionary.tables[table].title;
export const columnsOf = (table: ResearchTable): string[] => dictionary.tables[table].columns.map((c) => c[0]);
export const isResearchTable = (value: string): value is ResearchTable => (RESEARCH_TABLES as string[]).includes(value);

/** The data dictionary as CSV: every column of every table with its type and meaning. */
export function dictionaryCsv(): string {
  const lines = ["table,column,type,description"];
  for (const table of RESEARCH_TABLES) for (const [name, type, description] of dictionary.tables[table].columns) lines.push([table, name, type, description].map(csvCell).join(","));
  return lines.join("\r\n") + "\r\n";
}
export const dictionaryRows = (table: ResearchTable): [string, string, string][] => dictionary.tables[table].columns as [string, string, string][];
