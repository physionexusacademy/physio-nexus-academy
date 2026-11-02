export type FacultyEducation = {
  title: string;
  institution?: string;
  period?: string;
};

export type FacultyExperience = {
  role: string;
  institution: string;
  location?: string;
  details: string[];
};

export type FacultyMember = {
  slug: string;
  name: string;
  academyRole: string;
  professionalTitle: string;
  summary: string;
  bio: string;
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  education: FacultyEducation[];
  experience: FacultyExperience[];
  certifications: string[];
  activities: string[];
  research: string[];
  contact?: {
    phoneDisplay?: string;
    phoneRaw?: string;
    location?: string;
    instagram?: string;
    linkedinLabel?: string;
    facebookLabel?: string;
  };
  featured?: boolean;
};

export const facultyMembers: FacultyMember[] = [
  {
    slug: "dr-saleem-zafar-pt",
    name: "Dr. Saleem Zafar PT",
    academyRole: "Director, Workshops & Clinical Training",
    professionalTitle:
      "Doctor of Physical Therapy (DPT) | Physiotherapist | Manual Therapy & Rehabilitation Specialist",
    summary:
      "Doctor of Physical Therapy and practicing physiotherapist with clinical experience in musculoskeletal, neurological and rehabilitation care.",
    bio:
      "Dr. Saleem Zafar PT is a Doctor of Physical Therapy (DPT) and practicing physiotherapist with clinical experience in musculoskeletal, neurological and rehabilitation care. He has completed professional certifications in orthopedic manual therapy, manual therapy, dry needling, K-Taping, cupping therapy and other rehabilitation techniques. At Physio Nexus Academy, he serves as Director, Workshops & Clinical Training.",
    image: {
      src: "/images/faculty/dr-saleem-zafar-pt.webp",
      width: 520,
      height: 570,
      alt: "Dr. Saleem Zafar PT, Director of Workshops and Clinical Training at Physio Nexus Academy",
    },
    education: [
      {
        title: "Doctor of Physical Therapy (DPT)",
        institution: "Isra University, Hyderabad",
        period: "2021–2025",
      },
      {
        title: "Diploma in Radiology — MRI, X-Ray & CT Scan",
        period: "April 2023 – 31 July 2023",
      },
      {
        title: "Diploma in Information Technology (DIT)",
        period: "January 2020 – December 2020",
      },
    ],
    experience: [
      {
        role: "Physiotherapist / House Officer (DPT)",
        institution: "Jinnah Postgraduate Medical Centre (JPMC), Karachi",
        details: [
          "Patient assessment, rehabilitation and physiotherapy management.",
          "Musculoskeletal rehabilitation.",
          "Neurological rehabilitation.",
        ],
      },
    ],
    certifications: [
      "Orthopedic Manual Therapy Certification (OMTC)",
      "International Certified Manual Therapy & Dry Needling (CMT)",
      "Advanced K-Taping Professional",
      "Cupping Therapy Certification",
      "Manual Muscle Therapy & Dry Needling",
      "Additional national & international clinical workshops",
    ],
    activities: [
      "Physiotherapy clinical training",
      "Workshops and hands-on training",
      "Clinical education",
      "Research and academic activities",
      "Physiotherapy awareness and rehabilitation education",
    ],
    research: [
      "Effect of Deep Neck Flexor Activation on Upper Trapezius Muscle in Individuals with Forward Head Posture",
    ],
    contact: {
      phoneDisplay: "0301 0339158",
      phoneRaw: "923010339158",
      location: "Karachi, Sindh, Pakistan",
      instagram: "dr.saleemzafarpt",
      linkedinLabel: "Dr. Saleem Zafar PT",
      facebookLabel: "Dr. Saleem Zafar PT",
    },
    featured: true,
  },
];

export const featuredFaculty = facultyMembers.filter((member) => member.featured);

export const getFacultyMember = (slug: string) =>
  facultyMembers.find((member) => member.slug === slug);
