import type { Metadata } from "next";

const SITE_URL = "https://physionexusacademy.com";
const SITE_NAME = "Physio Nexus Academy";
const DEFAULT_OG_IMAGE = "https://physionexusacademy.com/images/pna-logo.png";
const FOUNDER_IMAGE = "https://physionexusacademy.com/images/founder-dr-sajjad.jpg";

export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildTitle(pageTitle: string, options?: { absolute?: boolean }): string {
  if (options?.absolute) return pageTitle;
  // Keep under ~60 characters where possible for SERP display
  const base = pageTitle.trim();
  if (base.length <= 48) return `${base} | ${SITE_NAME}`;
  return base;
}

export function buildDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

export function createPageMetadata({
  title,
  description,
  path = "",
  keywords = [],
  image,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || DEFAULT_OG_IMAGE;
  const fullTitle = buildTitle(title);

  return {
    title: fullTitle,
    description: buildDescription(description),
    keywords: keywords.length
      ? keywords
      : [
          "Physio Nexus Academy",
          "physiotherapy education Pakistan",
          "physiotherapy workshops",
          "MSK physiotherapy",
          "manual therapy",
          "Dr Sajjad Raza PT",
        ],
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description: buildDescription(description),
      url,
      siteName: SITE_NAME,
      locale: "en_PK",
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: buildDescription(description),
      images: [ogImage],
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; item?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.item ? { item: absoluteUrl(item.item) } : {}),
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  authorName = "Dr. Sajjad Raza PT",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image || DEFAULT_OG_IMAGE,
    author: {
      "@type": "Person",
      name: authorName,
      url: absoluteUrl("/founder"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path),
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, FOUNDER_IMAGE };
