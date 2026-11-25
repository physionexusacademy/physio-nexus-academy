import type { Metadata } from "next";
import PostureScreen from "./PostureScreen";

const url = "https://physionexusacademy.com/health-calculators/posture";

export const metadata: Metadata = {
  title: "Posture Screen | Free Posture Check With Your Phone | PNA",
  description:
    "A free posture screen from Physio Nexus Academy: stand in front of your phone and see head position, trunk lean, shoulder and hip level and knee alignment, each with its margin of error. Read on your own device; nothing is stored.",
  keywords: ["posture check", "posture assessment app", "forward head posture", "shoulder level", "physiotherapy posture screen", "Physio Nexus Academy"],
  alternates: { canonical: url },
  openGraph: { title: "Posture Screen | Physio Nexus Academy", description: "Check your posture with your phone, with every number shown with its margin of error. Nothing leaves your device.", url, siteName: "Physio Nexus Academy", type: "website", images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA posture screen" }] },
  robots: { index: true, follow: true },
};

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PNA Posture Screen",
  description: "A free posture screen read from a phone camera on the user's own device, for students and the public. A screening aid, not a diagnosis.",
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
      <PostureScreen />
    </>
  );
}
