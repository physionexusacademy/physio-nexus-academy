"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Crown, Medal, RefreshCw, Sun, Trophy, Users } from "lucide-react";
import { Ur } from "@/components/Ur";
import "./champion-boards.css";

/**
 * The Daily Clinical Challenge's public rankings in the same dark, glowing design as the Weekly Leagues: THREE boards side by side (today,
 * this month, this year; one under the other on a phone), each with the top players by name, a medal for the first three, their points and
 * how many challenges they finished. Live: they refresh by themselves and the moment a score is saved. Plain, large text and big tap targets.
 * The numbers come from /api/daily-challenge/leaderboard (names are the public display names the players agreed to show).
 */
type Period = "today" | "month" | "year";
type Row = { place: number; name: string; points: number; challenges: number };

const SHORT = 5;
const LONG = 15;

const monthLabel = (anchor: string, period: Period) => {
  if (!anchor) return period === "month" ? "This month" : "This year";
  const d = new Date(anchor + "T12:00:00Z");
  return period === "month" ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }) : d.toLocaleDateString("en-GB", { year: "numeric", timeZone: "UTC" });
};
const shiftAnchor = (anchor: string, period: Period, delta: number) => {
  const d = new Date(anchor + "T12:00:00Z");
  d.setUTCDate(1);
  if (period === "month") d.setUTCMonth(d.getUTCMonth() + delta);
  else d.setUTCFullYear(d.getUTCFullYear() + delta);
  return d.toISOString().slice(0, 10);
};
const initials = (name: string) => name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "PN";
/** A steady colour for a name, so the same person always has the same avatar. */
const hue = (name: string) => [...name].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 7);

/**
 * One board. `lazy` (the home page): the scores are asked for only when the board comes near the screen, and the 45-second refresh only runs
 * while the tab is visible, so the static home page makes no database call for a visitor who never scrolls down to it.
 */
function Board({ period, lazy = false, playHref = "#play-daily" }: { period: Period; lazy?: boolean; playHref?: string }) {
  const [near, setNear] = useState(!lazy);
  const holder = useRef<HTMLElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [anchor, setAnchor] = useState("");
  const [latest, setLatest] = useState("");
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const size = open ? LONG : SHORT;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const query = new URLSearchParams({ period, limit: String(size + 1), offset: "0" });
        if (anchor && period !== "today") query.set("anchor", anchor);
        const response = await fetch("/api/daily-challenge/leaderboard?" + query.toString(), { cache: "no-store", signal });
        if (!response.ok) throw new Error("board");
        const data = (await response.json()) as { rows: Row[]; challengeDate: string };
        if (signal?.aborted) return;
        setLatest(data.challengeDate);
        setRows(data.rows.slice(0, size));
        setMore(data.rows.length > size);
        setFailed(false);
      } catch {
        if (!signal?.aborted) setFailed(true);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [period, anchor, size],
  );

  useEffect(() => {
    if (near) return;
    const node = holder.current;
    if (!node || typeof IntersectionObserver === "undefined") return setNear(true);
    const watcher = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); watcher.disconnect(); } }, { rootMargin: "400px 0px" });
    watcher.observe(node);
    return () => watcher.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();
    setLoading(true);
    void load(controller.signal);
    const timer = window.setInterval(() => { if (!document.hidden) void load(controller.signal); }, 45000);
    const onScore = () => void load(controller.signal);
    window.addEventListener("pna-daily-score-saved", onScore);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("pna-daily-score-saved", onScore);
    };
  }, [load, near]);

  const chosen = anchor || latest;
  const key = period === "month" ? 7 : 4;
  const canNext = period !== "today" && !!chosen && shiftAnchor(chosen, period, 1).slice(0, key) <= latest.slice(0, key);
  const Icon = period === "today" ? Sun : period === "month" ? CalendarDays : Crown;

  return (
    <section ref={holder} className="cb-board" data-period={period} data-open={open ? "1" : "0"} aria-label={period === "today" ? "Today's ranking" : period === "month" ? "This month's ranking" : "This year's ranking"}>
      <header className="cb-bhead">
        <span className="cb-ico" aria-hidden="true"><Icon className="h-5 w-5" /></span>
        <div className="cb-btitle">
          <h3>
            {period === "today" ? <Ur en="Today" ur="Aaj" /> : monthLabel(chosen, period)}
          </h3>
          <p>
            {period === "today" ? <Ur en="Resets every night at 12:00 AM PKT" ur="Har raat 12:00 baje (PKT) naye sire se" /> : period === "month" ? <Ur en="All points earned this month" ur="Is mahine ke tamam points" /> : <Ur en="All points earned this year" ur="Is saal ke tamam points" />}
          </p>
        </div>
        {period !== "today" ? (
          <div className="cb-nav">
            <button type="button" onClick={() => chosen && setAnchor(shiftAnchor(chosen, period, -1))} aria-label={period === "month" ? "Previous month" : "Previous year"}><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" disabled={!canNext} onClick={() => chosen && setAnchor(shiftAnchor(chosen, period, 1))} aria-label={period === "month" ? "Next month" : "Next year"}><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        ) : null}
      </header>

      {failed && rows.length === 0 ? (
        <div className="cb-empty" role="status">
          <p><Ur en="The ranking could not load." ur="Ranking load nahi ho saki." /></p>
          <button type="button" className="cb-more" onClick={() => { setLoading(true); setFailed(false); void load(); }}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> <Ur en="Try again" ur="Dobara koshish karein" />
          </button>
        </div>
      ) : loading && rows.length === 0 ? (
        <ol className="cb-rows" aria-hidden="true">{[0, 1, 2].map((i) => <li key={i} className="cb-row cb-skel" />)}</ol>
      ) : rows.length === 0 ? (
        <div className="cb-empty">
          <Users className="h-7 w-7" aria-hidden="true" />
          <p><Ur en="Nobody has scored yet. Be the first name here!" ur="Abhi kisi ne score nahi kiya. Sab se pehle aap ka naam yahan aaye!" /></p>
          <a href={playHref} className="cb-more"><Trophy className="h-4 w-4" aria-hidden="true" /> <Ur en="Play today's challenge" ur="Aaj ka challenge khelein" /></a>
        </div>
      ) : (
        <ol className="cb-rows">
          {rows.map((row) => (
            <li key={`${row.place}-${row.name}`} className="cb-row" data-place={row.place <= 3 ? row.place : undefined}>
              <span className="cb-rank" aria-label={`Rank ${row.place}`}>{row.place <= 3 ? <Medal className="h-5 w-5" aria-hidden="true" /> : row.place}</span>
              <span className="cb-av" style={{ background: `linear-gradient(135deg, hsl(${hue(row.name)} 80% 70%), hsl(${(hue(row.name) + 60) % 360} 75% 62%))` }} aria-hidden="true">{initials(row.name)}</span>
              <span className="cb-name">
                <b>{row.name}{row.place === 1 ? <Crown className="cb-crown h-4 w-4" aria-label="Leader" /> : null}</b>
                <small>{row.challenges} <Ur en={row.challenges === 1 ? "challenge" : "challenges"} ur="challenge" /></small>
              </span>
              <span className="cb-pts"><b>{row.points}</b><small><Ur en="points" ur="points" /></small></span>
            </li>
          ))}
        </ol>
      )}

      {rows.length > 0 && (more || open) ? (
        <button type="button" className="cb-more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? <Ur en="Show fewer" ur="Kam dikhayein" /> : <Ur en={`Show top ${LONG}`} ur={`Top ${LONG} dikhayein`} />}
        </button>
      ) : null}
    </section>
  );
}

/** The single "today" board for the home page (loaded when it comes near the screen). */
export function HomeTodayBoard() {
  return <Board period="today" lazy playHref="/daily-challenge#play-daily" />;
}

export function ChampionBoards() {
  return (
    <section id="full-leaderboard" className="cb scroll-mt-28" aria-labelledby="cb-title">
      <span id="hall-of-fame" className="sr-only" />
      <div className="cb-card">
        <div className="cb-head">
          <div>
            <span className="cb-badge"><span className="cb-live" aria-hidden="true" /> <Ur en="Live · Free" ur="Live · Free" /></span>
            <h2 id="cb-title" className="cb-title">
              <Ur en="PNA Champions League" ur="PNA Champions League" />
              <span><Ur en="Today. This month. This year." ur="Aaj. Is mahine. Is saal." /></span>
            </h2>
            <p className="cb-lead"><Ur en="Finish the Daily Challenge and your name appears on all three boards. More points, higher rank." ur="Daily Challenge poora karein aur aap ka naam teenon boards par aayega. Zyada points, ooncha rank." /></p>
          </div>
          <a href="#play-daily" className="cb-play"><Trophy className="h-5 w-5" aria-hidden="true" /> <Ur en="Play today's challenge" ur="Aaj ka challenge khelein" /></a>
        </div>

        <div className="cb-grid">
          <Board period="today" />
          <Board period="month" />
          <Board period="year" />
        </div>
        <p className="cb-foot"><Ur en="Names are the public display names the players agreed to show. Points come only from answers scored on the server." ur="Naam wahi hain jo khilariyon ne public dikhane ki ijazat di. Points sirf server par check kiye gaye jawabon se milte hain." /></p>
      </div>
    </section>
  );
}
