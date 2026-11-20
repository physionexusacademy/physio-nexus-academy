/**
 * Roman Urdu (a natural English + Urdu mix, the way the academy speaks) for the shared shell: the wings and places of the campus map, which
 * the header menus, the mobile drawer, the footer and the search all show. `validate-language` fails when a wing or a place has no entry.
 * Names of features (PNA Teacher, Skills Lab, RehabVerse …) stay as they are; the explanation next to them is in Roman Urdu.
 */
import type { AcademyPlace, AcademyWing } from "./academy-map.ts";
import type { Lang } from "./lang.ts";

export const WING_UR: Record<AcademyWing["id"], { label: string; tagline: string; intro: string }> = {
  learn: {
    label: "Seekhein",
    tagline: "Gehrai se samjhein",
    intro: "Step-by-step lessons, clinical guides aur reference libraries — aasaan zubaan mein, English ya Roman Urdu mein.",
  },
  practise: {
    label: "Practice",
    tagline: "Apna clinical dimagh train karein",
    intro: "Daily sawal, patient cases aur spaced review — taake knowledge confident decisions mein badal jaye.",
  },
  clinic: {
    label: "Clinic",
    tagline: "Mareezon ki dekh-bhaal",
    intro: "Physiotherapy appointments, home visits aur apni condition samajhne ke liye aasaan rehnumai.",
  },
  academy: {
    label: "Academy",
    tagline: "PNA ke saath aage barhein",
    intro: "Hands-on CPD workshops, research support aur Physio Nexus Academy ke peeche kaam karne wale log.",
  },
};

/** By address. `label` only where the name itself is better in Roman Urdu; the description is always translated. */
export const PLACE_UR: Record<string, { label?: string; description: string }> = {
  "/learn": { description: "Mushkil concepts, step by step, checks ke saath" },
  "/manual-therapy": { description: "35 techniques: haath, dosage, safety" },
  "/conditions": { description: "48 conditions, 3 levels, stage-wise rehab plans" },
  "/msk-special-tests": { description: "Kaise karein aur result kaise parhein" },
  "/clinical-visual-atlas": { description: "Anatomy aur pathology ke visuals" },
  "/resources": { label: "Books aur Resources", description: "Books, PDFs aur study material" },
  "/skills": { description: "MMT, goniometry, neuro exam aur bohat kuch — beginner se expert tak" },
  "/virtual-patient": { description: "3D patient ko examine karein, diagnose karein, OSCE score payein" },
  "/daily-challenge": { description: "5 timed sawal + leaderboard" },
  "/leagues": { description: "XP kamayein, Bronze se Diamond tak saat tiers chadhein" },
  "/learn/review": { description: "Har lesson ke liye spaced repetition" },
  "/stupid-intern-diaries": { description: "Mazahiya ghaltiyan, sanjeeda sabaq" },
  "/rehabverse": { description: "Guided 3D rehab: approved programme, rozana feedback, virtual physio guide" },
  "/patient-services": { description: "Hum kis ka ilaaj karte hain aur kaise" },
  "/appointment": { label: "Appointment book karein", description: "Consultation ki request karein" },
  "/home-visit": { label: "Ghar par visit", description: "Aap ke ghar par physiotherapy" },
  "/symptom-checker": { description: "Patterns aur red flags screen karein" },
  "/health-calculators/bmi": { description: "Umar ke mutabiq notes ke saath fori BMI" },
  "/locations/karachi": { description: "Home visits aur workshops" },
  "/locations/hyderabad": { description: "Home visits aur workshops" },
  "/workshops": { description: "Aane wali hands-on training" },
  "/training": { description: "Guzishta workshops aur internships" },
  "/research": { description: "Methods, writing aur evidence" },
  "/faculty": { description: "Hamare clinical educators se milein" },
  "/founder": { description: "Dr. Sajjad Raza PT" },
  "/about": { label: "PNA ke baare mein", description: "Mission aur approach" },
  "/verify": { label: "Certificate verify karein", description: "PNA certificate check karein" },
  "/reviews": { description: "Apne PNA experience ko rate karein" },
  "/faq": { description: "Aam sawalon ke jawab" },
  "/contact": { label: "Rabta karein", description: "WhatsApp, email aur address" },
};

/** The shell's own words (header, drawer, bottom bar, footer), keyed by where they are used. English is the key's value in `en`. */
export const SHELL_TEXT = {
  searchAcademy: { en: "Search academy", ur: "Academy mein dhoondein" },
  searchAria: { en: "Search the academy (Ctrl K)", ur: "Academy mein dhoondein (Ctrl K)" },
  searchDrawer: { en: "Search lessons, cases, services…", ur: "Lessons, cases, services dhoondein…" },
  studentPass: { en: "Student pass", ur: "Student pass" },
  openMenu: { en: "Open menu", ur: "Menu kholein" },
  closeMenu: { en: "Close menu", ur: "Menu band karein" },
  wingSuffix: { en: "wing", ur: "hissa" },
  bookAppointment: { en: "Book Appointment", ur: "Appointment book karein" },
  requestHomeVisit: { en: "Request Home Visit", ur: "Ghar par visit mangwayein" },
  dockLearn: { en: "Learn", ur: "Seekhein" },
  dockCare: { en: "Care", ur: "Ilaaj" },
  footerTagline: { en: "Learn · Apply · Transform lives", ur: "Seekhein · Apply karein · Zindagiyan badlein" },
  footerAbout: {
    en: "Pakistan's online physiotherapy academy — step-by-step lessons, clinical practice, hands-on CPD workshops and patient care, built to help students, professionals and patients grow with confidence.",
    ur: "Pakistan ki online physiotherapy academy — step-by-step lessons, clinical practice, hands-on CPD workshops aur patient care, jo students, professionals aur patients ko confidence ke saath aage barhne mein madad karte hain.",
  },
  googleReview: { en: "Leave an honest Google review", ur: "Google par apni honest review dein" },
  verifyProvider: { en: "Verify provider", ur: "Provider verify karein" },
  verifyCertificate: { en: "Verify PNA certificate", ur: "PNA certificate verify karein" },
  rights: { en: "All rights reserved.", ur: "Tamam huqooq mehfooz hain." },
  backToTop: { en: "Back to top", ur: "Upar jayein" },
  languageName: { en: "Language", ur: "Zubaan" },
} as const;

export type ShellKey = keyof typeof SHELL_TEXT;
export const shellText = (key: ShellKey, lang: Lang) => SHELL_TEXT[key][lang];

export function localizeWing<T extends AcademyWing>(wing: T, lang: Lang): T {
  if (lang !== "ur") return wing;
  const ur = WING_UR[wing.id];
  return { ...wing, label: ur.label, tagline: ur.tagline, intro: ur.intro, places: wing.places.map((place) => localizePlace(place, lang)) };
}

export function localizePlace<T extends AcademyPlace>(place: T, lang: Lang): T {
  if (lang !== "ur") return place;
  const ur = PLACE_UR[place.href];
  return ur ? { ...place, label: ur.label ?? place.label, description: ur.description } : place;
}
