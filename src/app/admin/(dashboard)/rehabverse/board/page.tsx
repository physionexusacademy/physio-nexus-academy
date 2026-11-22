import Link from "next/link";
import { ArrowLeft, CheckCircle2, FlaskConical } from "lucide-react";
import { assess, sortBoard, type Attention, type BoardRow } from "@/lib/board/rules";
import { getBoard } from "@/lib/rehabverse/api";
import { REGION_LABEL, REGIONS, type Region } from "@/lib/rehabverse/types";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "RehabVerse — therapist board" };

const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");
const LIGHT = {
  red: { label: "Red", sentence: "needs your attention first", chip: "rv-chip-rose", dot: "bg-rose-500" },
  amber: { label: "Amber", sentence: "needs a look soon", chip: "rv-chip-amber", dot: "bg-amber-400" },
  green: { label: "Green", sentence: "on track", chip: "rv-chip-teal", dot: "bg-emerald-500" },
} as const;
type Level = keyof typeof LIGHT;
const areaName = (r: string) => REGION_LABEL[r as Region]?.en ?? r;

/** Filters are links (a query string), so the board needs no client code in the Cloudflare worker. */
const href = (level: string, area: string) => {
  const q = new URLSearchParams();
  if (level !== "all") q.set("level", level);
  if (area !== "all") q.set("area", area);
  const s = q.toString();
  return `/admin/rehabverse/board${s ? `?${s}` : ""}`;
};

export default async function TherapistBoard({ searchParams }: { searchParams: Promise<{ level?: string; area?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const level = sp.level === "red" || sp.level === "amber" || sp.level === "green" ? sp.level : "all";
  const area = (REGIONS as string[]).includes(sp.area ?? "") ? (sp.area as string) : "all";

  const rows = await getBoard().catch(() => null);
  if (!rows) {
    return (
      <div className="space-y-4">
        <Link href="/admin/rehabverse" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Clinician inbox</Link>
        <h1 className="font-heading text-2xl font-bold text-navy-800">Therapist board</h1>
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13.5px] text-amber-950" role="status">The board needs the latest database update, which has not been applied yet.</p>
      </div>
    );
  }

  const now = new Date();
  const all = sortBoard(rows.map((row: BoardRow) => ({ row, attention: assess(row, now) })));
  const count = (l: Level) => all.filter((x) => x.attention.level === l).length;
  const shown = all.filter((x) => (level === "all" || x.attention.level === level) && (area === "all" || (x.row.regions ?? []).includes(area)));

  return (
    <div className="space-y-5" data-board-page>
      <div>
        <Link href="/admin/rehabverse" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Clinician inbox</Link>
        <p className="rv-h mt-2">PNA RehabVerse</p>
        <h1 className="font-heading text-2xl font-bold text-navy-800">Therapist board</h1>
        <p className="max-w-3xl text-[13.5px] text-slate-600">Every active patient on one page, worst first. The colour comes from fixed rules, not from AI, and each light lists the reason, so you can check it against the record.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Summary">
        {(["red", "amber", "green"] as const).map((l) => (
          <Link key={l} href={href(level === l ? "all" : l, area)} aria-current={level === l ? "true" : undefined} data-testid={`tile-${l}`}
            className={"rounded-2xl border bg-white p-3 shadow-sm transition hover:border-teal-400 " + (level === l ? "border-teal-500 ring-2 ring-teal-200" : "border-slate-200")}>
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-slate-500"><span className={"h-2.5 w-2.5 rounded-full " + LIGHT[l].dot} aria-hidden="true" />{LIGHT[l].label}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy-800" data-testid={`count-${l}`}>{count(l)}</p>
            <p className="text-[12px] text-slate-500">{LIGHT[l].sentence}</p>
          </Link>
        ))}
      </div>

      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Filter by area">
        <span className="mr-1 text-[12px] font-bold uppercase tracking-wide text-slate-500">Area</span>
        {["all", ...REGIONS].map((a) => (
          <Link key={a} href={href(level, a)} aria-current={area === a ? "true" : undefined}
            className={"rv-chip " + (area === a ? "rv-chip-teal" : "")}>{a === "all" ? "All" : areaName(a)}</Link>
        ))}
        {(level !== "all" || area !== "all") && <Link href="/admin/rehabverse/board" className="ml-1 text-[12.5px] font-bold text-teal-700 hover:underline">Clear filters</Link>}
      </nav>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-[13.5px] text-slate-600" data-testid="board-empty">{all.length === 0 ? "No active patients yet." : "No patient matches these filters."}</p>
      ) : (
        <ul className="space-y-2.5" data-testid="board-list">
          {shown.map(({ row, attention }) => <BoardCard key={row.id} row={row} attention={attention} />)}
        </ul>
      )}

      <p className="flex items-center gap-2 text-[12.5px] text-slate-500">
        <FlaskConical className="h-4 w-4" aria-hidden="true" /> Research data for the patients who consented is on the <Link href="/admin/rehabverse/research" className="font-bold text-teal-700 hover:underline">research record</Link> page.
      </p>
    </div>
  );
}

function BoardCard({ row, attention }: { row: BoardRow; attention: Attention }) {
  const l = LIGHT[attention.level];
  const lastSeen = row.last_feedback_at ?? row.assessment_submitted_at;
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm" data-level={attention.level} data-testid="board-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className={"rv-chip " + l.chip} data-testid="board-level"><span className={"h-2 w-2 rounded-full " + l.dot} aria-hidden="true" />{l.label}</span>
            <Link href={`/admin/rehabverse/patients/${row.id}`} className="font-heading text-[15.5px] font-bold text-navy-800 hover:underline">{row.full_name}</Link>
            <span className="text-[12.5px] text-slate-500">{row.reference_code} · {row.age_years}{row.sex ? ` · ${row.sex}` : ""}{row.city ? ` · ${row.city}` : ""}</span>
            {row.research_consent && <span className="rv-chip" title="Research consent recorded">Research</span>}
          </p>
          <p className="mt-1 text-[13px] text-slate-600">
            {attention.stage}
            {row.regions && row.regions.length > 0 && <> · {row.regions.map(areaName).join(", ")}</>}
            {row.baseline_pain !== null && <> · pain at start {row.baseline_pain}/10</>}
          </p>
        </div>
        <div className="text-right text-[12.5px] text-slate-500">
          {attention.adherence !== null && <p><b className="text-navy-800">{attention.adherence}%</b> of released days done ({row.days_done ?? 0}/{row.days_released ?? 0})</p>}
          <p>Last activity {dt(lastSeen)}</p>
        </div>
      </div>
      {attention.reasons.length > 0 && (
        <ul className="mt-2 space-y-1" aria-label="Why this colour">
          {attention.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-slate-800" data-testid="board-reason" data-level={r.level}>
              <span className={"mt-1.5 h-2 w-2 shrink-0 rounded-full " + (r.level === "red" ? "bg-rose-500" : "bg-amber-400")} aria-hidden="true" />
              <span><b className="sr-only">{r.level}: </b>{r.text}</span>
            </li>
          ))}
        </ul>
      )}
      {attention.good.length > 0 && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-emerald-800">
          {attention.good.map((g, i) => <span key={i} className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />{g}</span>)}
        </p>
      )}
    </li>
  );
}
