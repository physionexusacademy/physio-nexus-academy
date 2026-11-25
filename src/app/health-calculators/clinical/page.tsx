import type { Metadata } from "next";
import ClinicalCalculators from "./ClinicalCalculators";

const url = "https://physionexusacademy.com/health-calculators/clinical";

export const metadata: Metadata = {
  title: "Clinical Calculators | Heart Rate Zones, One-Rep Max, Waist-Hip Ratio",
  description:
    "Free clinical calculators from Physio Nexus Academy: heart rate training zones, waist-hip ratio, one-rep max, daily energy and an outcome-change check against the minimal important change. Calculated in your browser.",
  keywords: ["heart rate zones calculator", "Karvonen calculator", "one rep max calculator", "waist hip ratio calculator", "minimal important change calculator", "physiotherapy calculators", "Physio Nexus Academy"],
  alternates: { canonical: url },
  openGraph: {
    title: "Clinical Calculators | Physio Nexus Academy",
    description: "Heart rate zones, waist-hip ratio, one-rep max, daily energy and outcome change, worked out in your browser.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA clinical calculators" }],
  },
  robots: { index: true, follow: true },
};

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PNA Clinical Calculators",
  description: "Heart rate zones, waist-hip ratio, one-rep max, daily energy and outcome-change calculators for physiotherapy students and clinicians.",
  url,
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
  provider: { "@type": "Organization", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd).replace(/</g, "\\u003c") }} />
      <ClinicalCalculators />
    </>
  );
}
