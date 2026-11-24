import type { AdminFormCheckSet } from "@/lib/rehabverse/api";
import { specFor } from "@/lib/formcheck";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** What the patient's camera counted, in numbers only (no video or picture exists). The tool is not a measurement: the notes say so. */
export function FormCheckSets({ sets }: { sets: AdminFormCheckSet[] }) {
  return (
    <div>
      <p className="mb-3 text-[13px] leading-5 text-slate-600">
        The patient chose to use the phone camera while exercising. Only numbers were saved: repetitions or hold time, how much of the time the camera could see the patient, and how many tips it gave.
        The camera counts and gives position tips; it is not a measurement of range or a clinical assessment, and no angle is reported until the validation study supports it.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-[13px]">
          <thead><tr className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500"><th className="py-1 pr-3">When</th><th className="pr-3">Exercise</th><th className="pr-3">Counted</th><th className="pr-3">Camera saw patient</th><th>Tips</th></tr></thead>
          <tbody>
            {sets.map((s) => {
              const isHold = specFor(s.spec_id)?.primary.mode !== "reps";
              const tips = s.cues ? Object.values(s.cues).reduce((a, b) => a + b, 0) : 0;
              return (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{dt(s.created_at)}</td>
                  <td className="pr-3">{s.spec_id.replace(/-/g, " ")}{s.side ? ` (${s.side})` : ""}{s.pass === 2 ? " · second check" : ""}</td>
                  <td className="pr-3">{isHold ? `${Math.round((s.best_hold_ms ?? 0) / 1000)} s held` : `${s.reps ?? 0} reps${s.partial ? `, ${s.partial} shallow` : ""}`}</td>
                  <td className="pr-3">{s.coverage ? `${Math.round(s.coverage.fraction * 100)}%` : "-"}</td>
                  <td>{tips}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
