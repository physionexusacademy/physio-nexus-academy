export type FacultyMember = {
  slug: string;
  name: string;
  role: string;
  credentials?: string;
  summary: string;
  image?: string;
  featured?: boolean;
};

export const facultyMembers: FacultyMember[] = [
  {
    slug: "dr-saleem-zafar-pt",
    name: "Dr. Saleem Zafar PT",
    role: "Director, Workshops & Clinical Training",
    credentials: "Physio Nexus Academy",
    summary:
      "Supports the planning, coordination and delivery of practical workshops and clinical training initiatives at Physio Nexus Academy.",
    featured: true,
  },
];

export const featuredFaculty = facultyMembers.filter((member) => member.featured);
