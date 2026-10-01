import type { Metadata } from "next";
import {
  BadgeCheck,
  BookOpen,
  Download,
  ExternalLink,
  Lock,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { BookOrderForm } from "./BookOrderForm";

export const metadata: Metadata = {
  title: "Physiotherapy Books, Notes & Learning Resources",
  description:
    "Explore physiotherapy books, review notes, manuals and educational resources from Physio Nexus Academy for students and professionals.",
  alternates: {
    canonical: "https://physionexusacademy.com/resources",
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

const accessIcon: Record<string, typeof Download> = {
  "Free download": Download,
  "View only": BookOpen,
  "External link": ExternalLink,
  "Future paid resource": Lock,
};

const BOOK_TITLE = "Clinical Myofascial Therapy";
const BOOK_SUBTITLE = "Illustrated Clinical Edition";

export default async function ResourcesPage() {
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
    url: "https://physionexusacademy.com/resources",
    name: "Physiotherapy Learning Resource Library",
    description:
      "Physiotherapy books, review notes, manuals and educational resources from Physio Nexus Academy.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: visibleResources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: resource.title,
      })),
    },
  };

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: `${BOOK_TITLE} — ${BOOK_SUBTITLE}`,
    author: {
      "@type": "Person",
      name: "Dr. Sajjad Raza PT",
    },
    bookEdition: "First Edition 2026",
    image:
      "https://physionexusacademy.com/images/clinical-myofascial-therapy-cover.svg",
    publisher: {
      "@type": "Organization",
      name: "Physio Nexus Academy",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: "2000",
      availability: "https://schema.org/InStock",
      url: "https://physionexusacademy.com/resources#order-book",
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(resourcesJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Books & Resources
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Learning Resource Library
      </h1>
      <p className="mt-4 max-w-2xl text-navy-600">
        Explore physiotherapy books, review notes, manuals and educational PDFs
        designed to support students and professionals with practical, evidence-informed learning.
      </p>

      <section className="mt-10 overflow-hidden rounded-3xl border border-grey-200 bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 text-white shadow-xl">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative flex items-center justify-center bg-black/10 p-6 sm:p-10">
            <div className="relative w-full max-w-[360px] overflow-hidden rounded-xl border border-white/15 shadow-2xl">
              <img
                src="/images/clinical-myofascial-therapy-cover.svg"
                alt="Clinical Myofascial Therapy — Illustrated Clinical Edition book cover"
                width={512}
                height={768}
                className="h-auto w-full"
                loading="eager"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                First Edition 2026
              </span>
              <span className="rounded-full border border-teal-200/30 bg-teal-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-100">
                Illustrated Clinical Edition
              </span>
            </div>

            <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
              Clinical Myofascial Therapy
            </h2>
            <p className="mt-2 text-lg font-medium text-amber-200">
              Illustrated Clinical Edition
            </p>
            <p className="mt-3 text-sm text-grey-200">by Dr. Sajjad Raza PT</p>

            <p className="mt-6 max-w-2xl leading-7 text-grey-100">
              A clinically focused physiotherapy book connecting fascia science, assessment,
              clinical reasoning, treatment principles and real-world application with an
              illustrated learning approach.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <BadgeCheck className="h-5 w-5 flex-none text-amber-300" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-grey-300">Book price</p>
                  <p className="text-xl font-bold text-white">PKR 2,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Truck className="h-5 w-5 flex-none text-teal-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-grey-300">Expected delivery</p>
                  <p className="text-xl font-bold text-white">3–4 days</p>
                </div>
              </div>
            </div>

            <a
              href="#order-book"
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-amber-300 px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-amber-200"
            >
              <ShoppingCart className="h-4 w-4" />
              Order Now — PKR 2,000
            </a>
          </div>
        </div>
      </section>

      <section id="order-book" className="scroll-mt-28 pt-10">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Book Order</p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">Place your order</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-500">
            Enter your delivery details below. Your order will receive a unique Order ID and our team will be notified immediately.
          </p>
        </div>
        <BookOrderForm />
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
  );
}
