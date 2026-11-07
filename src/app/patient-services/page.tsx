import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { AlertTriangle, ArrowRight, CalendarDays, ClipboardCheck, Home, Stethoscope, Video } from "lucide-react";
import { NexusHero } from "@/components/nexus/NexusHero";

export const metadata: Metadata = {
  title: "Physiotherapy Services & Patient Appointments",
  description:
    "Explore physiotherapy consultation, appointment and home visit request pathways from Physio Nexus Academy.",
  alternates: {
    canonical: "https://physionexusacademy.com/patient-services",
  },
};

export default function PatientServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Physio Nexus Academy Physiotherapy Services",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: "https://physionexusacademy.com/symptom-checker",
        name: "Musculoskeletal Symptom Checker",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: "https://physionexusacademy.com/appointment",
        name: "Physiotherapy Appointment & Consultation",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: "https://physionexusacademy.com/home-visit",
        name: "Physiotherapy Home Visit Service",
      },
    ],
  };

  const steps = [
    { title: "Tell us what hurts", text: "Use the symptom checker or simply describe your problem when you book.", icon: Stethoscope },
    { title: "We confirm a time", text: "The PNA team contacts you to confirm availability, location and details.", icon: CalendarDays },
    { title: "Assessment & plan", text: "A physiotherapist assesses you and explains a clear, safe treatment plan.", icon: ClipboardCheck },
  ];
  const services = [
    { title: "MSK symptom checker", text: "Patient-friendly screening of possible patterns, with safety warnings.", href: "/symptom-checker", icon: Stethoscope, cta: "Check your symptoms" },
    { title: "Clinic consultation", text: "In-person musculoskeletal consultation and physiotherapy guidance.", href: "/appointment", icon: CalendarDays, cta: "Book an appointment" },
    { title: "Home visit", text: "Physiotherapy at home, where the service is available (Karachi & Hyderabad).", href: "/home-visit", icon: Home, cta: "Request a home visit" },
    { title: "Online consultation", text: "Remote guidance — availability confirmed when you contact us.", href: "/contact", icon: Video, cta: "Ask about online care" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <NexusHero
        kicker="Clinic wing · Patient care"
        title={<>Physiotherapy services &amp; <span className="nx-gradient-text">patient appointments</span></>}
        lead="A clear pathway for patients: understand your symptoms, request a clinic appointment or a home visit, and our team will follow up to confirm the details."
        crumbs={[{ label: "Clinic", href: "/patient-services" }, { label: "Patient Services" }]}
        actions={
          <>
            <a href="/appointment" className="nx-btn nx-btn-primary">Book appointment</a>
            <a href="/home-visit" className="nx-btn nx-btn-ghost">Request home visit</a>
            <a href="/symptom-checker" className="nx-btn nx-btn-ghost">Check your symptoms</a>
          </>
        }
      />

      <div className="container-content section-padding !pt-10">
        <section aria-labelledby="services-title">
          <p className="nx-kicker nx-kicker-light">Physiotherapy service options</p>
          <h2 id="services-title" className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">How we can help</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <a key={service.title} href={service.href} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(10,60,90,0.6)]">
                  <span className="nx-icon-tile"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-lg font-bold text-navy-800">{service.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{service.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
                    {service.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="how-title">
          <p className="nx-kicker nx-kicker-light">How it works</p>
          <h2 id="how-title" className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">Three simple steps</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a1f3d] text-sm font-black text-[#2ee6d6]">{index + 1}</span>
                    <Icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-navy-800">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-10 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p>{siteConfig.medicalDisclaimer}</p>
        </div>
      </div>
    </>
  );
}
