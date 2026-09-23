export type TrainingCategory =
  | "Workshop"
  | "Internship Program"
  | "Clinical Camp";

export type TrainingHistoryItem = {
  slug: string;
  title: string;
  category: TrainingCategory;
  date?: string;
  displayDate: string;
  time?: string;
  city: string;
  venue?: string;
  address?: string;
  role?: string;
  summary: string;
  topics: string[];
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  details?: Array<{ label: string; value: string }>;
  sortOrder: number;
};

export const trainingHistory: TrainingHistoryItem[] = [
  {
    slug: "advanced-myofascial-therapy-mastery-shahdadpur-2026",
    title: "Advanced Myofascial Therapy Mastery",
    category: "Workshop",
    date: "2026-08-30",
    displayDate: "30 August 2026",
    time: "10:00 AM – 2:00 PM",
    city: "Shahdadpur, Sindh",
    venue: "Revive Physiotherapy Center",
    address: "Near Sindh Bank, Shahdadpur",
    role: "Instructor — Dr. Sajjad Raza PT",
    summary:
      "An advanced hands-on workshop covering myofascial release, dry needling, electro-acupuncture and cupping therapy.",
    topics: [
      "Myofascial Release",
      "Dry Needling",
      "Electro-Acupuncture",
      "Cupping Therapy",
    ],
    image: "/images/training/advanced-myofascial-shahdadpur.webp",
    imageAlt:
      "Advanced Myofascial Therapy Mastery workshop poster featuring Dr. Sajjad Raza PT in Shahdadpur",
    imageWidth: 220,
    imageHeight: 330,
    details: [
      { label: "Historical workshop fee", value: "Rs. 2,500" },
      { label: "Certificate", value: "Physical certificate for participants" },
    ],
    sortOrder: 20260830,
  },
  {
    slug: "cupping-therapy-workshop-hyderabad-2025",
    title: "Cupping Therapy — One Day Hands-On Workshop",
    category: "Workshop",
    date: "2025-08-24",
    displayDate: "24 August 2025",
    city: "Hyderabad",
    venue: "Chamber 5, Hayat Doctor's Clinic",
    address: "Near Rajputana Hospital, Hyderabad",
    role: "Trainer — Dr. Sajjad Raza",
    summary:
      "A one-day practical cupping therapy workshop presented as part of Dr. Sajjad Raza's clinical training portfolio.",
    topics: [
      "Cupping Therapy",
      "Safety Precautions",
      "Hands-On Clinical Techniques",
    ],
    image: "/images/training/cupping-therapy-hyderabad-2025.webp",
    imageAlt:
      "Cupping Therapy one day hands-on workshop poster with trainer Dr. Sajjad Raza in Hyderabad",
    imageWidth: 220,
    imageHeight: 293,
    details: [
      { label: "Historical charges", value: "Rs. 1,000; group discount was advertised" },
    ],
    sortOrder: 20250824,
  },
  {
    slug: "two-month-physiotherapy-internship-hyderabad-2025",
    title: "2-Month Physiotherapy Internship Program",
    category: "Internship Program",
    date: "2025-08-10",
    displayDate: "Started 10 August 2025",
    city: "Hyderabad",
    venue: "Chamber 5, Hayat Doctor's Clinic",
    address: "Near Rajputana Hospital, Hyderabad",
    role: "Trainer — Dr. Sajjad Raza",
    summary:
      "A two-month hands-on physiotherapy internship program focused on practical clinical skills, diagnosis and treatment techniques.",
    topics: [
      "Chiropractic",
      "Dry Needling",
      "Cupping Therapy",
      "Kinesio Taping",
      "Joint Adjustment by Manipulation",
      "Diagnosis and Treatment Skills",
      "Professional Handling",
    ],
    image: "/images/training/two-month-internship-hyderabad-2025.webp",
    imageAlt:
      "Two month physiotherapy internship program poster with trainer Dr. Sajjad Raza in Hyderabad",
    imageWidth: 220,
    imageHeight: 275,
    details: [
      { label: "Duration", value: "2 months" },
      { label: "Program benefit", value: "Intern certificate and hands-on clinical techniques" },
    ],
    sortOrder: 20250810,
  },
  {
    slug: "sciatica-hands-on-workshop-hyderabad-2025",
    title: "Sciatica Free Hands-On Workshop",
    category: "Workshop",
    date: "2025-07-13",
    displayDate: "13 July 2025",
    time: "5:00 PM",
    city: "Hyderabad",
    venue: "Chamber 5, Hayat Doctor's Clinic",
    address: "Near Rajputana Hospital, Hyderabad",
    role: "Trainer — Dr. Sajjad Raza",
    summary:
      "A practical workshop focused on identifying true sciatica, differentiating possible causes and discussing treatment approaches.",
    topics: [
      "Diagnosis of True Sciatica",
      "Disc-Related vs Piriformis-Related Sciatica",
      "Research-Based Treatment Approaches",
      "Common Treatment Mistakes",
    ],
    image: "/images/training/sciatica-workshop-hyderabad-2025.webp",
    imageAlt:
      "Sciatica free hands-on workshop poster with trainer Dr. Sajjad Raza in Hyderabad",
    imageWidth: 220,
    imageHeight: 293,
    sortOrder: 20250713,
  },
  {
    slug: "free-physiotherapy-camp-hyderabad-2025",
    title: "One Day Free Physiotherapy Camp",
    category: "Clinical Camp",
    date: "2025-06-15",
    displayDate: "15 June 2025",
    time: "3:00 PM – 8:00 PM",
    city: "Hyderabad",
    venue: "Chamber 5, Hayat Doctor's Clinic",
    address: "Near Rajputana Hospital, Hyderabad",
    summary:
      "A one-day free physiotherapy camp delivered in collaboration with Hayat Doctor's Clinic, Hyderabad.",
    topics: [
      "Lower Back Pain",
      "Frozen Shoulder",
      "Osteoarthritis",
      "Neck Pain",
      "Rheumatoid Arthritis",
      "Cerebral Palsy",
      "Down Syndrome",
      "Rotator Cuff Injury",
    ],
    image: "/images/training/free-physiotherapy-camp-hyderabad-2025.webp",
    imageAlt:
      "One day free physiotherapy camp poster in Hyderabad",
    imageWidth: 220,
    imageHeight: 275,
    details: [
      { label: "Collaboration", value: "Hayat Doctor's Clinic" },
    ],
    sortOrder: 20250615,
  },
  {
    slug: "one-month-physiotherapy-internship-hyderabad",
    title: "1-Month Physiotherapy Internship Program",
    category: "Internship Program",
    displayDate: "Past program",
    city: "Hyderabad",
    role: "Clinical training program",
    summary:
      "A one-month practical physiotherapy internship program emphasizing hands-on skills and clinical mentorship.",
    topics: [
      "Kinesio Taping",
      "Dry Needling",
      "Cupping Therapy",
      "Diagnosis and Differentiation",
      "Use of Modalities",
      "Advanced Physiotherapy Techniques",
    ],
    image: "/images/training/one-month-internship-hyderabad.webp",
    imageAlt:
      "One month physiotherapy internship program poster in Hyderabad",
    imageWidth: 220,
    imageHeight: 220,
    details: [{ label: "Duration", value: "1 month" }],
    sortOrder: 20250000,
  },
].sort((a, b) => b.sortOrder - a.sortOrder);

export const trainingCategories: TrainingCategory[] = [
  "Workshop",
  "Internship Program",
  "Clinical Camp",
];

export function getTrainingItem(slug: string) {
  return trainingHistory.find((item) => item.slug === slug);
}
