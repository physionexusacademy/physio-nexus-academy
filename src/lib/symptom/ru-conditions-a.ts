/**
 * Roman Urdu for the symptom checker's patterns (plain name and summary by condition id), neck, shoulder and elbow.
 * The medical name stays in English. These are screening patterns, never a diagnosis: the wording says "pattern" / "se milta hai".
 */
export type RuCondition = { plainName: string; summary: string };

export const RU_CONDITIONS_A: Record<string, RuCondition> = {
  // neck
  "mechanical-neck-pain": { plainName: "Gardan ke jor ya muscles ka aam dard", summary: "Gardan mein local dard aur akraahat jo posture ya harkat se badalti hai." },
  "cervical-radiculopathy": { plainName: "Gardan ki nerve ki jalan", summary: "Gardan se bazoo mein jaane wali alamat, jis mein nerve-root ke pattern par sunn-pan, jhunjhuni ya kamzori hoti hai." },
  "cervicogenic-headache": { plainName: "Gardan se jura sar dard", summary: "Sar dard jo gardan ke dard aur gardan hilane se jura hai, aksar gardan ke upar / khopri ki buniyad se shuru hota hai." },
  "whiplash-associated-disorder": { plainName: "Achanak jhatke ke baad gardan ka dard", summary: "Tez jhatke (maslan road accident) ke baad gardan ka dard aur akraahat." },
  "cervical-spondylosis": { plainName: "Umar ke saath gardan ki akraahat", summary: "Gardan ki musalsal akraahat aur dard jo umar barhne ke saath zyada aam hota hai." },
  "myofascial-neck-pain": { plainName: "Gardan ke muscles ka dukhta hua dard", summary: "Aisa dard jo kisi local dukhte ya sakht muscle wale hissay dabane se wapis aata hai." },
  "cervical-facet-pattern": { plainName: "Gardan ke jor ka ek taraf ka dard", summary: "Ek taraf ka local gardan dard jo aksar peechay jhukne aur ghumane se shuru hota hai." },
  "acute-torticollis": { plainName: "Achanak phansi hui ya tirchhi gardan", summary: "Achanak dardnaak rukawat, sar ek taraf ghuma ya jhuka hua, aur gardan hilana bohat mushkil." },
  "neurogenic-thoracic-outlet": { plainName: "Sar ke upar position se jure bazoo ke masail", summary: "Bazoo ka bhaari pan, jhunjhuni ya sunn-pan jo sar ke upar position se shuru hota hai, thoracic-outlet jaisay pattern se mil sakta hai." },
  // shoulder
  "rotator-cuff-related": { plainName: "Kandhe ke tendon ka aam dard", summary: "Kandhe ke bahar / bazoo ke upar ka dard jo uthane ya sar ke upar kaam se barhta hai." },
  "rotator-cuff-tear": { plainName: "Kandhe ke tendon ka mumkin phatna", summary: "Kandhe ka dard jis ke saath saaf kamzori ho, khaas kar chot ke baad ya buzurgon mein." },
  "adhesive-capsulitis": { plainName: "Frozen shoulder jaisa pattern", summary: "Barhta hua dard aur kandhe ki kai simton mein saaf akraahat." },
  "ac-joint-pain": { plainName: "Kandhe ke upar wale jor ka dard", summary: "Kandhe ke upar wale hissay par dard, jo aksar bazoo seenay ke aar paar le jane se barhta hai." },
  "shoulder-instability": { plainName: "Kandha phisalne / jawab dene ka pattern", summary: "Phisalne, dar ya baar baar be-qaraari ka ehsaas, aksar kandha nikalne ya aadha nikalne ke baad." },
  "long-head-biceps": { plainName: "Kandhe ke aage biceps tendon ka dard", summary: "Kandhe ke aage ka dard jo uthane, kuch utha kar chalne ya biceps par zor se barhta hai." },
  "shoulder-labral": { plainName: "Kandhe ke andar phansne / click ka pattern", summary: "Kandhe ke andar ka dard jis mein phansna ya click ho, aksar kheenchne, be-qaraari ya sar ke upar bojh ke baad." },
  "glenohumeral-oa": { plainName: "Kandhe ke jor ki arthritis ka pattern", summary: "Kandhe ke andar ka dard, akraahat aur ragray ki awaaz jo aahista aahista harkat kam kar deti hai." },
  "calcific-tendinopathy": { plainName: "Kandhe ke tendon ka achanak shadeed dard", summary: "Kandhe ka bohat dardnaak daura bina bari chot ke aa sakta hai aur harkat bohat mehdood kar sakta hai." },
  "suprascapular-neuropathy": { plainName: "Kandhe ke peechay ki nerve se jura kamzori ka pattern", summary: "Kandhe ke peechay ka dard aur kamzori baar baar sar ke upar kaam se, suprascapular nerve ki shamooliyat ke saath ho sakti hai." },
  // elbow
  "lateral-epicondylalgia": { plainName: "Kohni ke bahar ke tendon ka dard", summary: "Kohni ke bahar ka dard jo pakadne aur uthane se hota hai." },
  "medial-epicondylalgia": { plainName: "Kohni ke andar ke tendon ka dard", summary: "Kohni ke andar ka dard jo pakadne, kalai modne ya cheez phenkne se barhta hai." },
  "cubital-tunnel": { plainName: "Kohni par ulnar nerve ki jalan", summary: "Kohni ke andar ki alamat jis ke saath anamika aur chhoti ungli mein sunn-pan ya jhunjhuni ho." },
  "olecranon-bursitis": { plainName: "Kohni ki nok ki soojhi hui bursa", summary: "Kohni ki nok par local sujan, kabhi dabao ya takrane ke baad." },
  "distal-biceps-injury": { plainName: "Kohni ke aage biceps tendon ki chot", summary: "Kuch zor se uthane ke baad kohni ke aage achanak dard, neel ya kamzori." },
  "elbow-oa": { plainName: "Umar se kohni ki akraahat", summary: "Aahista aahista kohni ka dard aur akraahat, aam taur par harkat kam ho jati hai." },
  "radial-tunnel": { plainName: "Forearm ke bahar ki nerve ki jalan", summary: "Kohni ke bahar se bilkul neechay dukhta dard jo forearm ghumane se barhta hai, radial-tunnel jaisi jalan se mil sakta hai." },
  "elbow-ucl": { plainName: "Phenkne se jura kohni ke andar ke ligament ka dard", summary: "Phenkte waqt kohni ke andar ka dard UCL ligament par dabao ya chot ki alamat ho sakta hai." },
  "triceps-tendinopathy": { plainName: "Kohni ke peechay triceps tendon ka dard", summary: "Kohni ke peechay ka dard jo dhakelne aur zor se kohni seedhi karne se jura ho, triceps tendon ke zyada bojh se mil sakta hai." },
  "posterolateral-rotatory-instability": { plainName: "Kohni ke bahar ki be-qaraari ka pattern", summary: "Dhakelte waqt kohni ke bahar click, khisakna ya jawab dena be-qaraari ke pattern se mil sakta hai." },
};
