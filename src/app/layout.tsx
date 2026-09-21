import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Physio Nexus Academy",
  url: "https://physionexusacademy.com",
  logo: "https://physionexusacademy.com/images/pna-logo.png",
  description:
    "Physio Nexus Academy offers physiotherapy education, workshops, learning resources, research support and professional development.",
  founder: {
    "@type": "Person",
    name: "Dr. Sajjad Raza PT",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://physionexusacademy.com"),
  title: {
    default: "Physio Nexus Academy | Learn • Apply • Transform Lives",
    template: "%s | Physio Nexus Academy",
  },
  description:
    "Physio Nexus Academy provides physiotherapy education, clinical workshops, skills training, CPD professional development and learning resources in Pakistan.",
  openGraph: {
    title: "Physio Nexus Academy",
    description:
      "Physiotherapy education, clinical workshops, skills training, CPD professional development and learning resources in Pakistan.",
    siteName: "Physio Nexus Academy",
    url: "https://physionexusacademy.com",
    locale: "en_PK",
    type: "website",
    images: ["/images/pna-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Physio Nexus Academy",
    description:
      "Physiotherapy education, clinical workshops, skills training, CPD professional development and learning resources in Pakistan.",
    images: ["/images/pna-logo.png"],
  },
  icons: { icon: "/images/pna-logo.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
