import type { Metadata } from "next";
import { BookOpen, Download, Lock, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Physiotherapy Books, Notes & Learning Resources",
  description:
    "Explore physiotherapy books, review notes, manuals and educational resources from Physio Nexus Academy for students and professionals.",
  alternates: {
    canonical: "https://physionexusacademy.com/resources",
  },
};

export const revalidate = 60;

const accessIcon: Record<string, typeof Download> = {
  "Free download": Download,
  "View only": BookOpen,
  "External link": ExternalLink,
  "Future paid resource": Lock,
};

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("visibility", "Public")
    .order("created_at", { ascending: false });

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
      itemListElement: (resources ?? []).map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: resource.title,
      })),
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

      {!resources?.length && (
        <p className="mt-10 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No public resources are available yet — check back soon.
        </p>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources?.map((r) => {
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
