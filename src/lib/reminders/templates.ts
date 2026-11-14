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

/** One sober sentence that acknowledges what this person has actually done — no badges, rankings or pressure. */
function participantAcknowledgement(item: ClaimedReminder): string {
  const st = item.stats ?? { missions: 0, points: 0, best: 0, first_day: null, last_day: null, participants: 0, top_percent: 100 };
  const streak = Math.max(0, Math.floor(item.streak ?? 0));
  const first = st.first_day ? new Date(`${st.first_day}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }) : "";
  if (st.missions >= 2 && streak >= 2) return `Thank you for taking part on ${streak} consecutive days. You have completed ${NUM(st.missions)} challenges so far, with a best score of ${st.best}/100.`;
  if (st.missions >= 2) return `Thank you for taking part regularly. You have completed ${NUM(st.missions)} challenges so far, with a best score of ${st.best}/100.`;
  if (st.missions === 1) return `Thank you for completing your first challenge, where you scored ${st.best}/100.`;
  return `You began a challenge with us${first ? ` on ${first}` : ""}. Today's questions are ready whenever you would like to complete one.`;
}

/** The Daily Clinical Challenge reminder for a past participant: addressed by full name, calm and professional, one clear action. */
function buildParticipantMail(item: ClaimedReminder, base: string): ReminderMail {
  const name = FULL_NAME(item.name);
  const unsubscribe = reminderUnsubscribeUrl(base, item.token);
  const link = `${base}/daily-challenge`;
  const subject = `${name}, today's Clinical Challenge is ready`;
  const intro = "Today's Daily Clinical Challenge is now open: five clinical questions, 30 seconds each, about three minutes in total.";
  const thanks = participantAcknowledgement(item);
  const timing = "A new set of questions opens every day at midnight, Pakistan time.";
  const urdu = "Aaj ka Daily Clinical Challenge tayyar hai — sirf 3 minute ka.";
  const why = `You are receiving this because you took part in the PNA Daily Clinical Challenge as ${name}.`;

  const text = [
    `Assalam-o-alaikum, ${name},`,
    "",
    intro,
    "",
    thanks,
    "",
    `Open today's challenge: ${link}`,
    "",
    timing,
    urdu,
    "",
    "With regards,",
    "Physio Nexus Academy",
    "",
    "—",
    why,
    `If you would rather not receive these reminders, you can unsubscribe in one click and we will not send another: ${unsubscribe}`,
    SENDER_LINE,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f8;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1f3a4a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #dbe5ec;border-radius:10px;overflow:hidden">
<tr><td style="background:#0a1f3d;padding:18px 32px"><div style="font-size:12px;letter-spacing:.18em;color:#ffffff;font-weight:700">PHYSIO NEXUS ACADEMY</div><div style="margin-top:3px;font-size:12px;color:#8fb3c9">Daily Clinical Challenge</div></td></tr>
<tr><td style="padding:30px 32px 6px">
<p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#0a1f3d">Assalam-o-alaikum, <strong>${esc(name)}</strong>,</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">${esc(intro)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.75">${esc(thanks)}</p>
<p style="margin:0 0 24px"><a href="${esc(link)}" style="display:inline-block;background:#0a1f3d;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:6px">Open today's challenge</a></p>
<p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#5b7482">${esc(timing)}</p>
<p style="margin:0 0 24px;font-size:13px;line-height:1.7;color:#5b7482">${esc(urdu)}</p>
<p style="margin:0;font-size:15px;line-height:1.7">With regards,<br><strong>Physio Nexus Academy</strong></p>
</td></tr>
<tr><td style="padding:22px 32px 26px"><p style="margin:0;padding-top:16px;border-top:1px solid #e4ecf1;font-size:12px;line-height:1.75;color:#7a8e99">${esc(why)} If you would rather not receive these reminders, you can <a href="${esc(unsubscribe)}" style="color:#4a6a7c">unsubscribe in one click</a> and we will not send another.<br>${esc(SENDER_LINE)}</p></td></tr>
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
