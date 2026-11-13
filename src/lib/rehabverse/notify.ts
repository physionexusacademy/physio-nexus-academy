import "server-only";
import { getPatient } from "./api";

/**
 * E-mails to a patient about their own programme. They are deliberately plain: they say that something
 * changed and link to the dashboard. They never contain symptoms, scores, notes or the clinician's
 * message — those stay behind the patient's login.
 */
export type PatientEmailKind = "programme_ready" | "next_day_ready" | "paused" | "stopped" | "completed" | "day_opened";

const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";

const COPY: Record<PatientEmailKind, { en: [string, string]; ru: [string, string] }> = {
  programme_ready: {
    en: ["Your RehabVerse programme is ready", "Your physiotherapist has approved your programme. Day 1 is open — sign in to see today's exercises."],
    ru: ["Aap ka RehabVerse programme tayyar hai", "Aap ke physiotherapist ne aap ka programme approve kar diya hai. Din 1 khul gaya hai — aaj ki exercises dekhne ke liye sign in karein."],
  },
  next_day_ready: {
    en: ["Your next RehabVerse day is open", "Your physiotherapist reviewed your feedback and opened your next day. Sign in to continue."],
    ru: ["Aap ka agla RehabVerse din khul gaya", "Aap ke physiotherapist ne aap ka feedback dekh kar agla din khol diya hai. Jaari rakhne ke liye sign in karein."],
  },
  day_opened: {
    en: ["A RehabVerse day was opened for you", "Your physiotherapist opened your next day. Sign in to continue."],
    ru: ["Aap ke liye RehabVerse ka din khola gaya", "Aap ke physiotherapist ne aap ka agla din khol diya hai. Jaari rakhne ke liye sign in karein."],
  },
  paused: {
    en: ["An update on your RehabVerse programme", "Your physiotherapist has paused your programme for now. Please sign in to read their message, and do not continue the exercises until they say so."],
    ru: ["Aap ke RehabVerse programme ka update", "Aap ke physiotherapist ne filhal aap ka programme pause kar diya hai. Unka paigham parhne ke liye sign in karein, aur unke kehne tak exercises jaari na rakhein."],
  },
  stopped: {
    en: ["An update on your RehabVerse programme", "Your physiotherapist has stopped this programme. Please sign in to read their message or contact the clinic."],
    ru: ["Aap ke RehabVerse programme ka update", "Aap ke physiotherapist ne ye programme rok diya hai. Paigham parhne ke liye sign in karein ya clinic se rabta karein."],
  },
  completed: {
    en: ["You completed your RehabVerse programme", "Well done — your programme is complete. Sign in to see your progress."],
    ru: ["Aap ne apna RehabVerse programme mukammal kar liya", "Shabash — aap ka programme mukammal ho gaya. Apni progress dekhne ke liye sign in karein."],
  },
};

export async function emailPatient(patientId: string, kind: PatientEmailKind): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const record = await getPatient(patientId);
    const to = record.patient.email;
    if (!to) return;
    const lang = record.patient.preferred_language === "en" ? "en" : "ru";
    const [subject, line] = COPY[kind][lang];
    const first = record.patient.full_name.split(" ")[0];
    const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://physionexusacademy.com").replace(/\/$/, "");
    const text = [
      lang === "ru" ? `Assalam-o-alaikum ${first},` : `Hello ${first},`,
      "",
      line,
      "",
      `${origin}/rehabverse/me`,
      "",
      lang === "ru"
        ? "Ye email is liye aayi ke aap ka Physio Nexus Academy ka RehabVerse account hai. Is mein aap ki sehat ki koi tafseel nahi hoti. Emergency mein apna local emergency number milayein."
        : "You are receiving this because you have a RehabVerse account at Physio Nexus Academy. It never contains your health details. In an emergency, call your local emergency number.",
    ].join("\n");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, text }),
    });
    if (!response.ok) console.error("RehabVerse patient email failed:", response.status);
  } catch (error) {
    console.error("RehabVerse patient email error:", error);
  }
}
