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

export const stupidInternEpisodes: StupidInternEpisode[] = ([
  {
    id: 20,
    title: "The Discharge Magician",
    field: "Patient Education and Rehabilitation",
    date: "2026-10-30",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Did you teach the patient their home exercise programme before discharge?" },
      { speaker: "Intern", text: "Yes, Sir. I gave them a five-page exercise sheet." },
      { speaker: "Dr. Sajjad", text: "Did they understand how to perform the exercises?" },
      { speaker: "Intern", text: "Sir, I explained everything very quickly. They nodded throughout." },
      { speaker: "Dr. Sajjad", text: "Did you ask them to demonstrate any exercise?" },
      { speaker: "Intern", text: "No, Sir. They looked confident." },
      { speaker: "Dr. Sajjad", text: "Did you check whether they understood the dosage, precautions or when to stop?" },
      { speaker: "Intern", text: "No, Sir. But they said thank you!" },
      { speaker: "Dr. Sajjad", text: "Even the printer gets a thank you when it produces five pages! That doesn't mean it has educated the patient." },
      { speaker: "Intern", text: "So what should I do?" },
      { speaker: "Dr. Sajjad", text: "Demonstrate, explain in understandable language, ask the patient to demonstrate it back, correct mistakes and confirm they understand the home programme. A discharge sheet is not a substitute for learning." }
    ],
    lesson: "Patient education should be individualized and understandable. Use demonstration, teach-back and return demonstration to confirm understanding of exercise technique, dosage, precautions and progression. Adapt instructions to the patient's health literacy and functional abilities."
  },
  {
    id: 19,
    title: "The Electrode Exchange Program",
    field: "Infection Prevention and Control",
    date: "2026-10-30",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why are you using the same electrodes for two different patients?" },
      { speaker: "Intern", text: "Sir, they were still sticky, so I thought they were reusable." },
      { speaker: "Dr. Sajjad", text: "Did you clean or disinfect them according to the manufacturer's instructions?" },
      { speaker: "Intern", text: "No, Sir. I just wiped them on the patient's towel." },
      { speaker: "Dr. Sajjad", text: "Excellent! You've launched an international patient-to-patient sharing programme!" },
      { speaker: "Intern", text: "But Sir, both patients came for back pain." },
      { speaker: "Dr. Sajjad", text: "Does having the same diagnosis give them the same microorganisms too? Follow infection-control procedures, manufacturer instructions and your clinic's electrode replacement policy. Patient safety isn't a group project!" }
    ],
    lesson: "Electrodes and reusable electrotherapy accessories must be handled according to manufacturer instructions and infection-prevention protocols. Use appropriate patient-specific or disposable accessories where required, and never transfer contaminated equipment between patients."
  },
  {
    id: 18,
    title: "The Goniometer Magician",
    field: "Musculoskeletal Assessment",
    date: "2026-10-30",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "What was the patient's knee flexion today?" },
      { speaker: "Intern", text: "130 degrees, Sir." },
      { speaker: "Dr. Sajjad", text: "And last week?" },
      { speaker: "Intern", text: "90 degrees." },
      { speaker: "Dr. Sajjad", text: "That's a forty-degree improvement! Show me your measurement." },
      { speaker: "Intern", text: "Sir, I didn't actually measure it. I just estimated." },
      { speaker: "Dr. Sajjad", text: "You estimated forty degrees of improvement with your eyes?" },
      { speaker: "Intern", text: "Yes, Sir. I'm developing clinical intuition." },
      { speaker: "Dr. Sajjad", text: "That's not clinical intuition. That's a career in fortune-telling! Where was the patient positioned? What were your landmarks? Did you use the same measurement method?" },
      { speaker: "Intern", text: "I thought numbers were just numbers, Sir." },
      { speaker: "Dr. Sajjad", text: "And I thought you were a physiotherapy intern, not a mathematics magician!" }
    ],
    lesson: "Accurate ROM measurement requires standardized positioning, anatomical landmarks, correct goniometer alignment and consistent measurement procedures. Document the method and compare measurements cautiously. Never invent or estimate improvement without assessment."
  },
  {
    id: 17,
    title: "The Ice-Pack Time Traveller",
    field: "Musculoskeletal Rehabilitation",
    date: "2026-10-30",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "How long did you apply the ice pack?" },
      { speaker: "Intern", text: "Sir, just 45 minutes." },
      { speaker: "Dr. Sajjad", text: "FORTY-FIVE MINUTES?" },
      { speaker: "Intern", text: "Yes, Sir. The patient said it was getting numb, so I thought the treatment was working." },
      { speaker: "Dr. Sajjad", text: "And did you check the skin?" },
      { speaker: "Intern", text: "No, Sir. I thought ice doesn't need monitoring because it's already cold." },
      { speaker: "Dr. Sajjad", text: "Wonderful! You've discovered a new treatment technique: turning cryotherapy into cryogenic punishment." },
      { speaker: "Intern", text: "So should I use more ice next time?" },
      { speaker: "Dr. Sajjad", text: "Next time, use your brain first. Check skin condition, sensation, circulation and contraindications. Use an appropriate duration and protective barrier according to the modality protocol. Stop immediately if there are concerning skin changes or excessive discomfort." }
    ],
    lesson: "Cryotherapy requires appropriate screening, skin protection, monitoring and dosage. Excessive exposure can cause cold injury, particularly in patients with impaired sensation or circulation."
  },
  {
    id: 16,
    title: "The Blood Pressure Blind Spot",
    field: "Cardiopulmonary Physiotherapy",
    date: "2026-10-30",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why hasn't the patient started their exercise session?" },
      { speaker: "Intern", text: "Sir, they said they were feeling a little uncomfortable, but I was ready with the treadmill." },
      { speaker: "Dr. Sajjad", text: "Did you check their blood pressure?" },
      { speaker: "Intern", text: "Yes, Sir. It was 190/110." },
      { speaker: "Dr. Sajjad", text: "And what did you do?" },
      { speaker: "Intern", text: "I thought a little walking would improve circulation, Sir." },
      { speaker: "Dr. Sajjad", text: "YOU THOUGHT WALKING WOULD FIX 190/110? Did you mistake a physiotherapy clinic for a pressure cooker testing laboratory?" },
      { speaker: "Intern", text: "So should I reduce the treadmill speed?" },
      { speaker: "Dr. Sajjad", text: "Reduce your confidence first! Stop the session, reassess appropriately, check symptoms and arrange prompt medical evaluation. If there are symptoms suggesting acute target-organ injury, activate emergency care. We don't negotiate with potentially dangerous observations." }
    ],
    lesson: "A markedly elevated blood pressure reading requires appropriate reassessment and clinical decision-making before exercise. Consider symptoms, repeat measurements using correct technique, follow institutional escalation protocols, and never proceed with routine exercise when a potentially unsafe cardiovascular status has not been evaluated."
  },
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

  ,
  {
    id: 14,
    title: "The Human Crane",
    field: "Neurological Rehabilitation",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why are you pulling the patient's arm while helping them walk?" },
      { speaker: "Intern", text: "Sir, they were unsteady, so I grabbed their shoulder and dragged them forward. Efficient transport!" },
      { speaker: "Dr. Sajjad", text: "This is gait training, not moving furniture. Where is your assessment of balance, assistance level, footwear, walking aid, and fall risk?" },
      { speaker: "Intern", text: "I thought my grip was the walking aid, Sir." },
      { speaker: "Dr. Sajjad", text: "Your grip is not a safety plan. Set up the environment, use an appropriate aid and guarding technique, and match assistance to the patient's assessed ability. If you cannot safely manage the transfer, get help." },
      { speaker: "Intern", text: "So the goal is safe, purposeful walking—not me becoming a crane?" },
      { speaker: "Dr. Sajjad", text: "Exactly. We train the patient, not your biceps." }
    ],
    lesson: "Assess mobility, balance, cognition, medical status, environment, and fall risk before gait training. Use an appropriate walking aid and safe guarding/assistance technique; avoid pulling the patient by the arm. Seek additional help when the required assistance exceeds your competence or safe capacity."
  },
  {
    id: 13,
    title: "The Repetition Robot",
    field: "Exercise Safety",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why has the patient stopped exercising and grabbed the plinth?" },
      { speaker: "Intern", text: "They said they felt dizzy, Sir, but we still had twenty repetitions left." },
      { speaker: "Dr. Sajjad", text: "And your response was?" },
      { speaker: "Intern", text: "I said, 'Only twenty more!' Motivation is my speciality." },
      { speaker: "Dr. Sajjad", text: "A symptom is not a countdown timer. Stop the exercise, help them get into a safe position, assess their symptoms and vital signs as appropriate, and follow the clinic's escalation protocol. Do not restart just to finish the set." },
      { speaker: "Intern", text: "So the exercise sheet doesn't outrank the patient?" },
      { speaker: "Dr. Sajjad", text: "Correct. The sheet has never once complained of dizziness." }
    ],
    lesson: "Stop exercise when a patient develops dizziness or other unexpected concerning symptoms. Prevent a fall, assess the situation within your scope, check relevant observations when indicated, and escalate according to severity and local protocol. Do not push through unexplained symptoms or resume until it is safe."
  },
  {
    id: 12,
    title: "The Surprise Stretch",
    field: "Professional Practice",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "Why did the patient pull away when you started the stretch?" },
      { speaker: "Intern", text: "Sir, I wanted to save time. I moved their leg into position before explaining anything." },
      { speaker: "Dr. Sajjad", text: "So the patient received a surprise performance instead of an explanation?" },
      { speaker: "Intern", text: "I thought they would understand once I started, Sir." },
      { speaker: "Dr. Sajjad", text: "Patients are not props in your practical exam. Explain what you propose to do, why, what they may feel, and the alternatives. Check consent, respect their choice, and stop if they withdraw it." },
      { speaker: "Intern", text: "Even if it is a routine stretch?" },
      { speaker: "Dr. Sajjad", text: "Especially then. Familiarity is not permission." }
    ],
    lesson: "Explain the proposed assessment or intervention in understandable language, including its purpose, expected sensations, relevant risks, and alternatives. Obtain informed consent, respect the patient's decision, protect privacy and dignity, and stop if consent is withdrawn."
  },
  {
    id: 11,
    title: "The Posture Police",
    field: "Musculoskeletal Clinical Reasoning",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "What did you find in the assessment of the student with back pain?" },
      { speaker: "Intern", text: "Diagnosis: terrible posture, Sir. They were sitting with a rounded back. I told them their spine is getting damaged." },
      { speaker: "Dr. Sajjad", text: "Did you ask about symptom behaviour, activity, sleep, stress, workload, or what movements change the pain?" },
      { speaker: "Intern", text: "No, Sir. I was busy arresting their shoulders." },
      { speaker: "Dr. Sajjad", text: "Posture is one observation, not a complete diagnosis or proof of damage. Explore the whole clinical picture and explain movement without frightening the patient." },
      { speaker: "Intern", text: "So I should assess the person, not issue a posture fine?" },
      { speaker: "Dr. Sajjad", text: "Correct. Your posture-police badge is hereby revoked." }
    ],
    lesson: "Do not assume that a single posture explains musculoskeletal pain or means tissue damage. Assess symptoms, function, relevant physical findings, activity, psychosocial context, and the patient's goals. Offer balanced, non-alarmist advice and support comfortable, varied movement."
  }


  ,
  {
    id: 15,
    title: "The Reflex Royalty",
    field: "Neurological Assessment",
    date: "2026-10-29",
    dialogue: [
      { speaker: "Dr. Sajjad", text: "What did you find during the neurological examination?" },
      { speaker: "Intern", text: "Sir, the patient's knee reflex was absent. I think the nerve has officially resigned." },
      { speaker: "Dr. Sajjad", text: "You tested it once and diagnosed a neurological problem? Did you check the patient's position, relaxation, technique, or compare the other side?" },
      { speaker: "Intern", text: "No, Sir. I was waiting for the reflex to introduce itself." },
      { speaker: "Dr. Sajjad", text: "This is a reflex test, not a job interview! Relax the patient, use the correct technique, repeat the test when appropriate, and interpret it alongside the rest of the neurological examination." },
      { speaker: "Intern", text: "So, Sir… the nerve hasn't resigned yet?" },
      { speaker: "Dr. Sajjad", text: "Not as quickly as your clinical reasoning did!" }
    ],
    lesson: "An absent or reduced deep tendon reflex should not be interpreted in isolation. Ensure appropriate positioning, relaxation and technique; compare sides and assess other relevant neurological findings. Interpret the result in the context of the patient's history and complete examination. If findings are unexpected or concerning, reassess and arrange appropriate medical evaluation."
  }

] satisfies StupidInternEpisode[]).sort((a, b) => b.id - a.id);

export function getLatestEpisode() {
  return stupidInternEpisodes[0];
}

export function getEpisodeById(id: number) {
  return stupidInternEpisodes.find((e) => e.id === id);
}
