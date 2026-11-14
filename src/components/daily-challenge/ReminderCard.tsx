"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const formatHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "am" : "pm"}`;

/** Daily Challenge reminder switch for a signed-in student. Loaded in the browser only (it talks to Supabase). */
export function ReminderCard() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<{ ready: boolean; on: boolean; hour: number }>({ ready: false, on: false, hour: 18 });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    void supabase.rpc("student_my_prefs").then(({ data }) => {
      const prefs = data as { remind_email?: boolean; remind_hour?: number } | null;
      if (alive && prefs) setState({ ready: true, on: prefs.remind_email === true, hour: prefs.remind_hour ?? 18 });
    });
    return () => { alive = false; };
  }, [supabase]);

  if (!state.ready) return null;
  async function save(next: { on: boolean; hour: number }) {
    const before = state;
    setState({ ...state, ...next });
    setBusy(true); setNote("");
    const { error } = await supabase.rpc("student_set_reminders", { p_enabled: next.on, p_hour: next.hour });
    setBusy(false);
    if (error) { setState(before); setNote("Could not save. Please try again."); return; }
    setNote(next.on ? `We will e-mail you at ${formatHour(next.hour)} Pakistan time on days you have not played yet.` : "Reminder e-mails are off.");
  }
  return (
    <div className="dc-remind">
      <label className="dc-remind-row">
        <input type="checkbox" checked={state.on} disabled={busy} onChange={(e) => void save({ on: e.target.checked, hour: state.hour })} />
        <span><BellRing className="inline h-4 w-4" aria-hidden="true" /> Remind me by e-mail to play tomorrow</span>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      </label>
      <label className="dc-remind-hour">
        at
        <select value={state.hour} disabled={!state.on || busy} onChange={(e) => void save({ on: state.on, hour: Number(e.target.value) })} aria-label="Reminder time, Pakistan time">
          {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
        </select>
        Pakistan time
      </label>
      {note ? <p role="status">{note}</p> : null}
    </div>
  );
}
