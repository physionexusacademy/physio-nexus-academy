import type { Metadata } from "next";
import { GraduationCap, UserRound } from "lucide-react";
import { facultyMembers } from "@/lib/faculty";

export const metadata: Metadata = {
  title: "Faculty | Physio Nexus Academy",
  description:
    "Meet the Physio Nexus Academy faculty and clinical training team supporting practical physiotherapy education and workshops.",
  alternates: {
    canonical: "https://physionexusacademy.com/faculty",
  },
};

export default function FacultyPage() {
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
            Meet the professionals who support PNA&apos;s practical learning,
            workshops and clinical training initiatives.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facultyMembers.map((member) => (
            <article
              key={member.slug}
              className="group overflow-hidden rounded-3xl border border-grey-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
                <UserRound className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy-800">{member.name}</h2>
              <p className="mt-2 text-sm font-semibold text-teal-700">{member.role}</p>
              {member.credentials ? (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-navy-400">
                  {member.credentials}
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-6 text-navy-500">{member.summary}</p>

              <div className="mt-5 flex items-center gap-2 border-t border-grey-100 pt-4 text-xs font-semibold uppercase tracking-wide text-navy-400">
                <GraduationCap className="h-4 w-4 text-teal-500" />
                Faculty · Clinical Training
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
