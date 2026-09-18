import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://physionexusacademy.com"),
  title: {
    default: "Physio Nexus Academy | Learn • Apply • Transform Lives",
    template: "%s | Physio Nexus Academy",
  },
  description:
    "Physio Nexus Academy offers physiotherapy workshops, learning resources, research support, career development and patient appointment services led by Dr. Sajjad Raza PT.",
  openGraph: {
    title: "Physio Nexus Academy",
    description:
      "Physiotherapy education, workshops, learning resources, research support and patient services.",
    siteName: "Physio Nexus Academy",
    images: ["/images/pna-logo.png"],
    type: "website",
  },
  icons: {
    icon: "/images/pna-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
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
      </body>
    </html>
  );
}
