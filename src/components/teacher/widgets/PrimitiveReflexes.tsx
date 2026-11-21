"use client";

import { useState } from "react";
import type { TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { t } from "../ui";
import { Pill, Seg, WidgetFrame, bi, type Bi } from "./kit";

type Kind = "primitive" | "postural";
type Reflex = {
  id: string;
  kind: Kind;
  name: Bi;
  /** months: first seen (0 = birth) and, for primitive reflexes, when it should have gone */
  from: number;
  to: number | null;
  how: Bi;
  matters: Bi;
};

// Typical teaching windows (months). Textbooks differ by a month or two; read them as a guide, not a cut-off.
const REFLEXES: Reflex[] = [
  { id: "rooting", kind: "primitive", name: { en: "Rooting", ur: "Rooting" }, from: 0, to: 4, how: { en: "Stroke the cheek: the head turns toward the touch and the mouth opens.", ur: "Gaal par ungli phairein: sar chhoone ki taraf mudta hai aur munh khulta hai." }, matters: { en: "Helps feeding in the first weeks. Still strong at 6 months or absent at birth is worth a note.", ur: "Pehlay hafton mein doodh peene mein madad. 6 mahine mein bhi mazboot ya paidaish par na ho to note karein." } },
  { id: "palmar", kind: "primitive", name: { en: "Palmar grasp", ur: "Palmar grasp" }, from: 0, to: 5, how: { en: "Press a finger into the palm: the fingers curl round it.", ur: "Hatheli mein ungli dabayein: ungliyan us par lipat jati hain." }, matters: { en: "Keeps the hand fisted if it stays. A baby cannot open the hand to reach and release until it fades.", ur: "Rahe to haath band rehta hai. Jab tak khatam na ho, bachcha haath khol kar pakar aur chhor nahi sakta." } },
  { id: "plantar", kind: "primitive", name: { en: "Plantar grasp", ur: "Plantar grasp" }, from: 0, to: 10, how: { en: "Press the sole just under the toes: the toes curl down.", ur: "Ungliyon ke neechay talwe par dabayein: ungliyan neechay mudti hain." }, matters: { en: "If it persists it makes standing and heel-toe walking harder.", ur: "Rahe to khara hona aur heel-toe chalna mushkil hota hai." } },
  { id: "moro", kind: "primitive", name: { en: "Moro (startle)", ur: "Moro (startle)" }, from: 0, to: 5, how: { en: "With the head supported, let it drop back a little: the arms fling out, then hug in, and the baby may cry.", ur: "Sar ko sahara dete hue thora peeche girne dein: bazoo phailtay hain phir seenay ki taraf aate hain, bachcha ro sakta hai." }, matters: { en: "One-sided or absent: think collarbone fracture, brachial plexus injury or hemiparesis. Still strong after 6 months: ask why.", ur: "Ek taraf ya ghayab: collarbone fracture, brachial plexus injury ya hemiparesis sochein. 6 mahine ke baad bhi mazboot: wajah poochein." } },
  { id: "atnr", kind: "primitive", name: { en: "ATNR (fencer)", ur: "ATNR (fencer)" }, from: 0, to: 6, how: { en: "Baby on the back, turn the head to one side: the arm and leg on the face side straighten, the other side bends.", ur: "Bachcha kamar par, sar ek taraf ghumayein: chehre wali taraf ka bazoo aur taang seedhi, doosri taraf mudi." }, matters: { en: "If it is obligatory (cannot break out of it) the baby cannot bring hands together, roll or look at his own hand.", ur: "Agar lazmi ho (us se nikal na sake) to bachcha haath jorr, palat ya apna haath dekh nahi sakta." } },
  { id: "tlr", kind: "primitive", name: { en: "TLR (labyrinthine)", ur: "TLR (labyrinthine)" }, from: 0, to: 6, how: { en: "On the back the body extends; on the tummy it flexes, whatever the head does.", ur: "Kamar par jism extend, pait par flex, sar jo bhi kare." }, matters: { en: "If it persists: head lag, hard to lift the head on the tummy, hard to roll or pull to sit.", ur: "Rahe to head lag, pait par sar uthana, palatna ya baithna mushkil." } },
  { id: "galant", kind: "primitive", name: { en: "Galant (trunk curl)", ur: "Galant (trunk curl)" }, from: 0, to: 5, how: { en: "Hold the baby tummy-down and stroke along one side of the spine: the trunk curves toward that side.", ur: "Bachay ko pait ke bal pakar kar reerh ki ek side par ungli phairein: dhar usi taraf mud jata hai." }, matters: { en: "Absent on one side can point to a spinal or nerve problem. Persisting is linked to poor trunk control.", ur: "Ek side par na ho to reerh ya nerve ka masla ho sakta hai. Rahe to trunk control kamzor." } },
  { id: "stnr", kind: "primitive", name: { en: "STNR", ur: "STNR" }, from: 6, to: 11, how: { en: "On hands and knees: bending the neck bends the arms and straightens the legs; lifting the head does the opposite.", ur: "Haathon aur ghutnon par: gardan jhukane se bazoo mudtay aur taangein seedhi; sar uthane se ulta." }, matters: { en: "Seen briefly just before crawling. If it stays, the baby bunny-hops or sits between the heels instead of crawling.", ur: "Rengnay se pehle thori der dikhta hai. Rahe to bachcha rengnay ki jagah bunny-hop karta hai ya ediyon ke beech baithta hai." } },
  { id: "babinski", kind: "primitive", name: { en: "Babinski (toe fan)", ur: "Babinski (toe fan)" }, from: 0, to: 24, how: { en: "Stroke the outer sole from heel to toes: the big toe goes up and the toes fan out.", ur: "Bahar wale talwe par edi se ungliyon tak ungli phairein: bara angootha upar aur ungliyan phailti hain." }, matters: { en: "Normal in infants. Still present with walking past about 2 years: think upper motor neuron lesion.", ur: "Shaiqeen mein normal. Taqreeban 2 saal ke baad chalne ke saath bhi ho to upper motor neuron lesion sochein." } },
  { id: "head", kind: "postural", name: { en: "Head righting", ur: "Head righting" }, from: 3, to: null, how: { en: "Tilt the baby's body: the head stays upright.", ur: "Bachay ka jism tirchha karein: sar seedha rehta hai." }, matters: { en: "The base of all balance. Absent after 4 months needs a closer look.", ur: "Har balance ki buniyad. 4 mahine ke baad na ho to gour se dekhein." } },
  { id: "landau", kind: "postural", name: { en: "Landau", ur: "Landau" }, from: 4, to: 22, how: { en: "Hold the baby tummy-down in the air: the head lifts and the back and legs extend like a swimmer.", ur: "Bachay ko pait ke bal hawa mein uthayein: sar uthta hai aur peeth aur taangein tairaak ki tarah extend." }, matters: { en: "Floppy with no extension suggests low tone; too stiff suggests high tone.", ur: "Dheela aur extension nahi: low tone; bohat sakht: high tone." } },
  { id: "par-fwd", kind: "postural", name: { en: "Parachute: forward", ur: "Parachute: forward" }, from: 6, to: null, how: { en: "Tip the baby forward in sitting: the arms shoot out to protect.", ur: "Baithe bachay ko aage jhukayein: bazoo bachaao ke liye aage nikaltay hain." }, matters: { en: "Absent or one-sided after 8 months raises concern for hemiparesis.", ur: "8 mahine ke baad na ho ya ek taraf ho to hemiparesis ka shak." } },
  { id: "par-side", kind: "postural", name: { en: "Parachute: sideways", ur: "Parachute: sideways" }, from: 7, to: null, how: { en: "Tip the sitting baby sideways: the arm reaches out on that side.", ur: "Baithe bachay ko side par jhukayein: us taraf ka bazoo bahar aata hai." }, matters: { en: "Lets the baby sit alone safely. Without it, sitting stays fragile.", ur: "Bachay ko mehfooz akelay baithne deta hai. Iske baghair baithna nazuk rehta hai." } },
  { id: "par-back", kind: "postural", name: { en: "Parachute: backward", ur: "Parachute: backward" }, from: 9, to: null, how: { en: "Tip the sitting baby backward: the arms reach back.", ur: "Baithe bachay ko peeche jhukayein: bazoo peeche jatay hain." }, matters: { en: "Appears last of the three; it makes independent sitting truly safe.", ur: "Teen mein se sab se aakhir mein aata hai; akelay baithna haqeeqatan mehfooz banata hai." } },
  { id: "eq-sit", kind: "postural", name: { en: "Equilibrium: sitting", ur: "Equilibrium: sitting" }, from: 7, to: null, how: { en: "Tilt the surface or the child: the trunk curves the other way to keep the head over the base.", ur: "Sath ya bachay ko tirchha karein: dhar doosri taraf mud kar sar ko base ke upar rakhta hai." }, matters: { en: "The reaction behind real balance. Missing it means falls every time the base moves.", ur: "Asal balance ke peechay yahi reaction hai. Na ho to base hilne par har baar girta hai." } },
  { id: "eq-stand", kind: "postural", name: { en: "Equilibrium: standing", ur: "Equilibrium: standing" }, from: 12, to: null, how: { en: "Nudge the standing child: arms rise, trunk bends away and a step may follow.", ur: "Khare bachay ko halka dhakka dein: bazoo uthtay, dhar door mudta aur qadam bhi ho sakta hai." }, matters: { en: "Walking needs it. Its absence is a main reason a child keeps falling.", ur: "Chalne ke liye zaroori. Iski kami bachay ke baar baar girne ki aham wajah hai." } },
];

const MAX = 24;
const pct = (m: number) => `${(Math.min(m, MAX) / MAX) * 100}%`;

function status(reflex: Reflex, age: number): { id: "present" | "fading" | "gone" | "notyet" | "active" | "due"; tone: "green" | "amber" | "slate" | "red" | "sky" } {
  if (reflex.kind === "primitive") {
    const end = reflex.to ?? 0;
    if (reflex.from > age) return { id: "notyet", tone: "slate" };
    if (age > end) return { id: "gone", tone: "red" };
    if (age >= end - 1) return { id: "fading", tone: "amber" };
    return { id: "present", tone: "green" };
  }
  if (age < reflex.from) return { id: "notyet", tone: "slate" };
  if (age <= reflex.from + 2) return { id: "due", tone: "amber" };
  if (reflex.to !== null && age > reflex.to) return { id: "gone", tone: "red" };
  return { id: "active", tone: "green" };
}

export function PrimitiveReflexes({ lang }: { lang: TeacherLang }) {
  const [age, setAge] = useState(3);
  const [kind, setKind] = useState<Kind>("primitive");
  const [open, setOpen] = useState<string>("moro");

  const list = REFLEXES.filter((r) => r.kind === kind);
  const labelFor = (s: ReturnType<typeof status>, reflex: Reflex) => {
    switch (s.id) {
      case "present": return t(lang, "Should be present", "Hona chahiye");
      case "fading": return t(lang, "Fading now", "Ab khatam ho raha");
      case "gone": return reflex.kind === "primitive" ? t(lang, "Should be GONE: if present, look closer", "Khatam hona chahiye: maujood ho to gour se dekhein") : t(lang, "Fades with walking skills (normal to lose)", "Chalne ki salahiyat ke saath khatam (normal)");
      case "notyet": return reflex.kind === "primitive" ? t(lang, "Not yet appeared", "Abhi nahi aaya") : t(lang, "Not expected yet", "Abhi umeed nahi");
      case "due": return t(lang, "Just emerging: due now", "Abhi ubhar raha: ab due");
      default: return t(lang, "Should be present", "Maujood hona chahiye");
    }
  };

  return (
    <WidgetFrame id="primitive-reflexes">
      <div className="grid gap-2">
        <label htmlFor="pr-age" className="text-sm font-bold text-navy-800">
          {t(lang, `Age (corrected, in months): ${age === 0 ? "birth" : age}`, `Umar (corrected, mahinon mein): ${age === 0 ? "paidaish" : age}`)}
        </label>
        <input id="pr-age" type="range" min={0} max={MAX} step={1} value={age} onChange={(event) => setAge(Number(event.target.value))} className="w-full accent-teal-600" />
        <Seg value={kind} onChange={setKind} label={t(lang, "Type of reaction", "Reaction ki qisam")} options={[{ id: "primitive", label: t(lang, "Primitive reflexes (should fade)", "Primitive reflexes (khatam hone chahiye)") }, { id: "postural", label: t(lang, "Postural reactions (should appear and stay)", "Postural reactions (aane aur rehne chahiye)") }]} />
      </div>

      <ul className="mt-3 grid gap-2" aria-live="polite">
        {list.map((reflex) => {
          const s = status(reflex, age);
          const isOpen = open === reflex.id;
          const end = reflex.to ?? MAX;
          return (
            <li key={reflex.id} className={cn("rounded-xl border p-2.5", isOpen ? "border-teal-300 bg-teal-50/50" : "border-slate-200 bg-white")}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : reflex.id)} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
                <span className="text-sm font-extrabold text-navy-800">{bi(lang, reflex.name)}</span>
                <Pill tone={s.tone}>{labelFor(s, reflex)}</Pill>
              </button>
              <div className="relative mt-2 h-3 rounded-full bg-slate-100" role="img" aria-label={t(lang, `${reflex.name.en}: seen from ${reflex.from} to ${reflex.to ?? "24+"} months`, `${reflex.name.ur}: ${reflex.from} se ${reflex.to ?? "24+"} mahine tak`)}>
                <div className={cn("absolute top-0 h-3 rounded-full", reflex.kind === "primitive" ? "bg-amber-300" : "bg-teal-400")} style={{ left: pct(reflex.from), width: `calc(${pct(end)} - ${pct(reflex.from)})` }} />
                <div className="absolute -top-1 h-5 w-0.5 bg-navy-800" style={{ left: pct(age) }} aria-hidden="true" />
              </div>
              <div className="mt-0.5 flex justify-between text-xs font-bold text-slate-400" aria-hidden="true">
                <span>0</span><span>6</span><span>12</span><span>18</span><span>24 {t(lang, "months", "mahine")}</span>
              </div>
              {isOpen ? (
                <div className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-700">
                  <p><b>{t(lang, "How to see it: ", "Kaise dekhein: ")}</b>{bi(lang, reflex.how)}</p>
                  <p><b>{t(lang, "Why it matters: ", "Kyun aham hai: ")}</b>{bi(lang, reflex.matters)}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs leading-4 text-slate-500">
        {t(lang, "Windows are typical teaching values and differ by a month or two between textbooks. One reflex out of window is a prompt to look further, not a diagnosis. Look for asymmetry, absence at birth, or reflexes that stay strongly obligatory.", "Windows taleemi aam qeemtein hain aur kitabon mein ek do mahine ka farq hota hai. Ek reflex ka window se bahar hona aage dekhne ka ishara hai, tashkhees nahi. Asymmetry, paidaish par na hona, ya lazmi taur par mazboot rehna dekhein.")}
      </p>
    </WidgetFrame>
  );
}
