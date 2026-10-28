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
];

export function getLatestEpisode() {
  return stupidInternEpisodes[0];
}

export function getEpisodeById(id: number) {
  return stupidInternEpisodes.find((e) => e.id === id);
}
