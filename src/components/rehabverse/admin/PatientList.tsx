"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminPatientRow } from "@/lib/rehabverse/api-types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Draft" },
  { id: "none", label: "No programme" },
  { id: "done", label: "Completed / stopped" },
];

/** Find a patient by name, reference or city, and filter by programme state. */
export function PatientList({ patients }: { patients: AdminPatientRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      const state = p.programme_status;
      const matchesFilter = filter === "all" || (filter === "none" ? !state : filter === "done" ? state === "completed" || state === "discontinued" : state === filter);
      return matchesFilter && (!q || p.full_name.toLowerCase().includes(q) || p.reference_code.toLowerCase().includes(q) || (p.city ?? "").toLowerCase().includes(q));
    });
  }, [patients, query, filter]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, reference or city" aria-label="Search patients" className="rv-input !pl-9" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by programme">
          {FILTERS.map((f) => <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={"rv-pill " + (filter === f.id ? "rv-pill-on" : "")}>{f.label}</button>)}
        </div>
      </div>
      <p className="text-[12.5px] text-slate-500" aria-live="polite">{shown.length} of {patients.length} patients</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/rehabverse/patients/${p.id}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] hover:border-teal-400">
              <span><b className="text-navy-800">{p.full_name}</b> <span className="text-slate-500">{p.reference_code}{p.city ? ` · ${p.city}` : ""}</span></span>
              <span className={"rv-chip " + (p.programme_status === "active" ? "rv-chip-teal" : p.programme_status === "paused" ? "rv-chip-amber" : "")}>{p.programme_status ?? "no programme"}</span>
            </Link>
          </li>
        ))}
        {shown.length === 0 ? <li className="text-[14px] text-slate-500">No patients match.</li> : null}
      </ul>
    </div>
  );
}
