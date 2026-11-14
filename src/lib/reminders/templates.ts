/**
 * Reminder e-mails. Pure functions (no server-only imports) so the Cloudflare cron job and the validator share them.
 *
 * Rules every template follows:
 *  - plain, short, one clear action;
 *  - RehabVerse messages never contain symptoms, scores, notes or anything a clinician wrote — only "something is waiting";
 *  - every message carries its own one-click unsubscribe link and the matching List-Unsubscribe headers.
 */
export type ReminderKind = "daily_challenge" | "daily_participant" | "rehab_checkin" | "rehab_day";
export type ReminderLang = "mix" | "en" | "ru";

export type ClaimedReminder = {
  id: number;
  token: string;
  kind: ReminderKind;
  to: string;
  name: string;
  lang: ReminderLang;
  streak?: number;
  /** Daily Challenge participants only: their own history, from the database. */
  stats?: ParticipantStats;
};

export type ParticipantStats = {
  missions: number;
  points: number;
  best: number;
  first_day: string | null;
  last_day: string | null;
  participants: number;
  top_percent: number;
};

export type ReminderMail = {
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
};

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const firstName = (name: string) => (name.trim().split(/\s+/)[0] || "there").slice(0, 40);

type Copy = { subject: string; lines: string[]; button: string; path: string; why: string };

function dailyCopy(streak: number): Copy {
  const keep = streak >= 2;
  return {
    subject: keep ? `Keep your ${streak}-day streak alive — today's Clinical Challenge` : "Today's Clinical Challenge is waiting",
    lines: [
      "Today's Daily Clinical Challenge is ready: 5 questions, 30 seconds each — about 3 minutes.",
      keep ? `You are on a ${streak}-day streak. One quick round keeps it alive and adds to this week's league XP.` : "One quick round sharpens your clinical reasoning and adds to this week's league XP.",
      keep
        ? `Aaj ka Daily Clinical Challenge tayyar hai — sirf 5 sawal, takreeban 3 minute. Aap ka ${streak} din ka streak chal raha hai, ek round se wo barqarar rahega.`
        : "Aaj ka Daily Clinical Challenge tayyar hai — sirf 5 sawal, takreeban 3 minute. Ek round se clinical reasoning bhi tez hoti hai aur league XP bhi barhta hai.",
    ],
    button: "Play today's challenge",
    path: "/daily-challenge",
    why: "You are receiving this because you switched on daily reminders in My PNA.",
  };
}

const REHAB: Record<"rehab_checkin" | "rehab_day", Record<"en" | "ru", Copy>> = {
  rehab_checkin: {
    en: {
      subject: "A quick RehabVerse check-in is open",
      lines: [
        "Your RehabVerse recovery check-in is open. It takes about a minute and helps your physiotherapist decide your next step.",
        "If your symptoms are getting worse or you feel unwell, stop and contact your physiotherapist or your local emergency service.",
      ],
      button: "Open my check-in",
      path: "/rehabverse/me",
      why: "You are receiving this because you have a RehabVerse account. It never contains your health details.",
    },
    ru: {
      subject: "RehabVerse ka chhota sa check-in khula hai",
      lines: [
        "Aap ka RehabVerse recovery check-in khula hua hai. Sirf ek minute lagta hai aur is se aap ke physiotherapist ko agla qadam tay karne mein madad milti hai.",
        "Agar symptoms barh rahe hon ya tabiyat theek na lage to ruk jayein aur apne physiotherapist ya emergency service se rabta karein.",
      ],
      button: "Mera check-in kholein",
      path: "/rehabverse/me",
      why: "Ye email is liye aayi ke aap ka RehabVerse account hai. Is mein aap ki sehat ki koi tafseel nahi hoti.",
    },
  },
  rehab_day: {
    en: {
      subject: "Your RehabVerse day is waiting",
      lines: [
        "Your exercises for the day are ready whenever you are. Sign in to see them and start.",
        "If something feels wrong, or you are in more pain than usual, do not push through — message your physiotherapist first.",
      ],
      button: "Open my RehabVerse day",
      path: "/rehabverse/me",
      why: "You are receiving this because you have a RehabVerse account. It never contains your health details.",
    },
    ru: {
      subject: "Aap ka RehabVerse din intezar kar raha hai",
      lines: [
        "Aaj ki exercises tayyar hain — jab aap ko suhoolat ho sign in karke shuru kar lein.",
        "Agar kuch theek na lage ya dard maamool se zyada ho to zabardasti na karein — pehle apne physiotherapist ko paigham dein.",
      ],
      button: "Mera RehabVerse din kholein",
      path: "/rehabverse/me",
      why: "Ye email is liye aayi ke aap ka RehabVerse account hai. Is mein aap ki sehat ki koi tafseel nahi hoti.",
    },
  },
};

export function reminderUnsubscribeUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/api/reminders/unsubscribe?t=${token}`;
}

const FULL_NAME = (name: string) => name.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "there";
const NUM = (n: number) => Math.max(0, Math.round(Number(n) || 0)).toLocaleString("en-US");
const SENDER_LINE = "Physio Nexus Academy · Raja Ghazanfar Ali Khan Road, Saddar, Karachi 74400, Pakistan";

function participantFacts(item: ClaimedReminder) {
  const st: ParticipantStats = item.stats ?? { missions: 0, points: 0, best: 0, first_day: null, last_day: null, participants: 0, top_percent: 100 };
  const streak = Math.max(0, Math.floor(item.streak ?? 0));
  const first = st.first_day ? new Date(`${st.first_day}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }) : "";
  const lead =
    streak >= 2
      ? `You are on a ${streak}-day streak. One 3-minute mission keeps it alive — and keeps your name moving up the PNA leaderboard.`
      : st.missions >= 2
        ? `You have completed ${NUM(st.missions)} missions for ${NUM(st.points)} points. Today's mission is ready — can you beat your best of ${st.best}/100?`
        : st.missions === 1
          ? `You completed your first mission and scored ${st.best}/100. The second day of a habit is the one that counts — today's mission is ready for you.`
          : `You started a mission with us${first ? ` on ${first}` : ""}. Today is a fresh chance to finish a whole one and put your name on the PNA leaderboard.`;
  const top = st.participants >= 5 && st.missions >= 1 && st.top_percent <= 50 ? st.top_percent : null;
  return { st, streak, lead, top };
}

/** The Daily Clinical Challenge reminder for a past participant: their full name, their own record, one clear action. */
function buildParticipantMail(item: ClaimedReminder, base: string): ReminderMail {
  const name = FULL_NAME(item.name);
  const { st, streak, lead, top } = participantFacts(item);
  const unsubscribe = reminderUnsubscribeUrl(base, item.token);
  const link = `${base}/daily-challenge`;
  const subject = streak >= 2 ? `${name}, your ${streak}-day streak is waiting` : `${name}, your clinical mission is waiting`;
  const exclusive = st.participants >= 5 ? `You are one of only ${NUM(st.participants)} learners who have taken part in the PNA Daily Clinical Challenge so far — thank you for being one of them.` : "";
  const urdu = `Aap ke liye aaj ka Daily Clinical Challenge tayyar hai — sirf 3 minute. ${name}, aap jaise seekhne walon ki wajah se PNA ka leaderboard roz zinda rehta hai.`;
  const why = `You are receiving this because you took part in the PNA Daily Clinical Challenge as ${name}.`;
  const stop = `Not you, or no longer want these? Unsubscribe in one click and we will never send you a reminder again: ${unsubscribe}`;

  const text = [
    `Assalam-o-alaikum, ${name},`,
    "",
    lead,
    ...(top ? ["", `★ You are in the top ${top}% of PNA challengers.`] : []),
    ...(st.missions >= 1 ? ["", `Your record: ${NUM(st.missions)} missions · ${NUM(st.points)} points · best ${st.best}/100${streak >= 2 ? ` · ${streak}-day streak` : ""}`] : []),
    "",
    "Today's mission: 5 questions · 30 seconds each · up to 100 points (resets at midnight Pakistan time).",
    `Start now: ${link}`,
    "",
    ...(exclusive ? [exclusive, ""] : []),
    urdu,
    "",
    "— The Physio Nexus Academy team",
    "",
    why,
    stop,
    SENDER_LINE,
  ].join("\n");

  const cell = (value: string, label: string) =>
    `<td align="center" style="padding:14px 6px;background:#f2f8fb;border-radius:14px"><div style="font-size:24px;font-weight:800;color:#0b2a3b;line-height:1.1">${esc(value)}</div><div style="margin-top:4px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5b7482;font-weight:700">${esc(label)}</div></td>`;
  const stats = st.missions >= 1
    ? `<table role="presentation" width="100%" cellspacing="6" cellpadding="0" style="margin:18px 0 4px"><tr>${cell(NUM(st.missions), "Missions")}${cell(NUM(st.points), "Points")}${cell(`${st.best}/100`, "Best score")}${streak >= 2 ? cell(`${streak} 🔥`, "Day streak") : ""}</tr></table>`
    : "";
  const badge = top ? `<p style="margin:12px 0 0;text-align:center"><span style="display:inline-block;padding:7px 16px;border-radius:999px;background:#fff4d6;border:1px solid #f1d27a;color:#7a5200;font-size:13px;font-weight:700">★ You are in the top ${top}% of PNA challengers</span></p>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#eaf2f6;font-family:Segoe UI,Arial,sans-serif;color:#0f2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d3e2eb">
<tr><td style="background:#0a1f3d;background-image:linear-gradient(135deg,#0d4a6b,#0a1f3d 60%,#06142a);padding:26px 28px 24px">
<div style="font-size:11px;letter-spacing:.2em;color:#5eead4;font-weight:700">PHYSIO NEXUS ACADEMY · DAILY CLINICAL CHALLENGE</div>
<div style="margin-top:10px;font-size:13px;color:#a9bfd6">Assalam-o-alaikum,</div>
<div style="margin-top:2px;font-size:26px;line-height:1.2;font-weight:800;color:#ffffff">${esc(name)}</div>
</td></tr>
<tr><td style="padding:24px 28px 8px">
<p style="margin:0;font-size:16px;line-height:1.65">${esc(lead)}</p>
${badge}${stats}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;background:#0a1f3d;border-radius:16px"><tr><td style="padding:18px 20px">
<div style="font-size:10px;letter-spacing:.16em;color:#5eead4;font-weight:700">TODAY'S MISSION</div>
<div style="margin-top:6px;font-size:15px;color:#ffffff;font-weight:700">5 questions · 30 seconds each · up to 100 points</div>
<div style="margin-top:4px;font-size:12px;color:#a9bfd6">A fresh set unlocks every midnight, Pakistan time.</div>
<div style="margin-top:14px"><a href="${esc(link)}" style="display:inline-block;background:#2ee6d6;color:#032a2a;text-decoration:none;font-weight:800;padding:13px 24px;border-radius:12px;font-size:15px">Start today's mission &rarr;</a></div>
</td></tr></table>
${exclusive ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#44606f">${esc(exclusive)}</p>` : ""}
<p style="margin:14px 0 0;font-size:14px;line-height:1.65;color:#25414f">${esc(urdu)}</p>
<p style="margin:16px 0 0;font-size:14px;color:#25414f">— The Physio Nexus Academy team</p>
</td></tr>
<tr><td style="padding:18px 28px 24px"><p style="margin:0;padding-top:14px;border-top:1px solid #e3edf2;font-size:12px;line-height:1.7;color:#68808d">${esc(why)} Not you, or no longer want these? <a href="${esc(unsubscribe)}" style="color:#0a7f72;font-weight:700">Unsubscribe in one click</a> and we will never send you a reminder again.<br>${esc(SENDER_LINE)}</p></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html, headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } };
}

export function buildReminderMail(item: ClaimedReminder, origin: string): ReminderMail {
  const base = origin.replace(/\/$/, "");
  if (item.kind === "daily_participant") return buildParticipantMail(item, base);
  const copy = item.kind === "daily_challenge" ? dailyCopy(Math.max(0, Math.floor(item.streak ?? 0))) : REHAB[item.kind as "rehab_checkin" | "rehab_day"][item.lang === "en" ? "en" : "ru"];
  const unsubscribe = reminderUnsubscribeUrl(base, item.token);
  const link = `${base}${copy.path}`;
  const urdu = item.kind === "daily_challenge" || item.lang === "ru";
  const hello = urdu ? `Assalam-o-alaikum ${firstName(item.name)},` : `Hello ${firstName(item.name)},`;
  const stop = urdu ? `Reminders band karne ke liye / turn them off: ${unsubscribe}` : `Turn these reminders off: ${unsubscribe}`;
  const text = [hello, "", ...copy.lines.flatMap((l) => [l, ""]), `${copy.button}: ${link}`, "", copy.why, stop, "Physio Nexus Academy"].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#eef5f8;font-family:Segoe UI,Arial,sans-serif;color:#0f2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d6e4ec">
<tr><td style="background:#0b2a3b;padding:18px 24px;color:#7ff0e0;font-weight:700;letter-spacing:.14em;font-size:12px">PHYSIO NEXUS ACADEMY</td></tr>
<tr><td style="padding:24px"><p style="margin:0 0 14px;font-size:16px;font-weight:700">${esc(hello)}</p>
${copy.lines.map((l) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${esc(l)}</p>`).join("")}
<p style="margin:20px 0"><a href="${esc(link)}" style="display:inline-block;background:#0fb5a0;color:#032a2a;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px">${esc(copy.button)}</a></p>
<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#5b7482">${esc(copy.why)} <a href="${esc(unsubscribe)}" style="color:#0a7f72">${urdu ? "Band karein / Unsubscribe" : "Unsubscribe"}</a></p>
</td></tr></table></td></tr></table></body></html>`;
  return {
    subject: copy.subject,
    text,
    html,
    headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}
