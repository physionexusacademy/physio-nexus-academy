import type { Metadata } from "next";
import BmiCalculatorPage from "./BmiCalculatorPage";

export const metadata: Metadata = {
  title: "BMI Calculator | Age-Aware BMI Screening Tool",
  description: "Calculate BMI with clear age-aware guidance from Physio Nexus Academy. Understand adult BMI categories, child growth references and the limitations of BMI screening.",
  alternates: { canonical: "https://physionexusacademy.com/health-calculators/bmi" },
  openGraph: {
    title: "BMI Calculator | Physio Nexus Academy",
    description: "A free BMI screening calculator with responsible, age-aware interpretation guidance.",
    url: "https://physionexusacademy.com/health-calculators/bmi",
    siteName: "Physio Nexus Academy",
    type: "website",
  },
};

export default function Page() {
  return <BmiCalculatorPage />;
}
