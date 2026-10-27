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
      "@type": ["EducationalOrganization", "MedicalOrganization", "LocalBusiness"],
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      alternateName: ["PNA", "Physio Nexus Academy Pakistan"],
      url: "https://physionexusacademy.com",
      logo: {
        "@type": "ImageObject",
        url: "https://physionexusacademy.com/images/pna-logo.png",
        width: 512,
        height: 512,
      },
      image: [
        "https://physionexusacademy.com/images/pna-logo.png",
        "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        "https://physionexusacademy.com/images/pna-founder-hero-sharp-v2.avif",
      ],
      description:
        "Physio Nexus Academy is Pakistan’s practical physiotherapy learning platform offering evidence-based clinical education, MSK and manual therapy resources, case-based learning, hands-on workshops, research guidance and patient physiotherapy services.",
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
      geo: {
        "@type": "GeoCoordinates",
        addressCountry: "PK",
        addressLocality: "Karachi",
      },
      founder: {
        "@id": "https://physionexusacademy.com/founder#person",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: `+${siteConfig.contact.phoneRaw}`,
          email: siteConfig.contact.email,
          availableLanguage: ["English", "Urdu"],
          areaServed: "PK",
        },
        {
          "@type": "ContactPoint",
          contactType: "educational support",
          email: siteConfig.contact.email,
          availableLanguage: ["English", "Urdu"],
        },
      ],
      areaServed: [
        { "@type": "Country", name: "Pakistan" },
        { "@type": "City", name: "Karachi" },
        { "@type": "City", name: "Hyderabad" },
      ],
      medicalSpecialty: [
        "Physiotherapy",
        "Musculoskeletal",
        "Manual Therapy",
        "Rehabilitation",
        "Sports Physiotherapy",
      ],
      knowsAbout: [
        "Physiotherapy education",
        "Musculoskeletal physiotherapy",
        "Manual therapy",
        "Clinical reasoning",
        "Physiotherapy workshops",
        "Rehabilitation protocols",
        "Evidence-based practice",
        "Physiotherapy research support",
        "Dry needling",
        "Myofascial release",
        "Strain Counterstrain",
      ],
      ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
      priceRange: "$$",
      currenciesAccepted: "PKR",
      paymentAccepted: "Cash, Bank Transfer",
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
        "https://www.instagram.com/physionexusacademy/",
      ],
      jobTitle: "Physiotherapist, Clinical Educator and Founder",
      description:
        "Dr. Sajjad Raza PT is a physiotherapist, clinical educator and Founder of Physio Nexus Academy. He leads practical physiotherapy education, hands-on clinical workshops and evidence-informed learning for students and professionals in Pakistan.",
      worksFor: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      affiliation: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      knowsAbout: [
        "Physiotherapy education",
        "Musculoskeletal physiotherapy",
        "Manual therapy",
        "Clinical skills training",
        "Strain Counterstrain",
        "Myofascial release",
        "Dry needling",
        "Physiotherapy research support",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://physionexusacademy.com/#website",
      url: "https://physionexusacademy.com",
      name: "Physio Nexus Academy",
      description:
        "Practical physiotherapy education, clinical resources, workshops and patient services from Physio Nexus Academy in Pakistan.",
      publisher: {
        "@id": "https://physionexusacademy.com/#organization",
      },
      inLanguage: "en-PK",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://physionexusacademy.com/knowledge-hub?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://physionexusacademy.com"),
  title: {
    default: "Physio Nexus Academy | Physiotherapy Education, Workshops & Clinical Learning in Pakistan",
    template: "%s | Physio Nexus Academy",
  },
  description:
    "Physio Nexus Academy offers evidence-based physiotherapy education, MSK & manual therapy resources, clinical case labs, daily challenges, hands-on workshops and patient physiotherapy services across Pakistan. Founded by Dr. Sajjad Raza PT.",
  keywords: [
    "Physio Nexus Academy",
    "physiotherapy education Pakistan",
    "physiotherapy workshops Pakistan",
    "physiotherapy workshops Karachi",
    "physiotherapy workshops Hyderabad",
    "MSK physiotherapy",
    "manual therapy training",
    "manual therapy techniques",
    "physiotherapy clinical skills",
    "physiotherapy students Pakistan",
    "physiotherapy resources",
    "clinical reasoning physiotherapy",
    "treatment plans physiotherapy",
    "physiotherapy case studies",
    "CPD physiotherapy Pakistan",
    "physiotherapy home visit Karachi",
    "Dr Sajjad Raza PT",
    "dry needling Pakistan",
    "myofascial release training",
  ],
  applicationName: "Physio Nexus Academy",
  creator: "Physio Nexus Academy",
  publisher: "Physio Nexus Academy",
  authors: [{ name: "Dr. Sajjad Raza PT", url: "https://physionexusacademy.com/founder" }],
  category: "Education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Physio Nexus Academy | Physiotherapy Education & Workshops in Pakistan",
    description:
      "Evidence-based physiotherapy learning, MSK & manual therapy guides, clinical cases, quizzes, hands-on workshops and patient care pathways — built for students and professionals in Pakistan.",
    siteName: "Physio Nexus Academy",
    url: "https://physionexusacademy.com",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Sajjad Raza PT — Founder of Physio Nexus Academy",
      },
      {
        url: "https://physionexusacademy.com/images/pna-logo.png",
        width: 512,
        height: 512,
        alt: "Physio Nexus Academy logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Physio Nexus Academy | Physiotherapy Education & Workshops",
    description:
      "Practical physiotherapy education, clinical resources, case labs and hands-on workshops from Physio Nexus Academy in Pakistan.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  alternates: {
    canonical: "https://physionexusacademy.com",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PNA", statusBarStyle: "default" },
  icons: {
    icon: "/images/pna-logo.png",
    apple: "/images/pna-logo.png",
  },
  other: {
    "geo.region": "PK-SD",
    "geo.placename": "Karachi",
  },
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
