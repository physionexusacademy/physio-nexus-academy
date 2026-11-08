// Single source of truth for printed books sold on /resources.
// Prices live here (server-trusted) so the order form can never set its own price.

export type BookId = "clinical-myofascial-therapy" | "physiotherapy-clinical-mastery";

export interface BookListing {
  id: BookId;
  title: string;
  subtitle: string;
  /** Full title saved on orders and shown in emails / admin. */
  orderTitle: string;
  author: string;
  edition: string;
  price: number;
  deliveryEstimate: string;
  cover: { src: string; width: number; height: number; alt: string };
  badges: string[];
  description: string;
  highlights: string[];
}

export const BOOKS: BookListing[] = [
  {
    id: "physiotherapy-clinical-mastery",
    title: "The Complete Physiotherapy Clinical Mastery",
    subtitle: "Clinical Assessment, Diagnosis, Special Tests, Red Flags and Treatment",
    orderTitle: "The Complete Physiotherapy Clinical Mastery",
    author: "Dr. Sajjad Raza PT",
    edition: "First Edition 2026",
    price: 3000,
    deliveryEstimate: "3–4 days",
    cover: {
      src: "/images/books/physiotherapy-clinical-mastery-cover.webp",
      width: 640,
      height: 960,
      alt: "The Complete Physiotherapy Clinical Mastery by Dr. Sajjad Raza PT — book cover",
    },
    badges: ["New · First Edition 2026", "13 Volumes · 84 Chapters"],
    description:
      "A complete, step-by-step clinical reference that teaches you how to move from a patient's presentation to a defensible working diagnosis and a clear treatment plan — across musculoskeletal, neurological, cardiopulmonary, paediatric, geriatric and sports physiotherapy.",
    highlights: [
      "One 8-step clinical reasoning method used in every chapter",
      "Special tests taught step by step: position, action, findings and next step",
      "Red-flag safety panels with clear urgency and action",
      "Clinical cases and reasoning questions with explained answers",
    ],
  },
  {
    id: "clinical-myofascial-therapy",
    title: "Clinical Myofascial Therapy",
    subtitle: "Illustrated Clinical Edition",
    orderTitle: "Clinical Myofascial Therapy — Illustrated Clinical Edition",
    author: "Dr. Sajjad Raza PT",
    edition: "First Edition 2026",
    price: 2000,
    deliveryEstimate: "3–4 days",
    cover: {
      src: "/images/clinical-myofascial-therapy-cover.svg",
      width: 512,
      height: 768,
      alt: "Clinical Myofascial Therapy — Illustrated Clinical Edition book cover",
    },
    badges: ["First Edition 2026", "Illustrated Clinical Edition"],
    description:
      "A clinically focused physiotherapy book connecting fascia science, assessment, clinical reasoning, treatment principles and real-world application with an illustrated learning approach.",
    highlights: [],
  },
];

export const DEFAULT_BOOK_ID: BookId = "physiotherapy-clinical-mastery";

export function getBook(id: string | null | undefined): BookListing | undefined {
  return BOOKS.find((book) => book.id === id);
}

export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
