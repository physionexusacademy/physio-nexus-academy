import type { Metadata } from "next";
import { BookOpenCheck, Brain, Hand, Lightbulb, MessagesSquare, Repeat2 } from "lucide-react";
import { conceptLessonMetas, lessonIndex, manualLessonMetas } from "@/lib/teacher/lesson-index";
import { teacherPaths } from "@/lib/teacher/paths";
import { TeacherHome } from "@/components/teacher/TeacherHome";
import { TeacherCatalog } from "@/components/teacher/TeacherCatalog";
import { TeacherAvatar } from "@/components/teacher/ui";

const url = "https://physionexusacademy.com/learn";

export const metadata: Metadata = {
  title: "PNA Teacher — Physiotherapy Concepts Made Easy",
  description:
    "Free PNA Teacher lessons that explain hard physiotherapy concepts step by step in English and Roman Urdu, with practice questions and flashcards.",
  keywords: [
    "PNA Teacher",
    "physiotherapy teacher",
    "hard physiotherapy concepts explained",
    "DPT students Pakistan",
    "convex concave rule explained",
    "Maitland grades explained",
    "sensitivity specificity physiotherapy",
    "UMN vs LMN",
    "tissue healing phases physiotherapy",
    "pain science for physiotherapists",
    "Roman Urdu physiotherapy",
    "physiotherapy lessons Pakistan",
    "clinical concepts physiotherapy",
    "free physiotherapy education Pakistan",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "PNA Teacher — Physiotherapy Concepts Made Easy | PNA",
    description:
      "Free PNA Teacher lessons that explain hard physiotherapy concepts step by step in English and Roman Urdu, with practice questions and flashcards.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "PNA Teacher — Physiotherapy concepts explained simply",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PNA Teacher — Physiotherapy Concepts Made Easy | PNA",
    description:
      "Free PNA Teacher lessons that explain hard physiotherapy concepts step by step in English and Roman Urdu, with practice questions and flashcards.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const principles = [
  { icon: MessagesSquare, title: "One idea at a time", text: "Short messages, never a wall of text. You decide when to move on." },
  { icon: Lightbulb, title: "Analogies first", text: "Every hard idea is tied to something you already know — a tyre, a smoke alarm, a road." },
  { icon: Hand, title: "Learn by doing", text: "Interactive visuals and 'try it on your own body' moments make concepts stick." },
  { icon: Brain, title: "Checks that teach", text: "Every wrong answer gets a kind explanation of why it was tempting — and why it's wrong." },
  { icon: Repeat2, title: "Remember for good", text: "Flashcards come back just before you'd forget them (spaced repetition)." },
  { icon: BookOpenCheck, title: "Honest evidence", text: "Clinical pearls, common mistakes and real sources — including where the textbook rule breaks down." },
];

export default function LearnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PNA Teacher",
    description: metadata.description,
    url,
    isPartOf: { "@type": "WebSite", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
    about: {
      "@type": "Thing",
      name: "Physiotherapy education",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    inLanguage: ["en", "ur-Latn"],
    isAccessibleForFree: true,
    hasPart: conceptLessonMetas.map((lesson) => ({
      "@type": "LearningResource",
      name: lesson.title,
      description: lesson.hook.en,
      url: `${url}/${lesson.slug}`,
      learningResourceType: "Interactive lesson",
      educationalLevel: lesson.level,
      timeRequired: `PT${lesson.minutes}M`,
      inLanguage: ["en", "ur-Latn"],
      isAccessibleForFree: true,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://physionexusacademy.com" },
      { "@type": "ListItem", position: 2, name: "PNA Teacher", item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-content pb-16 pt-8 sm:pt-12" data-pna-teacher-hub="v1">
        <header className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <TeacherAvatar size="lg" />
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">PNA Teacher · Free</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-800 sm:text-5xl">
            Hard concepts. <span className="text-teal-700">Explained like a great teacher would.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            I talk you through physiotherapy step by step — with stories, analogies, interactive visuals and quick checks — in English or Roman Urdu. Tell me where you are, and I'll plan the route.
          </p>
        </header>

        <section className="mx-auto mt-8 max-w-3xl" aria-label="Your personal teacher">
          <TeacherHome lessons={lessonIndex} paths={teacherPaths} />
        </section>

        <div className="mx-auto mt-14 max-w-6xl">
          <TeacherCatalog conceptLessons={conceptLessonMetas} manualLessons={manualLessonMetas} paths={teacherPaths} />
        </div>

        <nav className="mx-auto mt-12 max-w-6xl rounded-3xl bg-navy-800 p-6 text-white sm:p-8" aria-label="Keep learning across PNA">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200">Keep going</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">Finished a lesson? Put it to work across PNA.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Conditions & Treatment Guide", href: "/conditions" },
              { label: "MSK Special Tests", href: "/msk-special-tests" },
              { label: "Clinical Case Lab", href: "/case-lab" },
              { label: "Daily Challenge", href: "/daily-challenge" },
              { label: "Weekly Leagues", href: "/leagues" },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mx-auto mt-14 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="pna-teacher-method">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">The method</p>
          <h2 id="pna-teacher-method" className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
            How PNA Teacher teaches
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((item) => (
              <li key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-700 text-white">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold text-navy-800">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-5 text-slate-500">
            PNA Teacher is educational. It doesn't replace clinical supervision, individual patient assessment or your university's curriculum.
          </p>
        </section>
      </div>
    </>
  );
}
