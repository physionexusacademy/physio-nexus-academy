/** Roman Urdu for the symptom checker's patterns, part 2: wrist and hand, upper back and ribs, lower back, hip and groin (see ru-conditions-a.ts). */
import type { RuCondition } from "./ru-conditions-a.ts";

export const RU_CONDITIONS_B: Record<string, RuCondition> = {
  // wrist-hand
  "carpal-tunnel": { plainName: "Kalai par median nerve ka dabao", summary: "Raat ko angoothay, shahadat aur beech ki ungli mein jhunjhuni ya sunn-pan, kabhi haath jhatakne se aaraam." },
  "de-quervain": { plainName: "Kalai ke angoothay wale tendon ki jalan", summary: "Kalai ke angoothay wali side ka dard jo angootha hilane, pakadne ya uthane se barhta hai." },
  "thumb-cmc-oa": { plainName: "Angoothay ki jar ki arthritis ka pattern", summary: "Angoothay ki jar par dard aur akraahat, aksar pakadne ya chutki wale kaamon mein." },
  "trigger-finger": { plainName: "Ungli ka phans jana / lock hona", summary: "Ungli modte ya seedhi karte waqt phansti, click karti ya lock ho jati hai." },
  "tfcc-injury": { plainName: "Kalai ki chhoti ungli wali side ka cartilage / ligament ki chot", summary: "Kalai ki chhoti ungli wali side ka dard jo ghumane, haath par wazan dalne ya chot ke baad ho." },
  "wrist-sprain": { plainName: "Kalai ke ligament ki chot", summary: "Girne ya mudne ke baad kalai ka dard, jis mein fracture ka saaf pattern nahi hota." },
  "ulnar-nerve-wrist": { plainName: "Chhoti ungli wali side ki nerve ki alamat", summary: "Haath ki chhoti ungli wali side par jhunjhuni ya kamzori." },
  "scaphoid-injury": { plainName: "Kalai ki angootha wali haddi ki mumkin chot", summary: "Girne ke baad kalai ki angootha wali side ka dard aur snuffbox par dukhna scaphoid ki chot ki alamat ho sakti hai." },
  "thumb-mcp-ucl": { plainName: "Angoothay ke ligament ki chot", summary: "Angootha haath se zabardasti door hone ke baad dard aur larkharahat ulnar collateral ligament ki chot se mil sakti hai." },
  "intersection-syndrome": { plainName: "Angoothay wali side ke forearm ke peechay tendons ki ragad", summary: "Kalai ke angoothay wali side se kuch centimetre upar dard aur charchrahat baar baar kalai / angoothay ke istemal se ho sakti hai." },
  "wrist-extensor-tendinopathy": { plainName: "Kalai ke peechay tendons par zyada bojh", summary: "Kalai ke peechay ka dard jo baar baar kalai peechay modne, pakadne ya haath par wazan dalne se barhta hai, extensor tendons ke zyada bojh se mil sakta hai." },
  // upper-back-ribs
  "thoracic-mechanical": { plainName: "Peeth ke upar / darmiyan ka aam mechanical dard", summary: "Peeth ke upar wale hissay ka dard jo posture aur harkat se jura ho." },
  "costovertebral-pain": { plainName: "Pasli ke jor ka mechanical dard", summary: "Local pasli / peeth ka dard jo dhar ki harkat ya gehri saans se barhta hai." },
  "intercostal-strain": { plainName: "Pasliyon ke muscle ka khinchao", summary: "Saans, khansi ya mudne par seene ki deewar / pasli ka dard, aksar mehnat ke baad." },
  "rib-injury": { plainName: "Pasli ki mumkin chot", summary: "Seedhi chot ya girne ke baad pasli par local dard aur dukhna." },
  "costochondral-pain": { plainName: "Aage ki pasli / seene ki deewar ka dukhta dard", summary: "Aage ki pasli aur chhati ki haddi ke jore par local dard jo dabane ya harkat se dobara aaye, musculoskeletal ho sakta hai." },
  "periscapular-myofascial": { plainName: "Kandhe ki haddi ke muscles par zyada bojh ka dard", summary: "Kandhe ki haddi ke aas paas dard jo posture ya baar baar bazoo istemal se barhta hai, aam taur par local muscles ke zyada bojh ko zahir karta hai." },
  "thoracic-facet-pattern": { plainName: "Peeth ke upar ke jor ka khaas dard", summary: "Peeth ke upar ek taraf ka khaas dard jo peechay jhukne ya mudne se barhta hai, local jor se jure pattern se mil sakta hai." },
  // low-back
  "nonspecific-low-back": { plainName: "Kamar ka aam dard", summary: "Local kamar ka dard jo harkat, uthane, posture ya activity se badalta hai aur nerve ki saaf alamat nahi hoti." },
  "lumbar-radiculopathy": { plainName: "Kamar ki nerve ki jalan", summary: "Kamar se taang mein jaane wala dard jis ke saath sunn-pan, jhunjhuni ya kamzori ho." },
  "disc-related-low-back": { plainName: "Disc se jura kamar ka pattern", summary: "Kamar ka dard jo aam taur par baithne, jhukne ya uthane se barhta hai, kabhi taang ki alamat ke saath." },
  "lumbar-stenosis": { plainName: "Chalne / khare hone se jura nerve ka dard", summary: "Taang / kamar ki alamat jo khare hone ya chalne se barhti hain aur baithne ya aage jhukne se kam hoti hain." },
  "lumbar-facet": { plainName: "Peechay jhukne / khare hone se barhta kamar dard", summary: "Local kamar ka dard jo peechay jhukne ya der tak khare rehne se barhta hai." },
  "sij-related": { plainName: "Ek taraf ke choolay / pelvis ka dard", summary: "Ek choolay / pelvis ke peechay ka dard jo bistar par karwat, seerhiyon ya ek taang par wazan se barhta hai." },
  "inflammatory-back-pattern": { plainName: "Kamar ka dard jis ka medical review zaroori ho sakta hai", summary: "Musalsal kamar dard jis mein subah ki lambi akraahat ho aur harkat se behtari aaye, inflammatory pattern ka ishara ho sakta hai." },
  "lumbar-spondylolysis": { plainName: "Peechay jhukne se jure stress injury ka pattern", summary: "Jawan sargarm shakhs mein peechay jhukne se barhta kamar dard pars ki stress injury ka shak paida kar sakta hai." },
  "spondylolisthesis": { plainName: "Reerh ki haddi ke khisakne se jura kamar dard", summary: "Peechay jhukne se barhta dard, purani akraahat ya hamstring ki sakhti spondylolisthesis mein dekhi ja sakti hai." },
  "lumbar-myofascial": { plainName: "Kamar ke muscle ka local dard", summary: "Reerh ke bagal mein ek khaas dukhta ya sakht hissa jo dabane se dard dohrata hai, local muscle ke dard ke pattern se mil sakta hai." },
  // hip-groin
  "hip-oa": { plainName: "Kulhe ki arthritis ka pattern", summary: "Groin / kulhe ke aage dard aur akraahat, jootay moze pehanne ya chalne mein mushkil." },
  "gtps": { plainName: "Kulhe ke bahar ke tendons ka dard", summary: "Kulhe ke bahar ka dard, aksar us side par letne, chalne ya seerhiyon se barhta hai." },
  "fai": { plainName: "Kulhe ki tangi (impingement) ka pattern", summary: "Groin ka dard jo gehra kulha modne, squat ya ghoomne se shuru ho." },
  "hip-labral": { plainName: "Kulhe ke andar click / phansne ka pattern", summary: "Gehra groin dard jis mein click ya phansna ho, aksar kulha modte / ghumate ya khel ke dauran." },
  "adductor-strain": { plainName: "Andar ki raan / groin ke muscle ka dard", summary: "Groin ka dard jo daurne, mudne, laat marne ya zor se ghutne jorne se jura ho." },
  "proximal-hamstring": { plainName: "Hamstring ke upar / baithne wali haddi ke tendon ka dard", summary: "Daurne, aage jhukne ya der tak baithne par baithne wali haddi ke qareeb dard." },
  "deep-gluteal": { plainName: "Choolay se jura sciatic jalan", summary: "Choolay ke andar ka gehra dard, mumkin hai taang ke peechay jhunjhuni ke saath." },
  "iliopsoas-tendinopathy": { plainName: "Kulhe ke aage hip flexor tendon ka dard", summary: "Kulhe ke aage / groin ka dard jo baar baar kulha modne ya zor se ghutna uthane se barhta hai, iliopsoas ke zyada bojh se mil sakta hai." },
  "internal-snapping-hip": { plainName: "Kulhe ke aage chatakhne ki awaaz", summary: "Harkat ke dauran kulhe ke aage dobara paida hone wala chatakhne ka ehsaas iliopsoas ki mechanics se jura ho sakta hai." },
  "hip-flexor-strain": { plainName: "Kulhe ke aage ke muscle ka khinchao", summary: "Daurte, laat marte ya zor se kulha modte waqt achanak kulhe ke aage ka dard muscle ke khinchao se mil sakta hai." },
  "athletic-pubalgia": { plainName: "Khel se jura gehra groin / pait ke neechay ka dard", summary: "Mudne, sit-ups, khansi ya ghumne se groin ya pait ke neechay ka dard athletic-pubalgia jaisay pattern se mil sakta hai." },
};
