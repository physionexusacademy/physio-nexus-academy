export type CityLocation = {
  slug: string;
  name: string;
  province: string;
  description: string;
  homeVisitNote: string;
};

export const majorCities: CityLocation[] = [
  {
    slug: "karachi",
    name: "Karachi",
    province: "Sindh",
    description:
      "Physio Nexus Academy supports patients and learners in Karachi with physiotherapy home-visit requests, appointment pathways and hands-on clinical workshops.",
    homeVisitNote:
      "Karachi is one of our strongest service areas. Share your area (e.g. Saddar, Clifton, Gulshan, North Nazimabad, DHA) and preferred time so the team can confirm availability.",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    province: "Sindh",
    description:
      "Physio Nexus Academy provides physiotherapy home-visit requests and clinical workshop pathways for patients and professionals in Hyderabad and surrounding areas.",
    homeVisitNote:
      "Hyderabad is an active service area. Submit your locality and preferred slot; confirmation depends on therapist schedule.",
  },
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
    slug: "islamabad",
    name: "Islamabad",
    province: "Islamabad Capital Territory",
    description:
      "Physiotherapy home visit and appointment request pathway for patients in Islamabad. Physio Nexus Academy confirms coverage before any visit is scheduled.",
    homeVisitNote:
      "Islamabad requests are accepted and confirmed according to schedule. Mention your sector or locality when you submit the form or message on WhatsApp.",
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
    slug: "sukkur",
    name: "Sukkur",
    province: "Sindh",
    description:
      "Request physiotherapy home visit service in Sukkur through Physio Nexus Academy.",
    homeVisitNote:
      "Sukkur requests are reviewed for therapist availability. Share your area when you submit the form or WhatsApp message.",
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
