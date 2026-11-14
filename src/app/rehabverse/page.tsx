import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Lock, ShieldCheck, Stethoscope, TrendingUp, UserCheck, UserPlus, Video } from "lucide-react";
import { GuideStage } from "@/components/rehabverse/GuideStage";
import { EnglishNote } from "@/components/rehabverse/EnglishNote";
import { T } from "@/components/rehabverse/useLang";
import { GUIDE } from "@/lib/rehabverse/guide";

const STEPS = [
  { icon: UserPlus, en: ["Create your account", "Your name, age and email — about one minute. Then a short, friendly questionnaire: your area, symptoms, pain, and a few safety questions."], ru: ["Account banayein", "Naam, umar aur email — lagbhag ek minute. Phir chhota aur aasaan questionnaire: kahan takleef hai, kya alamaat hain, dard kitna hai, aur kuch safety sawal."] },
  { icon: UserCheck, en: ["A physiotherapist reviews it", "A real physiotherapist reads your answers and builds your own programme. Nothing is automatic."], ru: ["Physiotherapist review karte hain", "Ek real physiotherapist aap ke jawabat parhte hain aur aap ka apna programme banate hain. Kuch bhi automatic nahi."] },
  { icon: Video, en: ["Learn every exercise in 3D", "Your virtual guide performs each movement slowly: start position, movement, return, common mistakes, breathing."], ru: ["Har exercise 3D mein seekhein", "Aap ka virtual guide har harkat aahista karke dikhata hai: start position, harkat, wapsi, aam ghaltiyan, saans."] },
  { icon: TrendingUp, en: ["Give daily feedback", "Pain before, during and after, how hard it felt, and how you recover later and the next day."], ru: ["Roz feedback dein", "Dard pehle, dauran aur baad mein, kitna mushkil laga, aur baad mein aur agle din recovery kaisi rahi."] },
  { icon: Lock, en: ["The next day opens safely", "Only after your feedback and your physiotherapist's approval. You always see just what is approved for you."], ru: ["Agla din safely khulta hai", "Sirf aap ke feedback aur physiotherapist ki approval ke baad. Aap ko hamesha wohi nazar aata hai jo aap ke liye approve hua ho."] },
];

const SAFE = [
  { icon: ShieldCheck, en: "Safety questions first — warning signs send you to a proper clinical check, not to exercise.", ru: "Pehle safety sawal — khatre ki alamaat aap ko exercise ki bajaye proper clinical check ki taraf bhejti hain." },
  { icon: Stethoscope, en: "No AI diagnosis or prescription. Your physiotherapist chooses, approves and can pause anything.", ru: "AI diagnosis ya prescription nahi karta. Aap ke physiotherapist chunte, approve karte aur kuch bhi pause kar sakte hain." },
  { icon: Lock, en: "Private by design — only you and your physiotherapist can see your records.", ru: "Privacy pehle — sirf aap aur aap ke physiotherapist aap ka record dekh sakte hain." },
  { icon: BellRing, en: "If you report a concerning symptom, your programme pauses and your physiotherapist is alerted.", ru: "Agar aap koi pareshan-kun alamat batate hain to programme ruk jata hai aur physiotherapist ko alert chala jata hai." },
];


const FAQ = [
  { en: ["Do I need an account?", "To get your own programme, yes — it keeps your answers and progress private and lets your physiotherapist reach you. Browsing the 3D exercise library needs no account."], ru: ["Kya account zaroori hai?", "Apna programme lene ke liye haan — ye aap ke jawabat aur progress ko private rakhta hai aur physiotherapist aap tak pohanch sakte hain. 3D exercise library dekhne ke liye account zaroori nahi."] },
  { en: ["Who builds my programme?", "A real physiotherapist at Physio Nexus Academy reads your answers and builds, approves and can change your programme. The 3D guide only shows you how to do the exercises."], ru: ["Mera programme kaun banata hai?", "Physio Nexus Academy ke ek real physiotherapist aap ke jawabat parhte hain aur programme banate, approve karte aur badal sakte hain. 3D guide sirf exercises karke dikhata hai."] },
  { en: ["What if my answers show a warning sign?", "Then no exercise programme is started. You will be asked to get a proper clinical assessment first — a ‘yes’ is not a diagnosis, it is a safety step."], ru: ["Agar mere jawab mein khatre ki alamat aaye?", "Tab koi exercise programme shuru nahi hota. Aap se pehle proper clinical assessment karwane ko kaha jata hai — ‘haan’ diagnosis nahi, safety ka qadam hai."] },
  { en: ["Why is the next day locked?", "Each day builds on how your body responded to the one before. The next day opens after you give feedback and your physiotherapist approves it."], ru: ["Agla din locked kyun hai?", "Har din pichle din par banta hai ke aap ke jism ne kaisa response diya. Agla din feedback dene aur physiotherapist ki approval ke baad khulta hai."] },
  { en: ["What if I feel pain or unwell?", "A mild ache can be normal, but sharp or worsening pain is not — stop and report it in your feedback. For chest pain, trouble breathing, sudden weakness or numbness, get emergency help straight away."], ru: ["Dard ya tabiyat kharab ho to?", "Halka dard aam ho sakta hai, lekin tez ya barhta dard nahi — ruk jayein aur feedback mein batayein. Seene mein dard, saans mein mushkil, achanak kamzori ya sunn-pan ho to foran emergency madad lein."] },
  { en: ["Which languages and devices work?", "English and Roman Urdu, on phone or computer. The optional spoken voice is English only; Roman Urdu always has subtitles."], ru: ["Kaun si zubaan aur device?", "English aur Roman Urdu, phone ya computer par. Awaaz (optional) sirf English mein hai; Roman Urdu ke saath subtitles hamesha hote hain."] },
  { en: ["Is my information private?", "Only you and your physiotherapist can see your records. Alert emails never contain your health details."], ru: ["Kya meri maloomat private hain?", "Sirf aap aur aap ke physiotherapist aap ka record dekh sakte hain. Alert emails mein aap ki sehat ki tafseel kabhi nahi hoti."] },
];

export const metadata: Metadata = {
  title: "RehabVerse — Guided 3D Home Rehabilitation",
  description: "RehabVerse by Physio Nexus Academy: describe your symptoms, get a physiotherapist-approved home programme and follow each exercise with a 3D virtual guide.",
  // The layout is shared by sign-in and dashboard pages, so this page declares its own canonical (it used to inherit the homepage's).
  alternates: { canonical: "https://physionexusacademy.com/rehabverse" },
  openGraph: {
    title: "RehabVerse — Guided 3D Home Rehabilitation | PNA",
    description: "A physiotherapist-approved home rehabilitation programme with a 3D virtual guide for every exercise, in English and Roman Urdu.",
    url: "https://physionexusacademy.com/rehabverse",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
};

export default function RehabVerseHome() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.en[0], acceptedAnswer: { "@type": "Answer", text: f.en[1] } })),
  };
  return (
    <div className="container-content pb-20 pt-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="grid items-center gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12">
        <div className="rv-fade-up">
          <p className="rv-h">PNA RehabVerse</p>
          <h1 className="mt-2 font-heading text-[2rem] font-extrabold leading-[1.1] tracking-tight text-navy-800 sm:text-5xl">
            <T en="Your guided rehab, step by step — with a 3D physio guide." ru="Aap ki guided rehab, qadam ba qadam — 3D physio guide ke saath." />
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-slate-600">
            <T
              en="Describe your symptoms, get a programme approved by a physiotherapist, and follow it day by day. Each exercise is shown in 3D, and each day opens only when it is safe."
              ru="Apni takleef bataein, physiotherapist ka approved programme hasil karein aur din ba din follow karein. Har exercise 3D mein dikhai jati hai, aur har din tabhi khulta hai jab safe ho."
            />
          </p>
          <EnglishNote />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/rehabverse/register" className="rv-btn rv-btn-primary">
              <UserPlus className="h-4 w-4" aria-hidden="true" /> <T en="Create your account" ru="Apna account banayein" /> <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/rehabverse/login" className="rv-btn rv-btn-ghost"><T en="Sign in" ru="Sign in" /></Link>
            <Link href="/rehabverse/library" className="text-[14px] font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Browse the 3D exercise library" ru="3D exercise library dekhein" /></Link>
          </div>
          <div className="mt-5 max-w-xl rounded-2xl border border-teal-200/70 bg-white/70 p-3.5 text-[13px] leading-5 text-slate-700" aria-label="Getting started">
            <b className="text-navy-800"><T en="New here? It takes three steps:" ru="Naye hain? Sirf teen qadam:" /></b>{" "}
            <T en="① Create an account (1 minute) → ② answer a few questions (5 minutes) → ③ your physiotherapist builds and approves your programme." ru="① Account banayein (1 minute) → ② kuch sawalon ke jawab dein (5 minute) → ③ aap ke physiotherapist aap ka programme banate aur approve karte hain." />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[["English + Roman Urdu", "English + Roman Urdu"], ["Phone friendly", "Phone par aasaan"], ["Physiotherapist approved", "Physiotherapist approved"], ["Private", "Private"]].map(([en, ru]) => (
              <li key={en} className="rv-chip rv-chip-teal"><T en={en} ru={ru} /></li>
            ))}
          </ul>
        </div>
        <GuideStage beats={GUIDE.welcome} className="rv-fade-up" />
      </section>

      <section className="mt-16" aria-labelledby="how">
        <p className="rv-h"><T en="How it works" ru="Ye kaise chalta hai" /></p>
        <h2 id="how" className="mt-1 font-heading text-2xl font-bold text-navy-800 sm:text-3xl"><T en="Five simple steps" ru="Paanch aasaan qadam" /></h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={i} className="rv-glass p-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><s.icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
              <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-teal-700"><T en="Step" ru="Qadam" /> {i + 1}</p>
              <h3 className="mt-0.5 text-[15px] font-bold leading-5 text-navy-800"><T en={s.en[0]} ru={s.ru[0]} /></h3>
              <p className="mt-1.5 text-[13px] leading-5 text-slate-600"><T en={s.en[1]} ru={s.ru[1]} /></p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start" aria-labelledby="safe">
        <div>
          <p className="rv-h"><T en="Safe by design" ru="Safety pehle" /></p>
          <h2 id="safe" className="mt-1 font-heading text-2xl font-bold text-navy-800 sm:text-3xl"><T en="Built so that you stay in safe hands." ru="Is tarah banaya gaya hai ke aap mehfooz rahein." /></h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            <T
              en="RehabVerse supports your physiotherapy. It does not replace an in-person assessment and it is not for emergencies."
              ru="RehabVerse aap ki physiotherapy ka saath deta hai. Ye in-person assessment ka badal nahi aur emergency ke liye nahi hai."
            />
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SAFE.map((s, i) => (
            <li key={i} className="rv-glass flex gap-3 p-4">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700"><s.icon className="h-4 w-4" aria-hidden="true" /></span>
              <p className="text-[13.5px] leading-6 text-slate-700"><T en={s.en} ru={s.ru} /></p>
            </li>
          ))}
        </ul>
      </section>


      <section className="mt-14" aria-labelledby="faq">
        <p className="rv-h"><T en="Questions" ru="Aam sawal" /></p>
        <h2 id="faq" className="mt-1 font-heading text-2xl font-bold text-navy-800 sm:text-3xl"><T en="Before you start" ru="Shuru karne se pehle" /></h2>
        <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
          {FAQ.map((f) => (
            <details key={f.en[0]} className="rv-glass group p-4">
              <summary className="cursor-pointer list-none text-[14.5px] font-bold text-navy-800 marker:hidden"><T en={f.en[0]} ru={f.ru[0]} /></summary>
              <p className="mt-2 text-[13.5px] leading-6 text-slate-700"><T en={f.en[1]} ru={f.ru[1]} /></p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f3d] via-[#0f4a63] to-[#0db3aa] p-6 text-white sm:p-9" aria-labelledby="ready">
        <h2 id="ready" className="font-heading text-2xl font-extrabold !text-white sm:text-3xl"><T en="Ready to start your guided rehab?" ru="Apni guided rehab shuru karne ke liye tayyar?" /></h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/85"><T en="Create your account, answer a few questions, and your physiotherapist takes it from there." ru="Account banayein, kuch sawalon ke jawab dein, baaqi kaam aap ke physiotherapist sambhal lete hain." /></p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/rehabverse/register" className="rv-btn !bg-white !text-[#0a1f3d]"><UserPlus className="h-4 w-4" aria-hidden="true" /> <T en="Create your account" ru="Apna account banayein" /></Link>
          <Link href="/rehabverse/login" className="rv-btn !border !border-white/50 !text-white"><T en="Sign in" ru="Sign in" /></Link>
        </div>
      </section>

      <p className="mt-12 max-w-3xl text-xs leading-5 text-slate-500">
        <T
          en="PNA RehabVerse is an educational and supportive tool under the supervision of a physiotherapist at Physio Nexus Academy. The virtual guide is a 3D character, not a clinician. Exercise content is reviewed by the supervising physiotherapist."
          ru="PNA RehabVerse physiotherapist ki nigrani mein Physio Nexus Academy ka ek taleemi aur madadgar tool hai. Virtual guide ek 3D character hai, clinician nahi. Exercise ka content supervising physiotherapist review karte hain."
        />
      </p>
    </div>
  );
}
