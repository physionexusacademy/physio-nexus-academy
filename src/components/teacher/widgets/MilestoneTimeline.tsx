"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Pill, Seg, WidgetFrame, bi, type Bi } from "./kit";

type Domain = "move" | "talk" | "social" | "think";
type Item = { d: Domain; text: Bi };
type Checkpoint = { m: number; label: Bi; items: Item[]; flag: Bi };

const mv = (en: string, ur: string): Item => ({ d: "move", text: { en, ur } });
const tk = (en: string, ur: string): Item => ({ d: "talk", text: { en, ur } });
const so = (en: string, ur: string): Item => ({ d: "social", text: { en, ur } });
const th = (en: string, ur: string): Item => ({ d: "think", text: { en, ur } });

/**
 * The ages at which most children (at least 3 in 4) show these skills, summarised in our own words from the CDC 2022 "Learn the Signs. Act Early" checklists.
 * Always point families to the official CDC checklist for the exact wording.
 */
const CHECKPOINTS: Checkpoint[] = [
  {
    m: 2,
    label: { en: "2 months", ur: "2 mahine" },
    items: [
      mv("Lifts the head briefly when on the tummy", "Pait ke bal lete hue sar thori der uthata hai"),
      mv("Moves both arms and both legs", "Dono bazoo aur dono taangein hilata hai"),
      mv("Opens the hands for a moment", "Haath thori der ke liye kholta hai"),
      tk("Makes sounds other than crying; reacts to a loud sound", "Rone ke ilawa awaazein nikalta hai; zorse awaaz par chounkta hai"),
      so("Smiles when you talk or smile; looks at your face", "Aap ke bolne ya muskurane par muskurata hai; chehre ko dekhta hai"),
      th("Watches you move; looks at a toy for a few seconds", "Aap ko harkat karte dekhta hai; khilone ko kuch seconds dekhta hai"),
    ],
    flag: { en: "Moves one side much less than the other, or does not react to sound or faces.", ur: "Ek side doosri se bohat kam hilti hai, ya awaaz aur chehre par rad-e-amal nahi." },
  },
  {
    m: 4,
    label: { en: "4 months", ur: "4 mahine" },
    items: [
      mv("Holds the head steady when held upright", "Utha kar pakarne par sar thama rakhta hai"),
      mv("Pushes up on the elbows when on the tummy", "Pait ke bal kohniyon par uthta hai"),
      mv("Brings the hands to the mouth; holds a toy put in the hand", "Haath munh tak laata hai; haath mein rakha khilona pakarta hai"),
      tk("Coos and makes sounds back when you talk; turns toward your voice", "Gunguna hai aur aap ke bolne par awaaz nikalta hai; aap ki awaaz ki taraf mudta hai"),
      so("Smiles on his own to get your attention; chuckles", "Apni taraf se aap ka dhyan lene ko muskurata hai; hansi ki halki awaaz"),
      th("Looks at his own hands; opens the mouth when he sees the breast or bottle", "Apne haathon ko dilchaspi se dekhta hai; doodh dekh kar munh kholta hai"),
    ],
    flag: { en: "Poor head control, hands stay tightly fisted, or he does not follow things with his eyes.", ur: "Sar par qaboo nahi, haath kasay hue band rehte hain, ya aankhon se cheezein follow nahi karta." },
  },
  {
    m: 6,
    label: { en: "6 months", ur: "6 mahine" },
    items: [
      mv("Rolls from tummy to back", "Pait se kamar par palatta hai"),
      mv("Pushes up on straight arms; leans on the hands to sit", "Seedhay bazooon par uthta hai; haathon ke sahare baithta hai"),
      tk("Takes turns making sounds with you; blows raspberries", "Aap ke saath bari bari awaazein nikalta hai; hothon se raspberry"),
      so("Knows familiar people; laughs", "Jaanay pehchanay logon ko pehchanta hai; hansta hai"),
      th("Reaches for a toy; puts things in the mouth to explore", "Khilone tak pohanchta hai; cheezein munh mein daal kar dekhta hai"),
    ],
    flag: { en: "Legs stiff and crossed, or very floppy; not reaching; not rolling.", ur: "Taangein akri aur crossed, ya bohat dheeli; cheez tak nahi pohanchta; palatta nahi." },
  },
  {
    m: 9,
    label: { en: "9 months", ur: "9 mahine" },
    items: [
      mv("Sits without support and gets into sitting alone", "Sahare ke baghair baithta hai aur khud baithne ki position mein aata hai"),
      mv("Passes a toy from one hand to the other; rakes food with the fingers", "Khilona ek haath se doosre mein deta hai; ungliyon se khana apni taraf kheenchta hai"),
      tk("Makes sounds like 'mamama' and 'bababa'; lifts the arms to be picked up", "'mamama' aur 'bababa' jaisi awaazein; utha-ne ke liye bazoo uthata hai"),
      so("Shy with strangers; looks when his name is called; plays peek-a-boo", "Ajnabiyon se sharmata hai; naam par dekhta hai; peek-a-boo khelta hai"),
      th("Looks for a toy that dropped out of sight; bangs two things together", "Nazar se ojhal gire khilone ko dhoondta hai; do cheezein takrata hai"),
    ],
    flag: { en: "Cannot sit even with support, no weight on the legs, no babbling, one hand never used.", ur: "Sahare se bhi baith nahi sakta, taangon par wazan nahi, babbling nahi, ek haath kabhi istemal nahi." },
  },
  {
    m: 12,
    label: { en: "12 months", ur: "12 mahine" },
    items: [
      mv("Pulls up to stand and cruises along furniture", "Pakar kar khara hota hai aur furniture pakar kar chalta hai"),
      mv("Picks up small food between thumb and finger (pincer)", "Anguthe aur ungli se chhota khana uthata hai (pincer)"),
      tk("Waves bye-bye; calls a parent 'mama' or 'dada'; understands 'no'", "Bye-bye karta hai; walidain ko 'mama' ya 'dada' kehta hai; 'nahi' samajhta hai"),
      so("Plays simple games such as pat-a-cake", "Pat-a-cake jaisay saday khel khelta hai"),
      th("Puts a block in a cup; looks for a toy you hide", "Block cup mein daalta hai; aap ka chhupaya khilona dhoondta hai"),
    ],
    flag: { en: "Does not pull up, a strong hand preference this early, no pointing or waving, no babble.", ur: "Pakar kar khara nahi hota, itni jaldi ek haath ko taraseeh, ishara ya hath hilana nahi, babbling nahi." },
  },
  {
    m: 15,
    label: { en: "15 months", ur: "15 mahine" },
    items: [
      mv("Takes a few steps on his own", "Khud kuch qadam leta hai"),
      mv("Feeds himself some food with the fingers", "Ungliyon se khud kuch khana khata hai"),
      tk("Says one or two words besides mama/dada; points to ask for something", "Mama/dada ke ilawa ek do alfaaz bolta hai; kuch maangne ko ishara karta hai"),
      so("Copies other children; shows you affection; claps when excited", "Doosray bachon ki naqal; pyaar dikhata hai; khushi mein taali"),
      th("Uses a cup or phone the right way; stacks two blocks", "Cup ya phone sahi tareeqe se istemal; do blocks ek ke upar"),
    ],
    flag: { en: "Not taking steps by 15–18 months needs a proper check, not waiting.", ur: "15–18 mahine tak qadam nahi to intezaar nahi, theek se jaanch zaroori." },
  },
  {
    m: 18,
    label: { en: "18 months", ur: "18 mahine" },
    items: [
      mv("Walks without holding on", "Bina pakray chalta hai"),
      mv("Scribbles; climbs on and off a couch alone; tries a spoon", "Lakeerein banata hai; sofa par khud chadhta utarta hai; chamach try karta hai"),
      tk("Says three or more words; follows a one-step instruction without gestures", "Teen ya zyada alfaaz; ishaaray ke baghair ek qadam wali hidayat par amal"),
      so("Points to show you something interesting; checks you are near", "Dilchasp cheez dikhane ko ishara karta hai; dekhta hai aap qareeb hain"),
      th("Copies chores like sweeping; plays simply with toys such as pushing a car", "Jharoo jaisay kaam ki naqal; khilone saday tareeqe se, jaise gaari dhakelna"),
    ],
    flag: { en: "Not walking by 18 months, very few words, no pointing, or any loss of skills.", ur: "18 mahine tak chalta nahi, bohat kam alfaaz, ishara nahi, ya koi hunar kho dena." },
  },
  {
    m: 24,
    label: { en: "2 years", ur: "2 saal" },
    items: [
      mv("Kicks a ball; runs; walks up a few stairs with or without help", "Ball ko laat marta hai; bhagta hai; madad ke saath ya baghair chand seerhiyan chadhta hai"),
      mv("Eats with a spoon", "Chamach se khata hai"),
      tk("Says at least two words together ('more milk'); points to body parts", "Kam az kam do alfaaz ek saath ('more milk'); jism ke hissay batata hai"),
      so("Notices when others are hurt or upset", "Jaan leta hai jab doosray takleef ya pareshani mein hon"),
      th("Holds something in one hand and works with the other; plays with more than one toy at once", "Ek haath mein cheez pakar kar doosray se kaam; ek waqt mein ek se zyada khilonay se khelta hai"),
    ],
    flag: { en: "Does not run, no two-word phrases, loses skills, or walks only on the toes all the time.", ur: "Bhagta nahi, do lafzi jumlay nahi, hunar kho deta hai, ya hamesha sirf ungliyon par chalta hai." },
  },
  {
    m: 30,
    label: { en: "30 months", ur: "30 mahine" },
    items: [
      mv("Jumps off the ground with both feet", "Dono paaon se zameen se uchhalta hai"),
      mv("Twists a doorknob or lid; takes off loose clothes; turns book pages one at a time", "Doorknob ya dhakkan ghumata hai; dheelay kapray utarta hai; kitab ka ek ek safha palatta hai"),
      tk("Says about 50 words; says two or more words with an action word ('doggie run')", "Taqreeban 50 alfaaz; action lafz ke saath do ya zyada alfaaz ('doggie run')"),
      so("Plays next to other children and sometimes with them; 'look at me!'", "Doosray bachon ke qareeb aur kabhi un ke saath khelta hai; 'mujhe dekho!'"),
      th("Pretends with objects; follows two-step instructions; knows at least one colour", "Cheezon se pretend play; do qadam wali hidayat; kam az kam ek rang jaanta hai"),
    ],
    flag: { en: "Cannot jump, very few words, no pretend play, or clear regression.", ur: "Uchhal nahi sakta, bohat kam alfaaz, pretend play nahi, ya saaf regression." },
  },
  {
    m: 36,
    label: { en: "3 years", ur: "3 saal" },
    items: [
      mv("Strings large beads; puts on loose clothes; uses a fork", "Bare moti pirota hai; dheelay kapray pehanta hai; kanta istemal karta hai"),
      tk("Holds a back-and-forth conversation; asks who/what/where/why; strangers mostly understand", "Do tarfa baat cheet; kaun/kya/kahan/kyun poochta hai; ajnabi aksar samajh lete hain"),
      so("Calms within about 10 minutes after you leave; joins other children to play", "Aap ke jane ke taqreeban 10 minute mein shaant; doosray bachon ke saath khelta hai"),
      th("Draws a circle when shown; avoids touching hot things when warned", "Dikhane par gol banata hai; tanbeeh par garam cheezon se door rehta hai"),
    ],
    flag: { en: "Falls often, cannot climb stairs, speech hard to understand, no play with others.", ur: "Aksar girta hai, seerhi nahi chadhta, bolna samajhna mushkil, doosron ke saath nahi khelta." },
  },
  {
    m: 48,
    label: { en: "4 years", ur: "4 saal" },
    items: [
      mv("Catches a large ball most of the time; unbuttons some buttons", "Bara ball aksar pakar leta hai; kuch button kholta hai"),
      mv("Holds a crayon between fingers and thumb, not in a fist", "Crayon ko mutthi mein nahi, ungliyon aur anguthe mein pakarta hai"),
      tk("Says sentences of four or more words; tells you about his day", "Chaar ya zyada alfaaz ke jumlay; apne din ke bare mein batata hai"),
      so("Pretends to be someone else; comforts others who are hurt", "Kisi aur ka kirdar nibhata hai; zakhmi ya udaas ko tasalli deta hai"),
      th("Names a few colours; draws a person with three or more body parts", "Kuch rang batata hai; teen ya zyada hisson wala insaan banata hai"),
    ],
    flag: { en: "Cannot hop, cannot use a pencil with fingers, cannot be understood, loses skills.", ur: "Hop nahi kar sakta, pencil ungliyon se nahi pakarta, baat samajh nahi aati, hunar kho deta hai." },
  },
  {
    m: 60,
    label: { en: "5 years", ur: "5 saal" },
    items: [
      mv("Hops on one foot; buttons some buttons", "Ek paaon par hop karta hai; kuch button lagata hai"),
      tk("Tells a short story with two events; keeps a conversation going; uses simple rhymes", "Do waqiaat wali chhoti kahani; baat cheet jaari rakhta hai; saday rhymes"),
      so("Follows rules and takes turns in games; does simple chores", "Khel mein usool aur bari ka khayal; saday ghar ke kaam"),
      th("Counts to 10; uses words like yesterday and tomorrow; writes some letters of his name", "10 tak ginti; kal aur parson jaisay alfaaz; apne naam ke kuch harf likhta hai"),
    ],
    flag: { en: "Cannot hop, very untidy pencil grip, cannot take turns or follow rules, any regression.", ur: "Hop nahi, pencil ki pakar bohat kharab, bari ya usool nahi, koi regression." },
  },
];

const DOMAINS: { id: Domain; label: Bi; tone: "teal" | "violet" | "amber" | "sky" }[] = [
  { id: "move", label: { en: "Movement", ur: "Harkat" }, tone: "teal" },
  { id: "talk", label: { en: "Language", ur: "Zubaan" }, tone: "violet" },
  { id: "social", label: { en: "Social", ur: "Samaji" }, tone: "amber" },
  { id: "think", label: { en: "Thinking", ur: "Sochna" }, tone: "sky" },
];

const PREMATURE = [0, 4, 8, 12];

export function MilestoneTimeline({ lang }: { lang: TeacherLang }) {
  const [age, setAge] = useState(12);
  const [early, setEarly] = useState(0);
  const [domain, setDomain] = useState<Domain | "all">("all");

  // A baby born early is judged by the corrected age until 24 months: age minus the months born early.
  const corrected = age <= 24 ? Math.max(0, age - early / 4.345) : age;
  const useCorrected = early > 0 && age <= 24;
  const reached = CHECKPOINTS.filter((c) => c.m <= corrected + 0.01);
  const current = reached.length ? reached[reached.length - 1] : null;
  const next = CHECKPOINTS.find((c) => c.m > corrected + 0.01) ?? null;
  const shown = current ?? CHECKPOINTS[0];
  const items = shown.items.filter((item) => domain === "all" || item.d === domain);

  return (
    <WidgetFrame id="milestone-timeline">
      <div className="grid gap-3">
        <div>
          <label htmlFor="mt-age" className="text-sm font-bold text-navy-800">
            {t(lang, `Age of the child: ${age < 24 ? `${age} months` : `${(age / 12).toFixed(age % 12 ? 1 : 0)} years`}`, `Bachay ki umar: ${age < 24 ? `${age} mahine` : `${(age / 12).toFixed(age % 12 ? 1 : 0)} saal`}`)}
          </label>
          <input id="mt-age" type="range" min={0} max={60} step={1} value={age} onChange={(event) => setAge(Number(event.target.value))} className="mt-1 w-full accent-teal-600" />
          <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={t(lang, "Jump to a checkpoint", "Checkpoint par jayein")}>
            {CHECKPOINTS.map((c) => (
              <button key={c.m} type="button" onClick={() => setAge(c.m)} aria-pressed={age === c.m} className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", age === c.m ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300")}>
                {bi(lang, c.label)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-navy-800">{t(lang, "Born early by:", "Kitna pehle paida hua:")}</span>
          <Seg
            value={String(early) as "0" | "4" | "8" | "12"}
            onChange={(next) => setEarly(Number(next))}
            label={t(lang, "Weeks born early", "Kitne hafte pehle paida")}
            options={PREMATURE.map((w) => ({ id: String(w) as "0" | "4" | "8" | "12", label: w === 0 ? t(lang, "Full term", "Full term") : t(lang, `${w} weeks`, `${w} hafte`) }))}
          />
        </div>
        <Seg value={domain} onChange={setDomain} label={t(lang, "Domain", "Domain")} options={[{ id: "all" as const, label: t(lang, "All", "Sab") }, ...DOMAINS.map((d) => ({ id: d.id, label: bi(lang, d.label) }))]} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3" aria-live="polite">
        <p className="text-sm font-extrabold text-navy-800">
          {useCorrected ? t(lang, `Corrected age ≈ ${corrected.toFixed(1)} months: use this, not ${age}.`, `Corrected age ≈ ${corrected.toFixed(1)} mahine: ${age} nahi, yeh istemal karein.`) : t(lang, "Use the age in the calendar (corrected age only matters under 24 months for babies born early).", "Calendar ki umar istemal karein (corrected age sirf 24 mahine se kam umar ke qabl-az-waqt paida bachon ke liye).")}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {current
            ? t(lang, `By now most children can do the ${current.label.en} skills below.`, `Ab tak aksar bachay neechay diye ${current.label.ur} ke hunar kar lete hain.`)
            : t(lang, "Too young for the first checkpoint (2 months). Here is what comes first:", "Pehle checkpoint (2 mahine) ke liye abhi chhota hai. Sab se pehle yeh aata hai:")}
        </p>
        <ul className="mt-2 grid gap-1.5">
          {items.map((item) => {
            const meta = DOMAINS.find((d) => d.id === item.d) ?? DOMAINS[0];
            return (
              <li key={item.text.en} className="flex flex-col items-start gap-1 text-sm leading-6 text-slate-700 sm:flex-row sm:gap-2">
                <Pill tone={meta.tone}>{bi(lang, meta.label)}</Pill>
                <span>{bi(lang, item.text)}</span>
              </li>
            );
          })}
          {items.length === 0 ? <li className="text-sm text-slate-500">{t(lang, "No item in this domain at this checkpoint.", "Is checkpoint par is domain ka koi item nahi.")}</li> : null}
        </ul>
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs leading-5 text-rose-900">
          <b>{t(lang, "Look closer if: ", "Gour se dekhein agar: ")}</b>
          {bi(lang, shown.flag)} {t(lang, "Losing a skill the child already had, at any age, always needs a prompt medical review.", "Jo hunar bachay mein pehle tha usay kho dena, kisi bhi umar mein, foran medical review maangta hai.")}
        </div>
        {next ? (
          <p className="mt-2 text-xs text-slate-500">
            {t(lang, `Next checkpoint: ${next.label.en}.`, `Agla checkpoint: ${next.label.ur}.`)}
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-4 text-slate-500">
        {t(
          lang,
          "Summarised in our own words from the CDC 2022 'Learn the Signs. Act Early' milestones (skills most children show by that age). These are screening prompts, not a diagnosis. Use the official CDC checklist with families.",
          "CDC 2022 'Learn the Signs. Act Early' milestones se apne alfaaz mein khulasa (jo hunar aksar bachay us umar tak dikhate hain). Yeh screening ke ishaaray hain, tashkhees nahi. Families ke saath official CDC checklist istemal karein.",
        )}
      </p>
    </WidgetFrame>
  );
}
