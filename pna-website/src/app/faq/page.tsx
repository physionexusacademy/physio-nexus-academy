import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Physio Nexus Academy's workshops, appointments and resources.",
};

export const revalidate = 60;

// Fallback shown only if no FAQs have been added in the admin dashboard yet.
const fallbackGroups = [
  {
    group: "Workshops & Students",
    items: [
      {
        q: "Who can attend PNA workshops?",
        a: "Physiotherapy students, fresh graduates and practising professionals are welcome, unless a specific workshop states otherwise.",
      },
      {
        q: "Do workshops offer certificates?",
        a: "Certificates of participation may be provided per workshop; any CPD/accreditation status will only be stated if formally confirmed.",
      },
    ],
  },
  {
    group: "Appointments & Patients",
    items: [
      {
        q: "Is this an emergency service?",
        a: "No. For urgent or emergency symptoms, please contact an appropriate emergency medical service directly.",
      },
      {
        q: "Does submitting a request guarantee an appointment?",
        a: "No. Submitting a request starts the process — our team will contact you to confirm availability and details.",
      },
    ],
  },
  {
    group: "Resources",
    items: [
      {
        q: "Are all resources free?",
        a: "Access varies by resource — some are free downloads, others are view-only, members-only, or planned for future paid access.",
      },
    ],
  },
];

export default async function FaqPage() {
  const supabase = createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("group_label", { ascending: true })
    .order("sort_order", { ascending: true });

  const groups = faqs?.length
    ? Object.values(
        faqs.reduce((acc: Record<string, { group: string; items: { q: string; a: string }[] }>, f) => {
          acc[f.group_label] ??= { group: f.group_label, items: [] };
          acc[f.group_label].items.push({ q: f.question, a: f.answer });
          return acc;
        }, {})
      )
    : fallbackGroups;

  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">FAQ</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h1>

      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <div key={group.group}>
            <h2 className="text-lg font-bold text-navy-800">{group.group}</h2>
            <div className="mt-3 space-y-3">
              {group.items.map((item) => (
                <details key={item.q} className="rounded-lg border border-grey-200 p-4">
                  <summary className="cursor-pointer font-medium text-navy-700">{item.q}</summary>
                  <p className="mt-2 text-sm text-navy-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
