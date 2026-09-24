import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { InstallApp } from "@/components/InstallApp";
import { siteConfig } from "@/lib/site-config";

const socialProfiles = Object.values(siteConfig.contact.social).filter(Boolean);

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      alternateName: "PNA",
      url: "https://physionexusacademy.com",
      logo: "https://physionexusacademy.com/images/pna-logo.png",
      image: "https://physionexusacademy.com/images/pna-logo.png",
      description:
        "Physio Nexus Academy provides physiotherapy education, clinical workshops, learning resources, research support and patient-service pathways in Pakistan.",
      email: siteConfig.contact.email,
      telephone: `+${siteConfig.contact.phoneRaw}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Raja Ghazanfar Ali Khan Road, Saddar",
        addressLocality: "Karachi",
        addressRegion: "Sindh",
        postalCode: "74400",
        addressCountry: "PK",
      },
      founder: {
        "@id": "https://physionexusacademy.com/founder#person",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: `+${siteConfig.contact.phoneRaw}`,
        email: siteConfig.contact.email,
        availableLanguage: ["English", "Urdu"],
      },
      areaServed: [
        {
          "@type": "Country",
          name: "Pakistan",
        },
        {
          "@type": "City",
          name: "Karachi",
        },
        {
          "@type": "City",
          name: "Hyderabad",
        },
      ],
      ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
    },
    {
      "@type": "Person",
      "@id": "https://physionexusacademy.com/founder#person",
      name: siteConfig.founder.name,
      url: "https://physionexusacademy.com/founder",
      image: `https://physionexusacademy.com${siteConfig.founder.photo}`,
      jobTitle: "Founder and Main Instructor",
      description:
        "Physiotherapy educator, clinical workshop instructor and Founder of Physio Nexus Academy in Pakistan.",
      worksFor: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      affiliation: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      knowsAbout: [
        "Physiotherapy education",
        "Musculoskeletal physiotherapy",
        "Clinical skills training",
        "Manual therapy",
        "Physiotherapy research support",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://physionexusacademy.com/#website",
      url: "https://physionexusacademy.com",
      name: "Physio Nexus Academy",
      publisher: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      inLanguage: "en-PK",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://physionexusacademy.com"),
  title: {
    default: "Physio Nexus Academy | Learn • Apply • Transform Lives",
    template: "%s | Physio Nexus Academy",
  },
  description:
    "Physio Nexus Academy, founded by Dr. Sajjad Raza PT, provides physiotherapy education, clinical workshops, skills training, CPD professional development and learning resources in Pakistan.",
  openGraph: {
    title: "Physio Nexus Academy",
    description:
      "Physio Nexus Academy, founded by Dr. Sajjad Raza PT, provides physiotherapy education, clinical workshops, skills training, CPD professional development and learning resources in Pakistan.",
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
      "Physio Nexus Academy, founded by Dr. Sajjad Raza PT, provides physiotherapy education, clinical workshops, skills training and learning resources in Pakistan.",
    images: ["/images/pna-logo.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PNA", statusBarStyle: "default" },
  icons: { icon: "/images/pna-logo.png", apple: "/images/pna-logo.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: true,
  themeColor: "#102A43",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-clip">
      <body className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <InstallApp />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppButton />
      </body>
    </html>
  );
}
