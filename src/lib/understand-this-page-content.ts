import type { UnderstandThisPageContent } from "@/components/learning/UnderstandThisPage";

/**
 * Editorially prepared Roman Urdu explanations for the first PNA pilot.
 * Static Git content only: no AI request, database lookup, or runtime translation.
 */
export const understandThisPageContent: Record<string, UnderstandThisPageContent> = {
  "trigger-point-vs-tender-point": {
    short: "Tender point ka matlab hai muscle ya soft tissue ka aisa maqam jo dabane par dard kare. Trigger point ek zyada specific clinical finding hai: muscle ke sensitive spot par pressure dene se patient ka pehchana hua dard ya kabhi referred pain reproduce ho sakta hai. Har tender point trigger point nahi hota, aur muscle spasm in dono se alag cheez hai.",
    details: [
      { heading: "Tender point kya hota hai?", text: "Jab kisi jagah pressure dene se local dard mehsoos ho, to usay tender point kaha ja sakta hai. Is finding se akelay yeh sabit nahi hota ke muscle mein trigger point hai ya dard kisi ek tissue se hi aa raha hai." },
      { heading: "Trigger point kis tarah different hai?", text: "Trigger point ko aam tor par muscle ke ek hypersensitive spot ke taur par describe kiya jata hai. Pressure se patient ka familiar pain reproduce ho sakta hai; kuch cases mein dard doosri jagah bhi mehsoos hota hai. Yeh findings clinical context ke sath interpret hoti hain, akelay diagnosis confirm nahi kartin." },
      { heading: "Taut band aur muscle spasm", text: "Taut band muscle fibres ka tight, band jaisa feel hone wala hissa hai. Trigger point us band mein ho sakta hai, lekin har taut band trigger point nahi hota. Muscle spasm involuntary contraction hai, is liye isay tender point ya trigger point ka doosra naam na samjhein." },
      { heading: "Clinical example", text: "Agar upper trapezius par pressure dene se sirf usi jagah tenderness ho, to yeh local tenderness hai. Agar pressure se patient ka familiar shoulder ya head-area pain bhi reproduce ho, to trigger point ke features consider kiye ja sakte hain. Phir bhi history, examination aur alternative explanations zaroor dekhein." }
    ]
  },
  "direct-vs-indirect-myofascial-release": {
    short: "Myofascial Release (MFR) ek hands-on approach hai jisme therapist fascia aur soft tissue par slow, sustained contact use karta hai. Direct approach mein therapist tissue resistance ki taraf gentle engagement karta hai; indirect approach mein pehle us direction mein jata hai jahan tissue ya movement zyada asaani se tolerate hota hai. Dono ko patient response aur treatment goal ke mutabiq choose kiya jata hai.",
    details: [
      { heading: "Fascia aur MFR ka basic idea", text: "Fascia connective tissue ka network hai jo body ke structures ko surround aur connect karta hai. MFR mein therapist controlled, sustained contact use karta hai. Patient ka comfort, symptoms aur movement response important hain; zyada force lagana treatment ko automatically behtar nahi banata." },
      { heading: "Direct approach", text: "Direct MFR mein therapist restriction ya resistance ki direction mein dheere se engage karta hai, bina achanak ya forceful pressure ke. Contact ko symptoms ke mutabiq adjust kiya jata hai aur patient ko pain ya discomfort barhne par batane ka mauqa diya jata hai." },
      { heading: "Indirect approach", text: "Indirect MFR mein therapist pehle tissue ko aisi direction ya position mein rakhta hai jo zyada comfortable ho. Maqsad force se barrier todna nahi, balkay tolerable position se response observe karna hai." },
      { heading: "Clinical reasoning aur evidence", text: "MFR kuch patients mein short-term pain ya movement mein madad kar sakta hai, lekin results condition aur study ke mutabiq farq karte hain. Isay har problem ka cure na samjhein. Assessment, active exercise, education aur progress reassessment ke sath use karein." }
    ]
  },
  "central-sensitization-explained": {
    short: "Central sensitization ka concept nervous system ki pain processing mein barhi hui responsiveness ko describe karta hai. Is ka matlab yeh nahi ke patient ka pain imaginary hai, aur na hi sirf zyada dard hone se central sensitization confirm hoti hai. Pain ko symptoms, history, function aur medical screening ke sath samajhna zaroori hai.",
    details: [
      { heading: "Asaan alfaaz mein", text: "Nervous system danger signals ko process karta hai. Kuch persistent pain presentations mein system zyada sensitive ho sakta hai, jis se normal ya halkay input par bhi pain zyada mehsoos ho sakta hai. Yeh ek possible mechanism hai, har patient ke liye final diagnosis nahi." },
      { heading: "Pain aur tissue damage ka relation", text: "Pain real experience hai, lekin pain intensity hamesha tissue damage ki quantity ko directly show nahi karti. Tissue, nervous system, sleep, stress, past experiences aur environment mil kar symptoms ko influence kar sakte hain. Is ka matlab yeh nahi ke har pain non-structural hai; assessment phir bhi zaroori hai." },
      { heading: "Clinician ko kya dekhna chahiye?", text: "Symptom history, sensitivity pattern, function, sleep, activity tolerance, neurological signs aur red flags ko context mein assess karein. Central sensitization ka label sirf widespread pain ya tenderness dekh kar na lagayen." },
      { heading: "Management ka practical point", text: "Patient ko validate karein, clear aur non-frightening education dein, activity ko tolerable steps mein build karein aur relevant exercise, sleep/self-management support aur follow-up use karein. Naye, progressive ya concerning symptoms hon to appropriate medical assessment/referral ko delay na karein." }
    ]
  },
  "mechanical-neck-pain-assessment-rehabilitation": {
    short: "Mechanical ya nonspecific neck pain ek clinical description hai, kisi ek damaged tissue ka confirmed diagnosis nahi. Symptoms movement, load ya sustained positions se change ho sakte hain. Physiotherapist ka kaam red flags screen karna, history aur examination se presentation samajhna, phir education, exercise aur zaroorat par manual therapy ko patient ke goals ke mutabiq plan karna hai.",
    details: [
      { heading: "Mechanical neck pain ka matlab", text: "Neck pain ko mechanical tab kaha ja sakta hai jab symptoms movement, position ya loading se influence hon. Is se yeh zaroori nahi sabit hota ke koi ek joint ya muscle hi pain ka source hai. Imaging par changes bhi symptoms ke sath context mein interpret honay chahiye." },
      { heading: "Treatment se pehle screening", text: "Trauma, fever ya systemic illness, unexplained weight loss, worsening neurological deficit, unusual severe headache, vascular concern ya doosri concerning features hon to routine exercise/manual therapy se pehle appropriate medical assessment zaroori ho sakti hai. Red flags ki list ko clinical judgement aur local pathway ke sath use karein." },
      { heading: "Focused examination", text: "History mein onset, symptom behaviour, sleep, work/activity, aggravating-relieving factors aur patient ka main goal samjhein. Zaroorat ke mutabiq cervical movement, neurological screen, strength/endurance aur function measures assess karein. Har test tab karein jab us ka result clinical decision ko inform kar sakta ho." },
      { heading: "Management aur reassessment", text: "Education, graded movement, strength/endurance work aur self-management active plan ka hissa ho sakte hain. Manual therapy ko selected patients mein short-term symptom relief ke liye use kiya ja sakta hai, magar exercise aur function-building ka badal nahi. Follow-up par pain ke sath function, movement aur patient goals dobara assess karein." }
    ]
  },
  "pain-neuroscience-education-multimodal-rehab": {
    short: "Pain Neuroscience Education (PNE) patient ko samjhati hai ke pain nervous system aur body ke signals ko kaise process karta hai. Is ka maqsad pain ko fake kehna nahi, balkay patient ko pain samajhne aur safe activity mein confidence hasil karne mein madad dena hai. Education akelay har patient ka pain khatam nahi karti; isay active rehabilitation ke sath jorna chahiye.",
    details: [
      { heading: "PNE kyun di jati hai?", text: "Persistent pain mein pain ka tajurba sirf tissue input par depend nahi karta. Nervous system ki sensitivity, sleep, stress, previous experiences aur environment bhi asar dal sakte hain. PNE in mechanisms ko understandable language mein explain karne ki koshish karti hai." },
      { heading: "Patient se kaise baat karein?", text: "Patient ke pain ko validate karein aur aise alfaaz se bachein jo unhein fragile ya permanently damaged mehsoos karwayen. Har patient ko ek hi explanation dena zaroori nahi; unke sawalat, beliefs aur readiness ke mutabiq baat karein." },
      { heading: "PNE ko treatment plan mein kaise use karein?", text: "Education ko graded activity, exercise, functional goals aur self-management ke sath combine karein. Patient ko sirf lecture dena aur phir activity se door rakhna PNE ka maqsad nahi. Progress ko participation, confidence, function aur symptom response ke zariye evaluate karein." },
      { heading: "Evidence ko realistic rakhein", text: "PNE kuch outcomes mein madad kar sakti hai, khaas tor par jab multimodal rehabilitation ka hissa ho, lekin effect har condition aur patient mein same nahi hota. Isay guaranteed cure, ya medical assessment aur active care ka replacement na batayen." }
    ]
  }
};
