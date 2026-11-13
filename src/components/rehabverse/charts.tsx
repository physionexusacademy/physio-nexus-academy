"use client";

import { useId } from "react";

export type Series = { name: string; colour: string; points: (number | null)[]; dashed?: boolean };

/**
 * Small accessible line chart on a 0–10 scale (pain / difficulty). Pure SVG: no chart library on
 * the page. A visually hidden table carries the same numbers for screen readers.
 */
export function LineChart({ series, labels, title, height = 190, yMax = 10 }: { series: Series[]; labels: string[]; title: string; height?: number; yMax?: number }) {
  const id = useId();
  const W = 440;
  const H = height;
  const pad = { l: 28, r: 12, t: 12, b: 26 };
  const x = (i: number) => pad.l + (labels.length <= 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (labels.length - 1));
  const y = (v: number) => pad.t + (1 - v / yMax) * (H - pad.t - pad.b);
  const ticks = [0, 2, 4, 6, 8, 10].filter((t) => t <= yMax);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t`} className="h-auto w-full">
        <title id={`${id}-t`}>{title}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e3eaf1" strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize={11} fill="#64748b">{t}</text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="#64748b">{l}</text>
        ))}
        {series.map((s) => {
          const parts: string[] = [];
          let pen = false;
          s.points.forEach((v, i) => {
            if (v === null || v === undefined) {
              pen = false;
              return;
            }
            parts.push(`${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`);
            pen = true;
          });
          return (
            <g key={s.name}>
              <path d={parts.join(" ")} fill="none" stroke={s.colour} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? "5 4" : undefined} />
              {s.points.map((v, i) => (v === null || v === undefined ? null : <circle key={i} cx={x(i)} cy={y(v)} r={3.4} fill="#fff" stroke={s.colour} strokeWidth={2} />))}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-semibold text-slate-600">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: s.colour, opacity: s.dashed ? 0.6 : 1 }} aria-hidden="true" /> {s.name}
          </span>
        ))}
      </figcaption>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr><th>Day</th>{series.map((s) => <th key={s.name}>{s.name}</th>)}</tr></thead>
        <tbody>{labels.map((l, i) => <tr key={i}><th>{l}</th>{series.map((s) => <td key={s.name}>{s.points[i] ?? "—"}</td>)}</tr>)}</tbody>
      </table>
    </figure>
  );
}
