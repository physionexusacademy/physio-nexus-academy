import type { Metadata } from "next";
import { Box } from "lucide-react";
import { Ur } from "@/components/Ur";
import ScanLoader from "./ScanLoader";
import "../posture.css";
import "./scan.css";

const url = "https://physionexusacademy.com/health-calculators/posture/scan";

export const metadata: Metadata = {
  title: "Full Posture Scan | Front, Side, Back and Forward Bend With Your Phone | PNA",
  description:
    "A free four-view posture scan from Physio Nexus Academy: front, side, back and forward bend with your phone, shown on an illustrative 3D skeleton. Every number has its margin of error. Read on your own device; nothing is uploaded.",
  keywords: ["posture scan", "3D posture", "posture assessment app", "forward head posture", "shoulder level", "physiotherapy posture screen", "Physio Nexus Academy"],
  alternates: { canonical: url },
  openGraph: { title: "Full Posture Scan | Physio Nexus Academy", description: "Four phone views turned into angles and an illustrative 3D skeleton, with every number shown with its margin of error. Nothing leaves your device.", url, siteName: "Physio Nexus Academy", type: "website", images: [{ url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg", width: 1200, height: 630, alt: "PNA full posture scan" }] },
  robots: { index: true, follow: true },
};

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PNA Full Posture Scan",
  description: "A free four-view posture screen read from a phone camera on the user's own device, with an illustrative 3D skeleton, for students and the public. A screening aid, not a diagnosis.",
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
          <p className="ps-eyebrow"><Box aria-hidden="true" /> <Ur en="Full posture scan" ur="Mukammal posture scan" /></p>
          <h1><Ur en="Scan your posture from four sides with your phone" ur="Apne phone se apni posture chaar taraf se scan karein" /></h1>
          <p><Ur en="Front, side, back and a forward bend. Your numbers appear on an illustrative 3D skeleton, each with its margin of error. It is a screen for learning and awareness, not a diagnosis: the skeleton is an illustration and the tool cannot see your spine. Nothing is uploaded." ur="Saamne, side, peeche aur aage jhukna. Aap ke numbers tasveeri 3D skeleton par dikhte hain, har ek ghalti ki hadd ke saath. Yeh seekhne aur aagahi ke liye screen hai, tashkhees nahi: skeleton tasveeri misaal hai aur tool aap ki reedh nahi dekh sakta. Kuch upload nahi hota." /></p>
        </header>
        <ScanLoader />
      </div>
    </>
  );
}
