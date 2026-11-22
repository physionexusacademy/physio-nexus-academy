import { RehabError, isStaff, rpc } from "@/lib/rehabverse/api";
import { toCsv } from "@/lib/research/csv";
import { columnsOf, dictionaryCsv, isResearchTable } from "@/lib/research/dictionary";

export const dynamic = "force-dynamic";

/**
 * De-identified research export as CSV. Staff only (checked here and again inside the database function); only patients whose research consent was recorded are
 * included; every export is written to the audit log by the database. `dictionary` returns the data dictionary instead of data.
 */
export async function GET(_request: Request, context: { params: Promise<{ table: string }> }) {
  const { table } = await context.params;
  if (!(await isStaff())) return new Response("Not authorised", { status: 403 });
  const stamp = new Date().toISOString().slice(0, 10);
  const headers = (name: string) => ({ "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="pna-rehabverse-${name}-${stamp}.csv"`, "cache-control": "no-store", "x-content-type-options": "nosniff" });
  if (table === "dictionary") return new Response(dictionaryCsv(), { headers: headers("data-dictionary") });
  if (!isResearchTable(table)) return new Response("Not found", { status: 404 });
  try {
    const result = await rpc<{ rows: Record<string, unknown>[] }>("rehab_admin_research_export", { p_table: table });
    return new Response(toCsv(result.rows, columnsOf(table)), { headers: headers(table) });
  } catch (error) {
    if (error instanceof RehabError) return new Response("Could not export", { status: 400 });
    throw error;
  }
}
