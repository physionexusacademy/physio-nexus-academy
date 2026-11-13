/**
 * What the PNA virtual physiotherapist guide says. Fixed, reviewed scripts — the guide is NOT a free
 * chatbot: it cannot diagnose, prescribe or change a programme. English and Roman Urdu
 * (natural spoken Urdu–English mix). The guide always says plainly that it is a virtual guide.
 */
import type { Bi } from "./types";

export type Gesture = "calm" | "wave" | "open" | "care" | "nod" | "point_left" | "point_right" | "point_down";
export type GuideBeat = { say: Bi; gesture?: Gesture };
export type GuideTopic = { id: string; label: Bi; beats: GuideBeat[] };

const EMERGENCY: Bi = {
  en: "If you have chest pain, trouble breathing, sudden weakness or numbness, loss of bladder or bowel control, or fainting — stop and get emergency help straight away: call your local emergency number (for example 1122 in much of Pakistan) or go to the nearest emergency department.",
  ru: "Agar seene mein dard ho, saans lene mein mushkil ho, achanak kamzori ya sunn-pan ho, peshab/pakhane par control na rahe, ya behoshi jaisa lage — to foran ruk jayein aur emergency madad lein: apna local emergency number (jaise Pakistan mein aksar jagah 1122) milayein ya qareebi hospital ke emergency mein jayein.",
};

export const TOPIC_VIRTUAL: GuideTopic = {
  id: "who",
  label: { en: "Are you a real physiotherapist?", ru: "Kya aap real physiotherapist hain?" },
  beats: [
    { gesture: "care", say: { en: "No — I am a virtual guide, a 3D character made by Physio Nexus Academy. I do not diagnose or prescribe.", ru: "Nahi — main ek virtual guide hoon, Physio Nexus Academy ka banaya hua 3D character. Main diagnosis ya prescription nahi karta." } },
    { gesture: "open", say: { en: "A real physiotherapist reviews your answers, chooses your exercises and approves every day. I just show you how to do them and keep you company.", ru: "Aap ke jawabat ek real physiotherapist dekhte hain, wohi exercises chunte hain aur har din approve karte hain. Main sirf exercises karke dikhata hoon aur aap ka saath deta hoon." } },
  ],
};

export const TOPIC_PAIN: GuideTopic = {
  id: "pain",
  label: { en: "Is some pain okay during exercise?", ru: "Kya exercise mein thora dard theek hai?" },
  beats: [
    { gesture: "open", say: { en: "A mild to moderate ache or stretch can be normal while you get stronger — many programmes accept up to about 5 out of 10 if it settles within a day.", ru: "Halka se darmiyana dard ya khinchao taaqat banate waqt aam hota hai — kai programmes mein 5/10 tak ka dard theek samjha jata hai, agar wo ek din ke andar settle ho jaye." } },
    { gesture: "care", say: { en: "But sharp, severe or worsening pain is not okay. Stop, rest, and tell us in your feedback. Your physiotherapist sets the limit that is right for you.", ru: "Lekin tez, shadeed ya barhta hua dard theek nahi. Ruk jayein, aaram karein aur feedback mein bataein. Aap ke liye sahi hadd aap ke physiotherapist tay karte hain." } },
  ],
};

export const TOPIC_LOCKED: GuideTopic = {
  id: "locked",
  label: { en: "Why is the next day locked?", ru: "Agla din locked kyun hai?" },
  beats: [
    { gesture: "open", say: { en: "Each day builds on how your body responded to the one before. So the next day opens only after you give feedback and your physiotherapist approves it.", ru: "Har din pichle din par banta hai ke aap ke jism ne kaisa response diya. Isliye agla din tab khulta hai jab aap feedback dein aur aap ke physiotherapist approve karein." } },
    { gesture: "nod", say: { en: "It is a safety step, not a delay. You will get a notification when it opens.", ru: "Ye safety ka qadam hai, delay nahi. Jab khulega to aap ko notification mil jayegi." } },
  ],
};

export const TOPIC_MISSED: GuideTopic = {
  id: "missed",
  label: { en: "What if I miss a day?", ru: "Agar mujh se ek din chhoot jaye?" },
  beats: [
    { gesture: "care", say: { en: "That is okay — do not try to catch up by doing double. Just do your open day when you are ready and tell us in the feedback.", ru: "Koi baat nahi — double kar ke pura karne ki koshish na karein. Jab tayyar hon to khula hua din karein aur feedback mein bata dein." } },
  ],
};

export const TOPIC_UNWELL: GuideTopic = {
  id: "unwell",
  label: { en: "What if I feel unwell?", ru: "Agar tabiyat kharab ho jaye?" },
  beats: [
    { gesture: "care", say: EMERGENCY },
    { gesture: "nod", say: { en: "For anything else that worries you, stop exercising, rest, and mention it in your feedback so your physiotherapist can look at it.", ru: "Baaki jo bhi baat pareshan kare, exercise rok dein, aaram karein aur feedback mein likh dein taa ke aap ke physiotherapist dekh sakein." } },
  ],
};

export const TOPIC_RED_FLAGS: GuideTopic = {
  id: "redflags",
  label: { en: "Why these safety questions?", ru: "Ye safety sawal kyun?" },
  beats: [
    { gesture: "open", say: { en: "A few symptoms need a proper in-person check before any exercise. These questions help us catch them early.", ru: "Kuch alamaat aisi hoti hain jin ka exercise se pehle in-person check zaroori hota hai. Ye sawal unhein jaldi pakadne mein madad karte hain." } },
    { gesture: "care", say: { en: "If you answer yes, nothing bad is assumed — we simply route you to a clinical assessment first.", ru: "Agar aap ‘haan’ kahte hain to iska matlab ye nahi ke kuch bura hai — hum bas aap ko pehle clinical assessment ke liye bhej dete hain." } },
  ],
};

export const COMMON_TOPICS: GuideTopic[] = [TOPIC_VIRTUAL, TOPIC_PAIN, TOPIC_UNWELL];

/** Scripts per page and situation. */
export const GUIDE = {
  welcome: [
    { gesture: "wave", say: { en: "Assalam-o-alaikum! I am your PNA virtual physio guide. Welcome to RehabVerse.", ru: "Assalam-o-alaikum! Main aap ka PNA virtual physio guide hoon. RehabVerse mein khush aamdeed." } },
    { gesture: "open", say: { en: "Here you tell us about your symptoms, a real physiotherapist prepares a programme for you, and I show you each exercise in 3D, day by day.", ru: "Yahan aap apni takleef bataate hain, ek real physiotherapist aap ke liye programme banate hain, aur main har exercise 3D mein din ba din karke dikhata hoon." } },
    { gesture: "care", say: { en: "Please remember: I am a virtual guide, not a doctor. Your physiotherapist stays in charge of everything.", ru: "Yaad rakhein: main virtual guide hoon, doctor nahi. Har cheez ka control aap ke physiotherapist ke paas rehta hai." } },
    { gesture: "point_down", say: { en: "Ready? Create your account below, or browse the exercise library first.", ru: "Tayyar hain? Neeche apna account banayein, ya pehle exercise library dekh lein." } },
  ] as GuideBeat[],

  intake: [
    { gesture: "wave", say: { en: "Let us start with a few simple questions about what is bothering you. Take your time — there are no wrong answers.", ru: "Chaliye kuch aasaan sawalon se shuru karte hain ke aap ko kya takleef hai. Aaram se jawab dein — koi jawab ghalat nahi hota." } },
    { gesture: "nod", say: { en: "Use your own words wherever you like. Natural Urdu or English is fine.", ru: "Jahan chahein apne alfaaz mein likhein. Urdu ho ya English, sab theek hai." } },
    { gesture: "care", say: { en: "I will ask a few safety questions too. They are for your protection.", ru: "Main kuch safety sawal bhi poochunga. Ye aap ki hifazat ke liye hain." } },
  ] as GuideBeat[],

  intakeSafety: [
    { gesture: "care", say: { en: "These next questions are about warning signs. Please answer honestly — if any apply, we will arrange a proper check first.", ru: "Ab ke sawal khatre ki alamaat ke baare mein hain. Sach sach jawab dein — agar koi lagu ho to hum pehle proper check ka intezam karenge." } },
  ] as GuideBeat[],

  submitted: [
    { gesture: "nod", say: { en: "Thank you — your assessment is with the physiotherapist now. You will get a notification once your programme is ready.", ru: "Shukriya — aap ka assessment ab physiotherapist ke paas hai. Programme tayyar hote hi aap ko notification mil jayegi." } },
    { gesture: "open", say: { en: "Please do not start exercises on your own until it is approved.", ru: "Jab tak approve na ho jaye, apni marzi se exercises shuru na karein." } },
  ] as GuideBeat[],

  flagged: [
    { gesture: "care", say: { en: "Thank you for telling us. Some of your answers mean you should be checked in person before doing any exercise, so no programme has been started.", ru: "Bataane ka shukriya. Aap ke kuch jawabat ke mutabiq exercise se pehle in-person check zaroori hai, isliye koi programme shuru nahi kiya gaya." } },
    { gesture: "open", say: { en: "Please book a clinical assessment with PNA or see your doctor. If your symptoms are severe or getting worse, seek urgent care.", ru: "Meherbani karke PNA se clinical assessment book karein ya apne doctor ko dikhayein. Agar alamaat shadeed hon ya barh rahi hon to foran medical madad lein." } },
    { gesture: "care", say: EMERGENCY },
  ] as GuideBeat[],

  awaitingReview: [
    { gesture: "nod", say: { en: "Your physiotherapist is reviewing your assessment. I will be here when your programme is ready.", ru: "Aap ke physiotherapist aap ka assessment dekh rahe hain. Programme tayyar hone par main yahin milunga." } },
  ] as GuideBeat[],

  dayOpen: (day: number): GuideBeat[] => [
    { gesture: "wave", say: { en: `Welcome back! Day ${day} is open. Let us look at today's exercises together.`, ru: `Wapis khush aamdeed! Din ${day} khul gaya hai. Aaiye aaj ki exercises saath dekhte hain.` } },
    { gesture: "open", say: { en: "Watch each demo first, move slowly, and breathe. When you finish, give your feedback — that is how tomorrow opens.", ru: "Pehle har demo dekhein, aahista harkat karein aur saans lete rahein. Khatam hone par feedback dein — isi se agla din khulta hai." } },
  ],

  waitingReview: [
    { gesture: "nod", say: { en: "Great work! Your feedback has gone to your physiotherapist. The next day opens once they approve it.", ru: "Shabash! Aap ka feedback physiotherapist ko pohanch gaya. Unke approve karne par agla din khul jayega." } },
  ] as GuideBeat[],

  paused: [
    { gesture: "care", say: { en: "Your programme is paused for now. Your physiotherapist wants to look at how you are doing before you carry on.", ru: "Aap ka programme filhal pause hai. Aap ke physiotherapist agay barhne se pehle aap ki halat dekhna chahte hain." } },
    { gesture: "care", say: EMERGENCY },
  ] as GuideBeat[],

  completed: [
    { gesture: "wave", say: { en: "Congratulations — you completed your programme! Look at your progress below. Your physiotherapist will tell you what comes next.", ru: "Mubarak ho — aap ne apna programme mukammal kar liya! Neeche apni progress dekhein. Aage kya karna hai, ye aap ke physiotherapist batayenge." } },
  ] as GuideBeat[],

  feedback: [
    { gesture: "point_down", say: { en: "Now your feedback. Tell me honestly how it felt — pain, how hard it was, and anything unusual.", ru: "Ab aap ka feedback. Sach sach bataein kaisa laga — dard, kitna mushkil tha, aur agar kuch ajeeb mehsoos hua." } },
    { gesture: "care", say: { en: "Feedback is not an approval. Your physiotherapist reads it and decides what happens next.", ru: "Feedback approval nahi hota. Aap ke physiotherapist ise parhte hain aur agla qadam tay karte hain." } },
  ] as GuideBeat[],
};
