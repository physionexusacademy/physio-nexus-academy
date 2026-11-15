import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import "./nexus.css";
import "./motion.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobilePortalNav } from "@/components/MobilePortalNav";
import { PwaRuntime } from "@/components/PwaRuntime";
import { PhysioNexusAILauncher } from "@/components/PhysioNexusAILauncher";
import { siteConfig } from "@/lib/site-config";
import { atlasPublished } from "@/lib/clinical-visual-atlas";

/** Sora — the academy display face for headings (self-hosted, OFL). */
const display = localFont({
  src: "./fonts/sora-latin-wght.woff2",
  variable: "--font-display",
  weight: "100 800",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

const googleMapsProfile = "https://www.google.com/maps/place/?q=place_id:ChIJEyXEA0A-bG8RCrIF9nIJv3A";
const socialProfiles = [...Object.values(siteConfig.contact.social).filter(Boolean), googleMapsProfile];

/** The academy's main features as a navigation list: a clear, crawlable statement of what the site offers (helps Google choose sitelinks). */
const featureNav = [
  ["PNA Teacher", "/learn"],
  ["Clinical Skills Lab", "/skills"],
  ["Virtual Patient", "/virtual-patient"],
  ["RehabVerse", "/rehabverse"],
  ["Conditions & Treatment Guide", "/conditions"],
  ["MSK Symptom Checker", "/symptom-checker"],
  ["Daily Clinical Challenge", "/daily-challenge"],
  ["Weekly Leagues", "/leagues"],
  ["Case Lab", "/case-lab"],
  ["Manual Therapy Encyclopedia", "/manual-therapy"],
  ["MSK Special Tests", "/msk-special-tests"],
  ["Clinical Visual Atlas", "/clinical-visual-atlas"],
  ["Workshops & CPD", "/workshops"],
  ["Books & Resources", "/resources"],
  ["Book an Appointment", "/appointment"],
  ["Home Physiotherapy Visit", "/home-visit"],
  ["About Physio Nexus Academy", "/about"],
  ["Contact", "/contact"],
] as const;

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // "Physiotherapy" is schema.org's type for a physiotherapy practice (a MedicalBusiness).
      "@type": ["EducationalOrganization", "Physiotherapy", "MedicalOrganization", "LocalBusiness"],
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      alternateName: ["PNA", "Physio Nexus", "PhysioNexus Academy", "Physio Nexus Academy Pakistan"],
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
      hasMap: googleMapsProfile,
      ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Physiotherapy services and education",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home physiotherapy visits", url: "https://physionexusacademy.com/home-visit" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Physiotherapy appointments and online consultations", url: "https://physionexusacademy.com/appointment" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hands-on physiotherapy workshops and CPD courses", url: "https://physionexusacademy.com/workshops" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Manual therapy training", url: "https://physionexusacademy.com/manual-therapy" } },
        ],
      },
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
      alternateName: ["PNA", "Physio Nexus", "PhysioNexus Academy", "Physionexus"],
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
          urlTemplate: "https://physionexusacademy.com/conditions?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    ...featureNav.map(([name, path]) => ({
      "@type": "SiteNavigationElement",
      "@id": `https://physionexusacademy.com/#nav-${path.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home"}`,
      name,
      url: `https://physionexusacademy.com${path}`,
    })),
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://physionexusacademy.com"),
  title: {
    default: "Physio Nexus Academy — Physiotherapy Learning in Pakistan",
    // Short suffix: most titles were cut by Google because " | Physio Nexus Academy" alone took a third of the visible width.
    // The brand is carried by the site name (WebSite structured data), the domain and the hub pages' own titles.
    template: "%s | PNA",
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
  // Small, correctly sized icons (the full logo PNG is 541 KB and was fetched as the tab icon on every first visit).
  icons: {
    icon: [{ url: "/icons/pna-48.png", sizes: "48x48", type: "image/png" }, { url: "/icons/pna-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/pna-180.png", sizes: "180x180", type: "image/png" }],
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
  themeColor: "#030a17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`overflow-x-clip ${display.variable}`}>
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
        <Header atlasPublished={atlasPublished} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <PhysioNexusAILauncher />
        <MobilePortalNav />
        {/* Instant page opens: the browser fetches a page as soon as its link is touched or
            hovered (Chrome, Edge, Android). Never for APIs, admin, the registry or portals. */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prefetch: [
                {
                  where: {
                    and: [
                      { href_matches: "/*" },
                      { not: { href_matches: "/api/*" } },
                      { not: { href_matches: "/admin" } },
                      { not: { href_matches: "/admin/*" } },
                      { not: { href_matches: "/clinical-registry*" } },
                      { not: { href_matches: "/rehabverse/me*" } },
                      { not: { href_matches: "/rehabverse/start" } },
                      { not: { href_matches: "/workshops/*/portal*" } },
                      { not: { selector_matches: "[download], [target=_blank], [rel~=nofollow]" } },
                    ],
                  },
                  eagerness: "moderate",
                },
              ],
            }),
          }}
        />
        {/* Analytics loads once the page is idle, so it never competes with the first interaction. */}
        <Script id="google-analytics" strategy="lazyOnload">
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
