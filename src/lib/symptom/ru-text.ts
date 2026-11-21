/**
 * Roman Urdu for the symptom checker's advice sentences, hints and result wording (keyed by the exact English sentence, so a condition that reuses
 * a sentence is covered once). Natural spoken Urdu-English mix. "Screening, not diagnosis" is kept in every place it appears.
 */
export const RU_ADVICE: Record<string, string> = {
  "A clinician should assess the neck, shoulder girdle, neurologic findings and vascular status before confirming this pattern.": "Is pattern ko pakka karne se pehle clinician ko gardan, kandhe ka hissa, nerve ki findings aur khoon ki naliyon (vascular) ki halat check karni chahiye.",
  "A physiotherapy assessment can confirm the pattern and guide management.": "Physiotherapy assessment is pattern ko pakka kar sakta hai aur ilaaj ka rasta bata sakta hai.",
  "A physiotherapy assessment can identify movement and load factors.": "Physiotherapy assessment harkat aur bojh ki wajahein dhoondh sakta hai.",
  "Chest symptoms still require appropriate medical screening when features are not clearly musculoskeletal.": "Agar alamat saaf taur par musculoskeletal na hon to seene ki alamat ki munasib medical screening phir bhi zaroori hai.",
  "Discuss this pattern with a clinician; medical review may be appropriate.": "Is pattern ke bare mein clinician se baat karein; medical review munasib ho sakta hai.",
  "Groin pain has several possible sources; abdominal, hip and adductor assessment may be needed.": "Groin dard ki kai wajahein ho sakti hain; pait, kulhe aur adductor muscles ka assessment zaroori ho sakta hai.",
  "High ankle sprains often need in-person assessment because recovery and stability differ from a routine lateral sprain.": "High ankle sprain aksar in-person assessment maangti hai, kyunke aam bahar wale sprain ke muqable mein recovery aur stability mukhtalif hoti hai.",
  "In-person assessment is recommended after significant rib trauma.": "Pasliyon par bari chot ke baad in-person assessment ki sifarish ki jati hai.",
  "Marked thumb instability or weakness with pinch should be assessed promptly.": "Angoothay ki saaf larkharahat ya pinch mein kamzori ka jaldi assessment karwana chahiye.",
  "Neurologic and shoulder examination is recommended before confirming this pattern.": "Is pattern ko pakka karne se pehle nerves aur kandhe ka examination karwane ki sifarish ki jati hai.",
  "Persistent extension-related pain in an athlete deserves clinical assessment; imaging may be considered based on examination and duration.": "Kisi khiladi mein peechay jhukne se jura musalsal dard clinical assessment ka haqdar hai; examination aur dauraniye ke hisaab se imaging par ghaur ho sakta hai.",
  "Persistent numbness, weakness or progressive symptoms deserve neurologic assessment.": "Musalsal sunn-pan, kamzori ya barhti hui alamat ka neurologic assessment hona chahiye.",
  "Prompt assessment is recommended for suspected tendon rupture.": "Tendon phatne ka shak ho to jaldi assessment ki sifarish ki jati hai.",
  "Prompt assessment is recommended if weakness followed an injury.": "Agar kamzori chot ke baad aayi ho to jaldi assessment ki sifarish ki jati hai.",
  "Prompt in-person assessment and imaging consideration are recommended because scaphoid fractures can be occult.": "Jaldi in-person assessment aur imaging par ghaur ki sifarish ki jati hai, kyunke scaphoid ke fracture chhupe hue ho sakte hain.",
  "Prompt sports/orthopaedic or physiotherapy assessment is recommended.": "Jaldi sports / orthopaedic ya physiotherapy assessment ki sifarish ki jati hai.",
  "Recurrent instability deserves specialist clinical assessment.": "Baar baar ki be-qaraari specialist clinical assessment ki haqdar hai.",
  "Recurrent patellar instability should be assessed in person.": "Kneecap ka baar baar phisalna in-person assess hona chahiye.",
  "Reduce impact loading and arrange assessment; imaging may be needed depending on findings.": "Impact wala bojh kam karein aur assessment karwayein; findings ke hisaab se imaging ki zaroorat ho sakti hai.",
  "Reduce impact loading and arrange assessment; stress injuries can require imaging.": "Impact wala bojh kam karein aur assessment karwayein; stress injury mein imaging ki zaroorat ho sakti hai.",
  "Severe unexplained shoulder pain deserves clinical assessment; imaging may be considered depending on examination findings.": "Kandhe ka shadeed be-wajah dard clinical assessment ka haqdar hai; examination ke hisaab se imaging par ghaur ho sakta hai.",
  "Throwing athletes with instability or persistent pain should have an in-person sports/orthopaedic assessment.": "Cheez phenkne wale khiladi jin mein larkharahat ya musalsal dard ho, unka in-person sports / orthopaedic assessment hona chahiye.",
  "Urgent in-person assessment is recommended for a suspected Achilles rupture.": "Achilles phatne ka shak ho to foran in-person assessment ki sifarish ki jati hai.",
  "Weakness such as foot drop deserves prompt clinical assessment.": "Foot drop jaisi kamzori ka jaldi clinical assessment hona chahiye.",
};

export const RU_NEURO: Record<string, { label: string; detail: string }> = {
  clue_c6_dist: { label: "Mumkin C6 distribution", detail: "Angoothay / shahadat ki ungli ki taraf ki sunn-pan C6 pattern se mil sakti hai, lekin peripheral nerve ke masle aur doosri wajahein bhi hain; examination se pakka karna zaroori hai." },
  clue_c7_dist: { label: "Mumkin C7 distribution", detail: "Beech ki ungli ki taraf ki sunn-pan C7 pattern se mil sakti hai, lekin yeh pakka nahi; examination se pakka karna zaroori hai." },
  clue_c8_dist: { label: "Mumkin C8/T1 distribution", detail: "Anamika aur chhoti ungli ki taraf ki alamat C8/T1 aur ulnar nerve ke masle se mil sakti hain; examination se pakka karna zaroori hai." },
  clue_l4_dist: { label: "Mumkin L4 distribution", detail: "Ghutne ke aage / shin ke andar ki sunn-pan L4 pattern se mil sakti hai, lekin pakka karne ke liye clinical examination zaroori hai." },
  clue_l5_dist: { label: "Mumkin L5 distribution", detail: "Taang ke bahar / paaon ke upar ya bare angoothay ki sunn-pan L5 pattern se mil sakti hai, lekin pakka karne ke liye clinical examination zaroori hai." },
  clue_s1_dist: { label: "Mumkin S1 distribution", detail: "Pindli ke peechay / paaon ke bahar ya talwe ki sunn-pan S1 pattern se mil sakti hai, lekin pakka karne ke liye clinical examination zaroori hai." },
};

export const RU_CARE: Record<string, { label: string; detail: string }> = {
  high: {
    label: "Jaldi professional assessment ki sifarish",
    detail: "Aap ki alamat ka asar zyada hai (ya dard bohat tez hai). Emergency warning na hone ke bawajood sirf self-care par bharosa karne ke bajaye in-person assessment karwana samajhdari hai.",
  },
  moderate: {
    label: "Professional assessment ki sifarish",
    detail: "Aap ki alamat rozmarra ke kaamon ko mutasir kar rahi hain. Physiotherapy assessment pattern ko pakka karne aur aage barhne mein madad kar sakta hai.",
  },
  mild: {
    label: "Nazar rakhein aur zaroorat par assessment karwayein",
    detail: "Abhi aap ke rozmarra ke kaam par asar halka lagta hai. Agar alamat rahein, barhein, dobara aayein ya aap ko fikar ho to professional assessment karwayein.",
  },
};

export const RU_SAFETY_TITLE = {
  emergency: "Emergency medical assessment ki sifarish",
  urgent: "Jaldi medical assessment ki sifarish",
};

export const RU_COMPAT = { high: "Bohat zyada milta hai", moderate: "Darmiyana milta hai", possible: "Mumkin hai" };
