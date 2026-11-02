export type CityLocation = {
  slug: string;
  name: string;
  province: string;
  description: string;
  homeVisitNote: string;
};

export const majorCities: CityLocation[] = [
  // ===== Sindh (strong coverage focus) =====
  {
    slug: "karachi",
    name: "Karachi",
    province: "Sindh",
    description:
      "Physio Nexus Academy supports patients and learners in Karachi with physiotherapy home-visit requests, appointment pathways and hands-on clinical workshops.",
    homeVisitNote:
      "Karachi is one of our strongest service areas. Share your area (e.g. Saddar, Clifton, Gulshan, North Nazimabad, DHA, Malir, Korangi) and preferred time so the team can confirm availability.",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    province: "Sindh",
    description:
      "Physio Nexus Academy provides physiotherapy home-visit requests and clinical workshop pathways for patients and professionals in Hyderabad and surrounding areas.",
    homeVisitNote:
      "Hyderabad is an active service area. Submit your locality (e.g. Latifabad, Qasimabad, Hirabad) and preferred slot; confirmation depends on therapist schedule.",
  },
  {
    slug: "sukkur",
    name: "Sukkur",
    province: "Sindh",
    description:
      "Request physiotherapy home visit service in Sukkur through Physio Nexus Academy.",
    homeVisitNote:
      "Sukkur requests are reviewed for therapist availability. Share your area when you submit the form or WhatsApp message.",
  },
  {
    slug: "larkana",
    name: "Larkana",
    province: "Sindh",
    description:
      "Physiotherapy home visit request pathway for patients in Larkana. Physio Nexus Academy confirms coverage before any visit is scheduled.",
    homeVisitNote:
      "Larkana requests are accepted subject to therapist and schedule confirmation. Share your area or locality for faster guidance.",
  },
  {
    slug: "nawabshah",
    name: "Nawabshah",
    province: "Sindh",
    description:
      "Request home physiotherapy in Nawabshah (Shaheed Benazirabad) via Physio Nexus Academy. Availability is confirmed before arranging a visit.",
    homeVisitNote:
      "Nawabshah patients can submit a home visit request with area and preferred time. The team will confirm what is possible.",
  },
  {
    slug: "mirpurkhas",
    name: "Mirpurkhas",
    province: "Sindh",
    description:
      "Physiotherapy home service request option for Mirpurkhas patients through Physio Nexus Academy.",
    homeVisitNote:
      "Mirpurkhas requests are reviewed for schedule and area feasibility. Provide your locality for accurate confirmation.",
  },
  {
    slug: "jacobabad",
    name: "Jacobabad",
    province: "Sindh",
    description:
      "Request physiotherapy home visit service in Jacobabad through Physio Nexus Academy.",
    homeVisitNote:
      "Jacobabad requests are evaluated based on therapist availability. Share your area when requesting.",
  },
  {
    slug: "shikarpur",
    name: "Shikarpur",
    province: "Sindh",
    description:
      "Home physiotherapy request pathway for Shikarpur. Physio Nexus Academy confirms feasibility before arranging visits.",
    homeVisitNote:
      "Shikarpur patients can submit a request with preferred time and area. Confirmation depends on availability.",
  },
  {
    slug: "khairpur",
    name: "Khairpur",
    province: "Sindh",
    description:
      "Physiotherapy home visit request service for Khairpur via Physio Nexus Academy.",
    homeVisitNote:
      "Khairpur requests are confirmed according to coverage and schedule. Provide area details for faster response.",
  },
  {
    slug: "dadu",
    name: "Dadu",
    province: "Sindh",
    description:
      "Request home physiotherapy in Dadu through Physio Nexus Academy. We confirm service availability before arranging a visit.",
    homeVisitNote:
      "Dadu patients can submit a home visit request with area and preferred slot. The team will confirm what is possible.",
  },
  {
    slug: "thatta",
    name: "Thatta",
    province: "Sindh",
    description:
      "Physiotherapy home visit pathway for Thatta. Physio Nexus Academy accepts requests and confirms coverage based on availability.",
    homeVisitNote:
      "Thatta requests are accepted subject to therapist and schedule confirmation. Share your area when requesting.",
  },
  {
    slug: "badin",
    name: "Badin",
    province: "Sindh",
    description:
      "Request physiotherapy home service in Badin via Physio Nexus Academy. Availability is confirmed before any visit.",
    homeVisitNote:
      "Badin requests are evaluated individually. Contact us on WhatsApp or submit the form with your locality.",
  },
  {
    slug: "tando-allahyar",
    name: "Tando Allahyar",
    province: "Sindh",
    description:
      "Physiotherapy home visit request option for Tando Allahyar patients through Physio Nexus Academy.",
    homeVisitNote:
      "Tando Allahyar requests are confirmed according to coverage and schedule. Provide area details for faster response.",
  },
  {
    slug: "tando-adam",
    name: "Tando Adam",
    province: "Sindh",
    description:
      "Home physiotherapy request pathway for Tando Adam. Physio Nexus Academy confirms feasibility before arranging visits.",
    homeVisitNote:
      "Tando Adam patients can submit a request with preferred time and area. Confirmation depends on availability.",
  },
  {
    slug: "sanghar",
    name: "Sanghar",
    province: "Sindh",
    description:
      "Request physiotherapy home visit service in Sanghar through Physio Nexus Academy.",
    homeVisitNote:
      "Sanghar requests are reviewed for therapist availability. Share your area when you submit the form or WhatsApp message.",
  },
  {
    slug: "ghotki",
    name: "Ghotki",
    province: "Sindh",
    description:
      "Physiotherapy home service request option for Ghotki patients via Physio Nexus Academy.",
    homeVisitNote:
      "Ghotki requests are confirmed subject to schedule. Provide locality details for accurate guidance.",
  },
  {
    slug: "umerkot",
    name: "Umerkot",
    province: "Sindh",
    description:
      "Home physiotherapy request pathway for Umerkot through Physio Nexus Academy.",
    homeVisitNote:
      "Umerkot patients can request a visit; the team confirms what is possible based on coverage.",
  },
  {
    slug: "naushahro-feroze",
    name: "Naushahro Feroze",
    province: "Sindh",
    description:
      "Physiotherapy home visit request service for Naushahro Feroze. Physio Nexus Academy confirms availability before scheduling.",
    homeVisitNote:
      "Naushahro Feroze requests are accepted and confirmed according to therapist schedule and area feasibility.",
  },
  {
    slug: "kashmore",
    name: "Kashmore",
    province: "Sindh",
    description:
      "Request home physiotherapy in Kashmore through Physio Nexus Academy.",
    homeVisitNote:
      "Kashmore requests are evaluated based on therapist availability. Share your area for guidance.",
  },
  {
    slug: "jamshoro",
    name: "Jamshoro",
    province: "Sindh",
    description:
      "Physiotherapy home visit pathway for Jamshoro and surrounding areas via Physio Nexus Academy.",
    homeVisitNote:
      "Jamshoro requests are accepted subject to schedule confirmation. Provide your locality when requesting.",
  },
  {
    slug: "matiari",
    name: "Matiari",
    province: "Sindh",
    description:
      "Home physiotherapy request option for Matiari patients through Physio Nexus Academy.",
    homeVisitNote:
      "Matiari requests are reviewed for coverage and schedule. Contact us on WhatsApp or use the home visit form.",
  },
  {
    slug: "tando-muhammad-khan",
    name: "Tando Muhammad Khan",
    province: "Sindh",
    description:
      "Request physiotherapy home visit service in Tando Muhammad Khan via Physio Nexus Academy.",
    homeVisitNote:
      "Tando Muhammad Khan patients can submit a request; confirmation depends on therapist availability.",
  },

  // ===== Punjab =====
  {
    slug: "lahore",
    name: "Lahore",
    province: "Punjab",
    description:
      "Request physiotherapy home visit service in Lahore through Physio Nexus Academy. Submit your area and preferred time for availability confirmation.",
    homeVisitNote:
      "Lahore requests are evaluated based on therapist availability. Share your area (e.g. DHA, Johar Town, Model Town, Gulberg) for faster guidance.",
  },
  {
    slug: "rawalpindi",
    name: "Rawalpindi",
    province: "Punjab",
    description:
      "Book or request physiotherapy home service in Rawalpindi via Physio Nexus Academy. Availability is confirmed before the visit.",
    homeVisitNote:
      "Rawalpindi patients can request home physiotherapy by sharing area and preferred time. Confirmation depends on therapist coverage.",
  },
  {
    slug: "faisalabad",
    name: "Faisalabad",
    province: "Punjab",
    description:
      "Physiotherapy home visit request service for Faisalabad. Submit details through the form or contact Physio Nexus Academy on WhatsApp.",
    homeVisitNote:
      "Faisalabad requests are reviewed for schedule and area feasibility. Provide your locality for accurate confirmation.",
  },
  {
    slug: "multan",
    name: "Multan",
    province: "Punjab",
    description:
      "Request home physiotherapy in Multan through Physio Nexus Academy. We confirm service availability before arranging a visit.",
    homeVisitNote:
      "Multan patients can submit a home visit request with area and preferred slot. The team will confirm what is possible.",
  },
  {
    slug: "sialkot",
    name: "Sialkot",
    province: "Punjab",
    description:
      "Physiotherapy home visit request option for Sialkot patients through Physio Nexus Academy.",
    homeVisitNote:
      "Sialkot requests are confirmed according to coverage and schedule. Provide area details for faster response.",
  },
  {
    slug: "gujranwala",
    name: "Gujranwala",
    province: "Punjab",
    description:
      "Home physiotherapy request pathway for Gujranwala. Physio Nexus Academy confirms feasibility before arranging visits.",
    homeVisitNote:
      "Gujranwala patients can submit a request with preferred time and area. Confirmation depends on availability.",
  },
  {
    slug: "bahawalpur",
    name: "Bahawalpur",
    province: "Punjab",
    description:
      "Physiotherapy home service request option for Bahawalpur patients via Physio Nexus Academy.",
    homeVisitNote:
      "Bahawalpur requests are confirmed subject to schedule. Provide locality details for accurate guidance.",
  },
  {
    slug: "sargodha",
    name: "Sargodha",
    province: "Punjab",
    description:
      "Home physiotherapy request pathway for Sargodha through Physio Nexus Academy.",
    homeVisitNote:
      "Sargodha patients can request a visit; the team confirms what is possible based on coverage.",
  },

  // ===== Other major cities =====
  {
    slug: "islamabad",
    name: "Islamabad",
    province: "Islamabad Capital Territory",
    description:
      "Physiotherapy home visit and appointment request pathway for patients in Islamabad. Physio Nexus Academy confirms coverage before any visit is scheduled.",
    homeVisitNote:
      "Islamabad requests are accepted and confirmed according to schedule. Mention your sector or locality when you submit the form or message on WhatsApp.",
  },
  {
    slug: "peshawar",
    name: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    description:
      "Physiotherapy home visit pathway for Peshawar. Physio Nexus Academy accepts requests and confirms coverage based on availability.",
    homeVisitNote:
      "Peshawar requests are accepted subject to therapist and schedule confirmation. Share your area when requesting.",
  },
  {
    slug: "quetta",
    name: "Quetta",
    province: "Balochistan",
    description:
      "Request physiotherapy home service in Quetta via Physio Nexus Academy. Availability is confirmed before any visit.",
    homeVisitNote:
      "Quetta requests are evaluated individually. Contact us on WhatsApp or submit the form with your locality.",
  },
  {
    slug: "abbottabad",
    name: "Abbottabad",
    province: "Khyber Pakhtunkhwa",
    description:
      "Physiotherapy home visit request service for Abbottabad. Physio Nexus Academy confirms availability before scheduling.",
    homeVisitNote:
      "Abbottabad requests are accepted and confirmed according to therapist schedule and area feasibility.",
  },
];

export function getCityBySlug(slug: string): CityLocation | undefined {
  return majorCities.find((city) => city.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return majorCities.map((city) => city.slug);
}
