import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Founder — Dr. Sajjad Raza PT",
  description:
    "Professional profile, qualifications and certifications of Dr. Sajjad Raza PT, Founder and Main Instructor of Physio Nexus Academy.",
};

export const revalidate = 60;

export default async function FounderPage() {
  const supabase = createClient();
  const [{ data: founderRow }, { data: qualifications }] = await Promise.all([
    supabase.from("founder_profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("qualifications").select("*").order("sort_order", { ascending: true }),
  ]);

  // Fall back to the shipped defaults for any field not yet edited in the
  // admin dashboard, so the page never looks broken or empty.
  const founder = {
    name: founderRow?.name || siteConfig.founder.name,
    role: founderRow?.role || siteConfig.founder.role,
    credentialsShort: founderRow?.credentials_short || siteConfig.founder.credentialsShort,
    academicFocus: founderRow?.academic_focus || siteConfig.founder.academicFocus,
    photo: founderRow?.photo_url || siteConfig.founder.photo,
    messageHeading: founderRow?.message_heading || siteConfig.founder.message.heading,
    messageBody: founderRow?.message_body?.length
      ? founderRow.message_body
      : siteConfig.founder.message.body,
  };

  const quals = qualifications?.length
    ? qualifications
    : siteConfig.qualifications.map((q, i) => ({ id: `fallback-${i}`, title: q.title }));

  return (
    <div className="container-content section-padding">
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl shadow-lg">
            <Image
              src={founder.photo}
              alt={founder.name}
              width={300}
              height={370}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="mt-5 font-heading text-xl font-bold text-navy-800">{founder.name}</h1>
          <p className="mt-1 text-sm text-teal-600">{founder.role}</p>
          <p className="mt-3 text-sm text-navy-500">{founder.credentialsShort}</p>
        </div>

        <div>
          <section>
            <h2 className="text-xl font-bold text-navy-800">Professional Profile</h2>
            <p className="mt-3 text-navy-600">
              {founder.name} is a physiotherapy educator, workshop instructor and mentor with
              an academic focus in {founder.academicFocus?.toLowerCase()} As Founder and Main
              Instructor of Physio Nexus Academy, {founder.name.split(" ")[1] ?? "he"} leads
              hands-on clinical workshops, contributes to academic and research support, and
              guides physiotherapy students and professionals through practical,
              evidence-informed learning.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-navy-800">Qualifications &amp; Certifications</h2>
            <p className="mt-2 text-sm text-navy-400">
              Issuing organization, year and verification details will be added where
              available — none are invented here.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {quals.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start gap-2 rounded-lg border border-grey-200 p-4 text-sm text-navy-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-500" />
                  <span>
                    {q.title}
                    {"issuer" in q && q.issuer && <span className="text-navy-400"> — {q.issuer}</span>}
                    {"year" in q && q.year && <span className="text-navy-400"> ({q.year})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-xl bg-grey-50 p-6">
            <h2 className="font-heading text-lg font-bold text-navy-800">
              {founder.messageHeading}
            </h2>
            {founder.messageBody.map((p: string, i: number) => (
              <p key={i} className="mt-3 text-navy-600">
                {p}
              </p>
            ))}
            <p className="mt-4 text-right text-sm font-semibold text-navy-700">— {founder.name}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
