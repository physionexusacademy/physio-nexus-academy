import type { TeacherLesson } from "../types.ts";

export const umnVsLmn: TeacherLesson = {
  slug: "umn-vs-lmn",
  title: "UMN vs LMN Lesions — Never Confuse Them Again",
  hook: {
    en: "Replace two long lists of signs with one picture and one question.",
    ur: "Signs ki do lambi lists ki jagah sirf ek tasveer aur ek sawal.",
  },
  area: "Neurology",
  level: "Clinical",
  bestFor: "2nd–4th year DPT",
  minutes: 10,
  goal: {
    en: "By the end, you'll tell an upper from a lower motor neuron lesion in 30 seconds — and explain why the signs differ.",
    ur: "End tak aap 30 second mein upper aur lower motor neuron lesion ka farq bata sakenge — aur yeh bhi ke signs alag kyun hain.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Neuro feels hard because students memorise two long lists of signs. Today we'll replace both lists with **one picture** and **one question**.",
        ur: "Neuro mushkil is liye lagta hai ke students signs ki do lambi lists ratte hain. Aaj hum dono lists ki jagah **ek tasveer** aur **ek sawal** rakhenge.",
      },
    },
    {
      type: "say",
      text: {
        en: "The picture: a movement command travels through **two neurons**. The **upper motor neuron (UMN)** starts in the brain (motor cortex) and travels down through the brainstem and spinal cord. The **lower motor neuron (LMN)** starts in the anterior horn of the spinal cord (or a cranial nerve nucleus) and travels out in the peripheral nerve to the muscle.",
        ur: "Tasveer yeh hai: movement ka hukm **do neurons** se guzarta hai. **Upper motor neuron (UMN)** dimagh (motor cortex) se shuru ho kar brainstem aur spinal cord mein neeche aata hai. **Lower motor neuron (LMN)** spinal cord ke anterior horn (ya cranial nerve nucleus) se shuru ho kar peripheral nerve ke zariye muscle tak jata hai.",
      },
      simpler: {
        en: "UMN = brain and spinal cord pathway. LMN = the final nerve from the spinal cord to the muscle.",
        ur: "UMN = dimagh aur spinal cord ka rasta. LMN = spinal cord se muscle tak aakhri nerve.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Think of a company. The UMN is the **manager** in head office who sends instructions and keeps the team calm. The LMN is the **worker** who actually does the job.\nLose the **worker** → the job simply doesn't get done: the muscle goes limp, floppy and wastes away.\nLose the **manager** → the workers are still there, but nobody controls them: they become over-reactive and stiff.",
        ur: "Ek company sochein. UMN head office ka **manager** hai jo hidayat bhejta hai aur team ko qaabu mein rakhta hai. LMN woh **worker** hai jo asal kaam karta hai.\n**Worker** chala jaye → kaam hota hi nahi: muscle dheeli, naram aur weak ho kar sookh jati hai.\n**Manager** chala jaye → workers maujood hain lekin un par koi control nahi: woh zyada react karte hain aur akar jaate hain.",
      },
    },
    {
      type: "memory",
      text: {
        en: "**UMN = UP**: tone up, reflexes up, toes up (Babinski).\n**LMN = LOW**: tone low, reflexes low, muscle bulk low.",
        ur: "**UMN = UP (upar)**: tone upar, reflexes upar, big toe upar (Babinski).\n**LMN = LOW (neeche)**: tone kam, reflexes kam, muscle bulk kam.",
      },
    },
    {
      type: "compare",
      title: { en: "UMN vs LMN at a glance", ur: "UMN vs LMN — ek nazar mein" },
      headers: [
        { en: "Sign", ur: "Sign" },
        { en: "UMN lesion", ur: "UMN lesion" },
        { en: "LMN lesion", ur: "LMN lesion" },
      ],
      rows: [
        [
          { en: "Tone", ur: "Tone" },
          { en: "Increased (spasticity)", ur: "Barha hua (spasticity)" },
          { en: "Decreased (flaccid)", ur: "Kam (flaccid)" },
        ],
        [
          { en: "Deep tendon reflexes", ur: "Deep tendon reflexes" },
          { en: "Brisk (hyperreflexia)", ur: "Tez (hyperreflexia)" },
          { en: "Reduced or absent", ur: "Kam ya ghayab" },
        ],
        [
          { en: "Plantar response", ur: "Plantar response" },
          { en: "Extensor (Babinski sign)", ur: "Extensor (Babinski sign)" },
          { en: "Flexor (normal) or absent", ur: "Flexor (normal) ya ghayab" },
        ],
        [
          { en: "Muscle wasting", ur: "Muscle wasting" },
          { en: "Mild, later, from disuse", ur: "Halki, baad mein, disuse se" },
          { en: "Marked and early", ur: "Wazeh aur jaldi" },
        ],
        [
          { en: "Fasciculations", ur: "Fasciculations" },
          { en: "Absent", ur: "Nahi hoti" },
          { en: "May be present", ur: "Ho sakti hain" },
        ],
        [
          { en: "Clonus", ur: "Clonus" },
          { en: "May be present", ur: "Ho sakta hai" },
          { en: "Absent", ur: "Nahi hota" },
        ],
        [
          { en: "Weakness pattern", ur: "Weakness ka pattern" },
          { en: "Groups of muscles / a whole region", ur: "Muscles ke groups / poora hissa" },
          { en: "Muscles of a specific root or nerve", ur: "Khaas root ya nerve ke muscles" },
        ],
      ],
    },
    {
      type: "say",
      text: {
        en: "Now the one question: **\"Is the worker gone, or is the manager gone?\"** Worker gone (LMN) → everything goes DOWN. Manager gone (UMN) → control is lost, so things go UP.",
        ur: "Ab woh ek sawal: **\"Worker gaya hai ya manager?\"** Worker gaya (LMN) → sab kuch NEECHE. Manager gaya (UMN) → control khatam, is liye cheezein UPAR.",
      },
    },
    {
      type: "widget",
      widget: "lesion-locator",
      intro: {
        en: "Pick where the damage is and watch which signs appear.",
        ur: "Chunein ke nuqsan kahan hai aur dekhein kaun se signs aate hain.",
      },
    },
    {
      type: "check",
      question: {
        en: "After a stroke, a patient has increased tone, brisk reflexes and an up-going plantar response on the right. Lesion type?",
        ur: "Stroke ke baad patient ki right side par tone barha hua, reflexes tez aur plantar response upar ki taraf hai. Lesion kis qism ka hai?",
      },
      options: [
        {
          text: { en: "UMN lesion", ur: "UMN lesion" },
          correct: true,
          feedback: {
            en: "Correct — the manager is gone: tone up, reflexes up, toes up. And because the motor pathway crosses in the medulla, a left-brain stroke affects the right side.",
            ur: "Sahi — manager chala gaya: tone upar, reflexes upar, thumb upar. Aur kyun ke motor rasta medulla mein cross karta hai, left dimagh ka stroke right side ko affect karta hai.",
          },
        },
        {
          text: { en: "LMN lesion", ur: "LMN lesion" },
          feedback: {
            en: "LMN lesions push everything DOWN — floppy, weak reflexes, wasting. These signs are all UP.",
            ur: "LMN lesion sab kuch NEECHE le jata hai — dheela pan, weak reflexes, wasting. Yahan sab signs UPAR hain.",
          },
        },
        {
          text: { en: "Primary muscle disease", ur: "Muscle ki apni beemari" },
          feedback: {
            en: "Muscle disease doesn't give brisk reflexes or a Babinski sign. Those point to the central pathway.",
            ur: "Muscle ki beemari mein reflexes tez nahi hote aur Babinski sign nahi aata. Yeh central raste ki taraf ishara hai.",
          },
        },
      ],
    },
    {
      type: "check",
      question: {
        en: "After a common fibular (peroneal) nerve injury, a patient has foot drop, a floppy ankle and wasting of the front of the leg. Lesion type?",
        ur: "Common fibular (peroneal) nerve injury ke baad patient ko foot drop, dheela ankle aur leg ke aage wale hisse ki wasting hai. Lesion kis qism ka?",
      },
      options: [
        {
          text: { en: "LMN lesion", ur: "LMN lesion" },
          correct: true,
          feedback: {
            en: "Yes — the worker's wire was cut. Peripheral nerve damage = LMN: flaccid, wasting, in that nerve's muscles only.",
            ur: "Haan — worker ki taar kat gayi. Peripheral nerve ka nuqsan = LMN: dheela pan, wasting, sirf usi nerve ke muscles mein.",
          },
        },
        {
          text: { en: "UMN lesion", ur: "UMN lesion" },
          feedback: {
            en: "Brain or cord lesions can cause foot drop too — but with increased tone and brisk reflexes, not early wasting and floppiness.",
            ur: "Dimagh ya cord ke lesion se bhi foot drop ho sakta hai — lekin tone barha hua aur reflexes tez honge, jaldi wasting aur dheela pan nahi.",
          },
        },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "Trap: in the first hours to days after a stroke or spinal cord injury, the limb can be **floppy** with reduced reflexes (an early flaccid phase, or spinal shock after cord injury). Spasticity often develops later. So don't call it LMN just because the limb is floppy on day 1 — ask **where** the damage is.",
        ur: "Trap: stroke ya spinal cord injury ke pehle ghanton ya dinon mein limb **dheela** ho sakta hai aur reflexes kam (shuru ka flaccid phase, ya cord injury ke baad spinal shock). Spasticity aksar baad mein aati hai. Is liye pehle din dheela limb dekh kar LMN na keh dein — poochein nuqsan **kahan** hai.",
      },
    },
    {
      type: "say",
      text: {
        en: "A favourite viva question — **spasticity vs rigidity**. **Spasticity** (UMN) is **velocity-dependent**: the faster you stretch, the more it resists, sometimes with a sudden 'clasp-knife' give. **Rigidity** (e.g. Parkinson's) resists through the whole range **regardless of speed** — 'lead-pipe', or 'cogwheel' when tremor is added.",
        ur: "Viva ka pasandeeda sawal — **spasticity vs rigidity**. **Spasticity** (UMN) **velocity-dependent** hai: jitna tez stretch karein utni zyada resistance, kabhi achanak 'clasp-knife' jaisa chhorna. **Rigidity** (maslan Parkinson's) poori range mein **raftaar se farq pare baghair** resistance deti hai — 'lead-pipe', ya tremor ke saath 'cogwheel'.",
      },
      simpler: {
        en: "Spasticity cares about speed. Rigidity doesn't.",
        ur: "Spasticity ko raftaar se farq parta hai. Rigidity ko nahi.",
      },
    },
    {
      type: "check",
      question: {
        en: "You move a patient's elbow slowly — little resistance. You move it fast — strong resistance that suddenly gives way. This is…",
        ur: "Aap patient ki elbow aahista move karte hain — thori resistance. Tez move karte hain — zabardast resistance jo achanak chhor deti hai. Yeh hai…",
      },
      options: [
        {
          text: { en: "Spasticity", ur: "Spasticity" },
          correct: true,
          feedback: {
            en: "Exactly — velocity-dependent with a clasp-knife release. A UMN sign.",
            ur: "Bilkul — velocity-dependent aur clasp-knife jaisa chhorna. Yeh UMN sign hai.",
          },
        },
        {
          text: { en: "Rigidity", ur: "Rigidity" },
          feedback: {
            en: "Rigidity resists the same at any speed. Here speed changed everything — that's spasticity.",
            ur: "Rigidity har raftaar par ek jaisi resistance deti hai. Yahan raftaar ne sab badal diya — yeh spasticity hai.",
          },
        },
        {
          text: { en: "Normal tone", ur: "Normal tone" },
          feedback: {
            en: "Normal tone doesn't build up strongly with fast stretch and then suddenly give way.",
            ur: "Normal tone tez stretch par itni zyada resistance de kar achanak nahi chhorti.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "Why it matters for treatment: in UMN lesions you work on tone management, positioning, task-specific training and motor control. In LMN lesions you protect weak or denervated muscle, prevent contracture and deformity, use orthoses (e.g. an AFO for foot drop) and strengthen as reinnervation allows. Same word 'weakness' — completely different plan.",
        ur: "Treatment ke liye kyun zaroori hai: UMN lesion mein tone management, positioning, task-specific training aur motor control par kaam. LMN lesion mein weak ya denervated muscle ki hifazat, contracture aur deformity se bachao, orthoses (maslan foot drop ke liye AFO) aur reinnervation ke saath strengthening. Lafz ek hi 'weakness' — plan bilkul alag.",
      },
    },
    {
      type: "clinic",
      text: {
        en: "Remember: some conditions affect **both** neurons — for example motor neuron disease (ALS), which can show UMN and LMN signs together. If you see a mix, think bigger and refer for medical assessment.",
        ur: "Yaad rakhein: kuch conditions **dono** neurons ko affect karti hain — maslan motor neuron disease (ALS), jis mein UMN aur LMN signs saath saath ho sakte hain. Agar mix dikhe to bara sochein aur medical assessment ke liye refer karein.",
      },
    },
  ],
  summary: [
    {
      en: "UMN = brain/cord pathway; LMN = anterior horn cell → peripheral nerve → muscle.",
      ur: "UMN = dimagh/cord ka rasta; LMN = anterior horn cell → peripheral nerve → muscle.",
    },
    {
      en: "UMN = UP (tone, reflexes, Babinski). LMN = LOW (tone, reflexes, bulk).",
      ur: "UMN = UPAR (tone, reflexes, Babinski). LMN = NEECHE (tone, reflexes, bulk).",
    },
    {
      en: "Spasticity is velocity-dependent; rigidity is not. Mixed signs → think bigger and refer.",
      ur: "Spasticity velocity-dependent hai; rigidity nahi. Mixed signs → bara sochein aur refer karein.",
    },
  ],
  flashcards: [
    {
      id: "ul-1",
      front: { en: "Where does the lower motor neuron start?", ur: "Lower motor neuron kahan se shuru hota hai?" },
      back: {
        en: "In the anterior horn of the spinal cord (or a cranial nerve motor nucleus), travelling out to the muscle.",
        ur: "Spinal cord ke anterior horn (ya cranial nerve motor nucleus) se, muscle tak.",
      },
    },
    {
      id: "ul-2",
      front: { en: "Tone and reflexes in a UMN lesion?", ur: "UMN lesion mein tone aur reflexes?" },
      back: { en: "Increased tone (spasticity) and brisk reflexes; extensor plantar response.", ur: "Tone barha hua (spasticity), reflexes tez; extensor plantar response." },
    },
    {
      id: "ul-3",
      front: { en: "Tone, reflexes and bulk in an LMN lesion?", ur: "LMN lesion mein tone, reflexes aur bulk?" },
      back: { en: "Flaccid tone, reduced/absent reflexes, early marked wasting; fasciculations possible.", ur: "Flaccid tone, reflexes kam/ghayab, jaldi wazeh wasting; fasciculations mumkin." },
    },
    {
      id: "ul-4",
      front: { en: "Spasticity vs rigidity — the key difference?", ur: "Spasticity vs rigidity — asal farq?" },
      back: {
        en: "Spasticity is velocity-dependent (clasp-knife); rigidity is independent of speed (lead-pipe/cogwheel).",
        ur: "Spasticity velocity-dependent (clasp-knife); rigidity raftaar se azad (lead-pipe/cogwheel).",
      },
    },
    {
      id: "ul-5",
      front: { en: "Floppy limb on day 1 after stroke — LMN lesion?", ur: "Stroke ke pehle din dheela limb — LMN lesion?" },
      back: {
        en: "No. An early flaccid phase can occur after UMN lesions; spasticity often develops later.",
        ur: "Nahi. UMN lesion ke baad shuru mein flaccid phase ho sakta hai; spasticity aksar baad mein aati hai.",
      },
    },
  ],
  goDeeper: [
    {
      title: "Stroke Rehabilitation — treatment plan",
      href: "/conditions/stroke-rehabilitation#clinical",
      note: { en: "Turn UMN reasoning into a rehab plan.", ur: "UMN reasoning ko rehab plan mein badlein." },
    },
    {
      title: "Parkinson's Disease — treatment plan",
      href: "/conditions/parkinsons-disease#clinical",
      note: { en: "Where rigidity shows up in practice.", ur: "Practice mein rigidity kahan nazar aati hai." },
    },
    {
      title: "Spinal Cord Injury Rehabilitation",
      href: "/conditions/spinal-cord-injury-rehabilitation#clinical",
      note: { en: "UMN below the level, LMN at the level.", ur: "Level ke neeche UMN, level par LMN." },
    },
  ],
  sources: [
    { citation: "Lundy-Ekman L. Neuroscience: Fundamentals for Rehabilitation. 5th ed. Elsevier; 2018." },
    { citation: "Fuller G. Neurological Examination Made Easy. 6th ed. Elsevier; 2019." },
    {
      citation:
        "Lance JW. Symposium synopsis. In: Feldman RG, Young RR, Koella WP, eds. Spasticity: Disordered Motor Control. Year Book Medical; 1980:485–494 (classic velocity-dependent definition of spasticity).",
    },
  ],
};
