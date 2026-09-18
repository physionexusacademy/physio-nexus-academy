/**
 * Central, typed source of editable site content.
 *
 * This file is a stand-in for what will later live in Supabase
 * (`site_settings`, `editable_page_sections`, founder profile & credential
 * tables — see /supabase/schema.sql). Keeping it in one typed object now
 * means every page already reads content instead of hard-coding strings,
 * so wiring the Admin Dashboard later is a data-source swap, not a rewrite.
 *
 * PLACEHOLDER values are marked explicitly. Do not present them as verified
 * facts — replace before public launch per README "Before Launch" checklist.
 */

export const siteConfig = {
  academyName: "Physio Nexus Academy",
  shortName: "PNA",
  tagline: "LEARN • APPLY • TRANSFORM LIVES",
  established: 2026,
  operatingModel:
    "Primarily online, with physical physiotherapy workshops conducted in different cities.",
  brandPersonality:
    "Credible, modern, scientific, educational, clinically professional, welcoming, practical and growth-oriented.",

  // PLACEHOLDER — replace with verified details before launch
  contact: {
    phoneDisplay: "0348 900 9028",
    phoneRaw: "923489009028", // international format, used to build the WhatsApp link
    email: "PLACEHOLDER — add verified academy email",
    address: "PLACEHOLDER — add verified public address (optional)",
    hours: "PLACEHOLDER — add operating hours",
    social: {
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
  },

  founder: {
    name: "Dr. Sajjad Raza PT",
    credentialsShort: "DPT, MPhil Physical Therapy Scholar, AHPC Licensed Physiotherapist",
    role: "Founder and Main Instructor, Physio Nexus Academy",
    academicFocus:
      "Physical Therapy with an MSK / musculoskeletal emphasis at postgraduate level.",
    photo: "/images/founder-dr-sajjad.jpg",
    message: {
      heading: "A message from our founder",
      body: [
        "Welcome to Physio Nexus Academy. Our aim is to make physiotherapy learning more practical, understandable and connected to real clinical needs.",
        "Whether you are a student developing your skills, a professional looking to grow, or a patient seeking guidance, we want you to find clear support and a professional experience here.",
        "At Physio Nexus Academy, learning, application and patient care remain our priorities.",
      ],
    },
  },

  // Every entry editable from the Admin Dashboard once built. Optional
  // fields (issuer, year, certificateImage, verificationUrl) intentionally
  // left blank — no dates, numbers or awarding bodies have been supplied.
  qualifications: [
    { title: "Doctor of Physical Therapy (DPT)" },
    { title: "MPhil Physical Therapy Scholar" },
    { title: "AHPC Licensed Physiotherapist" },
    {
      title:
        "International Diploma / Training in Osteopathic Positional Release / Strain Counterstrain Technique (OMT)",
    },
    { title: "International Diploma / Training in Medical Acupuncture (OMT)" },
    { title: "International Diploma / Training in Dry Needling (OMT)" },
    { title: "International Dry Needling Training / Certification" },
    { title: "Manual Therapy Training (Primephysio)" },
    { title: "Kinesio Taping Mastery / Certification" },
    { title: "Diploma / Training in Hijama Therapy" },
    { title: "Diploma / Training in Cognitive Behaviour Therapy (CBT)" },
    { title: "Diploma / Training in Speech Therapy" },
    { title: "Diploma / Training in Alternative Medicine" },
  ] as Array<{
    title: string;
    issuer?: string;
    year?: string;
    certificateImage?: string;
    verificationUrl?: string;
  }>,

  mission: {
    purpose:
      "Provide physiotherapy students and professionals with practical skills, workshops, academic learning resources, research guidance and career-development support, while also giving patients an accessible way to request physiotherapy appointments and guidance.",
    vision:
      "To become a trusted, accessible and practice-focused physiotherapy learning platform that connects scientific knowledge with real clinical skills and professional growth.",
    mission:
      "To deliver structured workshops, practical education, evidence-informed learning resources, research support and career guidance while maintaining a patient-centered physiotherapy service pathway.",
  },

  whatWeOffer: [
    {
      title: "Clinical Skill Workshops",
      description:
        "Hands-on physiotherapy workshops designed to connect theory with practical clinical application.",
      href: "/workshops",
    },
    {
      title: "Learning Resources",
      description:
        "Easy-to-use books, review notes, PDFs and educational material for physiotherapy learners.",
      href: "/resources",
    },
    {
      title: "Research Support",
      description:
        "Ethical academic guidance for topic development, literature understanding, methodology and research skills.",
      href: "/research",
    },
    {
      title: "Career Development",
      description:
        "Professional learning support, practical exposure and guidance for physiotherapy students and graduates.",
      href: "/founder",
    },
    {
      title: "Patient Appointments",
      description:
        "A clear pathway for patients to request physiotherapy consultation and appointment support.",
      href: "/appointment",
    },
    {
      title: "Home Visit Requests",
      description:
        "A dedicated request system for eligible physiotherapy home visits where the service is available.",
      href: "/home-visit",
    },
  ],

  trustStrip: [
    "Practical Learning",
    "Evidence-Informed Resources",
    "Professional Workshops",
    "Patient Support",
  ],

  medicalDisclaimer:
    "Information on this website is for general educational and appointment-request purposes and does not replace an individual clinical assessment or emergency medical care. If you have severe, sudden or emergency symptoms, contact an appropriate emergency medical service. Final treatment decisions are made after appropriate professional assessment.",

  legalNotice:
    "This is an initial template and should be reviewed by a qualified professional before public launch.",
};

export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${siteConfig.contact.phoneRaw}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "About PNA", href: "/about" },
  { label: "Founder", href: "/founder" },
  { label: "Workshops", href: "/workshops" },
  { label: "Courses", href: "/courses" },
  { label: "Books & Resources", href: "/resources" },
  { label: "Research Support", href: "/research" },
  { label: "Patient Services", href: "/patient-services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Updates", href: "/updates" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = {
  academy: [
    { label: "About PNA", href: "/about" },
    { label: "Founder", href: "/founder" },
    { label: "Gallery", href: "/gallery" },
    { label: "Updates", href: "/updates" },
  ],
  students: [
    { label: "Workshops", href: "/workshops" },
    { label: "Courses / Learning", href: "/courses" },
    { label: "Books & Resources", href: "/resources" },
    { label: "Research Support", href: "/research" },
  ],
  patients: [
    { label: "Patient Services", href: "/patient-services" },
    { label: "Book Appointment", href: "/appointment" },
    { label: "Request Home Visit", href: "/home-visit" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Use", href: "/legal/terms" },
    { label: "Refund / Cancellation Policy", href: "/legal/refund" },
    { label: "Medical Disclaimer", href: "/legal/disclaimer" },
  ],
};
