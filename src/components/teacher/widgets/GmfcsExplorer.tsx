"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Seg, WidgetFrame, bi, type Bi } from "./kit";

type Level = 1 | 2 | 3 | 4 | 5;
type Band = "u2" | "2-4" | "4-6" | "6-12" | "12-18";

const BANDS: { id: Band; label: Bi }[] = [
  { id: "u2", label: { en: "Under 2 y", ur: "2 saal se kam" } },
  { id: "2-4", label: { en: "2–4 y", ur: "2–4 saal" } },
  { id: "4-6", label: { en: "4–6 y", ur: "4–6 saal" } },
  { id: "6-12", label: { en: "6–12 y", ur: "6–12 saal" } },
  { id: "12-18", label: { en: "12–18 y", ur: "12–18 saal" } },
];

const HEAD: Record<Level, { name: Bi; hip: number; focus: Bi }> = {
  1: { name: { en: "Walks without limitations", ur: "Bina rukawat chalta hai" }, hip: 0, focus: { en: "Speed, balance, endurance, running and jumping, sport and fitness.", ur: "Raftaar, balance, endurance, bhagna aur kudna, khel aur fitness." } },
  2: { name: { en: "Walks with limitations", ur: "Rukawat ke saath chalta hai" }, hip: 15, focus: { en: "Balance on uneven ground, stairs, endurance, strength, long-distance options such as a wheelchair for outings.", ur: "Na-hamwar zameen par balance, seerhiyan, endurance, taqat, lambay faaslay ke liye wheelchair jaisay options." } },
  3: { name: { en: "Walks with a handheld device", ur: "Haath mein pakray device se chalta hai" }, hip: 41, focus: { en: "Walker or crutches skills, orthoses, supported standing, wheelchair for distance, transfers.", ur: "Walker ya crutches ki maharat, orthoses, supported standing, faaslay ke liye wheelchair, transfers." } },
  4: { name: { en: "Self-mobility is limited (power chair likely)", ur: "Apni harkat mehdood (power chair mumkin)" }, hip: 69, focus: { en: "Seating, powered mobility, supported standing, transfers, preventing contractures and hip problems.", ur: "Seating, powered mobility, supported standing, transfers, contractures aur hip masail se bachao." } },
  5: { name: { en: "Transported in a wheelchair", ur: "Wheelchair mein le jaya jata hai" }, hip: 90, focus: { en: "24-hour posture care, supported standing, comfort, breathing and feeding, safe handling for the family.", ur: "24 ghantay posture care, supported standing, aaram, saans aur khilana, family ke liye mehfooz handling." } },
};

const TEXT: Record<Level, Record<Band, Bi>> = {
  1: {
    u2: { en: "Sits with both hands free, crawls on hands and knees, pulls to stand and takes steps holding furniture; walks by 18 months to 2 years, no device.", ur: "Dono haath azad rakh kar baithta, haathon ghutnon par rengta, pakar kar khara hota aur furniture pakar kar chalta; 18 mahine se 2 saal tak chalta hai, device nahi." },
    "2-4": { en: "Sits on the floor with both hands free, gets up from the floor to standing and walks with no device.", ur: "Farsh par dono haath azad baithta, farsh se khara hota aur bina device chalta hai." },
    "4-6": { en: "Gets in and out of a chair without hand support, walks indoors and out, climbs stairs; is starting to run and jump.", ur: "Haathon ke sahare ke baghair kursi par baithta uthta, ghar ke andar bahar chalta, seerhiyan chadhta; bhagna kudna shuru." },
    "6-12": { en: "Walks anywhere and climbs stairs freely; runs and jumps, but speed, balance and coordination are reduced.", ur: "Har jagah chalta aur seerhiyan chadhta hai; bhagta kudta hai magar raftaar, balance aur coordination kam." },
    "12-18": { en: "Walks anywhere (home, school, outdoors) and takes stairs freely; may need extra care for speed and balance in sport.", ur: "Har jagah (ghar, school, bahar) chalta aur seerhiyan chadhta hai; khel mein raftaar aur balance ke liye mazeed tawajjo." },
  },
  2: {
    u2: { en: "Sits on the floor but may need a hand for balance; creeps on the tummy or crawls on hands and knees; may pull to stand and cruise.", ur: "Farsh par baithta hai magar balance ke liye haath chahiye ho sakta hai; pait ke bal sarakta ya rengta hai; pakar kar khara ho kar cruise kar sakta hai." },
    "2-4": { en: "Sits on the floor but may fall when using both hands; crawls with a reciprocal pattern, cruises, may walk with a device as the main way to move.", ur: "Farsh par baithta hai magar dono haath istemal karte hue gir sakta hai; reciprocal pattern se rengta, cruise karta, device ke saath chalna mukhya tareeqa ho sakta hai." },
    "4-6": { en: "Sits with both hands free; gets up from the floor or a chair but often pushes on a stable surface; walks without a device indoors and short distances outdoors; stairs with a rail, cannot run or jump.", ur: "Dono haath azad baithta; farsh ya kursi se uthta hai magar aksar mazboot sath par zor lagata; ghar mein baghair device aur bahar chhoti doori chalta; rail ke saath seerhi, bhag kood nahi." },
    "6-12": { en: "Walks in most places, but the setting and personal choice matter; may use a handheld device or a wheelchair for long distances; stairs with a rail; little running or jumping.", ur: "Aksar jagah chalta hai magar mahaul aur apni pasand ka asar; lambay faaslay ke liye device ya wheelchair; rail ke saath seerhi; bhagna kudna kam." },
    "12-18": { en: "Walks in most places but may use wheeled mobility for long distances or rough ground; stairs with a rail; limited running and jumping.", ur: "Aksar jagah chalta hai magar lambay faaslay ya na-hamwar zameen par wheeled mobility; rail ke saath seerhi; bhagna kudna mehdood." },
  },
  3: {
    u2: { en: "Sits on the floor only with the low back supported; rolls and creeps forward on the tummy.", ur: "Farsh par sirf kamar ke neechay sahare ke saath baithta hai; palatta aur pait ke bal aage sarakta hai." },
    "2-4": { en: "Often W-sits and needs an adult to get into sitting; creeps or crawls, often without alternating legs; may walk short distances indoors with a device and help.", ur: "Aksar W-sitting aur baithne ke liye bare ki madad; sarakta ya rengta hai, aksar taangein bari bari nahi; device aur madad ke saath ghar mein chhoti doori chal sakta hai." },
    "4-6": { en: "Sits in a regular chair but may need trunk or pelvis support for hand use; pushes up on a stable surface to stand; walks with a handheld device on level ground; transported for long distances.", ur: "Aam kursi par baithta hai magar haath ke istemal ke liye dhar ya pelvis sahara chahiye; khara hone ke liye mazboot sath par zor; hamwar zameen par device ke saath chalta; lambay safar mein sawari." },
    "6-12": { en: "Walks with a handheld device in most indoor places; may need a seat belt when seated; needs a person or a surface for sit-to-stand; uses a wheelchair for distance; stairs with a rail and help.", ur: "Aksar andaruni jagah device ke saath chalta; baithte hue seat belt ki zaroorat ho sakti; sit-to-stand ke liye shakhs ya sath; faaslay ke liye wheelchair; rail aur madad se seerhi." },
    "12-18": { en: "Walks with a handheld device indoors; for community and outdoor distances, uses a manual or powered wheelchair; needs help with floor-to-stand transfers.", ur: "Ghar mein device ke saath chalta; bahar aur lambay faaslay ke liye manual ya powered wheelchair; farsh se khara hone mein madad." },
  },
  4: {
    u2: { en: "Has head control but needs trunk support to sit on the floor; may roll to lying on the back and may roll to the tummy.", ur: "Sar par qaboo magar farsh par baithne ke liye dhar ka sahara chahiye; kamar par palat sakta aur pait par bhi palat sakta hai." },
    "2-4": { en: "Sits when placed, but needs his hands to hold the position; often needs adapted seating and standing equipment; moves short distances within a room by rolling, creeping or crawling.", ur: "Rakhne par baithta hai magar position ke liye haath chahiye; aksar adapted seating aur standing equipment; kamray mein chhoti doori palat kar, sarak kar ya reng kar." },
    "4-6": { en: "Sits on a chair with adapted seating for trunk control and hand use; transfers need an adult or a stable surface; at most walks short distances with a walker and supervision; powered chair for self-mobility.", ur: "Dhar control aur haath ke istemal ke liye adapted seating wali kursi par baithta; transfers mein bare ya mazboot sath; ziyada se ziyada walker aur nigrani se chhoti doori; apni harkat ke liye powered chair." },
    "6-12": { en: "Mobility needs physical help or power; adapted seating for trunk and pelvis; most transfers need help; floor mobility at home; may use a body-support walker; wheelchair or power chair outside.", ur: "Harkat ke liye jismani madad ya power; dhar aur pelvis ke liye adapted seating; aksar transfers mein madad; ghar mein farsh par harkat; body-support walker ho sakta; bahar wheelchair ya power chair." },
    "12-18": { en: "Uses a wheelchair, usually powered, in most settings; physical help for most transfers; may stand or step with help for short moments.", ur: "Aksar jagah wheelchair, aam taur par powered; aksar transfers mein jismani madad; madad se chhoti der khara ya qadam." },
  },
  5: {
    u2: { en: "Cannot hold the head and trunk against gravity on the tummy or in sitting; an adult needs to help the baby roll.", ur: "Pait ke bal ya baithe hue sar aur dhar ko gravity ke khilaf nahi thaam sakta; palatne ke liye bare ki madad." },
    "2-4": { en: "Movement is very limited; head and trunk posture cannot be held even with equipment; no way to move independently; carried by an adult.", ur: "Harkat bohat mehdood; equipment ke baawajood sar aur dhar ki posture nahi thaamta; khud harkat ka tareeqa nahi; bara utha kar le jata hai." },
    "4-6": { en: "All areas of motor function are limited; adapted equipment and technology do not fully make up for sitting and standing; transported by others; a few may use a heavily adapted power chair.", ur: "Motor function ke har hissay mein kami; adapted equipment aur technology sitting aur standing ki kami poori nahi karte; doosray le jate hain; kuch bohat adapted power chair istemal karte hain." },
    "6-12": { en: "Transported in a manual wheelchair everywhere; head and trunk posture needs full support; some use powered mobility with very advanced adaptations.", ur: "Har jagah manual wheelchair mein le jaya jata hai; sar aur dhar ki posture ko mukammal sahara; kuch bohat advanced adaptations ke saath powered mobility." },
    "12-18": { en: "Transported in a wheelchair in all settings; needs full postural support and help with all transfers; self-mobility is possible only with advanced powered mobility.", ur: "Har jagah wheelchair mein; mukammal postural support aur har transfer mein madad; apni harkat sirf advanced powered mobility se mumkin." },
  },
};

export function GmfcsExplorer({ lang }: { lang: TeacherLang }) {
  const [level, setLevel] = useState<Level>(2);
  const [band, setBand] = useState<Band>("6-12");
  const head = HEAD[level];

  return (
    <WidgetFrame id="gmfcs-explorer">
      <div className="grid gap-2">
        <Seg value={String(level) as "1" | "2" | "3" | "4" | "5"} onChange={(v) => setLevel(Number(v) as Level)} label={t(lang, "GMFCS level", "GMFCS level")} options={([1, 2, 3, 4, 5] as Level[]).map((l) => ({ id: String(l) as "1" | "2" | "3" | "4" | "5", label: `Level ${["I", "II", "III", "IV", "V"][l - 1]}` }))} />
        <Seg value={band} onChange={setBand} label={t(lang, "Age band", "Umar ka band")} options={BANDS.map((b) => ({ id: b.id, label: bi(lang, b.label) }))} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3" aria-live="polite">
        <p className="text-sm font-extrabold text-navy-800">
          {t(lang, `Level ${["I", "II", "III", "IV", "V"][level - 1]}: ${head.name.en}`, `Level ${["I", "II", "III", "IV", "V"][level - 1]}: ${head.name.ur}`)}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{bi(lang, TEXT[level][band])}</p>
        <div className="mt-3">
          <p className="text-xs font-bold text-slate-600">
            {t(lang, `Hip displacement risk (migration over 30%): about ${head.hip}% of children`, `Hip displacement ka khatra (migration 30% se zyada): taqreeban ${head.hip}% bachay`)}
          </p>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${head.hip}%`}>
            <div className={cn("h-3 rounded-full transition-all", head.hip >= 60 ? "bg-rose-500" : head.hip >= 30 ? "bg-amber-400" : "bg-teal-500")} style={{ width: `${Math.max(head.hip, 2)}%` }} />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          <b>{t(lang, "Physio focus: ", "Physio ka focus: ")}</b>
          {bi(lang, head.focus)}
        </p>
      </div>
      <p className="mt-2 text-xs leading-4 text-slate-500">
        {t(
          lang,
          "Short paraphrases of the idea behind the GMFCS Expanded & Revised (CanChild), for teaching only. Classification describes what a child usually does at home, school and in the community, not the best they can do on a good day. Always use the official GMFCS-E&R descriptors to classify a real child. Hip figures from Soo et al. 2006 (J Bone Joint Surg Am); follow your local hip surveillance protocol.",
          "GMFCS Expanded & Revised (CanChild) ke khayal ka mukhtasar khulasa, sirf taleem ke liye. Classification yeh batati hai ke bachcha ghar, school aur community mein aam taur par kya karta hai, achhe din ka behtareen nahi. Asal bachay ko classify karne ke liye official GMFCS-E&R descriptors istemal karein. Hip ke figures Soo et al. 2006 (J Bone Joint Surg Am) se; apna local hip surveillance protocol follow karein.",
        )}
      </p>
    </WidgetFrame>
  );
}
