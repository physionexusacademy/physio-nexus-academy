import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  Lock,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { BookOrderForm } from "./BookOrderForm";
import { BOOKS, DEFAULT_BOOK_ID, formatPkr, getBook } from "@/lib/books";

const url = "https://physionexusacademy.com/resources";

export const metadata: Metadata = {
  title: {
    absolute:
      "Buy Physiotherapy Books Online in Pakistan | Clinical Mastery, Myofascial Therapy & Study Resources",
  },
  description:
    "Order physiotherapy books and learning resources from Physio Nexus Academy. Clinical mastery guides, myofascial therapy manuals and study materials delivered across Pakistan. Free educational PDFs also available.",
  keywords: [
    "physiotherapy books Pakistan",
    "buy physiotherapy books online",
    "physiotherapy books Karachi",
    "physiotherapy books Lahore",
    "physiotherapy books Islamabad",
    "clinical mastery physiotherapy book",
    "myofascial release book",
    "physiotherapy study material Pakistan",
    "DPT books Pakistan",
    "physiotherapy textbooks Pakistan",
    "Physio Nexus Academy books",
    "order physiotherapy books",
  ],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: "Physiotherapy Books & Resources for Sale | Physio Nexus Academy",
    description:
      "Order evidence-informed physiotherapy books and learning resources. Delivery across Pakistan. Free educational materials also available.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Physiotherapy Books — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Physiotherapy Books Online in Pakistan",
    description:
      "Clinical mastery guides, myofascial therapy manuals and study resources. Delivery across Pakistan.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Reads live, admin-editable data from Supabase: render on every request (prebuilt pages
// are served from a read-only cache that never refreshes).
export const dynamic = "force-dynamic";

const accessIcon: Record<string, typeof Download> = {
  "Free download": Download,
  "View only": BookOpen,
  "External link": ExternalLink,
  "Future paid resource": Lock,
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const { book: requestedBook } = await searchParams;
  const defaultBookId = getBook(requestedBook)?.id ?? DEFAULT_BOOK_ID;
  const supabase = createPublicClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("id,title,author,description,access_type,file_url,external_link,created_at")
    .eq("visibility", "Public")
    .order("created_at", { ascending: false });

  const visibleResources = (resources ?? []).filter(
    (resource) =>
      resource.title?.trim().toLowerCase() !== "review book of myofascial release"
  );

  const resourcesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://physionexusacademy.com/resources#collection",
    url,
    name: "Physiotherapy Learning Resource Library",
    description:
      "Physiotherapy books, review notes, manuals and educational resources from Physio Nexus Academy — available for students and professionals across Pakistan.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: visibleResources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: resource.title,
      })),
    },
  };

  const booksJsonLd = BOOKS.map((book) => ({
    "@context": "https://schema.org",
    "@type": "Book",
    name: `${book.title} — ${book.subtitle}`,
    author: {
      "@type": "Person",
      name: book.author,
    },
    bookEdition: book.edition,
    image: `https://physionexusacademy.com${book.cover.src}`,
    publisher: {
      "@type": "Organization",
      name: "Physio Nexus Academy",
      logo: "https://physionexusacademy.com/images/pna-logo.png",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: String(book.price),
      availability: "https://schema.org/InStock",
      url: `https://physionexusacademy.com/resources?book=${book.id}#order-book`,
      areaServed: {
        "@type": "Country",
        name: "Pakistan",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
      },
    },
  }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://physionexusacademy.com" },
      { "@type": "ListItem", position: 2, name: "Books & Resources", item: url },
    ],
  };

  return (
    <>
    <NexusHero
      kicker="Learn wing · Books & resources"
      title={<>Learning resource <span className="nx-gradient-text">library</span></>}
      lead={<>Physiotherapy books, review notes, manuals and educational PDFs that support students and professionals with practical, evidence-informed learning — order online with delivery across Pakistan.</>}
      crumbs={[{ label: "Learn", href: "/learn" }, { label: "Books & Resources" }]}
      actions={<><a href="#order-book" className="nx-btn nx-btn-primary">Order a book</a><a href="/learn" className="nx-btn nx-btn-ghost">Free lessons</a></>}
    />
    <div className="container-content section-padding !pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(resourcesJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(booksJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />


      {BOOKS.map((book, index) => (
        <section
          key={book.id}
          id={`book-${book.id}`}
          className="mt-10 scroll-mt-28 overflow-hidden rounded-3xl border border-grey-200 bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 text-white shadow-xl"
        >
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative flex items-center justify-center bg-black/10 p-6 sm:p-10">
              <div className="relative w-full max-w-[360px] overflow-hidden rounded-xl border border-white/15 shadow-2xl">
                <img
                  src={book.cover.src}
                  alt={book.cover.alt}
                  width={book.cover.width}
                  height={book.cover.height}
                  className="h-auto w-full"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <div className="flex flex-wrap gap-2">
                {book.badges.map((badge, badgeIndex) => (
                  <span
                    key={badge}
                    className={
                      badgeIndex === 0
                        ? "rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200"
                        : "rounded-full border border-teal-200/30 bg-teal-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-100"
                    }
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
                {book.title}
              </h2>
              <p className="mt-2 text-lg font-medium text-amber-200">{book.subtitle}</p>
              <p className="mt-3 text-sm text-grey-200">by {book.author}</p>

              <p className="mt-6 max-w-2xl leading-7 text-grey-100">{book.description}</p>

              {book.highlights.length > 0 && (
                <ul className="mt-5 grid gap-2 text-sm text-grey-100 sm:grid-cols-2">
                  {book.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal-200" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <BadgeCheck className="h-5 w-5 flex-none text-amber-300" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-grey-300">Book price</p>
                    <p className="text-xl font-bold text-white">{formatPkr(book.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <Truck className="h-5 w-5 flex-none text-teal-200" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-grey-300">Expected delivery</p>
                    <p className="text-xl font-bold text-white">{book.deliveryEstimate}</p>
                  </div>
                </div>
              </div>

              <a
                href={`?book=${book.id}#order-book`}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-amber-300 px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-amber-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Order Now — {formatPkr(book.price)}
              </a>
            </div>
          </div>
        </section>
      ))}

      <section id="order-book" className="scroll-mt-28 pt-10">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Book Order</p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">Place your order</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-500">
            Choose your book and enter your delivery details below. Delivery is available across Pakistan. Your order will receive a unique Order ID and our team will be notified immediately.
          </p>
        </div>
        <BookOrderForm
          key={defaultBookId}
          defaultBookId={defaultBookId}
          books={BOOKS.map(({ id, title, price, deliveryEstimate }) => ({ id, title, price, deliveryEstimate }))}
        />
      </section>

      <div className="mt-14 border-t border-grey-200 pt-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">More Resources</p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800">Learning materials</h2>
      </div>

      {!visibleResources.length && (
        <p className="mt-8 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No additional public resources are available yet — check back soon.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleResources.map((r) => {
          const Icon = accessIcon[r.access_type] ?? BookOpen;
          return (
            <div
              key={r.id}
              className="flex flex-col rounded-xl border border-grey-200 p-5"
            >
              <BookOpen className="h-6 w-6 text-teal-500" />
              <h2 className="mt-3 font-heading text-base font-semibold text-navy-800">
                {r.title}
              </h2>
              {r.author && (
                <p className="mt-1 text-xs text-navy-400">by {r.author}</p>
              )}
              {r.description && (
                <p className="mt-2 text-sm text-navy-500">{r.description}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-navy-500">
                <Icon className="h-4 w-4 text-teal-500" />
                {r.access_type}
              </div>
              {r.access_type !== "Future paid resource" &&
                (r.file_url || r.external_link) && (
                  <a
                    href={`/api/resources/${r.id}/download`}
                    className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {r.access_type === "View only" ? "View" : "Download"}
                  </a>
                )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
