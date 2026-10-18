import type { ClinicalCase } from "@/lib/clinical-cases";
export const case20261019Parkinsons: ClinicalCase = {
  slug: "parkinsons-freezing-turning-cueing-20261019",
  title: "Freezing During Turns: Parkinson's Gait Rehabilitation Simulation",
  specialty: "Neurological",
  difficulty: "Advanced",
  estimatedTime: "8–10 min",
  summary: "Fictional teaching case on freezing triggers, cueing, falls-risk screening and task-specific gait practice.",
  presentation: [
    "An adult with established Parkinson's disease reports hesitation when starting to walk and turning in narrow spaces.",
    "Episodes are more common at doorways, during quick turns and while talking and walking. The person has had near-falls and wants to walk independently in the community.",
    "No sudden onset or new focal neurological symptoms are reported; light-headedness on standing needs screening."
  ],
  keyFindings: [
    "Short steps and bradykinesia during straight walking.",
    "Brief start hesitation during turns and doorway passage.",
    "A visual floor target improves step initiation in a supervised trial.",
    "A pause, weight shift and wider multi-step turn appear safer than rapid pivoting."
  ],
  redFlags: [
    "New focal neurological symptoms, acute confusion, fainting, chest pain or severe breathlessness require urgent assessment.",
    "A significant fall injury or rapid deterioration warrants medical review."
  ],
  differentials: [
    { diagnosis: "Parkinson's-related freezing of gait", reasoning: "Repeatable start/turn episodes with short steps fit the known movement disorder." },
    { diagnosis: "Medication-related motor fluctuation", reasoning: "Ask about timing and coordinate with the prescriber; do not advise independent medication changes." },
    { diagnosis: "Orthostatic hypotension", reasoning: "Postural light-headedness may contribute to instability and should be assessed." }
  ],
  finalDiagnosis: "Parkinson's-related freezing of gait during initiation and turning, with falls risk requiring screening and individualized cue-based rehabilitation.",
  reasoning: [
    "The episodes are task-triggered and the visual-cue response is promising but must be tested in real-world contexts.",
    "Postural symptoms and medication timing may change the plan and require medical coordination."
  ],
  management: [
    "Assess postural symptoms and blood pressure according to local protocol when indicated.",
    "Trial a visual target and a simple pause-shift-step strategy; retain cues that improve safe movement.",
    "Practise starts, wide turns and doorways with appropriate guarding or an aid.",
    "Add progressive balance, leg strengthening and aerobic activity matched to ability; review environmental hazards with the person and caregiver."
  ],
  progression: [
    "Start with safe transfers, straight walking and one reliable cue.",
    "Practise starts, turns and doorways in short bouts; add route complexity only when performance is consistent.",
    "Reassess near-falls, episode frequency, turning, confidence and participation after several weeks."
  ],
  learningPoints: [
    "Freezing differs from general slowness and often appears during transitions.",
    "Cueing must be individualized; medicine timing and postural symptoms can change the plan.",
    "Safety screening comes before dual-task gait practice."
  ],
  references: [
    { title: "Parkinson's disease in adults: diagnosis and management (NG71)", organization: "NICE", year: "2017, updated", url: "https://www.nice.org.uk/guidance/ng71" },
    { title: "Physical Therapist Management of Parkinson Disease: A Clinical Practice Guideline", organization: "American Physical Therapy Association / Physical Therapy", year: "2022", url: "https://academic.oup.com/ptj/article/102/4/pzab302/6485222" }
  ],
  caseType: "Simulated evidence-based case"
};