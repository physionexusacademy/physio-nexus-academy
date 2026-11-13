/** In-depth PNA Teacher lessons (slug under /learn) that go with each Skills Lab skill. The teacher validator checks every slug exists. */
export type SkillLessonLink = { slug: string; title: string };

export const LESSONS_FOR_SKILL: Record<string, SkillLessonLink[]> = {
  dermatomes: [
    { slug: "sensory-exam-dermatomes", title: "Sensory exam & dermatomes" },
    { slug: "radiculopathy-myelopathy-neuropathy", title: "Root, cord or nerve?" },
  ],
  myotomes: [
    { slug: "myotome-screening-root-levels", title: "Myotome screening" },
    { slug: "radiculopathy-myelopathy-neuropathy", title: "Root, cord or nerve?" },
  ],
  reflexes: [
    { slug: "deep-tendon-reflexes-technique", title: "Reflex technique & grading" },
    { slug: "upper-motor-neuron-signs-bedside", title: "UMN signs at the bedside" },
  ],
  "peripheral-nerves": [
    { slug: "arm-nerve-injuries", title: "Arm nerve injuries" },
    { slug: "leg-nerve-injuries", title: "Leg nerve injuries" },
  ],
  "tone-coordination": [
    { slug: "tone-spasticity-rigidity-ashworth", title: "Tone & Ashworth" },
    { slug: "cerebellar-exam-coordination", title: "Cerebellar exam" },
    { slug: "romberg-tandem-pronator-drift", title: "Romberg, tandem, drift" },
  ],
  goniometry: [
    { slug: "goniometry-foundations", title: "Goniometry foundations" },
    { slug: "goniometry-upper-limb", title: "Shoulder, elbow, wrist" },
    { slug: "goniometry-lower-limb", title: "Hip, knee, ankle" },
  ],
  "manual-muscle-testing": [
    { slug: "mmt-grading-0-to-5", title: "MMT grading 0–5" },
    { slug: "mmt-upper-limb-substitutions", title: "Upper-limb substitutions" },
    { slug: "mmt-lower-limb-gluteals", title: "Hip, knee, ankle MMT" },
  ],
  "muscle-length": [{ slug: "muscle-length-testing", title: "Muscle length testing" }],
  "limb-measurements": [
    { slug: "limb-length-and-girth", title: "Limb length & girth" },
    { slug: "spinal-and-general-measures", title: "Spinal & general measures" },
  ],
  posture: [
    { slug: "posture-plumb-line-analysis", title: "Plumb-line analysis" },
    { slug: "janda-crossed-syndromes", title: "Crossed syndromes" },
    { slug: "scoliosis-and-limb-alignment", title: "Scoliosis & alignment" },
  ],
  palpation: [
    { slug: "palpation-spinal-levels", title: "Spinal levels" },
    { slug: "palpation-upper-body-landmarks", title: "Chest, shoulder, elbow" },
    { slug: "palpation-lower-limb-ottawa-rules", title: "Lower limb & Ottawa" },
  ],
  "vital-signs": [
    { slug: "pulse-blood-pressure-respiration", title: "Pulse, BP, respiration" },
    { slug: "oximetry-temperature-capillary-refill", title: "SpO₂, temperature, refill" },
    { slug: "exercise-intensity-borg-talk-test", title: "Exercise intensity" },
    { slug: "orthostatic-hypotension-screen", title: "Orthostatic hypotension" },
    { slug: "abpi-and-glucose-exercise-safety", title: "ABPI & glucose" },
    { slug: "exercise-stop-signs-and-ward-mobilisation", title: "Stop signs & ward mobilisation" },
  ],
  "balance-function": [
    { slug: "timed-up-and-go-gait-speed", title: "TUG & gait speed" },
    { slug: "sit-to-stand-tests", title: "Sit-to-stand tests" },
    { slug: "choosing-balance-tests", title: "Choosing a balance test" },
    { slug: "balance-falls-assessment", title: "Balance & falls assessment" },
  ],
};
