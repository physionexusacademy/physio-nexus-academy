"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Download, Flame, LoaderCircle, LogOut, ShieldCheck, Sparkles, Trash2, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAccountNav } from "@/components/student/AccountNav";
import { pendingCount, OUTBOX_EVENT, SYNCED_EVENT } from "@/lib/student/outbox";
import { flushStudentOutbox } from "@/lib/student/flush";
import { levelFor, levels } from "@/lib/student/levels";
import { buildInsights, mainSources, sourceInfo, type StudentSummary } from "@/lib/student/insights";
import { getPakistanDate, getUnifiedProgress } from "@/lib/unified-progress";

const stages: Record<string, string> = { "year1-2": "DPT year 1–2", "year3-4": "DPT year 3–4", "final-intern": "Final year / intern", graduate: "Practising physiotherapist", other: "Learner" };
const goalsLabel: Record<string, string> = { understand: "Understand concepts deeply", exams: "Exams and viva", clinic: "Better in the clinic", manual: "Manual therapy" };

type Load = { status: "loading" } | { status: "ready"; summary: StudentSummary } | { status: "error"; message: string };

function Ring({ percent, children }: { percent: number; children: React.ReactNode }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="mp-ring" role="img" aria-label={`${percent}% of the way to the next level`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="mp-ring-bg" />
        <circle cx="60" cy="60" r={r} className="mp-ring-fg" strokeDasharray={`${(percent / 100) * c} ${c}`} transform="rotate(-90 60 60)" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

function Radar({ summary }: { summary: StudentSummary }) {
  const stats = new Map((summary.by_source ?? []).map((s) => [s.source, s]));
  const values = mainSources.map((s) => stats.get(s)?.xp ?? 0);
  const max = Math.max(1, ...values);
  const cx = 110, cy = 110, R = 70;
  const point = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / mainSources.length;
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f] as const;
  };
  const poly = values.map((v, i) => point(i, Math.max(0.06, v / max)).join(",")).join(" ");
  return (
    <svg viewBox="-34 0 288 220" className="mp-radar" role="img" aria-label={`Balance of your learning: ${mainSources.map((s, i) => `${sourceInfo[s].short} ${values[i]} XP`).join(", ")}`}>
      {[0.33, 0.66, 1].map((f) => <polygon key={f} points={mainSources.map((_, i) => point(i, f).join(",")).join(" ")} className="mp-radar-grid" />)}
      {mainSources.map((_, i) => <line key={i} x1={cx} y1={cy} x2={point(i, 1)[0]} y2={point(i, 1)[1]} className="mp-radar-grid" />)}
      <polygon points={poly} className="mp-radar-shape" />
      {values.map((v, i) => { const [x, y] = point(i, Math.max(0.06, v / max)); return <circle key={i} cx={x} cy={y} r="3.5" className="mp-radar-dot" />; })}
      {mainSources.map((s, i) => {
        const [x, y] = point(i, 1.16);
        const side = x < cx - 8 ? "end" : x > cx + 8 ? "start" : "middle";
        return <text key={s} x={x} y={y} textAnchor={side} dominantBaseline="middle" className="mp-radar-label">{sourceInfo[s].short}</text>;
      })}
    </svg>
  );
}

function Heatmap({ summary, today }: { summary: StudentSummary; today: string }) {
  const map = new Map((summary.by_day ?? []).map((d) => [d.day, d.xp]));
  const base = Date.parse(today + "T00:00:00Z");
  const weekdayIndex = (new Date(base).getUTCDay() + 6) % 7; // Monday = 0
  const start = base - (weekdayIndex + 28) * 86400000; // five calendar weeks, Monday first, this week last
  const cells = Array.from({ length: 35 }, (_, i) => {
    const t = start + i * 86400000;
    const day = new Date(t).toISOString().slice(0, 10);
    return { day, xp: map.get(day) ?? 0, future: t > base, today: t === base };
  });
  const level = (xp: number) => (xp <= 0 ? 0 : xp < 25 ? 1 : xp < 60 ? 2 : xp < 120 ? 3 : 4);
  return (
    <div className="mp-heat-wrap">
      <div className="mp-heat-days" aria-hidden="true">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="mp-heat" role="img" aria-label="Your activity over the last five weeks">
        {cells.map((cell) => <span key={cell.day} data-l={level(cell.xp)} data-future={cell.future} data-today={cell.today} title={cell.future ? cell.day : `${cell.day}: ${cell.xp} XP`} />)}
      </div>
    </div>
  );
}

export function MyPna() {
  const nav = useAccountNav();
  const supabase = useMemo(() => createClient(), []);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [pending, setPending] = useState(0);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ display_name: "", stage: "year3-4", goal: "understand", university: "", city: "" });
  const today = getPakistanDate();

  const fetchSummary = useCallback(async (): Promise<StudentSummary> => {
    const { data, error } = await supabase.rpc("student_my_summary", { p_days: 35 });
    if (error) throw new Error(error.message);
    return data as StudentSummary;
  }, [supabase]);

  const boot = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) { await supabase.auth.signOut(); nav.go("login"); return; } // an expired session: clear it so we never bounce back here
      let summary = await fetchSummary();
      if (!summary.profile) {
        // First visit after confirming the email: create the profile from the sign-up form, then bring over this device's history.
        const meta = (user.user_metadata ?? {}) as Record<string, string>;
        const { error } = await supabase.rpc("student_upsert_profile", { p: {
          display_name: meta.display_name || (user.email ?? "Student").split("@")[0].slice(0, 40),
          stage: meta.stage || null, goal: meta.goal || null, university: meta.university || null, city: meta.city || null,
        } });
        if (error) throw new Error(error.message);
        const local = getUnifiedProgress();
        await supabase.rpc("student_import_local", { p: { total_xp: local.totalXP, active_dates: local.activeDates } });
        summary = await fetchSummary();
      }
      await flushStudentOutbox();
      summary = await fetchSummary();
      const pr = summary.profile;
      if (pr) setForm({ display_name: pr.display_name, stage: pr.stage ?? "year3-4", goal: pr.goal ?? "understand", university: pr.university ?? "", city: pr.city ?? "" });
      setLoad({ status: "ready", summary });
    } catch (e) {
      setLoad({ status: "error", message: e instanceof Error ? e.message : "Could not load your record." });
    }
  }, [supabase, nav, fetchSummary]);

  useEffect(() => { void boot(); }, [boot]);
  useEffect(() => {
    const refresh = () => setPending(pendingCount());
    refresh();
    const onSynced = () => void fetchSummary().then((summary) => setLoad({ status: "ready", summary })).catch(() => undefined);
    window.addEventListener(OUTBOX_EVENT, refresh);
    window.addEventListener(SYNCED_EVENT, onSynced);
    return () => { window.removeEventListener(OUTBOX_EVENT, refresh); window.removeEventListener(SYNCED_EVENT, onSynced); };
  }, [fetchSummary]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy("save"); setMsg("");
    const { error } = await supabase.rpc("student_upsert_profile", { p: { ...form } });
    setBusy("");
    if (error) { setMsg(error.message); return; }
    setEditing(false); setMsg("Profile saved.");
    await boot();
  }
  async function exportData() {
    setBusy("export");
    const { data, error } = await supabase.rpc("student_export_my_data");
    setBusy("");
    if (error) { setMsg(error.message); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "my-pna-record.json"; a.click(); URL.revokeObjectURL(url);
  }
  async function removeData() {
    if (!window.confirm("This permanently deletes your PNA record (profile and all activity). Your account email stays. Continue?")) return;
    setBusy("delete");
    const { error } = await supabase.rpc("student_delete_my_data");
    if (error) { setBusy(""); setMsg(error.message); return; }
    await supabase.auth.signOut();
    nav.go("landing", "deleted");
  }
  async function signOut() {
    await supabase.auth.signOut();
    nav.go("login", "signedout");
  }

  if (load.status === "loading") return <div className="mp-state" role="status"><LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> Opening your PNA record…</div>;
  if (load.status === "error") return <div className="mp-state" role="alert"><p>We could not open your record: {load.message}</p><button type="button" className="nx-btn nx-btn-primary" onClick={() => { setLoad({ status: "loading" }); void boot(); }}>Try again</button></div>;

  const { summary } = load;
  const profile = summary.profile!;
  const xp = summary.totals?.xp ?? 0;
  const lv = levelFor(xp);
  const streak = summary.streak ?? { current: 0, best: 0 };
  const insights = buildInsights(summary, today);
  const first = profile.display_name.split(" ")[0];
  const justJoined = Date.now() - Date.parse(profile.created_at) < 15 * 60 * 1000;
  const member = summary.totals?.first_day ?? profile.created_at.slice(0, 10);

  return (
    <div className="mp">
      <header className="mp-hero nx-sky nx-grid">
        <div className="mp-hero-id">
          <p className="mp-kicker"><Zap className="h-4 w-4" aria-hidden="true" /> My PNA</p>
          <h1>{justJoined ? "Welcome" : "Welcome back"}, {first}.</h1>
          <p className="mp-meta">{[stages[profile.stage ?? "other"], profile.goal ? goalsLabel[profile.goal] : null, profile.city].filter(Boolean).join(" · ")}</p>
          <p className="mp-next">{lv.next ? <>{lv.toNext} XP to <strong>{lv.next.name}</strong></> : "Top level reached — Clinical Legend"}</p>
          {pending > 0 ? <p className="mp-pending" role="status"><LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> {pending} {pending === 1 ? "activity is" : "activities are"} saving…</p> : <p className="mp-saved"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Everything you finish is recorded here, privately.</p>}
        </div>
        <Ring percent={lv.percent}>
          <strong>{lv.current.name}</strong>
          <span>{xp} XP</span>
        </Ring>
      </header>

      <section className="mp-tiles" aria-label="Your numbers">
        <div className="mp-tile"><span>Total XP</span><strong>{xp}</strong></div>
        <div className="mp-tile"><span>Day streak</span><strong><Flame className="h-5 w-5 text-[var(--nx-amber)]" aria-hidden="true" /> {streak.current}</strong><small>best {streak.best}</small></div>
        <div className="mp-tile"><span>Active days</span><strong>{summary.totals?.active_days ?? 0}</strong><small>since {member}</small></div>
        <div className="mp-tile"><span>Activities</span><strong>{summary.totals?.events ?? 0}</strong><small>recorded</small></div>
      </section>

      <div className="mp-grid">
        <section className="mp-panel" aria-labelledby="mp-insights">
          <h2 id="mp-insights"><Sparkles className="h-4 w-4" aria-hidden="true" /> What PNA noticed</h2>
          <ul className="mp-insights">
            {insights.map((item) => (
              <li key={item.title} data-tone={item.tone}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                {item.href ? <a href={item.href}>{item.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="mp-panel" aria-labelledby="mp-balance">
          <h2 id="mp-balance">Your learning balance</h2>
          <Radar summary={summary} />
          <ul className="mp-legend">
            {mainSources.map((s) => { const st = (summary.by_source ?? []).find((x) => x.source === s); return <li key={s}><span>{sourceInfo[s].name}</span><b>{st?.xp ?? 0} XP</b></li>; })}
          </ul>
        </section>

        <section className="mp-panel" aria-labelledby="mp-recent">
          <h2 id="mp-recent">Recent activity</h2>
          {summary.recent && summary.recent.length ? (
            <ol className="mp-timeline">
              {summary.recent.slice(0, 12).map((a, i) => (
                <li key={i}>
                  <span className="mp-dot" data-source={a.source} aria-hidden="true" />
                  <div><strong>{a.label}</strong><small>{sourceInfo[a.source]?.name ?? a.source} · {new Date(a.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small></div>
                  <b>+{a.xp} XP</b>
                </li>
              ))}
            </ol>
          ) : <p className="mp-note">No activity yet. Finish a lesson, a skill level, a patient or today’s challenge — it appears here at once.</p>}
        </section>

        <section className="mp-panel" aria-labelledby="mp-heat">
          <h2 id="mp-heat">The last five weeks</h2>
          <Heatmap summary={summary} today={today} />
          <p className="mp-note">Each square is a day. Brighter means more learning.</p>
        </section>

        <section className="mp-panel mp-wide" aria-labelledby="mp-levels">
          <h2 id="mp-levels">Levels</h2>
          <ol className="mp-levels">{levels.map((l) => <li key={l.name} data-on={xp >= l.min}><strong>{l.name}</strong><small>{l.min} XP</small></li>)}</ol>
        </section>
      </div>

      <section className="mp-panel mp-settings" aria-labelledby="mp-settings">
        <h2 id="mp-settings">Your details</h2>
        {editing ? (
          <form onSubmit={save} className="mp-form">
            <label>Name<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={40} required /></label>
            <label>You are<select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>{Object.entries(stages).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label>Main goal<select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>{Object.entries(goalsLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label>University<input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} maxLength={80} /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={60} /></label>
            <div className="mp-actions"><button type="submit" className="nx-btn nx-btn-primary" disabled={busy === "save"}>Save</button><button type="button" className="nx-btn nx-btn-ghost" onClick={() => setEditing(false)}>Cancel</button></div>
          </form>
        ) : (
          <div className="mp-actions">
            <button type="button" className="nx-btn nx-btn-ghost" onClick={() => setEditing(true)}>Edit details</button>
            <button type="button" className="nx-btn nx-btn-ghost" onClick={exportData} disabled={busy === "export"}><Download className="h-4 w-4" aria-hidden="true" /> Download my record</button>
            <button type="button" className="nx-btn nx-btn-ghost" onClick={signOut}><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button>
            <button type="button" className="mp-danger" onClick={removeData} disabled={busy === "delete"}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete my record</button>
          </div>
        )}
        {msg ? <p className="mp-note" role="status">{msg}</p> : null}
      </section>
    </div>
  );
}
