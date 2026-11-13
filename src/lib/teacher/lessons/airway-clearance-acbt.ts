import type { TeacherLesson } from "../types.ts";

export const airwayClearanceAcbt: TeacherLesson = {
  slug: "airway-clearance-acbt",
  title: "Airway Clearance — The Active Cycle of Breathing Technique (ACBT)",
  hook: {
    en: "Sputum stuck in the lungs means infections, breathlessness and hospital visits. Learn the ACBT cycle, the perfect 'huff' and when chest physiotherapy must stop.",
    ur: "Phephron mein phansi balgham ka matlab infections, saans phoolna aur hospital ke chakkar. ACBT cycle, perfect 'huff' aur yeh seekhein ke chest physiotherapy kab rokni hai.",
  },
  area: "Cardiorespiratory",
  level: "Clinical",
  bestFor: "3rd year onwards",
  minutes: 12,
  goal: {
    en: "By the end, you'll teach a patient the full ACBT cycle, adapt positioning safely and recognise red flags during airway clearance.",
    ur: "End tak aap patient ko mukammal ACBT cycle sikha sakenge, positioning ko safely adapt kar sakenge aur airway clearance ke dauraan red flags pehchan sakenge.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Airway clearance helps people who produce too much sputum or can't clear it — **bronchiectasis**, **cystic fibrosis**, some people with **COPD**, and patients with chest infections. The **Active Cycle of Breathing Technique (ACBT)** is a flexible, patient-led method that needs no equipment.",
        ur: "Airway clearance un logon ki madad karta hai jo zyada balgham banate hain ya nikal nahi pate — **bronchiectasis**, **cystic fibrosis**, COPD ke kuch patients, aur chest infection wale patients. **Active Cycle of Breathing Technique (ACBT)** ek lachakdar, patient khud karne wala tareeqa hai jis ke liye koi equipment nahi chahiye.",
      },
    },
    {
      type: "steps",
      title: { en: "The ACBT cycle", ur: "ACBT cycle" },
      steps: [
        { title: "Breathing control", detail: "Gentle, relaxed tidal breathing using the lower chest, shoulders relaxed — rest between the active parts and prevent bronchospasm." },
        { title: "Thoracic expansion exercises", detail: "3–4 deep breaths in, with a 2–3 s hold at the top, then a relaxed breath out. Air gets behind secretions via collateral ventilation. Percussion or vibration may be added." },
        { title: "Breathing control again", detail: "A short rest of relaxed breathing." },
        { title: "Forced expiration technique (huffs)", detail: "1–2 huffs: an open-mouth, open-throat forced breath out — from a medium breath to clear lower airways, from a big breath to clear upper airways — then cough when secretions are high up." },
      ],
      ur: "1. Breathing control — Halki, aaram se tidal breathing, chest ka neeche wala hissa, kandhe relaxed — active hisson ke darmiyan aaram aur bronchospasm se bachao.\n2. Thoracic expansion exercises — 3–4 gehri saans andar, upar 2–3 s rok kar, phir aaram se bahar. Collateral ventilation se hawa balgham ke peeche pohanchti hai. Percussion ya vibration bhi add ho sakti hai.\n3. Dobara breathing control — Thora aaram, relaxed breathing.\n4. Forced expiration technique (huffs) — 1–2 huffs: munh aur gala khol kar zor se saans bahar — darmiyani saans se neeche ki airways saaf, bari saans se upar ki airways — aur jab balgham upar aa jaye to khansi.",
    },
    {
      type: "analogy",
      text: {
        en: "Getting ketchup out of a bottle: first get air behind it (deep breaths with a hold), then give a firm, steady push — not a violent bang (a huff, not a hard cough). Repeated violent coughing tires the patient and can close floppy airways.",
        ur: "Bottle se ketchup nikalna: pehle us ke peeche hawa pohanchayein (gehri saans aur rok), phir mazboot, mustaqil dhakka — zor ka jhatka nahi (huff, sakht khansi nahi). Baar baar zor ki khansi patient ko thaka deti hai aur kamzor airways band kar sakti hai.",
      },
    },
    {
      type: "try",
      title: { en: "Try a huff on yourself", ur: "Khud huff try karein" },
      steps: [
        { en: "Take a medium-sized breath in.", ur: "Darmiyani saans andar lein." },
        { en: "Keep your mouth and throat open, as if fogging up a mirror.", ur: "Munh aur gala khula rakhein, jaise aaine par bhaap bana rahe hon." },
        { en: "Squeeze the air out steadily with your tummy muscles — 'haaah', not a cough.", ur: "Pait ki muscles se hawa mustaqil bahar nikalein — 'haaah', khansi nahi." },
      ],
      ask: { en: "How was the huff different from a cough?", ur: "Huff khansi se kaise mukhtalif tha?" },
      options: [
        { text: { en: "Longer, open-throated and less forceful at the start", ur: "Lamba, gala khula aur shuru mein kam zor" }, feedback: { en: "Yes — a huff keeps the airways open longer, moving secretions without a cough's sudden closure.", ur: "Haan — huff airways ko zyada dair khula rakhta hai, khansi ke achanak band hone ke baghair balgham hilata hai." } },
        { text: { en: "Exactly the same", ur: "Bilkul wahi" }, feedback: { en: "Try again with an open throat — no closing of the glottis at the start.", ur: "Gala khol kar dobara try karein — shuru mein glottis band na ho." } },
      ],
    },
    {
      type: "check",
      question: {
        en: "During ACBT, why is breathing control placed between the active parts?",
        ur: "ACBT mein active hisson ke darmiyan breathing control kyun rakha jata hai?",
      },
      options: [
        { text: { en: "To rest and prevent fatigue, breathlessness and bronchospasm", ur: "Aaram ke liye aur thakawat, saans phoolne aur bronchospasm se bachane ke liye" }, correct: true, feedback: { en: "Yes — the pauses keep the cycle comfortable and effective, especially in breathless patients.", ur: "Haan — waqfe cycle ko aaramdeh aur effective rakhte hain, khaas kar saans phoolne wale patients mein." } },
        { text: { en: "Because it clears most of the sputum", ur: "Kyunke yahi zyada balgham nikalta hai" }, feedback: { en: "The huffs and thoracic expansion do the clearing; breathing control is recovery.", ur: "Saaf huffs aur thoracic expansion karte hain; breathing control recovery hai." } },
        { text: { en: "It's optional and can be skipped", ur: "Ikhtiyari hai, chhor sakte hain" }, feedback: { en: "Skipping it often causes breathlessness and tight chests.", ur: "Chhorne se aksar saans phoolta aur seena jakarta hai." } },
      ],
    },
    {
      type: "say",
      text: {
        en: "**Dose:** sessions usually last 10–30 minutes, continuing until two consecutive cycles produce no sputum (or the patient tires), once or twice daily — more during an infection. **Positioning:** gravity-assisted positions can help a specific lobe, but head-down tilts are often avoided or modified (e.g. reflux, breathlessness, heart failure, recent surgery or raised blood pressure). Sitting or side-lying works for many people.",
        ur: "**Dose:** sessions aam tor par 10–30 minute, jab tak lagatar do cycles mein balgham na nikle (ya patient thak jaye), din mein ek ya do dafa — infection mein zyada. **Positioning:** gravity-assisted positions kisi khaas lobe ki madad kar sakti hain, lekin head-down tilt aksar avoid ya modify kiya jata hai (maslan reflux, saans phoolna, heart failure, haal ki surgery ya high blood pressure). Bohat se logon ke liye baithna ya side-lying kaafi hai.",
      },
    },
    {
      type: "check",
      question: {
        en: "Which patient should you NOT put in a head-down drainage position?",
        ur: "Kis patient ko head-down drainage position mein NAHI rakhna chahiye?",
      },
      options: [
        { text: { en: "A young adult with stable bronchiectasis and no other problems", ur: "Stable bronchiectasis wala jawan, koi aur masla nahi" }, feedback: { en: "If needed for a lower lobe, this patient may tolerate it.", ur: "Lower lobe ke liye zaroorat ho to yeh patient bardasht kar sakta hai." } },
        { text: { en: "A patient with severe reflux and heart failure who gets breathless lying flat", ur: "Shadeed reflux aur heart failure wala patient jo seedha letne par saans phool jata hai" }, correct: true, feedback: { en: "Yes — head-down tilt would worsen reflux and breathlessness. Use upright or side-lying ACBT.", ur: "Haan — head-down tilt reflux aur saans phoolna badtar karega. Seedha baith kar ya side-lying ACBT karein." } },
        { text: { en: "A patient who prefers sitting", ur: "Baithna pasand karne wala patient" }, feedback: { en: "Preference is fine — ACBT works well in sitting.", ur: "Pasand theek hai — ACBT baith kar acha kaam karta hai." } },
      ],
    },
    {
      type: "compare",
      title: { en: "Other airway clearance options", ur: "Airway clearance ke doosre options" },
      headers: [
        { en: "Technique", ur: "Technique" },
        { en: "How it works", ur: "Kaise kaam karta hai" },
        { en: "Good for", ur: "Kis ke liye acha" },
      ],
      rows: [
        [
          { en: "Oscillating PEP (e.g. flutter-type devices)", ur: "Oscillating PEP (maslan flutter-type devices)" },
          { en: "Breathing out against vibrating resistance splints airways open and loosens mucus", ur: "Vibrate karti resistance ke khilaf saans bahar nikalna airways khule rakhta aur balgham dheela karta hai" },
          { en: "Patients who like a device; independent home use", ur: "Device pasand karne wale patients; ghar par khud istemal" },
        ],
        [
          { en: "Autogenic drainage", ur: "Autogenic drainage" },
          { en: "Controlled breathing at different lung volumes to move mucus up", ur: "Phephron ke mukhtalif volumes par controlled breathing se balgham upar lana" },
          { en: "Motivated patients who can learn the technique (e.g. CF)", ur: "Seekh sakne wale motivated patients (maslan CF)" },
        ],
        [
          { en: "Exercise", ur: "Exercise" },
          { en: "Deeper breathing and airflow during activity", ur: "Activity ke dauraan gehri saans aur hawa ka bahao" },
          { en: "Everyone able — combine with a clearance technique", ur: "Har woh shakhs jo kar sake — clearance technique ke saath milayein" },
        ],
      ],
    },
    {
      type: "safety",
      text: {
        en: "**Stop and get medical help** if there is: frank **haemoptysis** (coughing up more than streaks of blood), sudden chest pain or breathlessness suggesting **pneumothorax**, falling **SpO₂** that doesn't recover with rest, new arrhythmia, or the patient becomes unwell or exhausted. Take care with recent rib fractures, osteoporosis (percussion), and immediately after chest surgery (follow the surgical team's protocol).",
        ur: "**Rok dein aur medical madad lein** agar: wazeh **haemoptysis** (khoon ki lakeeron se zyada khoon khansna), achanak seene mein dard ya saans phoolna jo **pneumothorax** ki taraf ishara kare, girta **SpO₂** jo aaram se wapas na aaye, nayi arrhythmia, ya patient ki tabiyat bigar jaye ya bohat thak jaye. Haal ki rib fractures, osteoporosis (percussion) aur chest surgery ke foran baad ehtiyat (surgical team ka protocol follow karein).",
      },
    },
    {
      type: "check",
      question: {
        en: "Midway through ACBT, your bronchiectasis patient coughs up about a tablespoon of bright red blood. What do you do?",
        ur: "ACBT ke beech mein bronchiectasis ka patient taqreeban ek chamach laal khoon khansta hai. Aap kya karenge?",
      },
      options: [
        { text: { en: "Continue — blood-streaked sputum is common in bronchiectasis", ur: "Jaari rakhein — bronchiectasis mein khoon ki lakeerein aam hain" }, feedback: { en: "Streaks can be common, but a tablespoon of fresh blood is frank haemoptysis.", ur: "Lakeerein aam ho sakti hain, lekin ek chamach taaza khoon wazeh haemoptysis hai." } },
        { text: { en: "Stop airway clearance, keep them upright and calm, check SpO₂ and get urgent medical review", ur: "Airway clearance rok dein, seedha aur pur-sukoon rakhein, SpO₂ check karein aur foran medical review karwayein" }, correct: true, feedback: { en: "Yes — stop, monitor and escalate. Clearance resumes only when the medical team agrees.", ur: "Haan — rokein, monitor karein aur escalate karein. Clearance tabhi dobara jab medical team ijazat de." } },
        { text: { en: "Add percussion to clear the blood", ur: "Khoon saaf karne ke liye percussion add karein" }, feedback: { en: "Percussion could worsen bleeding.", ur: "Percussion khoon behne ko badtar kar sakta hai." } },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "Making it work in real life: listen to the chest and watch for crackles that clear after huffing; let the patient lead the number of breaths and huffs; teach family members too; time sessions around nebulised bronchodilators (bronchodilator first, clearance after) if prescribed; and combine clearance with regular exercise and pulmonary rehabilitation where available.",
        ur: "Asli zindagi mein kaam karwana: seena sunein aur crackles dekhein jo huff ke baad saaf hon; saans aur huffs ki tadaad patient ko khud tay karne dein; ghar walon ko bhi sikhayein; agar likhe hon to sessions ko nebulised bronchodilators ke mutabiq rakhein (pehle bronchodilator, phir clearance); aur jahan mumkin ho clearance ko baqaida exercise aur pulmonary rehabilitation ke saath milayein.",
      },
    },
    {
      type: "evidence",
      text: {
        en: "A systematic review found ACBT improves sputum clearance compared with no treatment and performs similarly to other airway clearance methods, so patient preference matters (Lewis 2012). The British Thoracic Society bronchiectasis guideline recommends that patients with chronic productive cough be taught an airway clearance technique by a respiratory physiotherapist (Hill 2019).",
        ur: "Ek systematic review ne paaya ke ACBT bina treatment ke muqable balgham behtar nikalta hai aur doosre airway clearance tareeqon jaisa hi kaam karta hai, is liye patient ki pasand aham hai (Lewis 2012). British Thoracic Society bronchiectasis guideline kehti hai ke chronic productive cough wale patients ko respiratory physiotherapist airway clearance technique sikhaye (Hill 2019).",
      },
    },
    {
      type: "mistake",
      text: {
        en: "Common mistakes: making patients cough hard and repeatedly instead of huffing; skipping breathing control so they get breathless and tight; using head-down tilts without screening; and teaching the technique once without checking it at the next visit — technique drifts quickly at home.",
        ur: "Aam ghaltiyan: huff ke bajaye patients se zor zor se baar baar khansi karwana; breathing control chhor dena jis se saans phoolta aur seena jakarta hai; screening ke baghair head-down tilt; aur technique ek dafa sikha kar agli visit par check na karna — ghar par technique jaldi bigar jati hai.",
      },
    },
    {
      type: "reveal",
      question: {
        en: "Write a simple home ACBT plan for a 50-year-old with bronchiectasis who produces sputum every morning.",
        ur: "Har subah balgham nikalne wale bronchiectasis ke 50 saal ke patient ke liye ghar ka simple ACBT plan likhein.",
      },
      answer: {
        en: "Once daily in the morning (twice during infections), sitting upright or in side-lying if helpful. Cycle: breathing control → 3–4 deep breaths with a 3-second hold → breathing control → 1–2 huffs from a medium breath, then a big-breath huff and cough when sputum is high. Repeat until two cycles clear nothing, about 10–30 minutes. Stop and seek help for frank blood, chest pain or worsening breathlessness. Add regular exercise; review technique at the next visit.",
        ur: "Subah din mein ek dafa (infection mein do dafa), seedha baith kar ya side-lying mein agar madad mile. Cycle: breathing control → 3 second rok ke saath 3–4 gehri saans → breathing control → darmiyani saans se 1–2 huffs, phir balgham upar ho to bari saans ka huff aur khansi. Jab tak do cycles mein kuch na nikle dohrayein, taqreeban 10–30 minute. Wazeh khoon, seene mein dard ya barhti saans par rokein aur madad lein. Baqaida exercise add karein; agli visit par technique check karein.",
      },
    },
    {
      type: "memory",
      text: {
        en: "**Rest – Stretch – Rest – Huff**: breathing control, thoracic expansion, breathing control, forced expiration — then cough.",
        ur: "**Rest – Stretch – Rest – Huff**: breathing control, thoracic expansion, breathing control, forced expiration — phir khansi.",
      },
    },
  ],
  summary: [
    { en: "ACBT = breathing control, thoracic expansion (with holds), breathing control, then huffs; cough only when sputum is high.", ur: "ACBT = breathing control, thoracic expansion (rok ke saath), breathing control, phir huffs; khansi sirf jab balgham upar ho." },
    { en: "Dose 10–30 min until clear, once or twice daily; adapt positions — avoid head-down tilts in reflux, breathlessness, heart failure and after surgery.", ur: "Dose 10–30 min jab tak saaf na ho, din mein ek ya do dafa; positions adapt karein — reflux, saans phoolna, heart failure aur surgery ke baad head-down tilt na karein." },
    { en: "Stop for frank haemoptysis, suspected pneumothorax, falling SpO₂ or a deteriorating patient, and escalate.", ur: "Wazeh haemoptysis, mumkin pneumothorax, girte SpO₂ ya bigarte patient par rokein aur escalate karein." },
  ],
  flashcards: [
    { id: "ac-1", front: { en: "Four components of ACBT?", ur: "ACBT ke chaar hisse?" }, back: { en: "Breathing control, thoracic expansion exercises, breathing control, forced expiration technique (huffs).", ur: "Breathing control, thoracic expansion exercises, breathing control, forced expiration technique (huffs)." } },
    { id: "ac-2", front: { en: "Low-volume vs high-volume huff?", ur: "Low-volume vs high-volume huff?" }, back: { en: "From a medium breath to move peripheral secretions; from a big breath to clear upper airways.", ur: "Darmiyani saans se door ki balgham hilane ke liye; bari saans se upar ki airways saaf karne ke liye." } },
    { id: "ac-3", front: { en: "Why add a breath hold to thoracic expansion?", ur: "Thoracic expansion mein saans kyun rokein?" }, back: { en: "Allows collateral ventilation to get air behind secretions.", ur: "Collateral ventilation se hawa balgham ke peeche pohanchti hai." } },
    { id: "ac-4", front: { en: "When to stop airway clearance immediately?", ur: "Airway clearance foran kab rokein?" }, back: { en: "Frank haemoptysis, suspected pneumothorax, SpO₂ falling without recovery, new arrhythmia or a deteriorating patient.", ur: "Wazeh haemoptysis, mumkin pneumothorax, SpO₂ girna aur wapas na aana, nayi arrhythmia ya bigarta patient." } },
    { id: "ac-5", front: { en: "Typical ACBT session length?", ur: "ACBT session ki aam lambai?" }, back: { en: "About 10–30 minutes, until two consecutive cycles produce no sputum or the patient tires.", ur: "Taqreeban 10–30 minute, jab tak lagatar do cycles mein balgham na nikle ya patient thak jaye." } },
  ],
  goDeeper: [
    { title: "COPD — Pulmonary Rehabilitation", href: "/conditions/copd-pulmonary-rehabilitation#clinical", note: { en: "Airway clearance as part of a full respiratory plan.", ur: "Mukammal respiratory plan ke hisse ke tor par airway clearance." } },
    { title: "Vital Signs — Skills Lab", href: "/skills/vital-signs", note: { en: "Monitor SpO₂, heart rate and breathlessness safely.", ur: "SpO₂, heart rate aur saans phoolna safely monitor karein." } },
  ],
  sources: [
    {
      citation: "Lewis LK, Williams MT, Olds TS. The active cycle of breathing technique: a systematic review and meta-analysis. Respir Med. 2012;106(2):155–172.",
      pubmedQuery: "Lewis Williams Olds active cycle of breathing technique systematic review meta-analysis",
    },
    {
      citation: "Hill AT, Sullivan AL, Chalmers JD, et al. British Thoracic Society Guideline for bronchiectasis in adults. Thorax. 2019;74(Suppl 1):1–69.",
      pubmedQuery: "British Thoracic Society guideline for bronchiectasis in adults 2019",
    },
    {
      citation: "Lee AL, Burge AT, Holland AE. Airway clearance techniques for bronchiectasis. Cochrane Database Syst Rev. 2015;(11):CD008351.",
      pubmedQuery: "Lee Burge Holland airway clearance techniques for bronchiectasis Cochrane",
    },
  ],
};
