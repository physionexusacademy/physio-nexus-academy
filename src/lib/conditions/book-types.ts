/**
 * A chapter of "The Complete Physiotherapy Clinical Mastery" (Dr. Sajjad Raza PT), as extracted word for word by scripts/book/extract-book.py.
 * Text keeps the author's bold runs as **...** and the evidence marks as "[Ref – to verify]" (shown as a small badge).
 */
export type BookBlock =
  | { t: "p"; text: string; italic?: boolean }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; start: number; items: string[] }
  | { t: "table"; head: boolean; rows: string[][]; repeats?: number; clipped?: string[][] }
  | { t: "callout"; kind: "teacher" | "trap" | "memory" | "stop" | "case" | "why" | "note"; label: string; body: string[] }
  | { t: "flow"; steps: string[] };

/** key: "A" to "N" for the book's lettered sections, otherwise a slug of the heading (summary, evidence statement, ...). */
export type BookSection = { key: string; title: string; blocks: BookBlock[] };

export type BookChapter = {
  v: 2;
  vol: number;
  ch: number;
  title: string;
  lead: string;
  page: number;
  sections: BookSection[];
};

/** Roman Urdu help written for the site (not the author's text): one short explanation per section key, shown under the book's words. */
export type BookHelp = { v: 1; chapter: string; sections: Record<string, string> };

export const VOLUMES: Record<number, string> = {
  1: "Clinical Reasoning and Assessment Foundations",
  2: "Cervical Spine and Headache",
  3: "Thoracic Spine and Chest-Related Presentations",
  4: "Lumbar Spine and Pelvic Region",
  5: "Shoulder and Upper Arm",
  6: "Elbow, Wrist and Hand",
  7: "Hip, Groin and Thigh",
  8: "Knee, Leg, Ankle and Foot",
  9: "Neurological Physiotherapy",
  10: "Cardiopulmonary Physiotherapy",
  11: "Paediatrics, Geriatrics and Special Populations",
  12: "Sports, Postoperative and Functional Rehabilitation",
  13: "Manual Therapy, Exercise and Physical Modalities",
};

export const BOOK = {
  title: "The Complete Physiotherapy Clinical Mastery",
  author: "Dr. Sajjad Raza PT",
};
