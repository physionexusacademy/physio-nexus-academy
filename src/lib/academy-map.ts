/**
 * The PNA campus map — one source of truth for every place a learner or
 * patient can go. Used by the header wings, the mobile menu, the command
 * palette (Ctrl/⌘+K), the homepage search and the footer directory.
 */

export type AcademyIcon =
  | "teacher" | "library" | "hand" | "injury" | "plan" | "tests" | "atlas" | "book"
  | "trophy" | "arena" | "cases" | "cards" | "registry" | "laugh"
  | "care" | "calendar" | "home" | "symptoms" | "calculator" | "pin"
  | "workshop" | "archive" | "research" | "people" | "founder" | "info" | "certificate" | "star" | "faq" | "contact"
  | "lesson";

export type AcademyPlace = {
  label: string;
  href: string;
  description: string;
  icon: AcademyIcon;
  /** Extra words people type when looking for this place. */
  keywords?: string;
  /** Hidden until the section is published. */
  requiresAtlas?: boolean;
};

export type AcademyWing = {
  id: "learn" | "practise" | "clinic" | "academy";
  label: string;
  tagline: string;
  intro: string;
  places: AcademyPlace[];
};

export const academyWings: AcademyWing[] = [
  {
    id: "learn",
    label: "Learn",
    tagline: "Understand it deeply",
    intro: "Step-by-step lessons, clinical guides and reference libraries — explained simply, in English or Roman Urdu.",
    places: [
      { label: "PNA Teacher", href: "/learn", description: "Hard concepts, step by step, with checks", icon: "teacher", keywords: "lessons course learn teach roman urdu paths beginner" },
      { label: "Knowledge Hub", href: "/knowledge-hub", description: "MSK, neuro, cardio, sports & more", icon: "library", keywords: "articles notes evidence specialties" },
      { label: "Manual Therapy", href: "/manual-therapy", description: "35 techniques: hands, dosage, safety", icon: "hand", keywords: "maitland mulligan mckenzie kaltenborn met mobilization manipulation" },
      { label: "MSK Injury Hub", href: "/msk-injuries", description: "Conditions, tests and rehab stages", icon: "injury", keywords: "injuries conditions back pain knee shoulder" },
      { label: "Treatment Plans", href: "/treatment-plans", description: "Assessment to progression, by condition", icon: "plan", keywords: "protocol management rehab exercises" },
      { label: "Special Tests", href: "/msk-special-tests", description: "How to perform and interpret", icon: "tests", keywords: "orthopedic tests sensitivity specificity" },
      { label: "Clinical Visual Atlas", href: "/clinical-visual-atlas", description: "Anatomy & pathology visuals", icon: "atlas", keywords: "anatomy images 3d", requiresAtlas: true },
      { label: "Books & Resources", href: "/resources", description: "Books, PDFs and study material", icon: "book", keywords: "books pdf notes" },
    ],
  },
  {
    id: "practise",
    label: "Practise",
    tagline: "Train your clinical brain",
    intro: "Daily questions, patient cases and spaced review — so knowledge turns into confident decisions.",
    places: [
      { label: "Daily Challenge", href: "/daily-challenge", description: "5 timed questions + leaderboard", icon: "trophy", keywords: "quiz mcq daily weekly leaderboard exam test" },
      { label: "Clinical Arena", href: "/clinical-arena", description: "History → diagnosis → treatment", icon: "arena", keywords: "cases game reasoning differential" },
      { label: "Case Lab", href: "/case-lab", description: "Real reports, reasoning step by step", icon: "cases", keywords: "case studies reports" },
      { label: "Flashcard Review", href: "/learn/review", description: "Spaced repetition for every lesson", icon: "cards", keywords: "flashcards revision srs viva" },
      { label: "Case Library", href: "/clinical-registry", description: "Reviewed, de-identified case reports", icon: "registry", keywords: "registry clinical case library submit case" },
      { label: "Stupid Intern Diaries", href: "/stupid-intern-diaries", description: "Funny mistakes, serious lessons", icon: "laugh", keywords: "intern episodes funny stories" },
    ],
  },
  {
    id: "clinic",
    label: "Clinic",
    tagline: "Care for patients",
    intro: "Physiotherapy appointments, home visits and simple guidance to understand your condition.",
    places: [
      { label: "Patient Services", href: "/patient-services", description: "What we treat and how", icon: "care", keywords: "physiotherapy treatment patient" },
      { label: "Book Appointment", href: "/appointment", description: "Request a consultation", icon: "calendar", keywords: "booking consult session appointment" },
      { label: "Home Visit", href: "/home-visit", description: "Physiotherapy at your home", icon: "home", keywords: "home visit ghar" },
      { label: "Symptom Checker", href: "/symptom-checker", description: "Screen patterns and red flags", icon: "symptoms", keywords: "pain checker symptoms" },
      { label: "BMI Calculator", href: "/health-calculators/bmi", description: "Quick BMI with age-aware notes", icon: "calculator", keywords: "bmi health calculator weight" },
      { label: "Karachi", href: "/locations/karachi", description: "Home visits & workshops", icon: "pin", keywords: "karachi location" },
      { label: "Hyderabad", href: "/locations/hyderabad", description: "Home visits & workshops", icon: "pin", keywords: "hyderabad location" },
    ],
  },
  {
    id: "academy",
    label: "Academy",
    tagline: "Grow with PNA",
    intro: "Hands-on CPD workshops, research support and the people behind Physio Nexus Academy.",
    places: [
      { label: "Workshops & CPD", href: "/workshops", description: "Upcoming hands-on training", icon: "workshop", keywords: "workshop cpd training register" },
      { label: "Training Archive", href: "/training", description: "Past workshops & internships", icon: "archive", keywords: "past training internship" },
      { label: "Research Support", href: "/research", description: "Methods, writing and evidence", icon: "research", keywords: "research thesis" },
      { label: "Faculty", href: "/faculty", description: "Meet our clinical educators", icon: "people", keywords: "teachers trainers" },
      { label: "Founder", href: "/founder", description: "Dr. Sajjad Raza PT", icon: "founder", keywords: "dr sajjad raza founder" },
      { label: "About PNA", href: "/about", description: "Mission and approach", icon: "info", keywords: "about mission" },
      { label: "Verify Certificate", href: "/verify", description: "Check a PNA certificate", icon: "certificate", keywords: "verify certificate" },
      { label: "Reviews", href: "/reviews", description: "Rate your PNA experience", icon: "star", keywords: "feedback review rating" },
      { label: "FAQ", href: "/faq", description: "Common questions answered", icon: "faq", keywords: "questions help" },
      { label: "Contact", href: "/contact", description: "WhatsApp, email and address", icon: "contact", keywords: "contact phone whatsapp email address" },
    ],
  },
];

/** Popular lessons surfaced in search before the learner types anything specific. */
export const popularLessons: AcademyPlace[] = [
  { label: "Convex–Concave Rule", href: "/learn/convex-concave-rule", description: "PNA Teacher · 10 min", icon: "lesson", keywords: "arthrokinematics glide roll" },
  { label: "Red Flags — When NOT to Treat", href: "/learn/red-flags-screening", description: "PNA Teacher · 11 min", icon: "lesson", keywords: "red flags cauda equina screening" },
  { label: "Dermatomes, Myotomes & Reflexes", href: "/learn/dermatomes-myotomes-reflexes", description: "PNA Teacher · 12 min", icon: "lesson", keywords: "neuro screen dermatome myotome reflex" },
  { label: "Maitland Grades", href: "/learn/maitland-grades", description: "PNA Teacher lesson", icon: "lesson", keywords: "maitland grades mobilization" },
  { label: "Gait Cycle Made Easy", href: "/learn/gait-cycle", description: "PNA Teacher · 11 min", icon: "lesson", keywords: "gait stance swing" },
  { label: "Exercise Dosage (FITT & RPE)", href: "/learn/exercise-dosage", description: "PNA Teacher lesson", icon: "lesson", keywords: "fitt rpe sets reps dosage" },
];

export function visibleWings(atlasPublished: boolean): AcademyWing[] {
  return academyWings.map((wing) => ({
    ...wing,
    places: wing.places.filter((place) => atlasPublished || !place.requiresAtlas),
  }));
}

export function wingForPath(pathname: string): AcademyWing["id"] | null {
  if (!pathname || pathname === "/") return null;
  let best: { id: AcademyWing["id"]; length: number } | null = null;
  for (const wing of academyWings) {
    for (const place of wing.places) {
      const base = place.href.replace(/\/bmi$/, "");
      if ((pathname === base || pathname.startsWith(base + "/")) && (!best || base.length > best.length)) {
        best = { id: wing.id, length: base.length };
      }
    }
  }
  return best?.id ?? null;
}

export type AcademySearchHit = AcademyPlace & { wing: string };

/** Small, forgiving search over the campus map (whole words and prefixes). */
export function searchAcademy(query: string, atlasPublished = true, limit = 8): AcademySearchHit[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1);
  const all: AcademySearchHit[] = [
    ...visibleWings(atlasPublished).flatMap((wing) => wing.places.map((place) => ({ ...place, wing: wing.label }))),
    ...popularLessons.map((place) => ({ ...place, wing: "Lesson" })),
  ];
  if (!words.length) return [];
  return all
    .map((place) => {
      const title = place.label.toLowerCase();
      const haystack = `${title} ${place.description.toLowerCase()} ${place.keywords ?? ""}`;
      let score = 0;
      for (const word of words) {
        if (new RegExp(`\\b${word}`).test(title)) score += 3;
        else if (new RegExp(`\\b${word}`).test(haystack)) score += 1;
        else return { place, score: -1 };
      }
      return { place, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.place);
}
