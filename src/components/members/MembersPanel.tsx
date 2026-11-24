"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, MessageCircle, Pause, Play, Power, Search, X } from "lucide-react";
import { decideMemberAction, setMembersOnlyAction } from "@/app/admin/(dashboard)/members/actions";
import type { MemberDecision, MemberRow, MemberStatus, MembersList } from "@/lib/members/types";

const SITE = "https://physionexusacademy.com";
const digits = (phone: string | null) => (phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const TABS: { id: MemberStatus | "all"; label: string }[] = [
  { id: "pending", label: "Waiting" }, { id: "approved", label: "Approved" }, { id: "rejected", label: "Rejected" }, { id: "suspended", label: "Suspended" }, { id: "all", label: "Everyone" },
];
const WHO: Record<string, string> = { student: "Student", physiotherapist: "Physiotherapist", patient: "Patient", other: "Other" };
const SOURCE: Record<string, string> = { signup: "Asked for access", existing_staff: "Staff", existing_student: "Existing student", existing_patient: "Existing patient", admin: "Added by admin" };
const approvedMessage = (name: string) => `Hello ${name}, your Physio Nexus Academy account is approved. Sign in here: ${SITE}/members`;

/** The clinic's list of who may enter the website, with the decisions and the members-only switch. */
export function MembersPanel({ list, filter, query }: { list: MembersList; filter: MemberStatus | null; query: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [asking, setAsking] = useState<{ id: string; decision: MemberDecision } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [told, setTold] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [confirmOn, setConfirmOn] = useState(false);
  const active = filter ?? "all";

  const decide = (m: MemberRow, decision: MemberDecision, reason?: string) => start(async () => {
    setError(null);
    const r = await decideMemberAction(m.user_id, decision, reason);
    if (!r.ok) return setError(r.error);
    if (decision === "approve") setTold((t) => [{ id: m.user_id, name: r.fullName, phone: r.phone }, ...t]);
    setAsking(null); setNote("");
    router.refresh();
  });
  const flip = (on: boolean) => start(async () => {
    setError(null);
    const r = await setMembersOnlyAction(on);
    if (!r.ok) return setError(r.error);
    setConfirmOn(false);
    router.refresh();
  });

  return (
    <div className="space-y-5">
      <section className={"rounded-2xl border p-4 shadow-sm " + (list.members_only ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white")} aria-labelledby="mo-h" data-testid="mode-card">
        <h2 id="mo-h" className="flex flex-wrap items-center gap-2 font-heading text-base font-bold text-navy-800">
          <Power className="h-4 w-4 text-teal-600" aria-hidden="true" /> Members-only mode
          <span className={"rv-chip " + (list.members_only ? "rv-chip-teal" : "")} data-testid="mode-state">{list.members_only ? "ON: only approved members can enter" : "OFF: the website is open to everyone"}</span>
        </h2>
        <p className="mt-1 text-[13px] leading-6 text-slate-700">
          While it is <b>on</b>, anyone who is not an approved member is sent to the sign-in page (<b>/members</b>) and sees nothing else. Staff, students who already have a profile and active RehabVerse patients were approved automatically.
          Search engines can no longer read the pages, the admin area and RehabVerse patient pages keep their own sign-in, and a suspension takes effect within about 10 minutes.
        </p>
        {list.members_only ? (
          <button type="button" className="rv-btn rv-btn-ghost mt-2" disabled={busy} onClick={() => flip(false)} data-testid="mode-off">Open the website to everyone again</button>
        ) : confirmOn ? (
          <div className="mt-2 space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-950" role="alert">
            <p><b>Turn members-only mode on now?</b> Every visitor who is not an approved member will be sent to the sign-in page immediately. You can turn it off again here at any time.</p>
            <div className="flex gap-2"><button type="button" className="rv-btn rv-btn-primary" disabled={busy} onClick={() => flip(true)} data-testid="mode-confirm">Yes, turn it on</button><button type="button" className="rv-btn rv-btn-ghost" onClick={() => setConfirmOn(false)}>Cancel</button></div>
          </div>
        ) : (
          <button type="button" className="rv-btn rv-btn-primary mt-2" onClick={() => setConfirmOn(true)} data-testid="mode-on">Turn members-only mode on…</button>
        )}
      </section>

      {error ? <p className="rv-error" role="alert">Could not save ({error}).</p> : null}
      {told.length ? (
        <ul className="space-y-1.5">{told.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-[13.5px]">
            <span><b>{t.name}</b> is approved.</span>
            {digits(t.phone) ? <a href={`https://wa.me/${digits(t.phone)}?text=${encodeURIComponent(approvedMessage(t.name))}`} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost !min-h-[34px] !px-3"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Tell them on WhatsApp</a> : null}
          </li>))}</ul>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="People">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <Link key={t.id} href={`/admin/members?status=${t.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`} aria-current={active === t.id ? "page" : undefined}
              className={"rv-pill " + (active === t.id ? "rv-pill-on" : "")} data-testid={`tab-${t.id}`}>{t.label}{t.id !== "all" ? <span className="ml-1.5 rv-chip">{list.counts[t.id as MemberStatus]}</span> : null}</Link>
          ))}
          <form action="/admin/members" className="ml-auto flex items-center gap-1.5" role="search">
            <input type="hidden" name="status" value={active} />
            <label className="sr-only" htmlFor="mem-q">Search people</label>
            <input id="mem-q" name="q" defaultValue={query} placeholder="Name, email, phone, city" className="rv-input !w-56" />
            <button type="submit" className="rv-btn rv-btn-ghost !min-h-[40px]" aria-label="Search"><Search className="h-4 w-4" aria-hidden="true" /></button>
          </form>
        </div>

        <ul className="mt-3 space-y-2" data-testid="members-list">
          {list.members.map((m) => (
            <li key={m.user_id} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[13.5px]" data-testid="member-row">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="block text-navy-800">{m.full_name || "(no name)"} <span className={"rv-chip ml-1 " + (m.status === "approved" ? "rv-chip-teal" : m.status === "pending" ? "rv-chip-amber" : m.status === "rejected" || m.status === "suspended" ? "rv-chip-rose" : "")}>{m.status}</span></b>
                  <span className="block text-[12.5px] text-slate-600">{m.email ?? "no email"}{m.phone ? ` · ${m.phone}` : ""}{m.city ? ` · ${m.city}` : ""}</span>
                  <span className="block text-[12px] text-slate-500">{m.who ? `${WHO[m.who] ?? m.who} · ` : ""}{SOURCE[m.source] ?? m.source} · asked {dt(m.requested_at)}{m.decided_at ? ` · decided ${dt(m.decided_at)}` : ""}</span>
                  {m.decision_note ? <span className="block text-[12.5px] text-amber-900">Note: {m.decision_note}</span> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {(m.status === "pending" || m.status === "rejected") ? <button type="button" className="rv-btn rv-btn-primary !min-h-[38px]" disabled={busy} onClick={() => decide(m, "approve")} data-testid="approve"><Check className="h-4 w-4" aria-hidden="true" /> Approve</button> : null}
                  {m.status === "pending" ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px]" disabled={busy} onClick={() => { setAsking({ id: m.user_id, decision: "reject" }); setNote(""); }} data-testid="reject"><X className="h-4 w-4" aria-hidden="true" /> Reject…</button> : null}
                  {m.status === "approved" ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px]" disabled={busy} onClick={() => { setAsking({ id: m.user_id, decision: "suspend" }); setNote(""); }} data-testid="suspend"><Pause className="h-4 w-4" aria-hidden="true" /> Suspend…</button> : null}
                  {m.status === "suspended" ? <button type="button" className="rv-btn rv-btn-primary !min-h-[38px]" disabled={busy} onClick={() => decide(m, "reinstate")} data-testid="reinstate"><Play className="h-4 w-4" aria-hidden="true" /> Reinstate</button> : null}
                </div>
              </div>
              {asking?.id === m.user_id ? (
                <div className="mt-2 space-y-2">
                  <label className="rv-label" htmlFor={`why-${m.user_id}`}>Reason (the person can read it)</label>
                  <input id={`why-${m.user_id}`} className="rv-input" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder={asking.decision === "reject" ? "For example: we could not reach you on this number" : "For example: misuse of the AI chat"} />
                  <div className="flex gap-2">
                    <button type="button" className="rv-btn rv-btn-primary !bg-rose-600 !min-h-[38px]" disabled={busy || note.trim().length < 3} onClick={() => decide(m, asking.decision, note)} data-testid="confirm-reason">{asking.decision === "reject" ? "Reject" : "Suspend"}</button>
                    <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px]" onClick={() => setAsking(null)}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
          {list.members.length === 0 ? <li className="text-[13.5px] text-slate-500">Nobody here.</li> : null}
        </ul>
      </section>
    </div>
  );
}
