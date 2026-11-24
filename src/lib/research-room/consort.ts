import type { StudyOverview } from "./types.ts";

export type FlowLine = { label: string; value: number };

/** The numbers for a flow diagram, with a check that they add up: everyone screened is either excluded, declined or allocated (or still waiting). */
export function flowSummary(o: StudyOverview): { lines: FlowLine[]; consistent: boolean; waiting: number } {
  const f = o.flow;
  if (!f) return { lines: [], consistent: true, waiting: 0 };
  const waiting = f.screened - f.excluded - f.declined - f.allocated;
  return {
    lines: [
      { label: "Assessed for eligibility", value: f.screened },
      { label: "Excluded", value: f.excluded },
      { label: "Declined to take part", value: f.declined },
      { label: "Randomised", value: f.allocated },
      { label: "AI-assisted arm", value: f.allocated_ai },
      { label: "Standard (no AI) arm", value: f.allocated_no_ai },
      { label: "Departures from the allocated AI setting", value: f.deviations },
    ],
    consistent: waiting === 0 && f.allocated === f.allocated_ai + f.allocated_no_ai,
    waiting,
  };
}
