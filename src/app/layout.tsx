import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobilePortalNav } from "@/components/MobilePortalNav";
import { PwaRuntime } from "@/components/PwaRuntime";
import { PhysioNexusAI } from "@/components/PhysioNexusAI";
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
      image: {
        "@type": "ImageObject",
        "@id": "https://physionexusacademy.com/founder#primaryimage",
        url: `https://physionexusacademy.com${siteConfig.founder.photo}`,
        contentUrl: `https://physionexusacademy.com${siteConfig.founder.photo}`,
        caption: "Dr. Sajjad Raza PT — Founder of Physio Nexus Academy",
      },
      sameAs: [
        "https://pk.linkedin.com/in/dr-sajjad-raza-pt-8a7455372",
      ],
      jobTitle: "Physiotherapist, Clinical Educator and Founder",
      description:
        "Dr. Sajjad Raza PT is a physiotherapist, clinical educator and Founder of Physio Nexus Academy in Pakistan.",
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
    "Physio Nexus Academy, founded by Dr. Sajjad Raza PT, offers practical physiotherapy education, MSK clinical learning, manual therapy resources, hands-on workshops and professional development in Pakistan.",
  keywords: [
    "Physio Nexus Academy",
    "physiotherapy education Pakistan",
    "physiotherapy workshops Pakistan",
    "MSK physiotherapy learning",
    "manual therapy training",
    "physiotherapy clinical skills",
    "physiotherapy resources for students",
    "physiotherapy workshops Karachi",
    "physiotherapy workshops Hyderabad",
  ],
  applicationName: "Physio Nexus Academy",
  creator: "Physio Nexus Academy",
  publisher: "Physio Nexus Academy",
  openGraph: {
    title: "Physio Nexus Academy | Physiotherapy Education & Workshops",
    description:
      "Practical physiotherapy education, MSK clinical learning, manual therapy resources, clinical cases and hands-on workshops in Pakistan.",
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
      "Practical physiotherapy education, MSK clinical learning, clinical cases and hands-on workshops from Physio Nexus Academy in Pakistan.",
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
      <body className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip pb-16 lg:pb-0">
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
        <PwaRuntime />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppButton />
        <PhysioNexusAI />
        <MobilePortalNav />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FY98RYN1GP');
var gaScript = document.createElement('script');
gaScript.async = true;
gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-FY98RYN1GP';
document.head.appendChild(gaScript);`}
        </Script>
      </body>
    </html>
  );
}
