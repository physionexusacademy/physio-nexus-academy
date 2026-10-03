import type { ClinicalCase } from "@/lib/clinical-cases";

export const case20261004Falls: ClinicalCase = {
  slug: "older-adult-recurrent-falls-orthostatic-symptoms",
  title: "Recurrent Falls With Dizziness: Balance Problem or Orthostatic Hypotension?",
  specialty: "Geriatrics",
  difficulty: "Advanced",
  estimatedTime: "12 min",
  summary: "A simulated case showing why recurrent falls with position-related dizziness require cardiovascular and multidomain reasoning, not balance exercises alone.",
  presentation: [
    "A 76-year-old community-dwelling adult reports three falls in two months, usually after standing or shortly after beginning to walk.",
    "The patient describes brief light-headedness after rising from bed or a chair, but no spinning sensation.",
    "Walking confidence has reduced and daily activity has dropped because of fear of another fall."
  ],
  keyFindings: [
    "Lower-limb strength and reactive balance are reduced.",
    "Timed functional mobility is slower than expected for the patient's previous level.",
    "Symptoms are reproduced when moving from lying or sitting to standing.",
    "Medication list includes antihypertensive therapy and a recently added medication associated with blood-pressure lowering.",
    "No focal neurological deficit is identified during the screening examination."
  ],
  redFlags: [
    "True syncope, chest pain, palpitations, new severe breathlessness or injury from a fall requires medical assessment.",
    "Recurrent unexplained falls may have a cardiovascular cause and should not be treated as a simple balance impairment."
  ],
  differentials: [
    {
      diagnosis: "Orthostatic hypotension contributing to recurrent falls",
      reasoning: "The consistent position-related light-headedness and falls shortly after standing make an orthostatic mechanism plausible and require lying-to-standing blood-pressure assessment through the appropriate clinical pathway."
    },
    {
      diagnosis: "Multifactorial falls with strength and balance impairment",
      reasoning: "Reduced lower-limb strength and balance are important modifiable contributors but do not fully explain the position-related symptom pattern."
    },
    {
      diagnosis: "Vestibular disorder",
      reasoning: "Less likely because the symptom is described as light-headedness rather than vertigo, but dizziness history should still clarify triggers and quality."
    },
    {
      diagnosis: "Neurological gait disorder",
      reasoning: "No focal neurological signs are found, but this should be reconsidered if new gait, sensory, motor or cognitive findings emerge."
    }
  ],
  finalDiagnosis: "Multifactorial falls risk with suspected orthostatic hypotension requiring medical review alongside strength and balance rehabilitation.",
  reasoning: [
    "World falls guidelines recommend a multidomain approach for high-risk older adults rather than treating one impairment in isolation.",
    "Position-related symptoms make cardiovascular assessment important; recurrent unexplained falls should be approached similarly to possible syncope when indicated.",
    "Balance and strength deficits remain treatable, but the suspected orthostatic contributor changes the safety plan and referral pathway."
  ],
  management: [
    "Communicate the recurrent position-related symptoms and medication history to the appropriate medical provider for cardiovascular and medication review.",
    "Use the locally appropriate orthostatic blood-pressure assessment pathway and do not progress provocative standing tasks blindly.",
    "Begin supervised lower-limb strengthening and balance training at a safe level.",
    "Teach safe position changes, environmental fall-risk reduction and use of support when symptoms occur.",
    "Review footwear, vision, home hazards, medication burden and other fall-risk domains with the wider team as appropriate.",
    "Track falls, near-falls, dizziness episodes and functional mobility."
  ],
  progression: [
    "Progress sit-to-stand volume and resistance as symptoms and hemodynamic response allow.",
    "Advance static balance to stepping, turning and reactive tasks only when safe.",
    "Build walking duration and community challenges after the position-related symptoms are better understood and managed.",
    "Reassess strength, gait, balance, falls frequency and confidence at planned intervals."
  ],
  learningPoints: [
    "Recurrent falls are often multifactorial.",
    "Position-related dizziness should trigger cardiovascular reasoning, not only vestibular or balance treatment.",
    "Orthostatic hypotension management belongs inside a multidomain falls plan.",
    "A physiotherapy program can proceed, but the suspected medical contributor changes monitoring and referral."
  ],
  references: [
    {
      title: "World guidelines for falls prevention and management for older adults: a global initiative",
      organization: "Age and Ageing",
      year: "2022",
      url: "https://academic.oup.com/ageing/article/51/9/afac205/6730755"
    }
  ],
  caseType: "Simulated evidence-based case"
};
