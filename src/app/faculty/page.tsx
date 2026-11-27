import type { Metadata } from "next";
import { HubJsonLd } from "@/lib/seo/hub";
import Image from "next/image";
import { ArrowRight, GraduationCap, UserRound } from "lucide-react";
import { facultyMembers } from "@/lib/faculty";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Faculty — Physiotherapy Educators",
  description:
    "Meet the Physio Nexus Academy faculty and clinical training team supporting practical physiotherapy education, workshops and rehabilitation learning.",
  alternates: {
    canonical: "https://physionexusacademy.com/faculty",
  },
};

function FacultyPageBody() {
  return (
    <div className="section-padding bg-gradient-to-b from-grey-50 via-white to-cyan-50/40">
      <div className="container-content">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
            Physio Nexus Academy
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy-800 sm:text-4xl">
            Our Faculty
          </h1>
          <p className="mt-4 text-base leading-7 text-navy-500">
            Meet the professionals supporting PNA&apos;s practical learning,
            workshops, clinical education and rehabilitation training.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facultyMembers.map((member) => (
            <a
              key={member.slug}
              href={"/faculty/" + member.slug}
              className="group overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
            >
              {member.image ? (
                <div className="aspect-[13/14] overflow-hidden bg-grey-100">
                  <Image
                    src={member.image.src}
                    alt={member.image.alt}
                    width={member.image.width}
                    height={member.image.height}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-[13/14] items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
                  <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
                    <UserRound className="h-10 w-10" />
                  </span>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-navy-800">{member.name}</h2>
                <p className="mt-2 text-sm font-semibold text-teal-700">
                  {member.academyRole}
                </p>
                <p className="mt-2 text-sm leading-6 text-navy-500">
                  {member.professionalTitle}
                </p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-navy-500">
                  {member.summary}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-grey-100 pt-4">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
                    <GraduationCap className="h-4 w-4 text-teal-500" />
                    Faculty
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                    View profile
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-navy-500">
          PNA was founded by <a href="/founder" className="font-semibold text-teal-700 hover:underline">{siteConfig.founder.name}</a>, who leads the academy&apos;s teaching and clinical content.
        </p>

        <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="faculty-how">
          <h2 id="faculty-how" className="text-center text-2xl font-bold text-navy-800">How the faculty teach</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Hands-on workshops", "Practical sessions on clinical skills and evidence-informed techniques; dates and venues are on the workshops page.", "/workshops"],
              ["Lessons you can repeat", "PNA Teacher lessons with a 3D teacher, quick checks and flashcards, in English and Roman Urdu.", "/learn"],
              ["Exam skills, step by step", "The Skills Lab for goniometry, muscle testing, special tests, neuro exam and OSCE stations.", "/skills"],
              ["Real reasoning", "A 3D Virtual Patient to examine and diagnose, with an OSCE-style score.", "/virtual-patient"],
              ["Evidence first", "Condition guides that follow current guidelines and list their sources.", "/conditions"],
              ["Research support", "A research track on study design, statistics and appraisal, for theses and projects.", "/research"],
            ].map(([title, text, href]) => (
              <li key={href}>
                <a href={href} className="flex h-full flex-col rounded-2xl border border-grey-200 bg-white p-5 hover:border-teal-300">
                  <span className="font-bold text-navy-800">{title}</span>
                  <span className="mt-1.5 text-sm leading-6 text-navy-500">{text}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function FacultyPage() {
  return (
    <>
      <HubJsonLd name={"Physio Nexus Academy faculty"} description={"Meet the Physio Nexus Academy faculty and clinical training team."} path={"/faculty"} crumbs={[{ name: "Faculty", path: "/faculty" }]} />
      <FacultyPageBody />
    </>
  );
}
