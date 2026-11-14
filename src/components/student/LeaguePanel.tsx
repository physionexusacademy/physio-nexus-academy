"use client";

import "./league.css";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Clock, Crown, LoaderCircle, Minus, ShieldCheck, Users, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { flushStudentOutbox } from "@/lib/student/flush";
import { SYNCED_EVENT } from "@/lib/student/outbox";
import { useLang } from "@/lib/lang";
import { adviceFor, compactRows, countdownText, resultCopy, tierInfo, TIERS, zoneOf, type LeagueData, type LeagueReady, type LeagueRow, type Zone } from "@/lib/student/league";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: LeagueData };

export function TierMedal({ tier, size = 88, spin = true }: { tier: number; size?: number; spin?: boolean }) {
  const info = tierInfo(tier);
  const id = `lg-m${tier}-${size}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="lg-medal" data-spin={spin} role="img" aria-label={`${info.name} tier`}>
      <defs>
        <linearGradient id={`${id}-f`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0" stopColor={info.glow} />
          <stop offset=".45" stopColor={info.colour} />
          <stop offset="1" stopColor="#0b2a4a" />
        </linearGradient>
        <radialGradient id={`${id}-g`} cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor={info.glow} stopOpacity=".55" />
          <stop offset="1" stopColor={info.colour} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-g)`} />
      <circle cx="50" cy="50" r="45" className="lg-medal-ring" stroke={info.colour} />
      <path d="M50 8 86 29v42L50 92 14 71V29Z" fill={`url(#${id}-f)`} stroke={info.glow} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 18 77 33.5v33L50 82 23 66.5v-33Z" fill="rgba(5,15,34,.55)" stroke={info.glow} strokeOpacity=".55" strokeWidth="1" />
      <text x="50" y="62" textAnchor="middle" className="lg-medal-num" fill={info.glow}>{tier}</text>
    </svg>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

function Ladder({ tier, best, ur }: { tier: number; best: number; ur: boolean }) {
  return (
    <ol className="lg-ladder" aria-label={ur ? "Tier ladder" : "Tier ladder"}>
      {TIERS.map((t) => (
        <li key={t.id} data-state={t.id === tier ? "now" : t.id < tier ? "past" : t.id <= best ? "best" : "future"} style={{ ["--c" as string]: t.colour }}>
          <i aria-hidden="true" />
          <span>{t.name}</span>
        </li>
      ))}
    </ol>
  );
}

function ZoneIcon({ zone }: { zone: Zone }) {
  if (zone === "promote" || zone === "promote-locked") return <ArrowUp className="h-4 w-4" aria-hidden="true" />;
  if (zone === "danger") return <ArrowDown className="h-4 w-4" aria-hidden="true" />;
  if (zone === "practice") return <Users className="h-4 w-4" aria-hidden="true" />;
  return <ShieldCheck className="h-4 w-4" aria-hidden="true" />;
}

function Row({ row, max, zone }: { row: LeagueRow; max: number; zone: "promote" | "danger" | "safe" }) {
  return (
    <li className="lg-row" data-me={row.me} data-zone={zone} data-top={row.rank <= 3} style={{ ["--w" as string]: `${Math.max(3, Math.round((row.xp / Math.max(1, max)) * 100))}%` }}>
      <span className="lg-rank">{row.rank === 1 ? <Crown className="h-4 w-4" aria-label="1st" /> : row.rank}</span>
      <span className="lg-avatar" style={{ ["--h" as string]: hue(row.name) }} aria-hidden="true">{initials(row.name)}</span>
      <span className="lg-name"><span className="lg-name-row">{row.name}{row.me ? <em>you</em> : null}</span><i className="lg-bar" aria-hidden="true" /></span>
      <b className="lg-xp">{row.xp} <small>XP</small></b>
    </li>
  );
}

function History({ data, ur }: { data: LeagueReady; ur: boolean }) {
  const weeks = [...data.history].reverse();
  if (weeks.length < 2) return null;
  const w = 280, h = 64, pad = 14;
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, weeks.length - 1);
  const y = (tier: number) => h - pad - ((tier - 1) / 6) * (h - pad * 2);
  const line = weeks.map((wk, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(wk.tier).toFixed(1)}`).join(" ");
  return (
    <section className="lg-block" aria-label={ur ? "Pichle hafte" : "Past weeks"}>
      <h3>{ur ? "Pichle hafte" : "Past weeks"}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="lg-history" role="img" aria-label={weeks.map((wk) => `${wk.week_start}: ${tierInfo(wk.tier).name}${wk.rank ? `, rank ${wk.rank}` : ""}`).join("; ")}>
        <path d={line} fill="none" stroke="#2ee6d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {weeks.map((wk, i) => <circle key={wk.week_start} cx={x(i)} cy={y(wk.tier)} r="4" fill={tierInfo(wk.tier).colour} stroke="#071a33" strokeWidth="1.5" />)}
      </svg>
    </section>
  );
}

const EARN = [
  { href: "/daily-challenge", en: "Daily Challenge", ur: "Daily Challenge", note: "≈ 3 min · up to 35 XP" },
  { href: "/learn", en: "PNA Teacher lesson", ur: "PNA Teacher lesson", note: "up to 80 XP" },
  { href: "/skills", en: "Skills Lab level", ur: "Skills Lab level", note: "up to 150 XP" },
  { href: "/virtual-patient", en: "Virtual Patient", ur: "Virtual Patient", note: "up to 200 XP" },
];

export function LeaguePanel({ compact = false }: { compact?: boolean }) {
  const [lang] = useLang();
  const ur = lang === "ur";
  const t = useCallback((en: string, u: string) => (ur ? u : en), [ur]);
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<State>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      await flushStudentOutbox();
      const { data, error } = await supabase.rpc("student_league_my");
      if (error) throw new Error(error.message);
      setState({ status: "ready", data: data as LeagueData });
    } catch (e) {
      setState((prev) => (prev.status === "ready" ? prev : { status: "error", message: e instanceof Error ? e.message : "Could not open your league." }));
    }
  }, [supabase]);

  useEffect(() => {
    void load();
    const refresh = () => void load();
    const tick = window.setInterval(() => setNow(Date.now()), 30000);
    const poll = window.setInterval(() => { if (!document.hidden) void load(); }, 90000);
    window.addEventListener(SYNCED_EVENT, refresh);
    return () => { window.clearInterval(tick); window.clearInterval(poll); window.removeEventListener(SYNCED_EVENT, refresh); };
  }, [load]);

  async function setOptIn(value: boolean) {
    setBusy(true);
    const { error } = await supabase.rpc("student_set_league", { p_opt_in: value });
    setBusy(false);
    if (error) { setState({ status: "error", message: error.message }); return; }
    setState({ status: "loading" });
    await load();
  }

  if (state.status === "loading") return <div className="lg lg-state" role="status"><LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> {t("Opening your league…", "Aap ki league khul rahi hai…")}</div>;
  if (state.status === "error" && compact) return null; // a small card never shows an error: the full league page does
  if (state.status === "error") return <div className="lg lg-state" role="alert"><p>{t("We could not open your league", "Aap ki league nahi khul saki")}: {state.message}</p><button type="button" className="nx-btn nx-btn-primary" onClick={() => { setState({ status: "loading" }); void load(); }}>{t("Try again", "Dobara try karein")}</button></div>;

  const data = state.data;
  if (!data.enabled) {
    return (
      <section className="lg lg-join" aria-label="Leagues">
        <TierMedal tier={1} size={84} />
        <div>
          <h2>{data.reason === "opted_out" ? t("Leagues are switched off for you", "Aap ke liye leagues band hain") : t("Finish your profile to join a league", "League mein shamil hone ke liye profile mukammal karein")}</h2>
          <p>{t("Every week you are placed with up to 30 other students at your tier. Earn XP by learning — the top 30 % move up.", "Har hafte aap ko apni tier ke 30 tak students ke saath rakha jata hai. Seekh kar XP kamayein — top 30 % upar jate hain.")}</p>
          {data.reason === "opted_out" ? <button type="button" className="nx-btn nx-btn-primary" disabled={busy} onClick={() => void setOptIn(true)}>{t("Join this week's league", "Is hafte ki league join karein")} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button> : <Link className="nx-btn nx-btn-primary" href="/account">{t("Open My PNA", "My PNA kholein")}</Link>}
        </div>
      </section>
    );
  }

  const info = tierInfo(data.tier);
  const zone = zoneOf(data);
  const advice = adviceFor(data);
  const max = data.standings[0]?.xp ?? 0;
  const last = data.history[0] && data.history[0].week_start < data.week_start ? data.history[0] : null;
  const lastCopy = last?.result ? resultCopy(last.result, last.tier, last.rank) : null;
  const rows = compact ? compactRows(data.standings, data.rank) : data.standings;
  const zoneFor = (rank: number): "promote" | "danger" | "safe" => (data.promote_n && rank <= data.promote_n ? "promote" : data.demote_n && rank > data.size - data.demote_n ? "danger" : "safe");

  return (
    <section className="lg" data-compact={compact} data-zone={zone} style={{ ["--tier" as string]: info.colour, ["--tier-glow" as string]: info.glow }} aria-label={t("Your weekly league", "Aap ki hafta-war league")}>
      <header className="lg-hero">
        <TierMedal tier={data.tier} size={compact ? 76 : 104} />
        <div className="lg-hero-text">
          <p className="lg-kicker"><Zap className="h-3.5 w-3.5" aria-hidden="true" /> {t("Weekly league", "Hafta-war league")}</p>
          <h2>{info.name} {t("League", "League")}</h2>
          <p className="lg-clock"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {t("Ends in", "Khatam hone mein")} <b>{countdownText(data.ends_at, now, ur)}</b> · {t("Sunday midnight PKT", "Itwar raat 12 baje PKT")}</p>
        </div>
        <dl className="lg-me" aria-label={t("Your standing", "Aap ki position")}>
          <div><dt>{t("Rank", "Rank")}</dt><dd>#{data.rank}<small>/{data.size}</small></dd></div>
          <div><dt>{t("This week", "Is hafte")}</dt><dd>{data.xp}<small> XP</small></dd></div>
        </dl>
      </header>

      {!compact ? <Ladder tier={data.tier} best={data.best_tier} ur={ur} /> : null}

      <p className="lg-advice" data-zone={zone} role="status"><ZoneIcon zone={zone} /> <span>{ur ? advice.ur : advice.en}</span></p>

      {lastCopy && last && !compact ? (
        <p className="lg-last" data-tone={lastCopy.tone}>
          {lastCopy.tone === "up" ? <ArrowUp className="h-4 w-4" aria-hidden="true" /> : lastCopy.tone === "down" ? <ArrowDown className="h-4 w-4" aria-hidden="true" /> : <Minus className="h-4 w-4" aria-hidden="true" />}
          <span><strong>{t("Last week", "Pichla hafta")}:</strong> {ur ? lastCopy.ur : lastCopy.en}</span>
        </p>
      ) : null}

      <ol className="lg-table" aria-label={t("League standings", "League ki standings")}>
        {rows.map((row, i) => {
          const prev = rows[i - 1];
          const gap = prev && row.rank - prev.rank > 1;
          const showUp = !compact && data.promote_n > 0 && row.rank === data.promote_n + 1;
          const showDown = !compact && data.demote_n > 0 && row.rank === data.size - data.demote_n + 1;
          return (
            <Fragment key={row.rank}>
              {gap ? <li className="lg-gap" aria-hidden="true">⋯</li> : null}
              {showUp ? <li className="lg-divider" data-kind="up" aria-hidden="true"><ArrowUp className="h-3.5 w-3.5" /> {t("Promotion zone ends here", "Promotion zone yahan khatam")}</li> : null}
              {showDown ? <li className="lg-divider" data-kind="down" aria-hidden="true"><ArrowDown className="h-3.5 w-3.5" /> {t("Demotion zone", "Demotion zone")}</li> : null}
              <Row row={row} max={max} zone={zoneFor(row.rank)} />
            </Fragment>
          );
        })}
      </ol>

      {compact ? (
        <Link href="/leagues" className="lg-open">{t("Open full league", "Poori league dekhein")} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      ) : (
        <>
          <section className="lg-block" aria-label={t("Earn XP", "XP kamayein")}>
            <h3>{t("Earn XP now", "Abhi XP kamayein")}</h3>
            <ul className="lg-earn">
              {EARN.map((item) => <li key={item.href}><Link href={item.href}><b>{ur ? item.ur : item.en}</b><small>{item.note}</small><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></li>)}
            </ul>
          </section>
          <History data={data} ur={ur} />
          <footer className="lg-foot">
            <p>{t("Scores come from your saved learning record on the server, never from the browser. Top 30 % (with at least 100 XP) move up; the bottom 20 % move down. Your display name is visible to your league.", "Scores server par aap ke saved learning record se aate hain, browser se nahi. Top 30 % (kam az kam 100 XP ke saath) upar jate hain; neeche ke 20 % neeche aate hain. Aap ka display name aap ki league ko nazar aata hai.")}</p>
            <button type="button" className="lg-leave" disabled={busy} onClick={() => void setOptIn(false)}>{t("Hide me from leagues", "Mujhe leagues se hata dein")}</button>
          </footer>
        </>
      )}
    </section>
  );
}
