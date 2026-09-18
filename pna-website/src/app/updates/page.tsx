import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Updates",
  description: "Announcements, workshop news and educational posts from Physio Nexus Academy.",
};

export const revalidate = 60;

export default async function UpdatesPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Updates</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Academy Updates</h1>

      {!posts?.length && (
        <p className="mt-10 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No updates published yet — check back soon.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {posts?.map((p) => (
          <article key={p.id} className="border-b border-grey-200 pb-6">
            <p className="flex items-center gap-2 text-xs text-navy-400">
              <CalendarDays className="h-3.5 w-3.5" />
              {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
            </p>
            <h2 className="mt-2 font-heading text-lg font-semibold text-navy-800">{p.title}</h2>
            <p className="mt-2 text-navy-600">{p.excerpt || p.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
