import type { Metadata } from "next";
import BmiCalculatorPage from "./BmiCalculatorPage";

export const metadata: Metadata = {
  title: "BMI Calculator | Age-Aware BMI Screening Tool",
  description: "Free age-aware BMI calculator from Physio Nexus Academy. Calculate Body Mass Index with clear adult categories, child growth notes and responsible clinical limitations.",
  keywords: [
    "BMI calculator",
    "age aware BMI",
    "BMI screening tool",
    "body mass index calculator",
    "BMI for adults",
    "physiotherapy BMI tool",
    "free BMI calculator Pakistan",
    "Physio Nexus Academy",
  ],
  alternates: { canonical: "https://physionexusacademy.com/health-calculators/bmi" },
  openGraph: {
    title: "BMI Calculator | Age-Aware BMI Screening Tool | Physio Nexus Academy",
    description: "A free BMI screening calculator with responsible, age-aware interpretation guidance for adults and adolescents.",
    url: "https://physionexusacademy.com/health-calculators/bmi",
    siteName: "Physio Nexus Academy",
    type: "website",
    images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA BMI Calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BMI Calculator | Age-Aware Screening Tool",
    description: "Free BMI calculator with clear age-aware guidance and clinical limitations.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: { index: true, follow: true },
};

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PNA Age-Aware BMI Calculator",
  "description": "A free Body Mass Index screening calculator with age-aware interpretation guidance for adults and adolescents, provided by Physio Nexus Academy.",
  "url": "https://physionexusacademy.com/health-calculators/bmi",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "PKR"
  },
  "provider": {
    "@type": "Organization",
    "name": "Physio Nexus Academy",
    "url": "https://physionexusacademy.com"
  }
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BmiCalculatorPage />
    </>
  );
}
