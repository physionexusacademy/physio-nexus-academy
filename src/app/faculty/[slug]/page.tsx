import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  GraduationCap,
  Instagram,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { facultyMembers, getFacultyMember } from "@/lib/faculty";

export function generateStaticParams() {
  return facultyMembers.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getFacultyMember(slug);

  if (!member) {
    return { title: "Faculty | Physio Nexus Academy" };
  }

  return {
    title: `${member.name} | Faculty | Physio Nexus Academy`,
    description: `${member.name} — ${member.professionalTitle}. ${member.academyRole} at Physio Nexus Academy.`,
    alternates: {
      canonical: `https://physionexusacademy.com/faculty/${member.slug}`,
    },
  };
}

export default async function FacultyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getFacultyMember(slug);

  if (!member) notFound();

  return (
    <div className="bg-gradient-to-b from-grey-50 via-white to-cyan-50/30">
      <div className="container-content section-padding">
        <a
          href="/faculty"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Faculty
        </a>

        <section className="mt-6 overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[360px_1fr]">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100">
              {member.image ? (
                <Image
                  src={member.image.src}
                  alt={member.image.alt}
                  width={member.image.width}
                  height={member.image.height}
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="h-full max-h-[470px] w-full object-cover lg:max-h-none"
                />
              ) : (
                <div className="flex min-h-[380px] items-center justify-center">
                  <UserRound className="h-24 w-24 text-teal-500" />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                Physio Nexus Academy Faculty
              </p>
              <h1 className="mt-3 text-3xl font-bold text-navy-800 sm:text-4xl">
                {member.name}
              </h1>
              <p className="mt-3 text-base font-bold text-teal-700">
                {member.academyRole}
              </p>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-navy-600 sm:text-base">
                {member.professionalTitle}
              </p>
              <p className="mt-6 max-w-3xl leading-7 text-navy-600">{member.bio}</p>

              {member.contact ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  {member.contact.phoneDisplay && member.contact.phoneRaw ? (
                    <a
                      href={"tel:+" + member.contact.phoneRaw}
                      className="inline-flex items-center gap-2 rounded-full border border-grey-200 bg-grey-50 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-teal-200 hover:bg-teal-50"
                    >
                      <Phone className="h-4 w-4 text-teal-600" />
                      {member.contact.phoneDisplay}
                    </a>
                  ) : null}
                  {member.contact.location ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-grey-200 bg-grey-50 px-4 py-2 text-sm font-semibold text-navy-700">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      {member.contact.location}
                    </span>
                  ) : null}
                  {member.contact.instagram ? (
                    <a
                      href={"https://www.instagram.com/" + member.contact.instagram + "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-grey-200 bg-grey-50 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-teal-200 hover:bg-teal-50"
                    >
                      <Instagram className="h-4 w-4 text-teal-600" />
                      @{member.contact.instagram}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-bold text-navy-800">Education</h2>
            </div>
            <div className="mt-5 space-y-5">
              {member.education.map((item) => (
                <div key={item.title} className="border-l-2 border-teal-100 pl-4">
                  <h3 className="font-semibold text-navy-800">{item.title}</h3>
                  {item.institution ? (
                    <p className="mt-1 text-sm text-navy-600">{item.institution}</p>
                  ) : null}
                  {item.period ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
                      {item.period}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-bold text-navy-800">Clinical Experience</h2>
            </div>
            <div className="mt-5 space-y-6">
              {member.experience.map((item) => (
                <div key={item.role + item.institution}>
                  <h3 className="font-semibold text-navy-800">{item.role}</h3>
                  <p className="mt-1 text-sm font-medium text-teal-700">{item.institution}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-navy-600">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-bold text-navy-800">Certifications</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-navy-600">
              {member.certifications.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-bold text-navy-800">Professional Activities</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-navy-600">
              {member.activities.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-bold text-navy-800">Research</h2>
          </div>
          <div className="mt-5 space-y-3">
            {member.research.map((item) => (
              <p
                key={item}
                className="rounded-2xl border border-grey-100 bg-grey-50 p-4 text-sm font-medium leading-6 text-navy-700"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        {member.contact?.linkedinLabel || member.contact?.facebookLabel ? (
          <section className="mt-6 rounded-3xl border border-grey-200 bg-white p-6 sm:p-7">
            <h2 className="text-xl font-bold text-navy-800">Professional Profiles</h2>
            <p className="mt-3 text-sm leading-6 text-navy-500">
              Profile names supplied for professional reference. Direct profile URLs can be added when available.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {member.contact.linkedinLabel ? (
                <span className="rounded-full bg-grey-50 px-4 py-2 text-sm font-semibold text-navy-700">
                  LinkedIn · {member.contact.linkedinLabel}
                </span>
              ) : null}
              {member.contact.facebookLabel ? (
                <span className="rounded-full bg-grey-50 px-4 py-2 text-sm font-semibold text-navy-700">
                  Facebook · {member.contact.facebookLabel}
                </span>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
