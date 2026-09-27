export type WeeklyQuizQuestion = {
  id: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
  correctValue: "A" | "B" | "C" | "D";
  explanation: string;
};

export const currentQuiz = {
  id: "pna-weekly-001",
  title: "Weekly Clinical Challenge #1",
  subtitle: "5 questions · 30 seconds total",
  timeLimitSeconds: 30,
  questions: [
    {
      id: "q1",
      question:
        "A patient with acute low-back pain reports new urinary difficulty and numbness around the saddle area. What is the most appropriate next step?",
      options: [
        { value: "A", label: "Begin lumbar stretching" },
        { value: "B", label: "Arrange urgent medical assessment" },
        { value: "C", label: "Apply heat and review in one week" },
        { value: "D", label: "Perform repeated flexion exercises" },
      ],
      correctValue: "B",
      explanation:
        "New bladder dysfunction with saddle sensory change is a major neurological red flag and requires urgent in-person medical assessment.",
    },
    {
      id: "q2",
      question: "Which statement best describes a tender point?",
      options: [
        { value: "A", label: "Any palpable muscle spasm" },
        { value: "B", label: "A localized area painful to pressure" },
        { value: "C", label: "A diagnosis of nerve compression" },
        { value: "D", label: "A joint that is always hypomobile" },
      ],
      correctValue: "B",
      explanation:
        "A tender point is primarily a localized area of tenderness to pressure. It is not automatically a trigger point or a diagnosis by itself.",
    },
    {
      id: "q3",
      question:
        "In a direct myofascial-release approach, the therapist generally applies the sustained load in which direction?",
      options: [
        { value: "A", label: "Toward the perceived tissue restriction" },
        { value: "B", label: "Only away from the tissue barrier" },
        { value: "C", label: "Always perpendicular to the skin" },
        { value: "D", label: "Only along a nerve pathway" },
      ],
      correctValue: "A",
      explanation:
        "Direct MFR generally engages the perceived restrictive barrier with slow, controlled loading while monitoring the patient response.",
    },
    {
      id: "q4",
      question: "Which statement about pain is most accurate?",
      options: [
        { value: "A", label: "Pain intensity always equals tissue-damage severity" },
        { value: "B", label: "Persistent pain is always psychological" },
        { value: "C", label: "Pain is influenced by tissue, nervous-system and contextual factors" },
        { value: "D", label: "If imaging is normal, pain cannot be real" },
      ],
      correctValue: "C",
      explanation:
        "Pain is a real protective experience influenced by biological, neurological, psychological and contextual factors; it is not a simple tissue-damage meter.",
    },
    {
      id: "q5",
      question:
        "Dry needling and acupuncture can both use filiform needles. What most clearly distinguishes them in routine clinical practice?",
      options: [
        { value: "A", label: "Needles are always different materials" },
        { value: "B", label: "They necessarily use different skin depths" },
        { value: "C", label: "Their assessment and treatment frameworks can differ" },
        { value: "D", label: "Only one requires infection-control procedures" },
      ],
      correctValue: "C",
      explanation:
        "The same general type of filiform needle may be used, but target selection, assessment models, rationale and professional context can differ.",
    },
  ] satisfies WeeklyQuizQuestion[],
} as const;

export type PublicQuizQuestion = {
  id: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
};

export function getPublicQuestions(): PublicQuizQuestion[] {
  return currentQuiz.questions.map(({ id, question, options }) => ({
    id,
    question,
    options: options.map((option) => ({ ...option })),
  }));
}
