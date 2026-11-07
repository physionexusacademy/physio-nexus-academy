import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { VirtualPatientLoader } from "@/components/virtual-patient/VirtualPatientLoader";
import "./virtual-patient.css";

export const metadata: Metadata = {
  title: "Virtual Patient — Examine a 3D Physiotherapy Patient",
  description:
    "Examine a realistic 3D patient: take a history, position him, measure range with a goniometer, test muscles, reflexes and sensation, palpate landmarks and run special tests — then make your diagnosis and get an OSCE-style score.",
  alternates: { canonical: "https://physionexusacademy.com/virtual-patient" },
};

export default function VirtualPatientPage() {
  return (
    <>
      <NexusHero
        kicker="Practise wing · Virtual Patient"
        title={<>Your patient is <span className="nx-gradient-text">waiting.</span></>}
        lead="A realistic 3D patient you can examine like a real one — history, positioning, goniometry, MMT, reflexes, sensation, palpation and special tests — then diagnose and get an OSCE-style score."
        crumbs={[{ label: "Practise", href: "/daily-challenge" }, { label: "Virtual Patient" }]}
      />
      <section className="container-content pb-16 pt-8" aria-label="Exam room" data-pna-virtual-patient>
        <VirtualPatientLoader />
      </section>
    </>
  );
}
