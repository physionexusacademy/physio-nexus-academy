import "server-only";

export type WorkshopAssessmentQuestion = {
  id: string;
  topic: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
  correctValue: "A" | "B" | "C" | "D";
};

export const workshopAssessment = {
  id: "pna-hyderabad-oct-2026-final",
  title: "PNA Post-Workshop Knowledge Assessment",
  subtitle: "30 questions · 30 seconds per question · one attempt",
  timePerQuestionSeconds: 30,
  questions: [
    {
      id: "q1",
      topic: "Strain Counterstrain",
      question:
        "After identifying a tender point during Strain Counterstrain assessment, what is the most appropriate next step?",
      options: [
        { value: "A", label: "Apply a strong stretch to the involved tissue" },
        { value: "B", label: "Position the patient toward a position of comfort" },
        { value: "C", label: "Perform repeated resisted contractions" },
        { value: "D", label: "Apply deep friction over the tender point" },
      ],
      correctValue: "B",
    },
    {
      id: "q2",
      topic: "Strain Counterstrain",
      question:
        "What is the main clinical purpose of placing the patient in a position of comfort during Strain Counterstrain?",
      options: [
        { value: "A", label: "To increase tissue tension at the tender point" },
        { value: "B", label: "To produce joint cavitation" },
        { value: "C", label: "To reduce tender-point sensitivity and protective tissue tension" },
        { value: "D", label: "To create a maximal muscle contraction" },
      ],
      correctValue: "C",
    },
    {
      id: "q3",
      topic: "Strain Counterstrain",
      question:
        "When monitoring a tender point during positioning, which change is commonly used as an acceptable treatment target?",
      options: [
        { value: "A", label: "Approximately 70% or greater reduction in tenderness" },
        { value: "B", label: "No change in tenderness" },
        { value: "C", label: "A 10% increase in tenderness" },
        { value: "D", label: "Complete reproduction of the patient's pain" },
      ],
      correctValue: "A",
    },
    {
      id: "q4",
      topic: "Strain Counterstrain",
      question:
        "How should the patient usually be returned from the Strain Counterstrain treatment position toward neutral?",
      options: [
        { value: "A", label: "With a rapid active movement" },
        { value: "B", label: "With repeated bouncing movements" },
        { value: "C", label: "With a forceful passive stretch" },
        { value: "D", label: "Slowly and in a controlled manner" },
      ],
      correctValue: "D",
    },
    {
      id: "q5",
      topic: "Strain Counterstrain",
      question:
        "Which is the most appropriate immediate reassessment after completing a Strain Counterstrain technique?",
      options: [
        { value: "A", label: "Measure body weight" },
        { value: "B", label: "Check only blood pressure" },
        { value: "C", label: "Recheck tender-point sensitivity and the relevant painful movement or impairment" },
        { value: "D", label: "Order imaging before any reassessment" },
      ],
      correctValue: "C",
    },
    {
      id: "q6",
      topic: "Myofascial Release",
      question:
        "In a direct myofascial release approach, the therapist generally applies a sustained load in which direction?",
      options: [
        { value: "A", label: "Only toward the direction of ease" },
        { value: "B", label: "Toward the perceived restrictive barrier" },
        { value: "C", label: "Randomly without assessing tissue direction" },
        { value: "D", label: "Only vertically into the tissue" },
      ],
      correctValue: "B",
    },
    {
      id: "q7",
      topic: "Myofascial Release",
      question:
        "Which statement best describes an indirect myofascial release approach?",
      options: [
        { value: "A", label: "The tissue is guided toward the direction of ease or least resistance" },
        { value: "B", label: "The tissue is forced firmly into the restrictive barrier" },
        { value: "C", label: "A high-velocity thrust is always required" },
        { value: "D", label: "The patient performs maximal resisted contractions throughout" },
      ],
      correctValue: "A",
    },
    {
      id: "q8",
      topic: "Myofascial Release",
      question:
        "During myofascial assessment, which finding is most useful for selecting the direction of treatment?",
      options: [
        { value: "A", label: "The patient's height" },
        { value: "B", label: "The therapist's hand dominance" },
        { value: "C", label: "The patient's resting heart rate alone" },
        { value: "D", label: "Tissue glide, resistance, and directional restriction" },
      ],
      correctValue: "D",
    },
    {
      id: "q9",
      topic: "Myofascial Release",
      question:
        "If a myofascial release technique produces excessive or increasing pain, what is the best response?",
      options: [
        { value: "A", label: "Increase the force until the tissue releases" },
        { value: "B", label: "Reduce or stop the technique and reassess the patient's response" },
        { value: "C", label: "Ask the patient to hold their breath" },
        { value: "D", label: "Ignore the pain and continue for the planned duration" },
      ],
      correctValue: "B",
    },
    {
      id: "q10",
      topic: "Myofascial Release",
      question:
        "Which is the best way to judge the immediate clinical effect of a myofascial release intervention?",
      options: [
        { value: "A", label: "Measure an unrelated muscle group" },
        { value: "B", label: "Measure body mass" },
        { value: "C", label: "Rely only on the therapist's impression" },
        { value: "D", label: "Repeat the same relevant pain, range-of-motion, or functional measure used before treatment" },
      ],
      correctValue: "D",
    },
    {
      id: "q11",
      topic: "Dry Needling",
      question:
        "Which step is essential before performing dry needling?",
      options: [
        { value: "A", label: "Obtain informed consent and screen for relevant contraindications and precautions" },
        { value: "B", label: "Insert the needle before explaining the procedure" },
        { value: "C", label: "Apply kinesiology tape over the target area first" },
        { value: "D", label: "Avoid discussing possible adverse effects" },
      ],
      correctValue: "A",
    },
    {
      id: "q12",
      topic: "Dry Needling",
      question:
        "Which knowledge is most important for safe dry needling in a specific body region?",
      options: [
        { value: "A", label: "The patient's preferred sleeping position" },
        { value: "B", label: "The color of the target muscle on an anatomy chart" },
        { value: "C", label: "Regional anatomy, including nearby neurovascular and visceral structures" },
        { value: "D", label: "The therapist's preferred needle brand" },
      ],
      correctValue: "C",
    },
    {
      id: "q13",
      topic: "Dry Needling",
      question:
        "Where should a used dry-needling needle be disposed of immediately after the procedure?",
      options: [
        { value: "A", label: "In a normal waste bin" },
        { value: "B", label: "On the treatment tray for later disposal" },
        { value: "C", label: "In a paper bag" },
        { value: "D", label: "In an approved sharps container" },
      ],
      correctValue: "D",
    },
    {
      id: "q14",
      topic: "Dry Needling",
      question:
        "A patient develops unexpected severe pain, dizziness, or distress during dry needling. What should the therapist do first?",
      options: [
        { value: "A", label: "Increase needle manipulation" },
        { value: "B", label: "Stop the procedure and assess the patient" },
        { value: "C", label: "Continue until the planned treatment time is complete" },
        { value: "D", label: "Ask the patient to ignore the symptoms" },
      ],
      correctValue: "B",
    },
    {
      id: "q15",
      topic: "Dry Needling",
      question:
        "Which is an appropriate approach to minor local soreness after dry needling?",
      options: [
        { value: "A", label: "Provide appropriate post-treatment advice and ask the patient to monitor symptoms" },
        { value: "B", label: "Tell the patient that any soreness is always dangerous" },
        { value: "C", label: "Repeat aggressive needling immediately" },
        { value: "D", label: "Require complete immobilization of the region" },
      ],
      correctValue: "A",
    },
    {
      id: "q16",
      topic: "Electro-Acupuncture",
      question:
        "How is electrical stimulation delivered during electro-acupuncture?",
      options: [
        { value: "A", label: "Through an ultrasound transducer" },
        { value: "B", label: "Through an elastic therapeutic tape" },
        { value: "C", label: "Through inserted needles connected to an electrical stimulator" },
        { value: "D", label: "Through a hot pack placed over the skin" },
      ],
      correctValue: "C",
    },
    {
      id: "q17",
      topic: "Electro-Acupuncture",
      question:
        "How should stimulation intensity generally be introduced during electro-acupuncture?",
      options: [
        { value: "A", label: "At maximum intensity immediately" },
        { value: "B", label: "Gradually, according to the treatment goal and patient tolerance" },
        { value: "C", label: "Randomly throughout the session" },
        { value: "D", label: "Without asking the patient about sensation" },
      ],
      correctValue: "B",
    },
    {
      id: "q18",
      topic: "Electro-Acupuncture",
      question:
        "Before electro-acupuncture, which safety consideration is especially important?",
      options: [
        { value: "A", label: "The patient's shoe size" },
        { value: "B", label: "The patient's dominant hand" },
        { value: "C", label: "The color of the electrode leads" },
        { value: "D", label: "Relevant electrical-stimulation precautions, contraindications, and implanted medical devices" },
      ],
      correctValue: "D",
    },
    {
      id: "q19",
      topic: "Electro-Acupuncture",
      question:
        "If electrical stimulation becomes painful or clearly uncomfortable, what is the best immediate response?",
      options: [
        { value: "A", label: "Reduce or stop the stimulation and reassess the patient" },
        { value: "B", label: "Increase the intensity to overcome the discomfort" },
        { value: "C", label: "Continue without adjustment" },
        { value: "D", label: "Insert the needles more deeply without reassessment" },
      ],
      correctValue: "A",
    },
    {
      id: "q20",
      topic: "Electro-Acupuncture",
      question:
        "Which approach is most appropriate when selecting electro-acupuncture treatment parameters?",
      options: [
        { value: "A", label: "Use exactly the same settings for every patient" },
        { value: "B", label: "Always choose the highest available frequency" },
        { value: "C", label: "Select parameters according to the treatment goal, patient tolerance, and safety considerations" },
        { value: "D", label: "Always choose the lowest available intensity regardless of response" },
      ],
      correctValue: "C",
    },
    {
      id: "q21",
      topic: "Cupping Therapy",
      question:
        "What is the primary mechanical action created by a suction cup during cupping therapy?",
      options: [
        { value: "A", label: "Compression of the underlying bone" },
        { value: "B", label: "Lifting and decompression of superficial tissues into the cup" },
        { value: "C", label: "Permanent shortening of the muscle" },
        { value: "D", label: "Joint dislocation" },
      ],
      correctValue: "B",
    },
    {
      id: "q22",
      topic: "Cupping Therapy",
      question:
        "Why should the skin be inspected before applying cupping therapy?",
      options: [
        { value: "A", label: "To estimate the patient's age" },
        { value: "B", label: "To choose the color of the cup" },
        { value: "C", label: "To measure joint range of motion" },
        { value: "D", label: "To identify wounds, infection, irritation, or other unsuitable skin conditions" },
      ],
      correctValue: "D",
    },
    {
      id: "q23",
      topic: "Cupping Therapy",
      question:
        "Which explanation is most appropriate regarding temporary circular discoloration after cupping?",
      options: [
        { value: "A", label: "It may occur after suction and usually fades over time" },
        { value: "B", label: "It always indicates serious tissue damage" },
        { value: "C", label: "It confirms a fracture" },
        { value: "D", label: "It is always permanent" },
      ],
      correctValue: "A",
    },
    {
      id: "q24",
      topic: "Cupping Therapy",
      question:
        "If excessive pain or marked skin irritation develops during cupping, what should the therapist do?",
      options: [
        { value: "A", label: "Increase the suction" },
        { value: "B", label: "Double the planned treatment time" },
        { value: "C", label: "Remove or modify the cup and reassess the skin and symptoms" },
        { value: "D", label: "Ignore the response and continue" },
      ],
      correctValue: "C",
    },
    {
      id: "q25",
      topic: "Cupping Therapy",
      question:
        "Which statement best reflects appropriate clinical use of cupping therapy?",
      options: [
        { value: "A", label: "It should replace assessment and rehabilitation planning" },
        { value: "B", label: "It should be used within an appropriate clinical assessment and rehabilitation plan" },
        { value: "C", label: "It should be applied without screening whenever requested" },
        { value: "D", label: "It should be the only treatment for every musculoskeletal condition" },
      ],
      correctValue: "B",
    },
    {
      id: "q26",
      topic: "Kinesio Taping",
      question:
        "What is the most appropriate skin preparation before applying kinesiology tape?",
      options: [
        { value: "A", label: "Apply the tape to clean, dry skin" },
        { value: "B", label: "Apply lotion immediately before taping" },
        { value: "C", label: "Apply the tape over wet skin" },
        { value: "D", label: "Apply oil to improve adhesion" },
      ],
      correctValue: "A",
    },
    {
      id: "q27",
      topic: "Kinesio Taping",
      question:
        "A patient develops significant itching, burning, or skin irritation after kinesiology taping. What should be advised?",
      options: [
        { value: "A", label: "Add another layer of tape" },
        { value: "B", label: "Keep the tape on for seven days regardless of symptoms" },
        { value: "C", label: "Remove the tape and assess the skin" },
        { value: "D", label: "Increase the tape tension" },
      ],
      correctValue: "C",
    },
    {
      id: "q28",
      topic: "Kinesio Taping",
      question:
        "What should primarily guide the choice of a kinesiology taping application?",
      options: [
        { value: "A", label: "The therapist's favorite technique" },
        { value: "B", label: "The color of the tape" },
        { value: "C", label: "The patient's preferred color alone" },
        { value: "D", label: "The clinical goal and assessment findings" },
      ],
      correctValue: "D",
    },
    {
      id: "q29",
      topic: "Kinesio Taping",
      question:
        "Which principle is most appropriate regarding tape tension?",
      options: [
        { value: "A", label: "Use maximum tension for every application" },
        { value: "B", label: "Stretch the tape as much as possible regardless of purpose" },
        { value: "C", label: "Select tension randomly" },
        { value: "D", label: "Use controlled tension according to the intended taping technique and clinical goal" },
      ],
      correctValue: "D",
    },
    {
      id: "q30",
      topic: "Kinesio Taping",
      question:
        "What is good practice after applying kinesiology tape as part of a treatment session?",
      options: [
        { value: "A", label: "Reassess the relevant clinical response or functional measure" },
        { value: "B", label: "Assume the intervention worked without reassessment" },
        { value: "C", label: "Stop all exercise permanently" },
        { value: "D", label: "Apply a second layer automatically" },
      ],
      correctValue: "A",
    },
  ] satisfies WorkshopAssessmentQuestion[],
} as const;

export type PublicWorkshopAssessmentQuestion = {
  id: string;
  topic: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
};

export function getPublicWorkshopAssessmentQuestions(): PublicWorkshopAssessmentQuestion[] {
  return workshopAssessment.questions.map(({ id, topic, question, options }) => ({
    id,
    topic,
    question,
    options: options.map((option) => ({ ...option })),
  }));
}
