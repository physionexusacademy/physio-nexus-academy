import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { Ur } from "@/components/Ur";
import PostureLoader from "./PostureLoader";
import "./posture.css";

const url = "https://physionexusacademy.com/health-calculators/posture";

export const metadata: Metadata = {
  title: "Posture Screen | Free Posture Check With Your Phone",
  description:
    "Free posture screen with your phone: head position, trunk lean, shoulder, hip and knee alignment, each with its margin of error. Nothing leaves your device.",
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
      <div className="ps-page">
        <header className="ps-hero">
          <p className="ps-eyebrow"><ScanLine aria-hidden="true" /> <Ur en="Posture screen" ur="Posture screen" /></p>
          <h1><Ur en="Check your posture with your phone" ur="Apne phone se apni posture check karein" /></h1>
          <p><Ur en="A free screen for students and the public. It reads your posture from one phone picture, on your own device, and shows every number with its margin of error. Nothing is recorded, uploaded or saved." ur="Students aur awam ke liye free screen. Yeh aap ke apne device par ek phone ki tasveer se posture parhta hai, aur har number ghalti ki hadd ke saath dikhata hai. Kuch record, upload ya save nahi hota." /></p>
        </header>
        <p className="ps-scanlink"><Link href="/health-calculators/posture/scan"><Ur en="Want all four sides on a 3D skeleton? Try the full posture scan." ur="Chaaron taraf ka 3D skeleton par dekhna hai? Mukammal posture scan try karein." /></Link></p>
        <PostureLoader />
      </div>
    </>
  );
}
