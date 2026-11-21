import type { Bi } from "../types.ts";

/**
 * What a patient is told before an AI assistant talks with them. One place for all three assistants, so the wording the patient sees is the
 * wording the physiotherapist reviews (the review pack in Admin reads this same file) and the ethics wording is changed in one place.
 * "alert" items are the emergency line; "shield" items are the AI / privacy / research statements.
 */
export type NoticeItem = { icon: "shield" | "alert"; en: string; ru: string };
export type AiNotice = { badge?: Bi; title: Bi; items: NoticeItem[] };

const title: Bi = { en: "Before we start", ru: "Shuru karne se pehle" };

export const AI_NOTICES: Record<"intake" | "coach" | "checkin", AiNotice> = {
  intake: {
    badge: { en: "Your physiotherapist has made this available to you", ru: "Aap ke physiotherapist ne ye aap ke liye faraham kiya hai" },
    title,
    items: [
      { icon: "shield", en: "I am an AI assistant, not a doctor or a physiotherapist. I cannot diagnose or give treatment advice.", ru: "Main AI assistant hoon, doctor ya physiotherapist nahi. Main diagnose ya ilaaj ka mashwara nahi de sakta." },
      { icon: "shield", en: "I will ask about your problem so your physiotherapist has a clear picture. They read everything and make every decision about your care.", ru: "Main aap ki takleef ke baare mein poochunga taake aap ke physiotherapist ko saaf tasveer mile. Woh sab kuch parhte hain aur aap ke ilaaj ka har faisla wohi karte hain." },
      { icon: "shield", en: "Please do not type your name, phone number or address. I do not need them.", ru: "Barah-e-karam apna naam, phone number ya pata na likhein. Mujhe in ki zaroorat nahi." },
      { icon: "shield", en: "Our conversation is saved in your RehabVerse record. Your physiotherapist can read it, and it may also be used, without your name, to study how AI can help in physiotherapy.", ru: "Hamari baat-cheet aap ke RehabVerse record mein mehfooz hoti hai. Aap ka physiotherapist ise parh sakta hai, aur aap ka naam hataye baghair ye is tehqeeq mein bhi istemal ho sakti hai ke AI physiotherapy mein kaise madad kar sakta hai." },
      { icon: "shield", en: "To write its replies, this assistant uses an AI service from a technology provider (Claude by Anthropic, Groq or Cloudflare AI). Only the chat text is sent, never your account name, e-mail or phone number.", ru: "Jawab likhne ke liye ye assistant ek technology provider ki AI service istemal karta hai (Anthropic ka Claude, Groq ya Cloudflare AI). Sirf baat-cheet ka matn bheja jata hai, aap ke account ka naam, e-mail ya phone number kabhi nahi." },
      { icon: "alert", en: "In an emergency, such as chest pain, trouble breathing, loss of bladder or bowel control or sudden weakness, call 1122 straight away.", ru: "Emergency mein, jaise seene mein dard, saans mein mushkil, peshab/pakhane par control khona ya achanak kamzori, foran 1122 par call karein." },
    ],
  },
  coach: {
    title,
    items: [
      { icon: "shield", en: "I am an AI coach, not a doctor or a physiotherapist. I explain the exercises your physiotherapist chose; I cannot change them, diagnose, or advise on medicines.", ru: "Main AI coach hoon, doctor ya physiotherapist nahi. Main wohi exercises samjhata hoon jo aap ke physiotherapist ne chunin; main unhein badal nahi sakta, diagnose nahi kar sakta aur dawai ka mashwara nahi de sakta." },
      { icon: "shield", en: "Your physiotherapist can read this chat, and it may be used, without your name, to study how AI can help in physiotherapy. Please do not type your name or phone number.", ru: "Aap ka physiotherapist ye baat-cheet parh sakta hai, aur aap ka naam hataye baghair ye tehqeeq mein istemal ho sakti hai ke AI physiotherapy mein kaise madad kar sakta hai. Apna naam ya phone number na likhein." },
      { icon: "shield", en: "To write its replies, this assistant uses an AI service from a technology provider (Claude by Anthropic, Groq or Cloudflare AI). Only the chat text is sent, never your account name, e-mail or phone number.", ru: "Jawab likhne ke liye ye assistant ek technology provider ki AI service istemal karta hai (Anthropic ka Claude, Groq ya Cloudflare AI). Sirf baat-cheet ka matn bheja jata hai, aap ke account ka naam, e-mail ya phone number kabhi nahi." },
      { icon: "alert", en: "If something hurts sharply, you feel dizzy, or you have chest pain, trouble breathing or sudden weakness, stop and call 1122.", ru: "Agar tez dard ho, chakkar aaye, ya seene mein dard, saans mein mushkil ya achanak kamzori ho to ruk jayein aur 1122 par call karein." },
    ],
  },
  checkin: {
    title,
    items: [
      { icon: "shield", en: "I am an AI assistant, not a doctor or a physiotherapist. I only ask the check-in questions and fill in the form below; you check it and save it yourself. I cannot diagnose or change your plan.", ru: "Main AI assistant hoon, doctor ya physiotherapist nahi. Main sirf check-in ke sawal poochta hoon aur neeche ka form bharta hoon; aap use check karke khud save karte hain. Main diagnose nahi kar sakta aur na plan badal sakta hoon." },
      { icon: "shield", en: "Your physiotherapist can read this chat, and it may be used, without your name, to study how AI can help in physiotherapy. Please do not type your name or phone number.", ru: "Aap ka physiotherapist ye baat-cheet parh sakta hai, aur aap ka naam hataye baghair ye tehqeeq mein istemal ho sakti hai ke AI physiotherapy mein kaise madad kar sakta hai. Apna naam ya phone number na likhein." },
      { icon: "shield", en: "To write its replies, this assistant uses an AI service from a technology provider (Claude by Anthropic, Groq or Cloudflare AI). Only the chat text is sent, never your account name, e-mail or phone number.", ru: "Jawab likhne ke liye ye assistant ek technology provider ki AI service istemal karta hai (Anthropic ka Claude, Groq ya Cloudflare AI). Sirf baat-cheet ka matn bheja jata hai, aap ke account ka naam, e-mail ya phone number kabhi nahi." },
      { icon: "alert", en: "If you have chest pain, trouble breathing, fainting or sudden weakness, call 1122 now.", ru: "Agar seene mein dard, saans mein mushkil, behoshi ya achanak kamzori ho to abhi 1122 par call karein." },
    ],
  },
};
