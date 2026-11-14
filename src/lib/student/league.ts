/**
 * Weekly leagues — the pure parts: tiers, zones, plain-language advice and the countdown.
 * The scoring itself lives in the database (student_league_my): the browser only displays it.
 */
export type LeagueRow = { rank: number; name: string; xp: number; me: boolean };
export type LeagueResult = "promoted" | "stayed" | "demoted" | "practice";
export type LeagueWeek = { week_start: string; tier: number; rank: number | null; xp: number | null; size: number | null; result: LeagueResult | null };
export type LeagueReady = {
  enabled: true;
  week_start: string;
  ends_at: string;
  tier: number;
  best_tier: number;
  size: number;
  rank: number;
  xp: number;
  practice: boolean;
  promote_n: number;
  demote_n: number;
  promote_min_xp: number;
  standings: LeagueRow[];
  history: LeagueWeek[];
};
export type LeagueData = LeagueReady | { enabled: false; reason?: "opted_out" | "no_profile" };

export const TIERS = [
  { id: 1, name: "Bronze", colour: "#e0925a", glow: "#ffb37a" },
  { id: 2, name: "Silver", colour: "#c7d2de", glow: "#eef4fb" },
  { id: 3, name: "Gold", colour: "#ffcf4d", glow: "#fff0a8" },
  { id: 4, name: "Platinum", colour: "#6fe7ff", glow: "#c4f6ff" },
  { id: 5, name: "Emerald", colour: "#3be59d", glow: "#aaffd9" },
  { id: 6, name: "Sapphire", colour: "#6a94ff", glow: "#c3d4ff" },
  { id: 7, name: "Diamond", colour: "#c98bff", glow: "#ecd2ff" },
] as const;

export const tierInfo = (tier: number) => TIERS[Math.min(TIERS.length, Math.max(1, Math.round(tier))) - 1];

export type Zone = "practice" | "promote" | "promote-locked" | "safe" | "danger";

/** Where the student stands right now, by the same rules the database uses at the end of the week. */
export function zoneOf(league: LeagueReady): Zone {
  if (league.practice) return "practice";
  if (league.promote_n > 0 && league.rank <= league.promote_n) return league.xp >= league.promote_min_xp ? "promote" : "promote-locked";
  if (league.demote_n > 0 && league.rank > league.size - league.demote_n) return "danger";
  return "safe";
}

export type Advice = { zone: Zone; en: string; ur: string };

/** One sentence that says what to do next. */
export function adviceFor(league: LeagueReady): Advice {
  const zone = zoneOf(league);
  const next = league.tier < 7 ? tierInfo(league.tier + 1).name : null;
  if (zone === "practice") {
    return {
      zone,
      en: `Your league has ${league.size} ${league.size === 1 ? "student" : "students"}. Leagues start moving people up and down once 5 are in — invite a classmate.`,
      ur: `Aap ki league mein ${league.size} student hain. 5 students hone par promotion aur demotion shuru ho jata hai — apne kisi classmate ko bulayein.`,
    };
  }
  if (league.xp === 0) {
    return { zone, en: "Earn your first XP this week — the Daily Challenge takes about 3 minutes.", ur: "Is hafte ka pehla XP kamayein — Daily Challenge sirf 3 minute ka hai." };
  }
  if (zone === "promote") {
    return { zone, en: next ? `You are in the promotion zone for ${next}. Hold your place until Sunday midnight.` : "You lead the top tier. Hold your place until Sunday midnight.", ur: next ? `Aap ${next} ke promotion zone mein hain. Itwar raat 12 baje tak apni jagah barqarar rakhein.` : "Aap sab se upar tier mein aage hain. Itwar raat 12 baje tak apni jagah barqarar rakhein." };
  }
  if (zone === "promote-locked") {
    const need = Math.max(1, league.promote_min_xp - league.xp);
    return { zone, en: `You are in the top ${league.promote_n}, but promotion needs ${league.promote_min_xp} XP this week — ${need} more to go.`, ur: `Aap top ${league.promote_n} mein hain, lekin promotion ke liye is hafte ${league.promote_min_xp} XP chahiye — ${need} XP aur.` };
  }
  if (zone === "danger") {
    const firstSafe = league.standings.find((row) => row.rank === league.size - league.demote_n);
    const need = firstSafe ? Math.max(1, firstSafe.xp - league.xp + 1) : 1;
    return { zone, en: `You are in the demotion zone. ${need} XP gets you out of it.`, ur: `Aap demotion zone mein hain. Bahar nikalne ke liye ${need} XP chahiye.` };
  }
  const edge = league.standings.find((row) => row.rank === league.promote_n);
  if (!edge || !next) return { zone, en: "You are safe this week. Keep learning.", ur: "Is hafte aap mehfooz hain. Seekhte rahein." };
  const need = Math.max(1, Math.max(edge.xp, league.promote_min_xp - 1) - league.xp + 1);
  return { zone, en: `${need} XP to reach the promotion zone for ${next}.`, ur: `${next} ke promotion zone tak pahunchne ke liye ${need} XP chahiye.` };
}

export function resultCopy(result: LeagueResult, tier: number, rank: number | null) {
  const place = rank ? `#${rank}` : "";
  const name = tierInfo(tier).name;
  switch (result) {
    case "promoted":
      return { tone: "up" as const, en: `Promoted! You finished ${place} in ${name} and moved up to ${tier < 7 ? tierInfo(tier + 1).name : name}.`, ur: `Mubarak! Aap ${name} mein ${place} par rahe aur ${tier < 7 ? tierInfo(tier + 1).name : name} mein pohnch gaye.` };
    case "demoted":
      return { tone: "down" as const, en: `You finished ${place} in ${name} and dropped to ${tier > 1 ? tierInfo(tier - 1).name : name}. A strong week brings you straight back.`, ur: `Aap ${name} mein ${place} par rahe aur ${tier > 1 ? tierInfo(tier - 1).name : name} mein aa gaye. Ek achha hafta aap ko foran wapas le aayega.` };
    case "practice":
      return { tone: "flat" as const, en: `Practice week in ${name}: the league was too small for anyone to move. You finished ${place}.`, ur: `${name} mein practice week: league chhoti thi is liye kisi ki tier nahi badli. Aap ${place} par rahe.` };
    default:
      return { tone: "flat" as const, en: `You finished ${place} in ${name} and stay there. Reach the top 30 % to move up.`, ur: `Aap ${name} mein ${place} par rahe aur isi tier mein hain. Upar jane ke liye top 30 % mein aayein.` };
  }
}

export function timeLeft(endsAt: string, now = Date.now()) {
  const ms = Math.max(0, Date.parse(endsAt) - now);
  const minutes = Math.floor(ms / 60000);
  return { done: ms <= 0, days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };
}

export function countdownText(endsAt: string, now = Date.now(), ur = false) {
  const t = timeLeft(endsAt, now);
  if (t.done) return ur ? "Hafta khatam ho raha hai" : "Week is closing";
  if (t.days > 0) return `${t.days}d ${String(t.hours).padStart(2, "0")}h`;
  if (t.hours > 0) return `${t.hours}h ${String(t.minutes).padStart(2, "0")}m`;
  return `${t.minutes}m`;
}

/** Rows to show in the compact card: the top three and the student with one neighbour either side. */
export function compactRows(rows: LeagueRow[], myRank: number) {
  const keep = new Set<number>();
  [1, 2, 3, myRank - 1, myRank, myRank + 1].forEach((rank) => rank >= 1 && rank <= rows.length && keep.add(rank));
  return rows.filter((row) => keep.has(row.rank));
}
