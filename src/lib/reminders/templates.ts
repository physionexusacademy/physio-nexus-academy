/**
 * Reminder e-mails. Pure functions (no server-only imports) so the Cloudflare cron job and the validator share them.
 *
 * Rules every template follows:
 *  - plain, short, one clear action;
 *  - RehabVerse messages never contain symptoms, scores, notes or anything a clinician wrote — only "something is waiting";
 *  - every message carries its own one-click unsubscribe link and the matching List-Unsubscribe headers.
 */
export type ReminderKind = "daily_challenge" | "rehab_checkin" | "rehab_day";
export type ReminderLang = "mix" | "en" | "ru";

export type ClaimedReminder = {
  id: number;
  token: string;
  kind: ReminderKind;
  to: string;
  name: string;
  lang: ReminderLang;
  streak?: number;
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

export function buildReminderMail(item: ClaimedReminder, origin: string): ReminderMail {
  const base = origin.replace(/\/$/, "");
  const copy = item.kind === "daily_challenge" ? dailyCopy(Math.max(0, Math.floor(item.streak ?? 0))) : REHAB[item.kind][item.lang === "en" ? "en" : "ru"];
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
