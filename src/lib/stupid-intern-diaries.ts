export type StupidInternEpisode = {
  id: number;
  title: string;
  field: string;
  date: string; // YYYY-MM-DD
  dialogue: {
    speaker: "Dr. Sajjad" | "Intern" | "Other";
    text: string;
  }[];
  lesson: string;
};

export const stupidInternEpisodes: StupidInternEpisode[] = [
  {
    id: 5,
    title: "The Pacemaker Special",
    field: "Cardiopulmonary",
    date: "2026-10-28",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "What happened to the patient in bed 4? The one with the pacemaker?" },
      { speaker: "Intern", text: "Sir, don’t worry. I handled it perfectly." },
      { speaker: "Dr. Sajjad", text: "Handled it how?" },
      { speaker: "Intern", text: "He was complaining of chest discomfort. So I applied TENS on his chest for pain relief and then put a heat pack on top for extra comfort. When I came back, he was completely silent and peaceful. Best sleep of his life." },
      { speaker: "Dr. Sajjad", text: "Best sleep? You idiot, go check if he’s even alive! TENS and heat on a pacemaker? Are you trying to cook the device or the patient?" }
    ],
    lesson: "Never apply TENS or heat over a pacemaker or any implanted electronic device. It can interfere with the device and become life-threatening."
  },
  {
    id: 4,
    title: "The Frozen Shoulder Expert",
    field: "Musculoskeletal",
    date: "2026-10-27",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why is the frozen shoulder patient crying?" },
      { speaker: "Intern", text: "Sir, I was just helping him. His external rotation was very limited, so I did a strong Grade 5 manipulation to free it up quickly." },
      { speaker: "Dr. Sajjad", text: "You did a Grade 5 on an irritable frozen shoulder?" },
      { speaker: "Intern", text: "Yes Sir. And it worked! Now he can’t move it at all. At least the range is consistent from all directions." },
      { speaker: "Dr. Sajjad", text: "Consistent zero is not a success, you genius. You didn’t free the shoulder, you destroyed whatever movement he had left. Next time think before you become a human jackhammer." }
    ],
    lesson: "Never force aggressive manipulation on an irritable or highly painful frozen shoulder. Respect pain and irritability first."
  },
  {
    id: 3,
    title: "The Neuro Consultation",
    field: "Neurological",
    date: "2026-10-26",
    dialogue: [
      { speaker: "Other", text: "(Senior Neurologist on phone) Dr. Sajjad, your intern just told me the stroke patient has ‘good recovery potential’ because he can move his shoulder a little." },
      { speaker: "Dr. Sajjad", text: "I’m coming." },
      { speaker: "Intern", text: "Sir, I was just being positive! He can shrug the shoulder, so I told the doctor he will walk soon." },
      { speaker: "Dr. Sajjad", text: "You told a neurologist that a dense hemiplegic patient will walk soon because of a shoulder shrug? Have you lost your mind? Motivation is fine, but spreading false hope to other doctors makes us look like fools. Next time open your mouth only when you actually know what you’re talking about." }
    ],
    lesson: "Never give false or exaggerated prognosis, especially to other medical professionals. Be honest and accurate about the patient’s current status."
  },
  {
    id: 2,
    title: "The Pediatric Stretch",
    field: "Pediatrics",
    date: "2026-10-25",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why is the child’s mother so upset?" },
      { speaker: "Intern", text: "Sir, the child had tight hamstrings. I did a strong sustained stretch for three minutes. The child started crying so I knew it was working." },
      { speaker: "Dr. Sajjad", text: "You held a three-minute aggressive stretch on a five-year-old until he cried?" },
      { speaker: "Intern", text: "Yes Sir. No pain, no gain." },
      { speaker: "Dr. Sajjad", text: "In pediatrics, ‘no pain no gain’ is how you lose the child’s trust and possibly cause injury. Next time if a child is crying during a stretch, you stop. Immediately." }
    ],
    lesson: "Never force painful or prolonged stretches on children. Pediatric treatment must be gentle, playful, and always respect the child’s comfort."
  },
  {
    id: 1,
    title: "The Sports Return",
    field: "Sports",
    date: "2026-10-24",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Did you clear the footballer for return to play?" },
      { speaker: "Intern", text: "Yes Sir. He said his ankle feels fine, so I told him he can play in the match tomorrow." },
      { speaker: "Dr. Sajjad", text: "You cleared him only because he said it feels fine?" },
      { speaker: "Intern", text: "Yes Sir. Athletes know their bodies best." },
      { speaker: "Dr. Sajjad", text: "Athletes also want to play even when they shouldn’t. You cleared him without hop tests, strength comparison, or functional assessment? Brilliant. Next time he rolls the same ankle, I’ll make sure the coach knows who cleared him." }
    ],
    lesson: "Never clear an athlete for return to sport based only on subjective feeling. Always use objective tests and functional criteria."
  }
  ,
  {
    id: 10,
    title: "The Copy-Paste Clinician",
    field: "Professional Practice",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Who wrote these notes? This patient came for left shoulder pain, but the record says right knee injury." },
      { speaker: "Intern", text: "Sir, that was just a template. I forgot to change the side." },
      { speaker: "Dr. Sajjad", text: "And it says the patient completed stair training independently. Did they even do stair training?" },
      { speaker: "Intern", text: "Sir, that line belonged to the previous patient. I copied it to save time." },
      { speaker: "Dr. Sajjad", text: "You saved thirty seconds and sent the truth into intensive care! Templates are allowed. Copying unverified clinical facts is not. Your notes should describe this patient, not your clipboard's previous relationship." }
    ],
    lesson: "Clinical documentation must be accurate, timely, and patient-specific. Templates can help, but verify every detail. Never document an assessment or intervention that did not occur."
  },
  {
    id: 9,
    title: "The One-Hundred-Reps Champion",
    field: "Sports Physiotherapy",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "What home programme did you prescribe for the patient's shoulder?" },
      { speaker: "Intern", text: "Resistance-band external rotation. One hundred reps, three sets, three times daily!" },
      { speaker: "Dr. Sajjad", text: "The patient struggled after twelve reps. Why nine hundred a day?" },
      { speaker: "Intern", text: "Sir, progressive overload!" },
      { speaker: "Dr. Sajjad", text: "Progressive overload does not mean turning the patient into a washing-machine spin cycle. Dose depends on capacity, symptoms, technique, goals, and recovery. This is rehabilitation, not a punishment challenge." },
      { speaker: "Intern", text: "So I should adjust the reps to the patient?" },
      { speaker: "Dr. Sajjad", text: "Congratulations. Your first repetition of clinical reasoning!" }
    ],
    lesson: "Individualise exercise dosage. Select resistance, sets, repetitions, and frequency according to the patient's goals, capacity, symptoms, movement quality, and recovery; monitor the response and progress gradually."
  },
  {
    id: 8,
    title: "The Bathroom Emergency",
    field: "Neurological Red Flags",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Any red flags in the patient's low-back-pain history?" },
      { speaker: "Intern", text: "Sir, they mentioned a new problem controlling their bladder. I suggested a hot pack first." },
      { speaker: "Dr. Sajjad", text: "A new bladder-control problem with back pain, and you prescribed warmth?" },
      { speaker: "Intern", text: "Sir, maybe they just drank too much water." },
      { speaker: "Dr. Sajjad", text: "And maybe the fire alarm is just practising its singing! New bladder or bowel dysfunction can signal a spinal emergency. This needs immediate emergency assessment, not a routine exercise sheet." },
      { speaker: "Intern", text: "So no home programme today?" },
      { speaker: "Dr. Sajjad", text: "Today your home programme is revising red flags—after you arrange the urgent referral." }
    ],
    lesson: "New bladder or bowel dysfunction, saddle sensory changes, or progressive/severe neurological deficits with back pain may indicate serious spinal pathology, including cauda equina syndrome. Arrange immediate emergency assessment; do not delay it for routine physiotherapy."
  },
  {
    id: 7,
    title: "The Massage Murder Mystery",
    field: "Musculoskeletal Safety",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why did you start deep calf massage before taking a proper history?" },
      { speaker: "Intern", text: "Sir, the calf felt tight. I told the patient, 'Don't worry, even your muscles have stress!'" },
      { speaker: "Dr. Sajjad", text: "Was one calf more swollen or warm? Any redness, recent surgery, immobilisation, or clot risk?" },
      { speaker: "Intern", text: "Sir, I thought I was a physiotherapist, not CID." },
      { speaker: "Dr. Sajjad", text: "Right now you're the detective cleaning the crime scene before looking for evidence. If DVT is suspected, stop the massage and arrange urgent medical assessment. Chest pain or sudden breathlessness means emergency help." },
      { speaker: "Intern", text: "So not every tight calf needs my famous deep-tissue special?" },
      { speaker: "Dr. Sajjad", text: "Correct. Your hands are not a substitute for clinical screening." }
    ],
    lesson: "Unexplained unilateral calf swelling, warmth, redness, and relevant risk factors can raise suspicion of deep-vein thrombosis. Do not massage a suspected DVT; arrange urgent medical assessment. Sudden breathlessness or chest pain may indicate an emergency."
  },
  {
    id: 6,
    title: "The Slip Disc Detective",
    field: "Musculoskeletal",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Have you assessed the patient with low-back pain?" },
      { speaker: "Intern", text: "Diagnosis confirmed, Sir: L4-L5 disc bulge. The MRI report told me everything." },
      { speaker: "Dr. Sajjad", text: "What are the symptoms? Any leg pain or neurological signs? Did you screen for red flags?" },
      { speaker: "Intern", text: "Not yet, Sir. But the MRI was very cooperative." },
      { speaker: "Dr. Sajjad", text: "Then put the MRI on the treatment couch and ask it to do the exercises! Imaging is evidence, not the whole clinical story. A finding on a scan does not automatically explain a person's symptoms." },
      { speaker: "Intern", text: "So I should assess the patient, not just read the report?" },
      { speaker: "Dr. Sajjad", text: "Excellent. The scan has officially lost its job as your senior clinician." }
    ],
    lesson: "Do not diagnose or plan treatment from MRI findings alone. Integrate history, symptom behaviour, physical and neurological examination, red flags, and the clinical relevance of imaging. Treat the patient, not the scan."
  }
];

export function getLatestEpisode() {
  return stupidInternEpisodes[0];
}

export function getEpisodeById(id: number) {
  return stupidInternEpisodes.find((e) => e.id === id);
}
